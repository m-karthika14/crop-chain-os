import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const fpoId = req.nextUrl.searchParams.get('fpoId')
    if (!fpoId) {
      return NextResponse.json({ success: false, error: 'fpoId required' }, { status: 400 })
    }

    const db = await getDb()

    const [farmers, harvest, revenueMonth, revenueTotal, pending, mandis] = await Promise.all([
      db.query(
        `SELECT COUNT(*) as count FROM farmers WHERE fpo_id = $1`,
        [fpoId]
      ),
      db.query(
        `SELECT COALESCE(SUM(quantity_final), 0) as qty
         FROM harvests WHERE fpo_id = $1 AND status NOT IN ('SOLD', 'REJECTED')`,
        [fpoId]
      ),
      db.query(
        `SELECT COALESCE(SUM(actual_revenue), 0) as amount
         FROM dispatches
         WHERE fpo_id = $1 AND current_stage = 5
           AND EXTRACT(MONTH FROM sold_at) = EXTRACT(MONTH FROM NOW())
           AND EXTRACT(YEAR  FROM sold_at) = EXTRACT(YEAR  FROM NOW())`,
        [fpoId]
      ),
      db.query(
        `SELECT COALESCE(SUM(actual_revenue), 0) as amount
         FROM dispatches WHERE fpo_id = $1 AND current_stage = 5`,
        [fpoId]
      ),
      db.query(
        `SELECT
           COALESCE(SUM(p.net_amount), 0) as amount,
           COUNT(DISTINCT p.farmer_id)    as farmer_count
         FROM payouts p
         JOIN dispatches d ON d.id = p.dispatch_id
         WHERE d.fpo_id = $1 AND p.payment_status = 'PENDING'`,
        [fpoId]
      ),
      db.query(`SELECT COUNT(*) as count FROM mandis`),
    ])

    return NextResponse.json({
      success: true,
      farmer_count:          parseInt(farmers.rows[0]?.count         ?? '0'),
      active_harvest_qty:    Math.round(parseFloat(harvest.rows[0]?.qty ?? '0')),
      revenue_month_lakhs:   Math.round(parseFloat(revenueMonth.rows[0]?.amount ?? '0') / 100000),
      revenue_total:         parseFloat(revenueTotal.rows[0]?.amount ?? '0'),
      pending_payouts_lakhs: Math.round(parseFloat(pending.rows[0]?.amount      ?? '0') / 100000),
      pending_farmers:       parseInt(pending.rows[0]?.farmer_count   ?? '0'),
      mandi_count:           parseInt(mandis.rows[0]?.count           ?? '0'),
    })
  } catch (error) {
    console.error('[GET /api/stats/fpo]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
