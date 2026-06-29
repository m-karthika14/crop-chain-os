import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const fpoId = req.nextUrl.searchParams.get('fpoId')

    if (!fpoId) {
      return NextResponse.json({ success: false, error: 'fpoId is required' }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.query(
      `SELECT
         d.*,
         COALESCE(m.name,  d.mandi_id)  as mandi_name,
         COALESCE(m.state, '')          as mandi_state,
         m.lat                          as mandi_lat,
         m.lng                          as mandi_lng
       FROM dispatches d
       LEFT JOIN mandis m ON m.id = d.mandi_id
       WHERE d.fpo_id = $1
       ORDER BY d.created_at DESC`,
      [fpoId]
    )

    return NextResponse.json({ success: true, dispatches: result.rows })
  } catch (error) {
    console.error('[GET /api/dispatches]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      fpoId, mandiId, crop, totalQuantity,
      truckNumber, driverName, driverPhone,
      departureTime, expectedRevenue, pricePerQuintal,
      managerId,
    } = body

    if (!fpoId || !mandiId || !crop || !totalQuantity) {
      return NextResponse.json({ success: false, error: 'fpoId, mandiId, crop, totalQuantity are required' }, { status: 400 })
    }

    let departedAt: Date
    if (departureTime && (departureTime.includes('T') || departureTime.includes('-'))) {
      departedAt = new Date(departureTime)
    } else if (departureTime) {
      departedAt = new Date()
      const [hours, minutes] = departureTime.split(':')
      departedAt.setHours(parseInt(hours || '9'), parseInt(minutes || '0'), 0, 0)
    } else {
      departedAt = new Date()
    }

    const eta = new Date(departedAt.getTime() + 8 * 60 * 60 * 1000)
    const dispatchId = `dis-${Date.now()}`

    const db = await getDb()
    await db.query(
      `INSERT INTO dispatches
         (id, fpo_id, mandi_id, crop, total_quantity,
          truck_number, driver_name,
          departed_at, eta, current_stage,
          expected_revenue, price_per_quintal, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,1,$10,$11,NOW())`,
      [
        dispatchId, fpoId, mandiId, crop, totalQuantity,
        truckNumber || null, driverName || null,
        departedAt.toISOString(), eta.toISOString(),
        expectedRevenue || null, pricePerQuintal || null,
      ]
    )

    try {
      await db.query(
        `INSERT INTO events (id, event_type, aggregate_id, aggregate_type, actor_id, actor_type, payload)
         VALUES ($1,'DISPATCH_CREATED',$2,'dispatch',$3,'manager',$4)`,
        [
          `evt-${Date.now()}`, dispatchId,
          managerId || 'unknown',
          JSON.stringify({ mandi: mandiId, crop, qty: totalQuantity, truck: truckNumber }),
        ]
      )
    } catch {}

    return NextResponse.json({ success: true, dispatchId })
  } catch (error) {
    console.error('[POST /api/dispatches]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
