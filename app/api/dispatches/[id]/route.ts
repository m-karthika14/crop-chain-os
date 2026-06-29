import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getDb()

    const result = await db.query(
      `SELECT d.*, m.name as mandi_name, m.state as mandi_state, m.lat, m.lng
       FROM dispatches d
       JOIN mandis m ON m.id = d.mandi_id
       WHERE d.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Dispatch not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, dispatch: result.rows[0] })
  } catch (error) {
    console.error('[GET /api/dispatches/[id]]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { action, managerId, actualRevenue } = body

    const db = await getDb()

    if (action === 'advance_stage') {
      const result = await db.query(
        `UPDATE dispatches SET current_stage = current_stage + 1 WHERE id = $1 RETURNING current_stage`,
        [id]
      )

      try {
        await db.query(
          `INSERT INTO events (id, event_type, aggregate_id, aggregate_type, actor_id, actor_type, payload)
           VALUES ($1,'STAGE_ADVANCED',$2,'dispatch',$3,'manager',$4)`,
          [`evt-${Date.now()}`, id, managerId || 'unknown',
           JSON.stringify({ newStage: result.rows[0]?.current_stage })]
        )
      } catch {}

      return NextResponse.json({ success: true, newStage: result.rows[0]?.current_stage })
    }

    if (action === 'mark_sold') {
      await db.query(
        `UPDATE dispatches SET current_stage = 4, actual_revenue = $1, sold_at = NOW() WHERE id = $2`,
        [actualRevenue || 0, id]
      )

      try {
        const dispatchRow = await db.query(`SELECT fpo_id FROM dispatches WHERE id = $1`, [id])
        if (dispatchRow.rows.length > 0) {
          await db.query(
            `UPDATE fpos SET revenue_this_month = COALESCE(revenue_this_month, 0) + $1 WHERE id = $2`,
            [actualRevenue || 0, dispatchRow.rows[0].fpo_id]
          )
        }
      } catch {}

      try {
        await db.query(
          `INSERT INTO events (id, event_type, aggregate_id, aggregate_type, actor_id, actor_type, payload)
           VALUES ($1,'SALE_COMPLETED',$2,'dispatch',$3,'manager',$4)`,
          [`evt-${Date.now()}`, id, managerId || 'unknown',
           JSON.stringify({ actual_revenue: actualRevenue })]
        )
      } catch {}

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('[PATCH /api/dispatches/[id]]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
