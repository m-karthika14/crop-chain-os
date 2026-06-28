import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fpoId = req.nextUrl.searchParams.get('fpoId')

    if (!fpoId) {
      return NextResponse.json({ success: false, error: 'fpoId is required' }, { status: 400 })
    }

    const db = await getDb()

    await db.query(
      `UPDATE fpo_memberships
       SET status = 'REMOVED', left_at = NOW(), left_reason = 'Removed by manager'
       WHERE farmer_id = $1 AND fpo_id = $2`,
      [id, fpoId]
    )

    await db.query(
      `UPDATE fpos SET member_count = GREATEST(member_count - 1, 0) WHERE id = $1`,
      [fpoId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/farmers/[id]]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
