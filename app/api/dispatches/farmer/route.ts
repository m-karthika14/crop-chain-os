import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const farmerId = req.nextUrl.searchParams.get('farmerId')

    if (!farmerId) {
      return NextResponse.json({ success: false, error: 'farmerId is required' }, { status: 400 })
    }

    const db = await getDb()

    // First get farmer's harvests
    const harvests = await db.query(
      `SELECT crop_type, fpo_id, quantity_final FROM harvests WHERE farmer_id = $1`,
      [farmerId]
    )

    if (harvests.rows.length === 0) {
      return NextResponse.json({ success: true, dispatches: [] })
    }

    const result = await db.query(
      `SELECT
        d.id, d.crop, d.total_quantity, d.current_stage,
        d.departed_at, d.eta, d.arrived_at, d.sold_at,
        d.price_per_quintal, d.actual_revenue, d.truck_number,
        d.expected_revenue,
        m.name as mandi_name, m.state as mandi_state,
        m.lat as mandi_lat, m.lng as mandi_lng,
        h.quantity_final as farmer_quantity,
        p.net_amount as farmer_payout,
        p.payment_status as payout_status,
        p.paid_at
      FROM dispatches d
      JOIN mandis m ON m.id = d.mandi_id
      JOIN harvests h ON h.fpo_id = d.fpo_id AND h.farmer_id = $1 AND h.crop_type = d.crop
      LEFT JOIN payouts p ON p.dispatch_id = d.id AND p.farmer_id = $1
      WHERE d.current_stage > 0
      ORDER BY d.created_at DESC
      LIMIT 20`,
      [farmerId]
    )

    return NextResponse.json({ success: true, dispatches: result.rows })
  } catch (error) {
    console.error('[GET /api/dispatches/farmer]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
