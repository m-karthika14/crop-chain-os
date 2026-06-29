import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// GET /api/notifications/farmer?farmerId=X
export async function GET(req: NextRequest) {
  const farmerId = req.nextUrl.searchParams.get('farmerId')
  if (!farmerId) return NextResponse.json({ success: false, error: 'farmerId required' }, { status: 400 })

  const db = await getDb()
  const notifications: { id: string; text: string; time: Date; type: string }[] = []

  const run = async (fn: () => Promise<void>) => { try { await fn() } catch {} }

  await run(async () => {
    // Harvest approvals / verifications
    const r = await db.query(
      `SELECT h.id, h.crop_type, h.status, h.created_at,
              COALESCE(h.quantity_final, h.quantity_actual, h.quantity_estimated, 0) as qty,
              f.organization_name as fpo_name
       FROM harvests h
       JOIN fpos f ON f.id = h.fpo_id
       WHERE h.farmer_id = $1
         AND h.status IN ('APPROVED', 'VERIFIED', 'GODOWN_RECEIVED', 'REJECTED')
       ORDER BY h.created_at DESC LIMIT 6`,
      [farmerId]
    )
    for (const h of r.rows) {
      const label = h.status === 'APPROVED' ? 'approved' : h.status === 'VERIFIED' ? 'verified' : h.status === 'GODOWN_RECEIVED' ? 'received at godown' : 'rejected'
      notifications.push({
        id:   `harvest-${h.id}`,
        text: `Your ${h.crop_type} harvest (${Math.round(Number(h.qty))}q) was ${label} by ${h.fpo_name}`,
        time: new Date(h.created_at),
        type: h.status === 'REJECTED' ? 'alert' : 'harvest',
      })
    }
  })

  await run(async () => {
    // Dispatch stage updates involving this farmer's crops
    const r = await db.query(
      `SELECT DISTINCT d.id, d.crop, d.current_stage, d.truck_number,
              d.departed_at, d.arrived_at, d.sold_at, d.created_at
       FROM dispatches d
       JOIN harvests h ON h.fpo_id = d.fpo_id AND h.crop_type = d.crop
       WHERE h.farmer_id = $1
         AND d.current_stage >= 2
         AND d.created_at > NOW() - INTERVAL '30 days'
       ORDER BY d.created_at DESC LIMIT 6`,
      [farmerId]
    )
    const stageLabel: Record<number, string> = { 2: '🚛 now in transit', 3: '📍 arrived at mandi', 4: '🏪 sold at mandi', 5: '💰 payment processed' }
    for (const d of r.rows) {
      const label = stageLabel[d.current_stage]
      if (!label) continue
      const dateField = d.sold_at || d.arrived_at || d.departed_at || d.created_at
      notifications.push({
        id:   `dispatch-${d.id}`,
        text: `Your ${d.crop} dispatch (${d.truck_number}) is ${label}`,
        time: new Date(dateField),
        type: 'dispatch',
      })
    }
  })

  await run(async () => {
    // Payouts received
    const r = await db.query(
      `SELECT p.id, p.net_amount, p.paid_at, d.crop, d.truck_number
       FROM payouts p
       JOIN dispatches d ON d.id = p.dispatch_id
       WHERE p.farmer_id = $1
         AND p.payment_status = 'PAID'
         AND p.paid_at > NOW() - INTERVAL '30 days'
       ORDER BY p.paid_at DESC LIMIT 5`,
      [farmerId]
    )
    for (const p of r.rows) {
      const amt = Math.round(parseFloat(p.net_amount)).toLocaleString('en-IN')
      notifications.push({
        id:   `payout-${p.id}`,
        text: `₹${amt} received for ${p.crop} dispatch (${p.truck_number})`,
        time: new Date(p.paid_at),
        type: 'payment',
      })
    }
  })

  await run(async () => {
    // FPO membership approval
    const r = await db.query(
      `SELECT m.id, m.status, m.approved_at, f.organization_name
       FROM fpo_memberships m
       JOIN fpos f ON f.id = m.fpo_id
       WHERE m.farmer_id = $1
         AND m.status = 'ACTIVE'
         AND m.approved_at > NOW() - INTERVAL '30 days'
       ORDER BY m.approved_at DESC LIMIT 2`,
      [farmerId]
    )
    for (const m of r.rows) {
      notifications.push({
        id:   `member-${m.id}`,
        text: `You have been approved as a member of ${m.organization_name}`,
        time: new Date(m.approved_at),
        type: 'join',
      })
    }
  })

  notifications.sort((a, b) => b.time.getTime() - a.time.getTime())

  const now = Date.now()
  const formatted = notifications.slice(0, 15).map(n => {
    const diff = Math.floor((now - n.time.getTime()) / 1000)
    let timeStr: string
    if (diff < 60)         timeStr = 'just now'
    else if (diff < 3600)  timeStr = `${Math.floor(diff / 60)}m ago`
    else if (diff < 86400) timeStr = `${Math.floor(diff / 3600)}h ago`
    else                   timeStr = `${Math.floor(diff / 86400)}d ago`
    return { id: n.id, text: n.text, time: timeStr, type: n.type }
  })

  return NextResponse.json({ success: true, notifications: formatted, unread: formatted.length })
}
