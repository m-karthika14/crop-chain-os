import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/payouts/fpo?fpoId=X  — all payouts for an FPO with farmer + dispatch info
export async function GET(req: NextRequest) {
  try {
    const fpoId = req.nextUrl.searchParams.get('fpoId')
    if (!fpoId) {
      return NextResponse.json({ success: false, error: 'fpoId required' }, { status: 400 })
    }

    const db = await getDb()

    const result = await db.query(
      `SELECT
         p.id, p.farmer_id, p.dispatch_id, p.quantity_q,
         p.share_pct, p.net_amount, p.payment_status,
         p.upi_id, p.upi_reference, p.paid_at, p.created_at,
         f.full_name  as farmer_name,
         f.village    as farmer_village,
         d.crop, d.truck_number,
         COALESCE(m.name, d.mandi_id) as mandi_name,
         COALESCE(m.state, '')        as mandi_state
       FROM payouts p
       JOIN farmers  f ON f.id = p.farmer_id
       JOIN dispatches d ON d.id = p.dispatch_id
       LEFT JOIN mandis m ON m.id = d.mandi_id
       WHERE p.fpo_id = $1
       ORDER BY p.created_at DESC`,
      [fpoId]
    )

    return NextResponse.json({ success: true, payouts: result.rows })
  } catch (error) {
    console.error('[GET /api/payouts/fpo]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
