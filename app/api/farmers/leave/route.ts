import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { farmerId, fpoId, reason } = await req.json()

    if (!farmerId || !fpoId) {
      return NextResponse.json({ success: false, error: 'farmerId and fpoId are required' }, { status: 400 })
    }

    const db = await getDb()

    // Check pending crops
    const cropsResult = await db.query(
      `SELECT COUNT(*) as count FROM harvests
       WHERE farmer_id = $1 AND fpo_id = $2
       AND status NOT IN ('PAID', 'REJECTED')`,
      [farmerId, fpoId]
    )
    const pendingCrops = parseInt(cropsResult.rows[0]?.count ?? '0')

    if (pendingCrops > 0) {
      return NextResponse.json({
        success: false,
        error: 'You have pending crops. Cannot leave yet.',
        pendingCrops,
      })
    }

    // Check pending payments
    const payoutsResult = await db.query(
      `SELECT COUNT(*) as count FROM payouts
       WHERE farmer_id = $1 AND fpo_id = $2 AND payment_status = 'PENDING'`,
      [farmerId, fpoId]
    )
    const pendingPayments = parseInt(payoutsResult.rows[0]?.count ?? '0')

    if (pendingPayments > 0) {
      return NextResponse.json({
        success: false,
        error: 'You have pending payments. Cannot leave yet.',
        pendingPayments,
      })
    }

    // If only checking, stop here — no pending items found
    if (reason === 'CHECK_ONLY') {
      return NextResponse.json({ success: true })
    }

    await db.query(
      `UPDATE fpo_memberships
       SET status = 'LEFT', left_at = NOW(), left_reason = $1
       WHERE farmer_id = $2 AND fpo_id = $3 AND status = 'ACTIVE'`,
      [reason, farmerId, fpoId]
    )

    await db.query(
      `UPDATE fpos SET member_count = GREATEST(member_count - 1, 0) WHERE id = $1`,
      [fpoId]
    )

    return NextResponse.json({ success: true, message: 'You have left the FPO.' })
  } catch (error) {
    console.error('[POST /api/farmers/leave]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
