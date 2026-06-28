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
         f.id, f.full_name, f.phone_number, f.village,
         f.email, m.id as membership_id, m.joined_with_code,
         m.requested_at
       FROM farmers f
       JOIN fpo_memberships m ON m.farmer_id = f.id
       WHERE m.fpo_id = $1 AND m.status = 'PENDING'
       ORDER BY m.requested_at ASC`,
      [fpoId]
    )

    return NextResponse.json({ success: true, pending: result.rows })
  } catch (error) {
    console.error('[GET /api/farmers/pending]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
