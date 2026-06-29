'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ShieldCheck, CheckCircle2, RefreshCw, Truck, Banknote } from 'lucide-react'

interface DispatchRow {
  id:               string
  truck_number:     string
  crop:             string
  total_quantity:   number
  current_stage:    number
  mandi_name:       string
  mandi_state:      string
  expected_revenue: number
  actual_revenue:   number
  departed_at:      string | null
  sold_at:          string | null
  created_at:       string
}

interface PayoutRow {
  id:             string
  farmer_id:      string
  farmer_name:    string
  farmer_village: string
  dispatch_id:    string
  crop:           string
  truck_number:   string
  mandi_name:     string
  quantity_q:     number
  share_pct:      number
  net_amount:     number
  payment_status: string
  upi_id:         string | null
  paid_at:        string | null
  created_at:     string
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}
function fmtMoney(v: number | string | null) {
  const n = parseFloat(String(v || 0))
  if (!n) return '—'
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

const STAGE_LABELS: Record<number, string> = {
  0: '🌾 Harvest', 1: '📦 Loading', 2: '🚛 Transit',
  3: '📍 Arrived', 4: '🏪 Sold',    5: '💰 Paid',
}

type Tab = 'dispatches' | 'payments'

export default function LedgerPage() {
  const [tab,        setTab]        = useState<Tab>('dispatches')
  const [dispatches, setDispatches] = useState<DispatchRow[]>([])
  const [payouts,    setPayouts]    = useState<PayoutRow[]>([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAll = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    else        setRefreshing(true)

    const fpoId = localStorage.getItem('fpoId') || 'fpo-001'

    const [diRes, pyRes] = await Promise.allSettled([
      fetch(`/api/dispatches?fpoId=${fpoId}`).then(r => r.json()),
      fetch(`/api/payouts/fpo?fpoId=${fpoId}`).then(r => r.json()),
    ])

    if (diRes.status === 'fulfilled' && diRes.value.success)
      setDispatches(diRes.value.dispatches as DispatchRow[])

    if (pyRes.status === 'fulfilled' && pyRes.value.success)
      setPayouts(pyRes.value.payouts as PayoutRow[])

    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    const iv = setInterval(() => fetchAll(true), 30_000)
    return () => clearInterval(iv)
  }, [fetchAll])

  const totalRevenue  = dispatches.reduce((s, d) => s + (parseFloat(String(d.actual_revenue)) || parseFloat(String(d.expected_revenue)) || 0), 0)
  const paidPayouts   = payouts.filter(p => p.payment_status === 'PAID')
  const totalPaid     = paidPayouts.reduce((s, p) => s + parseFloat(String(p.net_amount)), 0)
  const uniqueFarmers = new Set(payouts.map(p => p.farmer_id)).size

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center" style={{ backgroundColor: '#0A0F0A' }}>
        <div className="text-center space-y-3">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-emerald-400 text-sm font-semibold">Loading ledger…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-5 min-h-full" style={{ backgroundColor: '#0A0F0A' }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Immutable Financial Ledger</h2>
            <p className="text-xs text-gray-500 mt-0.5">Every action permanently recorded — nothing can be changed</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">Tamper-Proof</span>
          </div>
          <button
            onClick={() => fetchAll(true)}
            className={`p-2 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-colors ${refreshing ? 'text-emerald-400' : 'text-gray-500'}`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Dispatches',   value: dispatches.length,                                     color: 'text-amber-400' },
          { label: 'Revenue',      value: fmtMoney(totalRevenue),                                color: 'text-emerald-400' },
          { label: 'Farmers Paid', value: `${paidPayouts.length}`,                               color: 'text-white' },
          { label: 'Distributed',  value: fmtMoney(totalPaid),                                   color: 'text-emerald-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value || '—'}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl w-fit">
        {([
          { id: 'dispatches', label: 'Dispatches', icon: Truck },
          { id: 'payments',   label: 'Payments',   icon: Banknote },
        ] as { id: Tab; label: string; icon: typeof Truck }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === id ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">

        {/* ── Dispatches ─────────────────────────────────────────────────── */}
        {tab === 'dispatches' && (
          <motion.div key="dispatches" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {dispatches.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <p className="text-4xl">🚛</p>
                <p className="text-white font-semibold">No dispatches yet</p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{dispatches.length} dispatches</p>
                  <p className="text-xs text-gray-600">Total revenue: {fmtMoney(totalRevenue)}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {['Date', 'Truck', 'Crop', 'Mandi', 'Qty', 'Revenue', 'Stage'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dispatches.map((d, i) => (
                        <motion.tr
                          key={d.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                        >
                          <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{fmtDate(d.created_at)}</td>
                          <td className="px-4 py-3.5 text-amber-300 font-mono font-semibold">{d.truck_number}</td>
                          <td className="px-4 py-3.5 text-gray-300">{d.crop}</td>
                          <td className="px-4 py-3.5 text-gray-400 whitespace-nowrap">
                            {d.mandi_name}{d.mandi_state ? `, ${d.mandi_state}` : ''}
                          </td>
                          <td className="px-4 py-3.5 text-gray-400">{Math.round(Number(d.total_quantity))}q</td>
                          <td className="px-4 py-3.5 font-bold text-emerald-400">
                            {fmtMoney(Number(d.actual_revenue) || Number(d.expected_revenue))}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-gray-400">
                              {STAGE_LABELS[d.current_stage] ?? `Stage ${d.current_stage}`}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
                  <p className="text-xs text-gray-600">
                    {dispatches.filter(d => d.current_stage >= 5).length} settled ·{' '}
                    {dispatches.filter(d => d.current_stage < 5).length} in progress
                  </p>
                  <p className="text-sm font-bold text-emerald-400">{fmtMoney(totalRevenue)} total</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Payments ───────────────────────────────────────────────────── */}
        {tab === 'payments' && (
          <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {payouts.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <p className="text-4xl">💸</p>
                <p className="text-white font-semibold">No payments yet</p>
                <p className="text-xs text-gray-500">Payments appear here once you process payouts.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm font-semibold text-white">
                    {payouts.length} payments · {uniqueFarmers} farmers
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-emerald-400 font-semibold">
                      ✅ {paidPayouts.length} paid · {fmtMoney(totalPaid)}
                    </span>
                    <span className="text-amber-400 font-semibold">
                      ⏳ {payouts.length - paidPayouts.length} pending
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        {['Date', 'Farmer', 'Crop', 'Truck', 'Mandi', 'Qty', 'Amount', 'UPI', 'Status'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((p, i) => (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                        >
                          <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{fmtDate(p.paid_at || p.created_at)}</td>
                          <td className="px-4 py-3.5">
                            <p className="font-semibold text-white">{p.farmer_name}</p>
                            {p.farmer_village && <p className="text-xs text-gray-600">{p.farmer_village}</p>}
                          </td>
                          <td className="px-4 py-3.5 text-gray-400">{p.crop}</td>
                          <td className="px-4 py-3.5 text-amber-300 font-mono text-xs">{p.truck_number}</td>
                          <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap text-xs">{p.mandi_name}</td>
                          <td className="px-4 py-3.5 text-gray-400">{Math.round(Number(p.quantity_q))}q</td>
                          <td className="px-4 py-3.5 font-bold text-emerald-400">{fmtMoney(Number(p.net_amount))}</td>
                          <td className="px-4 py-3.5 text-gray-600 font-mono text-xs">
                            {p.upi_id ? `${p.upi_id.slice(0, 8)}…` : '—'}
                          </td>
                          <td className="px-4 py-3.5">
                            {p.payment_status === 'PAID' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                ⏳ {p.payment_status}
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
                  <p className="text-xs text-gray-600">{uniqueFarmers} unique farmers</p>
                  <p className="text-sm font-bold text-emerald-400">{fmtMoney(totalPaid)} distributed</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* Verified footer */}
      {(dispatches.length > 0 || payouts.length > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-emerald-500/10 px-5 py-3 flex items-center gap-3 bg-emerald-500/[0.03]"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="font-mono text-xs text-emerald-400">
            {dispatches.length} dispatches · {payouts.length} payments — all immutable
          </p>
          <span className="ml-auto text-xs text-emerald-500/60 font-mono">VERIFIED</span>
        </motion.div>
      )}
    </div>
  )
}
