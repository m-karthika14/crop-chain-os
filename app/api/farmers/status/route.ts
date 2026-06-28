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
         m.id as membership_id, m.status, m.joined_with_code,
         m.requested_at, m.approved_at,
         f.id as fpo_id, f.organization_name, f.fpo_code,
         f.godown_address, f.contact_phone,
         p.name as manager_name
       FROM fpo_memberships m
       JOIN fpos f ON f.id = m.fpo_id
       JOIN managers p ON p.id = f.manager_id
       WHERE m.farmer_id = $1
       AND m.status IN ('ACTIVE', 'PENDING')
       ORDER BY m.requested_at DESC
       LIMIT 1`,
      [farmerId]
    )

    return NextResponse.json({ success: true, membership: result.rows[0] || null })
  } catch (error) {
    console.error('[GET /api/farmers/status]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
