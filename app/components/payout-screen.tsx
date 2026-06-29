'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, TrendingUp, Users, Wallet, ArrowDownRight,
  Clock, ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react'

interface PayoutRow {
  id:             string
  farmer_id:      string
  farmer_name:    string
  quantity_q:     number
  share_pct:      number
  net_amount:     number
  payment_status: string   // 'PENDING' | 'PAID' | 'ESTIMATED'
  paid_at:        string | null
}

interface DispatchRow {
  id:               string
  crop:             string
  total_quantity:   number
  actual_revenue:   number
  expected_revenue: number
  price_per_quintal: number
  mandi_name:       string
  mandi_state:      string
  truck_number:     string
  current_stage:    number
  [key: string]: unknown
}

interface PayoutScreenProps {
  dispatchId: string
  onBack:     () => void
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'PAID') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="w-2.5 h-2.5" /> Paid
      </span>
    )
  }
  if (status === 'ESTIMATED') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
        <AlertCircle className="w-2.5 h-2.5" /> Estimated
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
      <Clock className="w-2.5 h-2.5" /> Pending
    </span>
  )
}

export function PayoutScreen({ dispatchId, onBack }: PayoutScreenProps) {
  const [loading,   setLoading]   = useState(true)
  const [dispatch,  setDispatch]  = useState<DispatchRow | null>(null)
  const [payouts,   setPayouts]   = useState<PayoutRow[]>([])
  const [estimated, setEstimated] = useState(false)
  const [showAll,   setShowAll]   = useState(false)

  useEffect(() => {
    if (!dispatchId) { setLoading(false); return }
    fetch(`/api/payouts/dispatch?dispatchId=${dispatchId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setDispatch(data.dispatch as DispatchRow)
          setPayouts(data.payouts  as PayoutRow[])
          setEstimated(Boolean(data.estimated))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [dispatchId])

  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#0A0F0A' }}>
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-emerald-400 font-semibold text-sm">Loading payout data…</p>
      </div>
    )
  }

  const actualRevenue = dispatch ? Number(dispatch.actual_revenue) || 0 : 0
  const fpoCut        = actualRevenue * 0.02
  const farmerTotal   = actualRevenue * 0.98
  const avgPerFarmer  = payouts.length > 0 ? farmerTotal / payouts.length : 0
  const sorted        = [...payouts].sort((a, b) => Number(b.net_amount) - Number(a.net_amount))
  const top5          = sorted.slice(0, 5)
  const rest          = sorted.slice(5)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-full p-4 md:p-8 space-y-6"
      style={{ backgroundColor: '#0A0F0A' }}
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-start justify-between gap-4 flex-wrap"
        >
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {estimated ? 'Estimated Farmer Payouts' : 'Sale Complete — Payouts Ready'}
              </h1>
              {estimated && (
                <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Estimates
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm">
              {dispatch
                ? `${dispatch.truck_number} · ${dispatch.mandi_name}, ${dispatch.mandi_state} · ${dispatch.crop}`
                : 'Loading dispatch details…'}
            </p>
            {estimated && (
              <p className="text-amber-400/70 text-xs mt-1">
                Based on each farmer&apos;s harvest contribution — amounts will be confirmed after sale is recorded.
              </p>
            )}
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-2 ${
              estimated
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-emerald-500 bg-emerald-500/10'
            }`}
          >
            {estimated
              ? <AlertCircle className="w-7 h-7 text-amber-400" />
              : <CheckCircle2 className="w-7 h-7 text-emerald-400" />}
          </motion.div>
        </motion.div>

        {/* KPI cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {([
            {
              label: estimated ? 'Expected Revenue' : 'Total Revenue',
              value: `₹${actualRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
              sub:   dispatch?.price_per_quintal
                       ? `At ₹${Number(dispatch.price_per_quintal).toLocaleString('en-IN')}/quintal`
                       : estimated ? 'Projected amount' : 'Final sale',
              color: 'emerald' as const,
              Icon:  TrendingUp,
            },
            {
              label: 'FPO Commission (2%)',
              value: `₹${fpoCut.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
              sub:   'Operational & logistics',
              color: 'amber' as const,
              Icon:  Wallet,
            },
            {
              label: 'Farmer Distribution',
              value: `₹${farmerTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
              sub:   `To ${payouts.length} farmer${payouts.length !== 1 ? 's' : ''}`,
              color: 'blue' as const,
              Icon:  Users,
            },
            {
              label: 'Avg Per Farmer',
              value: `₹${avgPerFarmer.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
              sub:   'Based on quantity contributed',
              color: 'purple' as const,
              Icon:  ArrowDownRight,
            },
          ] as const).map(({ label, value, sub, color, Icon }) => {
            const colorMap = {
              emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', text: 'text-emerald-400' },
              amber:   { border: 'border-amber-500/30',   bg: 'bg-amber-500/5',   text: 'text-amber-400' },
              blue:    { border: 'border-blue-500/30',    bg: 'bg-blue-500/5',    text: 'text-blue-400' },
              purple:  { border: 'border-purple-500/30',  bg: 'bg-purple-500/5',  text: 'text-purple-400' },
            }
            const c = colorMap[color]
            return (
              <div key={label} className={`p-5 rounded-2xl border ${c.border} ${c.bg}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase text-gray-500 font-semibold leading-tight">{label}</span>
                  <Icon className={`w-4 h-4 ${c.text} shrink-0`} />
                </div>
                <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-1">{sub}</p>
              </div>
            )
          })}
        </motion.div>

        {/* Revenue split bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <h2 className="text-base font-bold text-white mb-5">Revenue Split</h2>
          <div className="flex rounded-lg overflow-hidden h-10 mb-3">
            <div
              className="bg-emerald-500 flex items-center justify-center text-black text-xs font-bold"
              style={{ width: actualRevenue > 0 ? '98%' : '0%' }}
            >
              Farmers 98%
            </div>
            <div
              className="bg-amber-500 flex items-center justify-center text-black text-[10px] font-bold"
              style={{ width: actualRevenue > 0 ? '2%' : '0%' }}
            />
          </div>
          <div className="flex gap-6 text-sm">
            <span className="text-gray-400 flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Farmers — 98%
            </span>
            <span className="text-gray-400 flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500" />
              FPO Commission — 2%
            </span>
          </div>
        </motion.div>

        {/* Farmers table */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-white">Contributing Farmers</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-gray-400 font-semibold">
                {payouts.length}
              </span>
            </div>
            {estimated && (
              <span className="text-xs text-amber-400/80 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Amounts are estimates until sale is confirmed
              </span>
            )}
          </div>

          {sorted.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-4xl mb-3">🌾</p>
              <p className="text-gray-500 text-sm">No harvest contributions found for this dispatch crop.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['#', 'Farmer', 'Quantity', 'Share', 'Amount', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {top5.map((p, idx) => (
                      <motion.tr
                        key={p.id || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + idx * 0.05 }}
                        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-3.5 w-12">
                          <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                            <span className="text-xs font-bold text-emerald-400">{idx + 1}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-white">{p.farmer_name}</p>
                          <p className="text-xs text-gray-600 mt-0.5 font-mono">{p.farmer_id.slice(0, 8)}…</p>
                        </td>
                        <td className="px-5 py-3.5 text-gray-300">{Math.round(Number(p.quantity_q))}q</td>
                        <td className="px-5 py-3.5 text-gray-400">{Number(p.share_pct).toFixed(1)}%</td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-emerald-400">
                            ₹{Number(p.net_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={p.payment_status} />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Collapsible rest */}
              {rest.length > 0 && (
                <>
                  <AnimatePresence>
                    {showAll && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <table className="w-full text-sm">
                          <tbody>
                            {rest.map((p, idx) => (
                              <tr
                                key={p.id || idx}
                                className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                              >
                                <td className="px-5 py-3 w-12">
                                  <div className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-500">{idx + 6}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-3">
                                  <p className="font-semibold text-white">{p.farmer_name}</p>
                                  <p className="text-xs text-gray-600 font-mono">{p.farmer_id.slice(0, 8)}…</p>
                                </td>
                                <td className="px-5 py-3 text-gray-300">{Math.round(Number(p.quantity_q))}q</td>
                                <td className="px-5 py-3 text-gray-400">{Number(p.share_pct).toFixed(1)}%</td>
                                <td className="px-5 py-3">
                                  <span className="font-bold text-emerald-400">
                                    ₹{Number(p.net_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                  </span>
                                </td>
                                <td className="px-5 py-3">
                                  <StatusBadge status={p.payment_status} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={() => setShowAll(v => !v)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 border-t border-white/[0.06] text-sm text-gray-500 hover:text-gray-300 hover:bg-white/[0.02] transition-colors"
                  >
                    {showAll
                      ? <><ChevronUp className="w-4 h-4" /> Collapse</>
                      : <><ChevronDown className="w-4 h-4" /> Show {rest.length} more farmers</>}
                  </button>
                </>
              )}
            </>
          )}
        </motion.div>

        {/* Back button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 transition-colors font-bold text-black"
          >
            ← Back to Dispatches
          </button>
        </motion.div>

      </div>
    </motion.div>
  )
}
