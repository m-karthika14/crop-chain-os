'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Leaf, BarChart3,
  Truck, Wallet, RefreshCw, CheckCircle2, Clock, TrendingUp, DollarSign,
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { FarmerHeader } from '@/app/farmer-dashboard/components/farmer-header'

interface DispatchRow {
  id:              string
  crop:            string
  total_quantity:  number
  farmer_quantity: number | null
  actual_revenue:  number | null
  expected_revenue:number | null
  price_per_quintal: number | null
  farmer_payout:   number | null
  payout_status:   string | null
  paid_at:         string | null
  sold_at:         string | null
  departed_at:     string | null
  mandi_name:      string
  mandi_state:     string | null
  current_stage:   number
  truck_number:    string
}

interface CropSummary { crop: string; paid: number; pending: number; qty: number; count: number }

function fmtMoney(n: number) {
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

export default function EarningsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dispatches,  setDispatches]  = useState<DispatchRow[]>([])
  const [loading,     setLoading]     = useState(true)
  const { t } = useTranslation('en')

  const fetchData = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/dispatches/farmer?farmerId=${id}`)
      const data = await res.json()
      if (data.success) setDispatches(data.dispatches as DispatchRow[])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    const farmerId = localStorage.getItem('userId') || ''
    if (farmerId) fetchData(farmerId)
    else setLoading(false)
  }, [fetchData])

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalEarned  = dispatches.reduce((s, d) => s + (d.payout_status === 'PAID' && d.farmer_payout ? Number(d.farmer_payout) : 0), 0)
  const totalPending = dispatches.reduce((s, d) => s + (d.farmer_payout && d.payout_status !== 'PAID' ? Number(d.farmer_payout) : 0), 0)
  const paidCount    = dispatches.filter(d => d.payout_status === 'PAID').length
  const soldCount    = dispatches.filter(d => d.current_stage >= 4).length
  const avgPayout    = paidCount > 0 ? totalEarned / paidCount : 0

  // Per-crop summary
  const cropMap = new Map<string, CropSummary>()
  for (const d of dispatches) {
    const existing = cropMap.get(d.crop) || { crop: d.crop, paid: 0, pending: 0, qty: 0, count: 0 }
    const payout   = Number(d.farmer_payout || 0)
    if (d.payout_status === 'PAID') existing.paid += payout
    else if (payout > 0)            existing.pending += payout
    existing.qty  += Number(d.farmer_quantity || 0)
    existing.count++
    cropMap.set(d.crop, existing)
  }
  const cropSummaries = Array.from(cropMap.values()).sort((a, b) => (b.paid + b.pending) - (a.paid + a.pending))

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <FarmerHeader subtitle="Earnings" activeNav="earnings" sidebarOpen={sidebarOpen} onSidebarToggle={() => setSidebarOpen(v => !v)} />

      <div className="flex">
        {/* Sidebar */}
        <motion.aside initial={{ width: sidebarOpen ? 240 : 0 }} animate={{ width: sidebarOpen ? 240 : 0 }}
          transition={{ duration: 0.3 }} className="hidden lg:block border-r border-emerald-500/10 bg-[#0D0D0D] overflow-hidden shrink-0">
          <nav className="p-6 space-y-2">
            {[
              { href: '/farmer-dashboard',           icon: LayoutDashboard, label: t('sidebar.dashboard') },
              { href: '/farmer-dashboard/harvest',    icon: Leaf,            label: t('sidebar.myHarvest') },
              { href: '/farmer-dashboard/sales',      icon: BarChart3,       label: t('sidebar.salesHistory') },
              { href: '/farmer-dashboard/dispatches', icon: Truck,           label: t('sidebar.dispatches') },
              { href: '/farmer-dashboard/earnings',   icon: Wallet,          label: t('sidebar.earnings'), active: true },
            ].map(({ href, icon: Icon, label, active }) => (
              <Link key={href} href={href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]'}`}>
                <Icon className="w-5 h-5" /><span>{label}</span>
              </Link>
            ))}
          </nav>
        </motion.aside>

        <main className="flex-1 overflow-auto">
          <div className="p-6 w-full max-w-5xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Earnings</h2>
              <p className="text-sm text-gray-500 mt-1">Your income from FPO dispatches and sales</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                </div>
              </div>
            ) : dispatches.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <p className="text-6xl">💰</p>
                <p className="text-white font-semibold text-lg">No earnings yet</p>
                <p className="text-sm text-gray-500">Earnings appear once your FPO dispatches and sells your crop.</p>
              </div>
            ) : (
              <>
                {/* KPI row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Paid Out',   value: totalEarned > 0 ? fmtMoney(totalEarned) : '₹0', icon: DollarSign,   color: 'text-emerald-400', sub: `${paidCount} payment${paidCount !== 1 ? 's' : ''} received` },
                    { label: 'Pending',          value: totalPending > 0 ? fmtMoney(totalPending) : '₹0', icon: Clock,      color: 'text-amber-400',   sub: totalPending > 0 ? 'Awaiting FPO payment' : 'All settled' },
                    { label: 'Avg per Sale',     value: avgPayout > 0 ? fmtMoney(avgPayout) : '—',       icon: TrendingUp, color: 'text-blue-400',    sub: 'Per paid dispatch' },
                    { label: 'Dispatches Sold',  value: soldCount.toString(),                              icon: CheckCircle2, color: 'text-white',    sub: `of ${dispatches.length} total` },
                  ].map(({ label, value, icon: Icon, color, sub }) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-xl p-5 border border-emerald-500/10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500">{label}</p>
                        <Icon className={`w-4 h-4 ${color} opacity-60`} />
                      </div>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-600 mt-1">{sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Per-crop breakdown */}
                {cropSummaries.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="glass rounded-xl border border-emerald-500/10 p-5">
                    <h3 className="text-sm font-bold text-white mb-4">Earnings by Crop</h3>
                    <div className="space-y-3">
                      {cropSummaries.map(cs => {
                        const total  = cs.paid + cs.pending
                        const maxVal = Math.max(...cropSummaries.map(x => x.paid + x.pending), 1)
                        const pct    = Math.round((total / maxVal) * 100)
                        return (
                          <div key={cs.crop} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{cs.crop}</span>
                                <span className="text-gray-600">· {Math.round(cs.qty)} Q · {cs.count} dispatch{cs.count !== 1 ? 'es' : ''}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {cs.paid > 0 && <span className="text-emerald-400 font-bold">{fmtMoney(cs.paid)} paid</span>}
                                {cs.pending > 0 && <span className="text-amber-400">{fmtMoney(cs.pending)} pending</span>}
                              </div>
                            </div>
                            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                              <div className="h-full flex">
                                <div className="bg-emerald-500 rounded-l-full transition-all" style={{ width: `${Math.round((cs.paid / (total || 1)) * pct)}%` }} />
                                <div className="bg-amber-500 rounded-r-full transition-all" style={{ width: `${Math.round((cs.pending / (total || 1)) * pct)}%` }} />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Dispatch-wise table */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="glass rounded-xl border border-emerald-500/10 overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Dispatch-wise Breakdown</h3>
                    <p className="text-xs text-gray-600">{dispatches.length} entries</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          {['Date', 'Crop', 'Mandi', 'Truck', 'Your Qty', 'Your Payout', 'Status'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dispatches.map((d, i) => {
                          const paid       = d.payout_status === 'PAID'
                          const hasPayout  = d.farmer_payout != null && Number(d.farmer_payout) > 0
                          const STAGE_LABEL: Record<number, string> = {
                            0: '🌾 Collected', 1: '📦 Loaded', 2: '🚛 Transit',
                            3: '📍 Arrived',   4: '🏪 Sold',   5: '💰 Paid',
                          }
                          return (
                            <motion.tr key={d.id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                              className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                              <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap text-xs">{fmtDate(d.paid_at || d.sold_at || d.departed_at)}</td>
                              <td className="px-4 py-3.5 font-semibold text-white">{d.crop}</td>
                              <td className="px-4 py-3.5 text-gray-400 whitespace-nowrap">{d.mandi_name}{d.mandi_state ? `, ${d.mandi_state}` : ''}</td>
                              <td className="px-4 py-3.5 text-amber-300 font-mono text-xs">{d.truck_number}</td>
                              <td className="px-4 py-3.5 text-gray-300">{d.farmer_quantity ? `${Math.round(Number(d.farmer_quantity))} Q` : '—'}</td>
                              <td className="px-4 py-3.5 font-bold text-emerald-400">{hasPayout ? fmtMoney(Number(d.farmer_payout)) : '—'}</td>
                              <td className="px-4 py-3.5">
                                {paid ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Paid
                                  </span>
                                ) : hasPayout ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                    <Clock className="w-2.5 h-2.5" /> Processing
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500 border border-gray-500/20">
                                    {STAGE_LABEL[d.current_stage] || `Stage ${d.current_stage}`}
                                  </span>
                                )}
                              </td>
                            </motion.tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Footer totals */}
                  <div className="px-5 py-3 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
                    <p className="text-xs text-gray-600">Total received</p>
                    <p className="text-sm font-bold text-emerald-400">{totalEarned > 0 ? fmtMoney(totalEarned) : '₹0'}</p>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
