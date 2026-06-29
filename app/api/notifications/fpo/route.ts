import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/notifications/fpo?fpoId=X
export async function GET(req: NextRequest) {
  try {
    const fpoId = req.nextUrl.searchParams.get('fpoId')
    if (!fpoId) {
      return NextResponse.json({ success: false, error: 'fpoId required' }, { status: 400 })
    }

    const db = await getDb()
    const notifications: { id: string; text: string; time: Date; type: string }[] = []

    // Each query is independent — one failure won't break the whole endpoint
    const run = async (fn: () => Promise<void>) => { try { await fn() } catch {} }

    await run(async () => {
      // Pending farmer join requests
      const r = await db.query(
        `SELECT COUNT(*) as cnt FROM farmers WHERE fpo_id = $1 AND status = 'pending'`,
        [fpoId]
      )
      const cnt = parseInt(r.rows[0]?.cnt ?? '0')
      if (cnt > 0) {
        notifications.push({
          id:   'pending-join',
          text: `${cnt} farmer${cnt > 1 ? 's' : ''} waiting to join your FPO`,
          time: new Date(),
          type: 'join',
        })
      }
    })

    await run(async () => {
      // Recent dispatches (last 7 days)
      const r = await db.query(
        `SELECT id, truck_number, crop, current_stage, departed_at, created_at
         FROM dispatches
         WHERE fpo_id = $1 AND created_at > NOW() - INTERVAL '7 days'
         ORDER BY created_at DESC LIMIT 8`,
        [fpoId]
      )
      const stageLabel = ['Registered', 'Loading', 'In Transit', 'Arrived', 'Sold', 'Paid']
      for (const d of r.rows) {
        notifications.push({
          id:   `dispatch-${d.id}`,
          text: `Dispatch ${d.truck_number} (${d.crop}) — ${stageLabel[d.current_stage] ?? 'Updated'}`,
          time: new Date(d.departed_at || d.created_at),
          type: 'dispatch',
        })
      }
    })

    await run(async () => {
      // Recent paid payouts — join through dispatches to avoid payouts.fpo_id
      const r = await db.query(
        `SELECT p.id, p.net_amount, p.paid_at,
                f.full_name as farmer_name,
                d.crop, d.truck_number
         FROM payouts p
         JOIN farmers   f ON f.id = p.farmer_id
         JOIN dispatches d ON d.id = p.dispatch_id
         WHERE d.fpo_id = $1
           AND p.payment_status = 'PAID'
           AND p.paid_at > NOW() - INTERVAL '7 days'
         ORDER BY p.paid_at DESC LIMIT 8`,
        [fpoId]
      )
      for (const p of r.rows) {
        const amt = Math.round(parseFloat(p.net_amount)).toLocaleString('en-IN')
        notifications.push({
          id:   `payout-${p.id}`,
          text: `₹${amt} paid to ${p.farmer_name} for ${p.crop}`,
          time: new Date(p.paid_at),
          type: 'payment',
        })
      }
    })

    await run(async () => {
      // Recently approved/verified harvests — use created_at (no updated_at column)
      const r = await db.query(
        `SELECT h.id, h.crop_type, h.status,
                COALESCE(h.quantity_final, h.quantity_actual, h.quantity_estimated, 0) as qty,
                f.full_name as farmer_name,
                h.created_at
         FROM harvests h
         JOIN farmers f ON f.id = h.farmer_id
         WHERE h.fpo_id = $1
           AND h.status IN ('approved', 'verified')
           AND h.created_at > NOW() - INTERVAL '7 days'
         ORDER BY h.created_at DESC LIMIT 5`,
        [fpoId]
      )
      for (const h of r.rows) {
        notifications.push({
          id:   `harvest-${h.id}`,
          text: `${h.farmer_name}'s ${h.crop_type} harvest (${Math.round(Number(h.qty))}q) approved`,
          time: new Date(h.created_at),
          type: 'harvest',
        })
      }
    })

    // Sort newest first
    notifications.sort((a, b) => b.time.getTime() - a.time.getTime())

    const now = Date.now()
    const formatted = notifications.slice(0, 15).map(n => {
      const diff = Math.floor((now - n.time.getTime()) / 1000)
      let timeStr: string
      if (diff < 60)        timeStr = 'just now'
      else if (diff < 3600) timeStr = `${Math.floor(diff / 60)}m ago`
      else if (diff < 86400)timeStr = `${Math.floor(diff / 3600)}h ago`
      else                  timeStr = `${Math.floor(diff / 86400)}d ago`
      return { id: n.id, text: n.text, time: timeStr, type: n.type }
    })

    return NextResponse.json({ success: true, notifications: formatted, unread: formatted.length })
  } catch (error) {
    console.error('[GET /api/notifications/fpo]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
