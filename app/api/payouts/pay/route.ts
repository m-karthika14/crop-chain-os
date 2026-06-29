import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// POST /api/payouts/pay  — marks all payouts for a dispatch as PAID
export async function POST(req: NextRequest) {
  try {
    const { dispatchId, fpoId } = await req.json()
    if (!dispatchId) {
      return NextResponse.json({ success: false, error: 'dispatchId required' }, { status: 400 })
    }

    const db = await getDb()

    // If estimated payouts don't exist yet, create them first
    const existing = await db.query(
      `SELECT COUNT(*) as cnt FROM payouts WHERE dispatch_id = $1`,
      [dispatchId]
    )
    const count = parseInt(existing.rows[0]?.cnt ?? '0')

    if (count === 0) {
      // Build payouts from harvest contributions
      const dispatch = await db.query(
        `SELECT fpo_id, crop, actual_revenue, expected_revenue, total_quantity
         FROM dispatches WHERE id = $1`,
        [dispatchId]
      )
      const d = dispatch.rows[0]
      if (!d) return NextResponse.json({ success: false, error: 'Dispatch not found' }, { status: 404 })

      const harvests = await db.query(
        `SELECT h.farmer_id,
                COALESCE(h.quantity_final, h.quantity_actual, h.quantity_estimated, 0) as qty,
                f.upi_id
         FROM harvests h
         JOIN farmers f ON f.id = h.farmer_id
         WHERE h.fpo_id = $1 AND LOWER(h.crop_type) = LOWER($2)`,
        [d.fpo_id, d.crop]
      )

      if (harvests.rows.length > 0) {
        const totalQty = harvests.rows.reduce((s: number, r: { qty: string }) => s + parseFloat(r.qty || '0'), 0)
        const revenue  = parseFloat(d.actual_revenue) || parseFloat(d.expected_revenue) || (totalQty * 2000)
        const pool     = revenue * 0.98

        for (const h of harvests.rows) {
          const qty      = parseFloat(h.qty || '0')
          const sharePct = totalQty > 0 ? qty / totalQty : 0
          const net      = Math.round(pool * sharePct)
          await db.query(
            `INSERT INTO payouts
               (id, dispatch_id, farmer_id, fpo_id, quantity_q, share_pct, net_amount,
                upi_id, payment_status, paid_at, created_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'PAID',NOW(),NOW())`,
            [
              `pay-${Date.now()}-${h.farmer_id.slice(-4)}`,
              dispatchId, h.farmer_id, d.fpo_id || fpoId,
              Math.round(qty),
              Math.round(sharePct * 1000000) / 10000,
              net,
              h.upi_id || null,
            ]
          )
        }
      }
    } else {
      // Mark existing payouts as PAID
      await db.query(
        `UPDATE payouts SET payment_status = 'PAID', paid_at = NOW()
         WHERE dispatch_id = $1 AND payment_status != 'PAID'`,
        [dispatchId]
      )
    }

    // Advance dispatch to stage 5
    await db.query(
      `UPDATE dispatches SET current_stage = 5 WHERE id = $1 AND current_stage < 5`,
      [dispatchId]
    )

    // Count how many farmers were paid
    const paid = await db.query(
      `SELECT COUNT(*) as cnt FROM payouts WHERE dispatch_id = $1 AND payment_status = 'PAID'`,
      [dispatchId]
    )

    return NextResponse.json({
      success: true,
      paidCount: parseInt(paid.rows[0]?.cnt ?? '0'),
    })
  } catch (error) {
    console.error('[POST /api/payouts/pay]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
