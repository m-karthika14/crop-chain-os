import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const farmerId = searchParams.get('farmerId')
    const fpoId = searchParams.get('fpoId')
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const db = await getDb()

    if (farmerId) {
      const result = await db.query(
        `SELECT e.id, e.event_type, e.aggregate_id, e.aggregate_type, e.actor_id, e.actor_type, e.payload, e.created_at
         FROM events e
         JOIN dispatches d ON d.id = e.aggregate_id AND e.aggregate_type = 'dispatch'
         JOIN harvests h ON h.fpo_id = d.fpo_id AND h.farmer_id = $1
         ORDER BY e.created_at DESC
         LIMIT $2`,
        [farmerId, limit]
      )
      return NextResponse.json({ success: true, events: result.rows })
    }

    if (fpoId) {
      const result = await db.query(
        `SELECT e.id, e.event_type, e.aggregate_id, e.aggregate_type, e.actor_id, e.actor_type, e.payload, e.created_at
         FROM events e
         JOIN dispatches d ON d.id = e.aggregate_id AND e.aggregate_type = 'dispatch'
         WHERE d.fpo_id = $1
         ORDER BY e.created_at DESC
         LIMIT $2`,
        [fpoId, limit]
      )
      return NextResponse.json({ success: true, events: result.rows })
    }

    return NextResponse.json({ success: false, error: 'fpoId or farmerId is required' }, { status: 400 })
  } catch (error) {
    console.error('[GET /api/events]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
