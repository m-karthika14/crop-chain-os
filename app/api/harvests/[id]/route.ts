import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getDb()
    const result = await db.query(
      `SELECT h.*, f.full_name as farmer_name, f.village,
         p.organization_name as fpo_name, p.godown_address,
         m.name as manager_name, p.contact_phone
       FROM harvests h
       JOIN farmers f ON f.id = h.farmer_id
       JOIN fpos p ON p.id = h.fpo_id
       JOIN managers m ON m.id = p.manager_id
       WHERE h.id = $1`,
      [id]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Harvest not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, harvest: result.rows[0] })
  } catch (error) {
    console.error('[GET /api/harvests/[id]]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { action, managerId, rejectionReason,
            quantityActual, gradeVerified,
            qualityMoistureOk, qualityForeignOk, qualitySizeOk, qualityColorOk } = body

    const db = await getDb()

    if (action === 'approve') {
      // Get FPO code for token generation
      const fpoResult = await db.query(
        `SELECT p.fpo_code FROM harvests h JOIN fpos p ON p.id = h.fpo_id WHERE h.id = $1`,
        [id]
      )
      if (fpoResult.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Harvest not found' }, { status: 404 })
      }
      const fpoCode = fpoResult.rows[0].fpo_code
      const tokenNumber = `${fpoCode}-${Date.now().toString().slice(-4)}`

      await db.query(
        `UPDATE harvests SET status = 'APPROVED', approved_at = NOW(), token_number = $1 WHERE id = $2`,
        [tokenNumber, id]
      )

      try {
        await db.query(
          `INSERT INTO events (id, event_type, aggregate_id, aggregate_type, actor_id, actor_type, payload)
           VALUES ($1,'HARVEST_APPROVED',$2,'harvest',$3,'manager',$4)`,
          [`evt-${Date.now()}`, id, managerId, JSON.stringify({ token: tokenNumber })]
        )
      } catch {}

      return NextResponse.json({ success: true, tokenNumber })
    }

    if (action === 'reject') {
      await db.query(
        `UPDATE harvests SET status = 'REJECTED', rejection_reason = $1 WHERE id = $2`,
        [rejectionReason || 'Rejected by manager', id]
      )
      try {
        await db.query(
          `INSERT INTO events (id, event_type, aggregate_id, aggregate_type, actor_id, actor_type, payload)
           VALUES ($1,'HARVEST_REJECTED',$2,'harvest',$3,'manager',$4)`,
          [`evt-${Date.now()}`, id, managerId || 'unknown', JSON.stringify({ reason: rejectionReason })]
        )
      } catch {}
      return NextResponse.json({ success: true })
    }

    if (action === 'godown_receive') {
      await db.query(
        `UPDATE harvests SET
           status = 'GODOWN_RECEIVED',
           quantity_actual = $1,
           quantity_final = $1,
           grade_verified = $2,
           godown_received_at = NOW(),
           godown_verified_by = $3,
           quality_moisture_ok = $4,
           quality_foreign_ok = $5,
           quality_size_ok = $6,
           quality_color_ok = $7
         WHERE id = $8`,
        [
          quantityActual, gradeVerified || null, managerId,
          qualityMoistureOk ?? false, qualityForeignOk ?? false,
          qualitySizeOk ?? false, qualityColorOk ?? false, id
        ]
      )
      try {
        await db.query(
          `UPDATE fpos SET active_harvest_q = COALESCE(active_harvest_q, 0) + $1
           WHERE id = (SELECT fpo_id FROM harvests WHERE id = $2)`,
          [quantityActual, id]
        )
      } catch {}
      try {
        await db.query(
          `INSERT INTO events (id, event_type, aggregate_id, aggregate_type, actor_id, actor_type, payload)
           VALUES ($1,'GODOWN_RECEIVED',$2,'harvest',$3,'manager',$4)`,
          [`evt-${Date.now()}`, id, managerId, JSON.stringify({ qty: quantityActual })]
        )
      } catch {}
      return NextResponse.json({ success: true })
    }

    if (action === 'mark_transit') {
      await db.query(`UPDATE harvests SET status = 'IN_TRANSIT' WHERE id = $1`, [id])
      return NextResponse.json({ success: true })
    }

    if (action === 'mark_sold') {
      await db.query(`UPDATE harvests SET status = 'SOLD' WHERE id = $1`, [id])
      return NextResponse.json({ success: true })
    }

    if (action === 'mark_paid') {
      await db.query(`UPDATE harvests SET status = 'PAID' WHERE id = $1`, [id])
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('[PATCH /api/harvests/[id]]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
