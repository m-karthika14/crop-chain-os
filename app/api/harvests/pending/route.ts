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
         h.id, h.crop_type, h.variety, h.grade_submitted,
         h.quantity_estimated, h.notes, h.submitted_at,
         f.full_name as farmer_name,
         f.village as farmer_village,
         f.phone_number as farmer_phone
       FROM harvests h
       JOIN farmers f ON f.id = h.farmer_id
       WHERE h.fpo_id = $1 AND h.status = 'SUBMITTED'
       ORDER BY h.submitted_at ASC`,
      [fpoId]
    )

    return NextResponse.json({ success: true, pending: result.rows, count: result.rows.length })
  } catch (error) {
    console.error('[GET /api/harvests/pending]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
