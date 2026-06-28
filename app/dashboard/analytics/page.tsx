'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Download, FileSpreadsheet,
  Share2, IndianRupee, ShoppingCart, Scale, Users,
  Calendar, ChevronDown,
} from 'lucide-react'

// ─── useCountUp ────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return count
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const revenueData = [
  { month: 'Jan', revenue: 28, target: 25 },
  { month: 'Feb', revenue: 31, target: 28 },
  { month: 'Mar', revenue: 35, target: 32 },
  { month: 'Apr', revenue: 29, target: 35 },
  { month: 'May', revenue: 38, target: 36 },
  { month: 'Jun', revenue: 42, target: 40 },
]

const mandiData = [
  { name: 'Karnal', sales: 18, revenue: 38.2 },
  { name: 'Panipat', sales: 12, revenue: 24.1 },
  { name: 'Hubli', sales: 8, revenue: 16.8 },
  { name: 'Delhi', sales: 5, revenue: 10.2 },
  { name: 'Nagpur', sales: 4, revenue: 8.1 },
]

const cropData = [
  { name: 'Wheat', value: 65, quintals: 2730, color: '#10B981' },
  { name: 'Rice', value: 20, quintals: 840, color: '#3B82F6' },
  { name: 'Tomato', value: 10, quintals: 420, color: '#EF4444' },
  { name: 'Others', value: 5, quintals: 210, color: '#F59E0B' },
]

const farmers = [
  { rank: 1, name: 'Ramesh K', village: 'Karnal', quintals: 48, revenue: 108000, payments: 6, onTime: true },
  { rank: 2, name: 'Priya D', village: 'Ambala', quintals: 42, revenue: 94500, payments: 6, onTime: true },
  { rank: 3, name: 'Suresh P', village: 'Panipat', quintals: 38, revenue: 85500, payments: 5, onTime: true },
  { rank: 4, name: 'Anita R', village: 'Kurukshetra', quintals: 35, revenue: 78750, payments: 5, onTime: true },
  { rank: 5, name: 'Mohan L', village: 'Hubli', quintals: 32, revenue: 72000, payments: 4, onTime: false },
  { rank: 6, name: 'Geeta S', village: 'Belgaum', quintals: 28, revenue: 63000, payments: 4, onTime: true },
  { rank: 7, name: 'Rajan T', village: 'Nagpur', quintals: 25, revenue: 56250, payments: 4, onTime: true },
  { rank: 8, name: 'Kavita M', village: 'Delhi', quintals: 22, revenue: 49500, payments: 3, onTime: false },
  { rank: 9, name: 'Vijay B', village: 'Rohtak', quintals: 19, revenue: 42750, payments: 3, onTime: true },
  { rank: 10, name: 'Sunita V', village: 'Ludhiana', quintals: 16, revenue: 36000, payments: 3, onTime: true },
]

const heatmapStates = [
  { state: 'Haryana', score: 91, label: 'Excellent', color: '#10B981' },
  { state: 'Punjab', score: 87, label: 'Excellent', color: '#10B981' },
  { state: 'Maharashtra', score: 73, label: 'Good', color: '#84cc16' },
  { state: 'Karnataka', score: 68, label: 'Good', color: '#84cc16' },
  { state: 'UP', score: 54, label: 'Fair', color: '#F59E0B' },
  { state: 'MP', score: 49, label: 'Fair', color: '#F59E0B' },
  { state: 'Rajasthan', score: 38, label: 'Poor', color: '#EF4444' },
  { state: 'Bihar', score: 31, label: 'Poor', color: '#EF4444' },
]

const DATE_RANGES = ['Last 7 days', 'Last 30 days', 'Last 6 months', 'Custom']

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111] border border-emerald-500/20 rounded-xl px-4 py-3 shadow-xl shadow-black/60">
      <p className="text-xs text-gray-400 mb-2 font-medium">{label} 2025</p>
      {payload.map((p) => (
        <p key={p.dataKey} className={`text-sm font-bold ${p.dataKey === 'revenue' ? 'text-emerald-400' : 'text-gray-500'}`}>
          {p.dataKey === 'revenue' ? 'Actual' : 'Target'}: ₹{p.value}L
        </p>
      ))}
    </div>
  )
}

function MandiTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111] border border-emerald-500/20 rounded-xl px-4 py-3 shadow-xl shadow-black/60">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-emerald-400">₹{payload[0]?.value}L revenue</p>
    </div>
  )
}

function DonutTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { quintals: number } }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl px-4 py-3 shadow-xl shadow-black/60">
      <p className="text-sm font-bold text-white">{payload[0].name}</p>
      <p className="text-xs text-gray-400 mt-0.5">{payload[0].value}% · {payload[0].payload.quintals}Q</p>
    </div>
  )
}

