import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const fpoId = req.nextUrl.searchParams.get('fpoId')
    const farmerId = req.nextUrl.searchParams.get('farmerId')
    const status = req.nextUrl.searchParams.get('status')

    const db = await getDb()

    if (farmerId) {
      const result = await db.query(
        `SELECT
           h.*,
           p.organization_name as fpo_name,
           p.godown_address,
           p.contact_phone as godown_contact
         FROM harvests h
         JOIN fpos p ON p.id = h.fpo_id
         WHERE h.farmer_id = $1
         ORDER BY h.submitted_at DESC`,
        [farmerId]
      )
      return NextResponse.json({ success: true, harvests: result.rows })
    }

    if (fpoId) {
      const params: unknown[] = [fpoId]
      let statusClause = ''
      if (status) {
        params.push(status)
        statusClause = `AND h.status = $2`
      }
      const result = await db.query(
        `SELECT
           h.*,
           f.full_name as farmer_name,
           f.village as farmer_village,
           f.phone_number as farmer_phone,
           f.upi_id as farmer_upi
         FROM harvests h
         JOIN farmers f ON f.id = h.farmer_id
         WHERE h.fpo_id = $1 ${statusClause}
         ORDER BY h.submitted_at DESC`,
        params
      )
      return NextResponse.json({ success: true, harvests: result.rows })
    }

    return NextResponse.json({ success: false, error: 'fpoId or farmerId required' }, { status: 400 })
  } catch (error) {
    console.error('[GET /api/harvests]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { farmerId, fpoId, cropType, variety, grade, quantityEstimated, moisture, notes } = body

    if (!farmerId || !fpoId || !cropType || !quantityEstimated) {
      return NextResponse.json({ success: false, error: 'farmerId, fpoId, cropType, quantityEstimated required' }, { status: 400 })
    }

    const db = await getDb()
    const harvestId = `har-${Date.now()}`

    await db.query(
      `INSERT INTO harvests
         (id, fpo_id, farmer_id, crop_type, variety, grade_submitted,
          quantity_estimated, quantity_final, notes, status, submitted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'SUBMITTED',NOW())`,
      [
        harvestId, fpoId, farmerId,
        cropType, variety || null, grade || null,
        quantityEstimated, quantityEstimated,
        notes || null,
      ]
    )

    try {
      await db.query(
        `INSERT INTO events (id, event_type, aggregate_id, aggregate_type, actor_id, actor_type, payload)
         VALUES ($1,'HARVEST_CREATED',$2,'harvest',$3,'farmer',$4)`,
        [`evt-${Date.now()}`, harvestId, farmerId, JSON.stringify({ crop: cropType, qty: quantityEstimated, farmer: farmerId })]
      )
    } catch {}

    return NextResponse.json({ success: true, harvestId, status: 'SUBMITTED' })
  } catch (error) {
    console.error('[POST /api/harvests]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
