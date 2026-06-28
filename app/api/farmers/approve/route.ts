import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { membershipId, fpoId, managerId, action, reason } = body

    if (!membershipId || !fpoId) {
      return NextResponse.json({ success: false, error: 'membershipId and fpoId are required' }, { status: 400 })
    }

    const db = await getDb()

    if (action === 'reject') {
      await db.query(
        `UPDATE fpo_memberships
         SET status = 'REMOVED', left_reason = $1, left_at = NOW()
         WHERE id = $2 AND fpo_id = $3`,
        [reason ?? 'Rejected by manager', membershipId, fpoId]
      )
      return NextResponse.json({ success: true })
    }

    // Default: approve
    await db.query(
      `UPDATE fpo_memberships
       SET status = 'ACTIVE', approved_at = NOW(), approved_by = $1
       WHERE id = $2 AND fpo_id = $3`,
      [managerId ?? '', membershipId, fpoId]
    )

    await db.query(
      `UPDATE fpos SET member_count = member_count + 1 WHERE id = $1`,
      [fpoId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/farmers/approve]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