// ─── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon, label, value, prefix, suffix, change, positive, delay, started,
}: {
  icon: React.ElementType; label: string; value: number; prefix?: string; suffix?: string
  change: string; positive: boolean; delay: number; started: boolean
}) {
  const count = useCountUp(value, 1600, started)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="glass rounded-xl border border-emerald-500/10 p-5 relative overflow-hidden group"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(circle at top right, rgba(16,185,129,0.07), transparent 65%)' }}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-emerald-400" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
          positive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-gray-400 bg-white/[0.04] border-white/[0.06]'
        }`}>
          {positive ? <TrendingUp className="w-3 h-3" /> : null}
          {change}
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white tracking-tight">
        {prefix}{count.toLocaleString('en-IN')}{suffix}
      </p>
    </motion.div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [range, setRange] = useState('Last 6 months')
  const [started, setStarted] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [donutActive, setDonutActive] = useState<number | null>(null)
  const kpiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.1 }
    )
    if (kpiRef.current) observer.observe(kpiRef.current)
    return () => observer.disconnect()
  }, [])

  function handleDownload(type: string) {
    setDownloading(type)
    setTimeout(() => setDownloading(null), 1800)
  }

  const kpis = [
    { icon: IndianRupee, label: 'Total Revenue', value: 230, prefix: '₹', suffix: 'L', change: '↑ 23%', positive: true, delay: 0 },
    { icon: ShoppingCart, label: 'Total Sales', value: 47, suffix: ' sales', change: '↑ 8%', positive: true, delay: 0.07 },
    { icon: Scale, label: 'Avg Price / Quintal', value: 2287, prefix: '₹', change: '↑ 12%', positive: true, delay: 0.14 },
    { icon: Users, label: 'Farmers Paid', value: 825, change: '100%', positive: false, delay: 0.21 },
  ]

  return (
    <div className="p-6 space-y-7 min-h-full">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-white">Analytics &amp; Reports</h2>
          <p className="text-xs text-gray-500 mt-0.5">GreenHarvest FPO · Kharif Season 2025</p>
        </div>

        {/* Date range pills */}
        <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
          {DATE_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150 ${
                range === r
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {r === 'Custom' && <Calendar className="w-3 h-3" />}
              {r}
              {r === 'Custom' && <ChevronDown className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div ref={kpiRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => <KpiCard key={k.label} {...k} started={started} />)}
      </div>

      {/* ── Revenue Trend (full width) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass rounded-xl border border-emerald-500/10 p-5"
      >
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Revenue Trend</h3>
            <p className="text-xs text-gray-500 mt-0.5">Jan – Jun 2025 · values in Lakhs (₹)</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 rounded-full inline-block" />
              <span className="text-xs text-gray-500">Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-px border-t-2 border-dashed border-gray-600 inline-block" />
              <span className="text-xs text-gray-500">Target</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <TrendingUp className="w-3 h-3" />
              <span>+50% over period</span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revenueData} margin={{ top: 6, right: 6, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.06)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
            <Tooltip content={<RevenueTooltip />} />
            <Area type="monotone" dataKey="target" stroke="#374151" strokeWidth={1.5} strokeDasharray="5 4" fill="none" dot={false} />
            <Area
              type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5}
              fill="url(#analyticsGrad)"
              dot={{ fill: '#10B981', r: 4, strokeWidth: 0 }}
              activeDot={{ fill: '#10B981', r: 6, strokeWidth: 2, stroke: 'rgba(16,185,129,0.4)' }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Monthly callouts */}
        <div className="grid grid-cols-6 gap-2 mt-4 pt-4 border-t border-white/[0.05]">
          {revenueData.map((d) => (
            <div key={d.month} className="text-center">
              <p className="text-[10px] text-gray-600">{d.month}</p>
              <p className="text-xs font-bold text-emerald-400 mt-0.5">₹{d.revenue}L</p>
              <div className="mt-1 h-0.5 rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full bg-emerald-500/50 rounded-full transition-all duration-700"
                  style={{ width: `${(d.revenue / 42) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Chart Row: Best Mandis + Crop Distribution ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Best Mandis — bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="xl:col-span-3 glass rounded-xl border border-emerald-500/10 p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Best Performing Mandis</h3>
              <p className="text-xs text-gray-500 mt-0.5">By total revenue generated</p>
            </div>
            <span className="text-xs text-gray-600 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.06]">Top 5</span>
          </div>

          {/* Custom horizontal bar chart */}
          <div className="space-y-3">
            {mandiData.map((m, i) => {
              const maxRevenue = 38.2
              const pct = (m.revenue / maxRevenue) * 100
              return (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
                  className="group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        i === 0 ? 'bg-emerald-500/20 text-emerald-400' :
                        i === 1 ? 'bg-amber-500/15 text-amber-400' :
                        'bg-white/[0.05] text-gray-500'
                      }`}>{i + 1}</span>
                      <span className="text-sm font-medium text-gray-200">{m.name}</span>
                      <span className="text-xs text-gray-600">{m.sales} sales</span>
                    </div>
                    <span className="text-sm font-bold text-white">₹{m.revenue}L</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        i === 0 ? 'bg-emerald-500' :
                        i === 1 ? 'bg-emerald-500/70' :
                        i === 2 ? 'bg-emerald-500/50' :
                        'bg-emerald-500/30'
                      }`}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Bar chart (recharts) below */}
          <div className="mt-5 pt-4 border-t border-white/[0.05]">
            <p className="text-xs text-gray-600 mb-3">Revenue comparison (₹ Lakhs)</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={mandiData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<MandiTooltip />} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {mandiData.map((_, idx) => (
                    <Cell key={idx} fill={`rgba(16,185,129,${1 - idx * 0.17})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Crop Distribution — donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="xl:col-span-2 glass rounded-xl border border-emerald-500/10 p-5"
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Crop Distribution</h3>
            <p className="text-xs text-gray-500 mt-0.5">By volume (quintals)</p>
          </div>

          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={cropData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={3}
                  dataKey="value"
                  onMouseEnter={(_, index) => setDonutActive(index)}
                  onMouseLeave={() => setDonutActive(null)}
                  strokeWidth={0}
                >
                  {cropData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      opacity={donutActive === null || donutActive === index ? 1 : 0.35}
                      style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[10px] text-gray-600 font-medium">Total</p>
              <p className="text-base font-bold text-white">4,200 Q</p>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 mt-3">
            {cropData.map((c, i) => (
              <div
                key={c.name}
                className={`flex items-center justify-between p-2 rounded-lg transition-all duration-150 cursor-pointer ${
                  donutActive === i ? 'bg-white/[0.05]' : 'hover:bg-white/[0.03]'
                }`}
                onMouseEnter={() => setDonutActive(i)}
                onMouseLeave={() => setDonutActive(null)}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="text-xs text-gray-300">{c.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600">{c.quintals}Q</span>
                  <span className="text-xs font-bold text-white w-8 text-right">{c.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Trust Score Heatmap ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass rounded-xl border border-emerald-500/10 p-5"
      >
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Trust Score Heatmap by State</h3>
            <p className="text-xs text-gray-500 mt-0.5">Average mandi trust scores across operating states</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {[
              { label: 'Poor', color: '#EF4444' },
              { label: 'Fair', color: '#F59E0B' },
              { label: 'Good', color: '#84cc16' },
              { label: 'Excellent', color: '#10B981' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                <span className="text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {heatmapStates.map((s, i) => (
            <motion.div
              key={s.state}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.25 + i * 0.05 }}
              className="relative rounded-xl p-4 border overflow-hidden group cursor-default"
              style={{
                borderColor: `${s.color}30`,
                background: `${s.color}0A`,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${s.color}18, transparent 70%)` }}
                aria-hidden="true"
              />
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm font-semibold text-gray-200">{s.state}</p>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: s.color, background: `${s.color}18` }}>
                  {s.label}
                </span>
              </div>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.score}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">Trust Score</p>
              <div className="mt-2 h-1 rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.score}%` }}
                  transition={{ duration: 0.9, delay: 0.4 + i * 0.06, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: s.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Farmer Performance Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="glass rounded-xl border border-emerald-500/10 overflow-hidden"
      >
        <div className="p-5 border-b border-white/[0.05] flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Farmer Performance</h3>
            <p className="text-xs text-gray-500 mt-0.5">Top 10 contributors this season</p>
          </div>
          <span className="text-xs text-gray-600 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.06]">
            Sorted by revenue
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {['Rank', 'Farmer', 'Village', 'Quintals', 'Revenue', 'Payments'].map((h) => (
                  <th key={h} className="text-left text-[11px] font-semibold text-gray-600 uppercase tracking-wider px-5 py-3 first:pl-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {farmers.map((f, i) => (
                <motion.tr
                  key={f.rank}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.04 }}
                  className="border-b border-white/[0.03] hover:bg-emerald-500/[0.03] transition-colors duration-150 group"
                >
                  <td className="px-5 py-3.5">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      f.rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                      f.rank === 2 ? 'bg-gray-400/10 text-gray-400' :
                      f.rank === 3 ? 'bg-orange-500/15 text-orange-500' :
                      'bg-white/[0.04] text-gray-600'
                    }`}>
                      {f.rank}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                        {f.name[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-200">{f.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{f.village}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-gray-200">{f.quintals}Q</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold text-emerald-400">
                      ₹{(f.revenue / 1000).toFixed(0)}K
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300">{f.payments} payments</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        f.onTime
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {f.onTime ? 'On-time' : 'Delayed'}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Download Buttons ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex flex-wrap gap-3 pb-2"
      >
        {[
          { id: 'pdf', icon: Download, label: 'Download PDF Report', color: 'emerald' },
          { id: 'excel', icon: FileSpreadsheet, label: 'Export to Excel', color: 'blue' },
          { id: 'nabard', icon: Share2, label: 'Share with NABARD', color: 'amber' },
        ].map(({ id, icon: Icon, label, color }) => {
          const isLoading = downloading === id
          const styles = {
            emerald: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50',
            blue: 'bg-blue-500/10 border-blue-500/25 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50',
            amber: 'bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50',
          }[color]
          return (
            <button
              key={id}
              onClick={() => handleDownload(id)}
              disabled={!!downloading}
              className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed ${styles}`}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Preparing...
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )
        })}
      </motion.div>

    </div>
  )
}
