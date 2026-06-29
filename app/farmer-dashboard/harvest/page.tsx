'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LayoutDashboard, Leaf, BarChart3, Truck, Wallet, RefreshCw, CheckCircle2, Clock, AlertCircle, Package } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { FarmerHeader } from '@/app/farmer-dashboard/components/farmer-header'

interface HarvestRow {
  id:                string
  crop_type:         string
  variety:           string | null
  grade_submitted:   string | null
  quantity_estimated:string | null
  quantity_actual:   string | null
  quantity_final:    string | null
  status:            string
  token_number:      string | null
  submitted_at:      string | null
  approved_at:       string | null
  godown_received_at:string | null
  rejection_reason:  string | null
  fpo_name:          string
  manager_name:      string
}

function qty(row: HarvestRow) {
  return parseFloat(row.quantity_final || row.quantity_actual || row.quantity_estimated || '0')
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    PENDING:          { label: 'Pending',   cls: 'bg-amber-500/10 text-amber-400 border-amber-500/25',   icon: <Clock className="w-3 h-3" /> },
    APPROVED:         { label: 'Approved',  cls: 'bg-blue-500/10 text-blue-400 border-blue-500/25',      icon: <CheckCircle2 className="w-3 h-3" /> },
    VERIFIED:         { label: 'Verified',  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', icon: <CheckCircle2 className="w-3 h-3" /> },
    GODOWN_RECEIVED:  { label: 'At Godown', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', icon: <Package className="w-3 h-3" /> },
  }
  const m = map[status?.toUpperCase()] || { label: status, cls: 'bg-gray-500/10 text-gray-400 border-gray-500/25', icon: <AlertCircle className="w-3 h-3" /> }
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.cls}`}>
      {m.icon}{m.label}
    </span>
  )
}

export default function HarvestPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [harvests,    setHarvests]    = useState<HarvestRow[]>([])
  const [loading,     setLoading]     = useState(true)
  const { t } = useTranslation('en')

  const fetchHarvests = async (id: string) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/harvests/my-harvests?farmerId=${id}`)
      const data = await res.json()
      if (data.success) setHarvests(data.harvests as HarvestRow[])
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    const farmerId = localStorage.getItem('userId') || ''
    if (farmerId) fetchHarvests(farmerId)
    else setLoading(false)
  }, [])

  const totalQty   = harvests.reduce((s, h) => s + qty(h), 0)
  const uniqueCrops= new Set(harvests.map(h => h.crop_type)).size
  const lastHarvest= harvests[0]

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <FarmerHeader subtitle="My Harvest Records" activeNav="harvest" sidebarOpen={sidebarOpen} onSidebarToggle={() => setSidebarOpen(v => !v)} />

      <div className="flex">
        {/* Sidebar */}
        <motion.aside initial={{ width: sidebarOpen ? 240 : 0 }} animate={{ width: sidebarOpen ? 240 : 0 }}
          transition={{ duration: 0.3 }} className="hidden lg:block border-r border-emerald-500/10 bg-[#0D0D0D] overflow-hidden shrink-0"
        >
          <nav className="p-6 space-y-2">
            {[
              { href: '/farmer-dashboard',           icon: LayoutDashboard, label: t('sidebar.dashboard') },
              { href: '/farmer-dashboard/harvest',    icon: Leaf,            label: t('sidebar.myHarvest'),    active: true },
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
          <div className="p-6 w-full max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">My Harvest Records</h2>
                <p className="text-sm text-gray-500 mt-1">All your submitted crops and their status</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { const id = localStorage.getItem('userId') || ''; if (id) fetchHarvests(id) }}
                  className="p-2 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-gray-500 hover:text-emerald-400 transition-colors">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <Link href="/farmer-dashboard/submit-harvest"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-colors">
                  + Submit Harvest
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                </div>
              </div>
            ) : harvests.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <p className="text-6xl">🌾</p>
                <p className="text-white font-semibold text-lg">No harvest records yet</p>
                <p className="text-sm text-gray-500">Submit your first harvest to get started.</p>
                <Link href="/farmer-dashboard/submit-harvest"
                  className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-sm">
                  + Submit Harvest
                </Link>
              </div>
            ) : (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Harvested', value: `${Math.round(totalQty)} Q`,    sub: `${uniqueCrops} crop${uniqueCrops !== 1 ? 's' : ''}`, color: 'text-white' },
                    { label: 'Last Harvest',    value: lastHarvest?.crop_type ?? '—',  sub: fmtDate(lastHarvest?.submitted_at ?? null),           color: 'text-emerald-400' },
                    { label: 'Records',         value: harvests.length.toString(),      sub: `${harvests.filter(h => h.status === 'PENDING').length} pending review`, color: 'text-white' },
                  ].map(({ label, value, sub, color }) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-xl p-5 border border-emerald-500/10">
                      <p className="text-xs text-gray-500 mb-2">{label}</p>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-emerald-400 mt-1">{sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Harvest table */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="glass rounded-xl border border-emerald-500/10 overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">All Harvest Records</h3>
                    <p className="text-xs text-gray-600">{harvests.length} entries · {Math.round(totalQty)} quintals total</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          {['Crop', 'Variety', 'Grade', 'Quantity', 'Token', 'Submitted', 'Status'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {harvests.map((h, i) => (
                          <motion.tr key={h.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                            <td className="px-4 py-3.5 font-semibold text-white">{h.crop_type}</td>
                            <td className="px-4 py-3.5 text-gray-400">{h.variety || '—'}</td>
                            <td className="px-4 py-3.5 text-gray-400">{h.grade_submitted || '—'}</td>
                            <td className="px-4 py-3.5 text-emerald-400 font-bold">{Math.round(qty(h))} Q</td>
                            <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">{h.token_number || '—'}</td>
                            <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{fmtDate(h.submitted_at)}</td>
                            <td className="px-4 py-3.5"><StatusBadge status={h.status} /></td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* FPO info strip */}
                  {lastHarvest && (
                    <div className="px-5 py-3 border-t border-white/[0.06] bg-white/[0.01] text-xs text-gray-600">
                      Submitted to: <span className="text-gray-400 font-medium">{lastHarvest.fpo_name}</span>
                      {lastHarvest.manager_name ? ` · Manager: ${lastHarvest.manager_name}` : ''}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
