'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Wheat, TrendingUp, DollarSign, CheckCircle2, LayoutDashboard,
  Leaf, BarChart3, Truck, Wallet, Plus, ChevronRight, Clock, Package,
} from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { FPOOnboarding } from '@/app/components/fpo-onboarding'
import { FarmerHeader } from '@/app/farmer-dashboard/components/farmer-header'

interface HarvestRow {
  id: string
  crop_type: string
  variety: string | null
  quantity_estimated: string | null
  quantity_actual: string | null
  quantity_final: string | null
  status: string
  token_number: string | null
  submitted_at: string | null
  fpo_name: string
}

interface DispatchRow {
  id: string
  crop: string
  total_quantity: number
  current_stage: number
  mandi_name: string
  mandi_state: string
  price_per_quintal: number | null
  actual_revenue: number | null
  expected_revenue: number | null
  farmer_quantity: number | null
  farmer_payout: number | null
  payout_status: string | null
  sold_at: string | null
  truck_number: string
}


function fmtMoney(n: number) {
  if (!n) return '—'
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function harvestQty(h: HarvestRow) {
  return parseFloat(h.quantity_final || h.quantity_actual || h.quantity_estimated || '0')
}

const STATUS_STYLE: Record<string, string> = {
  PENDING:         'bg-amber-500/10 text-amber-400',
  APPROVED:        'bg-blue-500/10 text-blue-400',
  VERIFIED:        'bg-emerald-500/10 text-emerald-400',
  GODOWN_RECEIVED: 'bg-emerald-500/10 text-emerald-400',
}

const STAGE_LABEL: Record<number, string> = {
  0: '🌾 Collected', 1: '📦 Loaded', 2: '🚛 Transit',
  3: '📍 Arrived',   4: '🏪 Sold',   5: '💰 Paid',
}

export default function FarmerDashboard() {
  const [sidebarOpen,       setSidebarOpen]       = useState(true)
  const [hasFPO,            setHasFPO]             = useState(true)
  const [showFPOOnboarding, setShowFPOOnboarding]  = useState(false)
  const [membershipInfo,    setMembershipInfo]     = useState<{ fpoName: string; memberSince: string; status: string } | null>(null)
  const [harvests,          setHarvests]           = useState<HarvestRow[]>([])
  const [dispatches,        setDispatches]         = useState<DispatchRow[]>([])
  const [loading,           setLoading]            = useState(true)

  const { t } = useTranslation('en')

  const fetchData = useCallback(async (farmerId: string) => {
    const [memberRes, harvestRes, dispatchRes] = await Promise.allSettled([
      fetch(`/api/farmers/status?farmerId=${farmerId}`).then(r => r.json()),
      fetch(`/api/harvests/my-harvests?farmerId=${farmerId}`).then(r => r.json()),
      fetch(`/api/dispatches/farmer?farmerId=${farmerId}`).then(r => r.json()),
    ])

    if (memberRes.status === 'fulfilled') {
      const data = memberRes.value
      if (!data.success || !data.membership || data.membership.status === 'PENDING') {
        setHasFPO(false)
        setShowFPOOnboarding(true)
      } else {
        setHasFPO(true)
        const m = data.membership
        setMembershipInfo({
          fpoName: m.organization_name,
          memberSince: m.approved_at
            ? new Date(m.approved_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
            : 'Recently',
          status: m.status,
        })
      }
    }
    if (harvestRes.status === 'fulfilled' && harvestRes.value.success)
      setHarvests(harvestRes.value.harvests as HarvestRow[])
    if (dispatchRes.status === 'fulfilled' && dispatchRes.value.success)
      setDispatches(dispatchRes.value.dispatches as DispatchRow[])

    setLoading(false)
  }, [])

  useEffect(() => {
    const farmerId = localStorage.getItem('userId') || ''
    if (!farmerId) { setLoading(false); return }
    fetchData(farmerId)
  }, [fetchData])

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalHarvestQty = harvests.reduce((s, h) => s + harvestQty(h), 0)
  const soldDispatches  = dispatches.filter(d => d.current_stage >= 4)
  const paidDispatches  = dispatches.filter(d => d.payout_status === 'PAID')
  const totalEarned     = paidDispatches.reduce((s, d) => s + parseFloat(String(d.farmer_payout || 0)), 0)
  const pendingEarned   = dispatches
    .filter(d => d.farmer_payout && d.payout_status !== 'PAID')
    .reduce((s, d) => s + parseFloat(String(d.farmer_payout || 0)), 0)
  const bestPrice = dispatches.reduce((best, d) => {
    const p = parseFloat(String(d.price_per_quintal || 0))
      || (d.actual_revenue && d.total_quantity ? parseFloat(String(d.actual_revenue)) / parseFloat(String(d.total_quantity)) : 0)
    return p > best ? p : best
  }, 0)
  const recentSales = soldDispatches.slice(0, 4)

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <FarmerHeader subtitle="Farmer Dashboard" activeNav="dashboard" sidebarOpen={sidebarOpen} onSidebarToggle={() => setSidebarOpen(v => !v)} />

      <div className="flex">
        {/* Sidebar */}
        <motion.aside initial={false} animate={{ width: sidebarOpen ? 256 : 0 }} transition={{ duration: 0.3 }}
          className="hidden lg:block border-r border-emerald-500/10 bg-[#0D0D0D] overflow-hidden shrink-0">
          <nav className="p-6 space-y-2">
            {[
              { href: '/farmer-dashboard',           icon: LayoutDashboard, label: t('sidebar.dashboard'),    active: true },
              { href: '/farmer-dashboard/harvest',    icon: Leaf,            label: t('sidebar.myHarvest') },
              { href: '/farmer-dashboard/sales',      icon: BarChart3,       label: t('sidebar.salesHistory') },
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
          {showFPOOnboarding ? (
            <FPOOnboarding />
          ) : loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">

              {/* FPO membership strip */}
              {hasFPO && membershipInfo && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl p-4 border border-blue-500/20 bg-gradient-to-r from-blue-500/[0.07] to-transparent flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-0.5">FPO Membership</p>
                    <p className="text-white font-bold">{membershipInfo.fpoName}</p>
                    <p className="text-xs text-gray-500">Member since {membershipInfo.memberSince} · {membershipInfo.status}</p>
                  </div>
                  <Link href="/farmer-dashboard/dispatches"
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors whitespace-nowrap">
                    Track Dispatch <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              )}

              {/* KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: t('dashboard.totalEarnings'), value: totalEarned > 0 ? fmtMoney(totalEarned) : '₹0', icon: DollarSign, color: 'text-emerald-400', sub: pendingEarned > 0 ? `+${fmtMoney(pendingEarned)} pending` : 'From paid dispatches' },
                  { label: t('dashboard.harvestSubmitted'), value: `${Math.round(totalHarvestQty)} Q`, icon: Wheat, color: 'text-amber-400', sub: `${harvests.length} records` },
                  { label: t('dashboard.salesCompleted'), value: soldDispatches.length.toString(), icon: CheckCircle2, color: 'text-emerald-400', sub: `${dispatches.length} total dispatches` },
                  { label: t('dashboard.bestPrice'), value: bestPrice > 0 ? fmtMoney(bestPrice) + '/q' : '—', icon: TrendingUp, color: 'text-green-400', sub: 'Best price received' },
                ].map(({ label, value, icon: Icon, color, sub }) => (
                  <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl p-5 border border-emerald-500/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500">{label}</p>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-600 mt-1">{sub}</p>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* My Harvests */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="lg:col-span-2 glass rounded-xl border border-emerald-500/10 overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wheat className="w-4 h-4 text-emerald-400" />
                      <h2 className="text-sm font-bold text-white">My Harvests</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href="/farmer-dashboard/harvest" className="text-xs text-emerald-400 hover:text-emerald-300">View all</Link>
                      <Link href="/farmer-dashboard/submit-harvest"
                        className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 text-black px-3 py-1.5 rounded-lg hover:bg-emerald-400 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Submit
                      </Link>
                    </div>
                  </div>
                  {harvests.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <p className="text-3xl">🌾</p>
                      <p className="text-sm text-gray-500">No harvests submitted yet</p>
                      <Link href="/farmer-dashboard/submit-harvest"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg mt-1">
                        <Plus className="w-3.5 h-3.5" /> Submit your first harvest
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.04]">
                      {harvests.slice(0, 4).map(h => (
                        <div key={h.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02]">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 text-base">
                            {h.crop_type?.toLowerCase().includes('wheat') ? '🌾'
                              : h.crop_type?.toLowerCase().includes('rice') ? '🌾'
                              : h.crop_type?.toLowerCase().includes('tomato') ? '🍅'
                              : '🌿'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white">{h.crop_type}{h.variety ? ` · ${h.variety}` : ''}</p>
                            <p className="text-xs text-gray-500">{Math.round(harvestQty(h))} Q · {fmtDate(h.submitted_at)}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[h.status?.toUpperCase()] || 'bg-gray-500/10 text-gray-400'}`}>
                            {h.status === 'GODOWN_RECEIVED' ? 'At Godown' : h.status?.charAt(0) + h.status?.slice(1).toLowerCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Quick stats */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="glass rounded-xl border border-emerald-500/10 p-5 space-y-4">
                  <h2 className="text-sm font-bold text-white">{t('dashboard.quickStats')}</h2>
                  {[
                    { label: 'Paid Earnings', value: fmtMoney(totalEarned), color: 'text-emerald-400', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
                    { label: 'Pending Payout', value: pendingEarned > 0 ? fmtMoney(pendingEarned) : '—', color: 'text-amber-400', icon: <Clock className="w-3.5 h-3.5 text-amber-400" /> },
                    { label: 'Total Harvest', value: `${Math.round(totalHarvestQty)} Q`, color: 'text-white', icon: <Package className="w-3.5 h-3.5 text-gray-500" /> },
                  ].map(({ label, value, color, icon }) => (
                    <div key={label} className="p-3 bg-white/[0.02] rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {icon}
                        <p className="text-xs text-gray-500">{label}</p>
                      </div>
                      <p className={`text-sm font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                  <Link href="/farmer-dashboard/earnings"
                    className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-emerald-400 border border-emerald-500/25 px-3 py-2 rounded-lg hover:bg-emerald-500/10 transition-colors">
                    Full Earnings <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              </div>

              {/* Recent sales */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="glass rounded-xl border border-emerald-500/10 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white">{t('dashboard.recentSales')}</h2>
                  <Link href="/farmer-dashboard/sales" className="text-xs text-emerald-400 hover:text-emerald-300">View all</Link>
                </div>
                {dispatches.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-sm">No dispatches yet</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          {[t('table.crop'), 'Mandi', t('table.quantity'), t('table.price'), 'Payout', t('table.status')].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(recentSales.length > 0 ? recentSales : dispatches.slice(0, 4)).map((d, i) => {
                          const pricePerQ = d.price_per_quintal
                            || (d.actual_revenue && d.total_quantity ? parseFloat(String(d.actual_revenue)) / parseFloat(String(d.total_quantity)) : 0)
                          return (
                            <tr key={d.id || i} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                              <td className="px-4 py-3 font-semibold text-white">{d.crop}</td>
                              <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{d.mandi_name}</td>
                              <td className="px-4 py-3 text-gray-400">{d.farmer_quantity ? `${Math.round(parseFloat(String(d.farmer_quantity)))} Q` : '—'}</td>
                              <td className="px-4 py-3 text-white font-semibold">{pricePerQ > 0 ? fmtMoney(pricePerQ) : '—'}</td>
                              <td className="px-4 py-3 text-emerald-400 font-bold">{d.farmer_payout ? fmtMoney(parseFloat(String(d.farmer_payout))) : '—'}</td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  d.payout_status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400'
                                    : d.current_stage >= 4 ? 'bg-blue-500/10 text-blue-400'
                                    : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                  {STAGE_LABEL[d.current_stage] || `Stage ${d.current_stage}`}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>

            </div>
          )}
        </main>
      </div>
    </div>
  )
}
