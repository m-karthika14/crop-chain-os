import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const farmerId = req.nextUrl.searchParams.get('farmerId')

    if (!farmerId) {
      return NextResponse.json({ success: false, error: 'farmerId is required' }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.query(
      `SELECT DISTINCT d.id, d.crop, d.total_quantity,
         d.current_stage, d.departed_at, d.eta, d.arrived_at, d.sold_at,
         d.price_per_quintal, d.truck_number,
         m.name as mandi_name, m.state as mandi_state
       FROM dispatches d
       JOIN mandis m ON m.id = d.mandi_id
       JOIN harvests h ON h.fpo_id = d.fpo_id
       WHERE h.farmer_id = $1
       AND d.current_stage > 0
       ORDER BY d.created_at DESC`,
      [farmerId]
    )

    return NextResponse.json({ success: true, dispatches: result.rows })
  } catch (error) {
    console.error('[GET /api/dispatches/farmer]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
