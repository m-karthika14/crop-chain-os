import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getDb()

    const dispatchRow = await db.query(
      `SELECT fpo_id, total_quantity, crop FROM dispatches WHERE id = $1`,
      [id]
    )
    if (dispatchRow.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Dispatch not found' }, { status: 404 })
    }
    const { fpo_id, total_quantity } = dispatchRow.rows[0]
    const totalQty = parseFloat(total_quantity) || 1

    const harvestRows = await db.query(
      `SELECT h.farmer_id, f.full_name AS farmer_name,
              SUM(COALESCE(h.quantity_final, h.quantity_actual, h.quantity_estimated, '0')::numeric) AS quantity_q
       FROM harvests h
       JOIN farmers f ON f.id = h.farmer_id
       WHERE h.fpo_id = $1
         AND h.status IN ('GODOWN_RECEIVED', 'IN_TRANSIT', 'SOLD', 'APPROVED', 'VERIFIED')
       GROUP BY h.farmer_id, f.full_name
       ORDER BY quantity_q DESC`,
      [fpo_id]
    )

    const farmers = harvestRows.rows.map(r => ({
      farmer_id:   r.farmer_id,
      farmer_name: r.farmer_name,
      quantity_q:  parseFloat(r.quantity_q),
      share_pct:   Math.round((parseFloat(r.quantity_q) / totalQty) * 10000) / 100,
    }))

    return NextResponse.json({ success: true, farmers, total_quantity: totalQty })
  } catch (error) {
    console.error('[GET /api/dispatches/[id]/farmers]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
