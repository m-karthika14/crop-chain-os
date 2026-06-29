import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const dispatchId = req.nextUrl.searchParams.get('dispatchId')

    if (!dispatchId) {
      return NextResponse.json({ success: false, error: 'dispatchId is required' }, { status: 400 })
    }

    const db = await getDb()

    // Get dispatch info with mandi details
    const dispatchResult = await db.query(
      `SELECT d.*, m.name as mandi_name, m.state as mandi_state
       FROM dispatches d JOIN mandis m ON m.id = d.mandi_id
       WHERE d.id = $1`,
      [dispatchId]
    )

    if (dispatchResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Dispatch not found' }, { status: 404 })
    }

    // Get payouts with farmer names
    const payoutsResult = await db.query(
      `SELECT p.id, p.farmer_id, p.quantity_q, p.share_pct, p.net_amount, p.payment_status, p.paid_at, f.full_name as farmer_name
       FROM payouts p
       JOIN farmers f ON f.id = p.farmer_id
       WHERE p.dispatch_id = $1
       ORDER BY p.net_amount DESC`,
      [dispatchId]
    )

    return NextResponse.json({
      success: true,
      dispatch: dispatchResult.rows[0],
      payouts: payoutsResult.rows,
    })
  } catch (error) {
    console.error('[GET /api/payouts/dispatch]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
