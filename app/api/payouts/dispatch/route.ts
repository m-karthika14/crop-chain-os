import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const dispatchId = req.nextUrl.searchParams.get('dispatchId')
    if (!dispatchId) {
      return NextResponse.json({ success: false, error: 'dispatchId is required' }, { status: 400 })
    }

    const db = await getDb()

    // Dispatch info with mandi details
    const dispatchResult = await db.query(
      `SELECT d.*,
              COALESCE(m.name,  d.mandi_id) as mandi_name,
              COALESCE(m.state, '')         as mandi_state
       FROM dispatches d
       LEFT JOIN mandis m ON m.id = d.mandi_id
       WHERE d.id = $1`,
      [dispatchId]
    )

    if (dispatchResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Dispatch not found' }, { status: 404 })
    }

    const dispatch = dispatchResult.rows[0]

    // Check if formal payouts already exist
    const payoutsResult = await db.query(
      `SELECT p.id, p.farmer_id, p.quantity_q, p.share_pct, p.net_amount,
              p.payment_status, p.paid_at, f.full_name as farmer_name
       FROM payouts p
       JOIN farmers f ON f.id = p.farmer_id
       WHERE p.dispatch_id = $1
       ORDER BY p.net_amount DESC`,
      [dispatchId]
    )

    if (payoutsResult.rows.length > 0) {
      // Real payouts — return as-is
      return NextResponse.json({
        success: true,
        dispatch,
        payouts: payoutsResult.rows,
        estimated: false,
      })
    }

    // No payouts yet — estimate from harvest contributions for this FPO + crop
    // Use COALESCE so we get a quantity even if quantity_final is not yet set
    // Use LOWER() for case-insensitive crop matching
    const harvestResult = await db.query(
      `SELECT h.farmer_id,
              SUM(COALESCE(h.quantity_final, h.quantity_actual, h.quantity_estimated, 0)::numeric) AS qty,
              f.full_name as farmer_name
       FROM harvests h
       JOIN farmers f ON f.id = h.farmer_id
       WHERE h.fpo_id = $1
         AND LOWER(h.crop_type) = LOWER($2)
       GROUP BY h.farmer_id, f.full_name
       ORDER BY qty DESC`,
      [dispatch.fpo_id, dispatch.crop]
    )

    if (harvestResult.rows.length === 0) {
      return NextResponse.json({ success: true, dispatch, payouts: [], estimated: true })
    }

    // Use actual_revenue if sold, else expected_revenue, else estimate ₹2,000/q
    const totalQty = harvestResult.rows.reduce(
      (s: number, r: { qty: string }) => s + parseFloat(r.qty || '0'), 0
    )
    const baseRevenue =
      parseFloat(dispatch.actual_revenue)   > 0 ? parseFloat(dispatch.actual_revenue)   :
      parseFloat(dispatch.expected_revenue) > 0 ? parseFloat(dispatch.expected_revenue) :
      Math.max(totalQty, 1) * 2000

    const farmerPool = baseRevenue * 0.98 // 2% FPO commission

    const estimated = harvestResult.rows.map((r: {
      farmer_id: string
      qty: string
      farmer_name: string
    }, i: number) => {
      const qty      = parseFloat(r.qty || '0')
      const sharePct = totalQty > 0 ? qty / totalQty : 0
      const netAmt   = Math.round(farmerPool * sharePct)
      return {
        id:             `est-${i}`,
        farmer_id:      r.farmer_id,
        farmer_name:    r.farmer_name,
        quantity_q:     Math.round(qty),
        share_pct:      Math.round(sharePct * 10000) / 100,  // e.g. 12.34
        net_amount:     netAmt,
        payment_status: 'ESTIMATED',
        paid_at:        null,
      }
    })

    return NextResponse.json({
      success: true,
      dispatch: {
        ...dispatch,
        // Patch in estimated revenue for UI calculations
        actual_revenue: baseRevenue,
      },
      payouts:   estimated,
      estimated: true,
    })
  } catch (error) {
    console.error('[GET /api/payouts/dispatch]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
