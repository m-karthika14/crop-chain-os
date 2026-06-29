'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LayoutDashboard, Leaf, BarChart3, Truck, Wallet, RefreshCw, CheckCircle2, Clock } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { FarmerHeader } from '@/app/farmer-dashboard/components/farmer-header'

interface DispatchRow {
  id:              string
  crop:            string
  total_quantity:  number
  current_stage:   number
  mandi_name:      string
  mandi_state:     string
  price_per_quintal: number | null
  actual_revenue:  number | null
  expected_revenue:number | null
  farmer_quantity: number | null
  farmer_payout:   number | null
  payout_status:   string | null
  paid_at:         string | null
  sold_at:         string | null
  departed_at:     string | null
  truck_number:    string
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

function fmtMoney(n: number | null) {
  if (!n) return '—'
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

export default function SalesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dispatches,  setDispatches]  = useState<DispatchRow[]>([])
  const [loading,     setLoading]     = useState(true)
  const { t } = useTranslation('en')

  const fetchData = async (id: string) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/dispatches/farmer?farmerId=${id}`)
      const data = await res.json()
      if (data.success) setDispatches(data.dispatches as DispatchRow[])
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    const farmerId = localStorage.getItem('userId') || ''
    if (farmerId) fetchData(farmerId)
    else setLoading(false)
  }, [])

  // Sales = dispatches that reached stage 4+ (sold or paid)
  const sales    = dispatches.filter(d => d.current_stage >= 4)
  const pending  = dispatches.filter(d => d.current_stage < 4)

  const totalSoldQty = sales.reduce((s, d) => s + (parseFloat(String(d.farmer_quantity || 0)) || 0), 0)
  const totalRevenue = sales.reduce((s, d) => s + (parseFloat(String(d.farmer_payout || 0)) || 0), 0)
  const avgPricePerQ = sales.length > 0 && totalSoldQty > 0
    ? sales.reduce((s, d) => {
        const rev = parseFloat(String(d.actual_revenue || d.expected_revenue || 0))
        const qty = parseFloat(String(d.total_quantity || 1))
        return s + (qty > 0 ? rev / qty : 0)
      }, 0) / sales.length
    : 0

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <FarmerHeader subtitle="Sales History" activeNav="sales" sidebarOpen={sidebarOpen} onSidebarToggle={() => setSidebarOpen(v => !v)} />

      <div className="flex">
        {/* Sidebar */}
        <motion.aside initial={{ width: sidebarOpen ? 240 : 0 }} animate={{ width: sidebarOpen ? 240 : 0 }}
          transition={{ duration: 0.3 }} className="hidden lg:block border-r border-emerald-500/10 bg-[#0D0D0D] overflow-hidden shrink-0"
        >
          <nav className="p-6 space-y-2">
            {[
              { href: '/farmer-dashboard',           icon: LayoutDashboard, label: t('sidebar.dashboard') },
              { href: '/farmer-dashboard/harvest',    icon: Leaf,            label: t('sidebar.myHarvest') },
              { href: '/farmer-dashboard/sales',      icon: BarChart3,       label: t('sidebar.salesHistory'), active: true },
              { href: '/farmer-dashboard/dispatches', icon: Truck,           label: t('sidebar.dispatches') },
              { href: '/farmer-dashboard/earnings',   icon: Wallet,          label: t('sidebar.earnings') },
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
              <h2 className="text-2xl font-bold text-white">Sales History</h2>
              <p className="text-sm text-gray-500 mt-1">Crops sold through your FPO dispatches</p>
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
                <p className="text-6xl">📊</p>
                <p className="text-white font-semibold text-lg">No sales yet</p>
                <p className="text-sm text-gray-500">Sales will appear here once your FPO dispatches and sells your crop.</p>
              </div>
            ) : (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Qty Sold',     value: `${Math.round(totalSoldQty)} Q`, sub: `${sales.length} sale${sales.length !== 1 ? 's' : ''} completed`, color: 'text-white' },
                    { label: 'Avg Price/Q',  value: avgPricePerQ > 0 ? fmtMoney(avgPricePerQ) : '—', sub: 'Across sold dispatches', color: 'text-emerald-400' },
                    { label: 'In Transit',   value: pending.length.toString(), sub: `${pending.length} dispatch${pending.length !== 1 ? 'es' : ''} in progress`, color: 'text-amber-400' },
                  ].map(({ label, value, sub, color }) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-xl p-5 border border-emerald-500/10">
                      <p className="text-xs text-gray-500 mb-2">{label}</p>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-500 mt-1">{sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Sold dispatches table */}
                {sales.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="glass rounded-xl border border-emerald-500/10 overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Completed Sales
                      </h3>
                      <p className="text-xs text-gray-600">{sales.length} records</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/[0.06]">
                            {['Date', 'Crop', 'Mandi', 'Truck', 'Your Qty', 'Price/Q', 'Your Payout', 'Status'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sales.map((d, i) => {
                            const pricePerQ = d.price_per_quintal
                              || (d.actual_revenue && d.total_quantity ? parseFloat(String(d.actual_revenue)) / parseFloat(String(d.total_quantity)) : null)
                            const paid = d.payout_status === 'PAID'
                            return (
                              <motion.tr key={d.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                                <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{fmtDate(d.sold_at || d.departed_at)}</td>
                                <td className="px-4 py-3.5 font-semibold text-white">{d.crop}</td>
                                <td className="px-4 py-3.5 text-gray-400 whitespace-nowrap">{d.mandi_name}{d.mandi_state ? `, ${d.mandi_state}` : ''}</td>
                                <td className="px-4 py-3.5 text-amber-300 font-mono text-xs">{d.truck_number}</td>
                                <td className="px-4 py-3.5 text-gray-300">{d.farmer_quantity ? `${Math.round(parseFloat(String(d.farmer_quantity)))} Q` : '—'}</td>
                                <td className="px-4 py-3.5 text-gray-300">{pricePerQ ? fmtMoney(pricePerQ) : '—'}</td>
                                <td className="px-4 py-3.5 font-bold text-emerald-400">{d.farmer_payout ? fmtMoney(parseFloat(String(d.farmer_payout))) : '—'}</td>
                                <td className="px-4 py-3.5">
                                  {paid ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                      <CheckCircle2 className="w-2.5 h-2.5" /> Paid
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                      <Clock className="w-2.5 h-2.5" /> Pending
                                    </span>
                                  )}
                                </td>
                              </motion.tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    {totalRevenue > 0 && (
                      <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
                        <p className="text-xs text-gray-600">Your total payout</p>
                        <p className="text-sm font-bold text-emerald-400">{fmtMoney(totalRevenue)}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* In-progress dispatches */}
                {pending.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass rounded-xl border border-amber-500/15 overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/[0.06]">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" /> In Progress
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/[0.06]">
                            {['Crop', 'Mandi', 'Truck', 'Your Qty', 'Expected', 'Stage'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pending.map((d, i) => {
                            const STAGES = ['🌾 Collected', '📦 Loaded', '🚛 Transit', '📍 Arrived']
                            return (
                              <motion.tr key={d.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                                <td className="px-4 py-3.5 font-semibold text-white">{d.crop}</td>
                                <td className="px-4 py-3.5 text-gray-400 whitespace-nowrap">{d.mandi_name}{d.mandi_state ? `, ${d.mandi_state}` : ''}</td>
                                <td className="px-4 py-3.5 text-amber-300 font-mono text-xs">{d.truck_number}</td>
                                <td className="px-4 py-3.5 text-gray-300">{d.farmer_quantity ? `${Math.round(parseFloat(String(d.farmer_quantity)))} Q` : '—'}</td>
                                <td className="px-4 py-3.5 text-gray-400">{fmtMoney(parseFloat(String(d.expected_revenue || 0)))}</td>
                                <td className="px-4 py-3.5 text-xs text-amber-400">{STAGES[d.current_stage] || `Stage ${d.current_stage}`}</td>
                              </motion.tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
