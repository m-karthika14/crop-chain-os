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
      `SELECT
         h.id, h.crop_type, h.variety, h.grade_submitted,
         h.quantity_estimated, h.quantity_actual, h.quantity_final,
         h.status, h.token_number, h.submitted_at,
         h.approved_at, h.godown_received_at,
         h.rejection_reason,
         p.organization_name as fpo_name,
         p.godown_address,
         p.contact_phone as godown_contact,
         m.name as manager_name
       FROM harvests h
       JOIN fpos p ON p.id = h.fpo_id
       JOIN managers m ON m.id = p.manager_id
       WHERE h.farmer_id = $1
       AND h.status NOT IN ('REJECTED')
       ORDER BY h.submitted_at DESC
       LIMIT 10`,
      [farmerId]
    )

    return NextResponse.json({ success: true, harvests: result.rows })
  } catch (error) {
    console.error('[GET /api/harvests/my-harvests]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
