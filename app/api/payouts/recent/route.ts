import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const fpoId = req.nextUrl.searchParams.get('fpoId')
    if (!fpoId) {
      return NextResponse.json({ success: false, error: 'fpoId required' }, { status: 400 })
    }

    const db = await getDb()

    const result = await db.query(
      `SELECT
         p.id, p.net_amount, p.paid_at,
         f.full_name  AS farmer_name,
         d.crop,
         m.name       AS mandi_name
       FROM payouts p
       JOIN farmers    f ON f.id = p.farmer_id
       JOIN dispatches d ON d.id = p.dispatch_id
       JOIN mandis     m ON m.id = d.mandi_id
       WHERE d.fpo_id = $1 AND p.payment_status = 'PAID'
       ORDER BY p.paid_at DESC
       LIMIT 20`,
      [fpoId]
    )

    return NextResponse.json({ success: true, payouts: result.rows })
  } catch (error) {
    console.error('[GET /api/payouts/recent]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
