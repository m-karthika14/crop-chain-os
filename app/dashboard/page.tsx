import Link from 'next/link'
import { Map, Zap, ArrowRight } from 'lucide-react'
import { KpiCards } from './components/kpi-cards'
import { RevenueChart } from './components/revenue-chart'
import { SalesTable } from './components/sales-table'
import { TopMandis } from './components/top-mandis'
import { LiveTicker } from './components/live-ticker'
import { ActiveHarvest } from './components/active-harvest'
import { CreditScoreCard } from './components/credit-score-card'
import { QuickActions } from './components/quick-actions'
import { PendingApprovals } from '@/app/components/pending-approvals'

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 min-h-full">
      {/* Page title + map CTA */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-white">Overview</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            GreenHarvest FPO &mdash; Kharif Season 2025
          </p>
        </div>
        <Link
          href="/dashboard/mandi-map"
          className="group flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/20"
        >
          <Map className="w-4 h-4" />
          <span>Live Mandi Map</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
            <Zap className="w-2.5 h-2.5" fill="currentColor" />
            1,473
          </span>
          <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
        </Link>
      </div>

      {/* KPI Cards — 5 across (spec) */}
      <KpiCards />

      {/* Pending Approvals Section */}
      <PendingApprovals />

      {/* Main 2-column layout — LEFT 60% / RIGHT 40% */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* LEFT — Active Harvest + Recent Sales */}
        <div className="xl:col-span-3 space-y-6">
          <ActiveHarvest />
          <SalesTable />
        </div>

        {/* RIGHT — Top Mandis + Credit Score + Quick Actions */}
        <div className="xl:col-span-2 space-y-5">
          <TopMandis />
          <CreditScoreCard />
          <QuickActions />
        </div>
      </div>

      {/* Revenue Chart — full width bottom */}
      <RevenueChart />

      {/* Live payout ticker */}
      <LiveTicker />
    </div>
  )
}
