'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, TrendingUp, Users, IndianRupee,
  CheckCircle2, Share2, ArrowUpRight, Landmark, HelpCircle, X,
  BarChart3,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'

const TARGET = 842
const MAX = 900

// Gauge arc helpers
const CX = 120
const CY = 108
const R = 88
const START_DEG = 210
const END_DEG = 510  // 300° sweep

function polarToXY(deg: number, r: number, cx: number, cy: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(startDeg: number, endDeg: number, r: number, cx: number, cy: number) {
  const s = polarToXY(startDeg, r, cx, cy)
  const e = polarToXY(endDeg, r, cx, cy)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

// Color zones (300–900 mapped onto 300° sweep)
const ZONES = [
  { from: 300, to: 500, color: '#EF4444' },
  { from: 500, to: 650, color: '#F59E0B' },
  { from: 650, to: 750, color: '#10B981' },
  { from: 750, to: 900, color: '#F59E0B' }, // gold
]

function scoreToAngle(score: number) {
  return START_DEG + ((score - 300) / (MAX - 300)) * 300
}

const HISTORY = [
  { month: 'Jan', score: 680 },
  { month: 'Feb', score: 710 },
  { month: 'Mar', score: 740 },
  { month: 'Apr', score: 790 },
  { month: 'May', score: 820 },
  { month: 'Jun', score: 842 },
]

const BREAKDOWN = [
  { label: 'Revenue Consistency', score: 92, max: 100, detail: '47 sales, ₹2.3Cr settled', impact: '+18' },
  { label: 'Settlement Reliability', score: 96, max: 100, detail: '0 defaults, avg 1.2 day payment', impact: '+12' },
  { label: 'Farmer Retention', score: 88, max: 100, detail: '825 active farmers, 94% retention', impact: '+7' },
  { label: 'Trade Volume', score: 91, max: 100, detail: '₹2.3Cr GMV last 6 months', impact: '+5' },
]

const NEGATIVES = [
  { label: 'Delayed Dispatches', score: -4, detail: '2 shipments delayed > 4hrs' },
]

const BENCHMARK = [
  { name: 'GreenHarvest', value: 842 },
  { name: 'Industry Avg', value: 768 },
  { name: 'Top District', value: 856 },
  { name: 'State Avg', value: 789 },
]

const BANKS = ['NABARD', 'SBI Agri', 'HDFC Kisan']

interface TooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#161616] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400">{label}</p>
      <p className="text-amber-400 font-bold text-sm mt-0.5">{payload[0].value}</p>
    </div>
  )
}

export default function CreditScorePage() {
  const [displayScore, setDisplayScore] = useState(300)
  const [barProgress, setBarProgress] = useState(0)
  const [showExplain, setShowExplain] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    const duration = 1800
    function animate(ts: number) {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const pct = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - pct, 3)
      setDisplayScore(Math.round(300 + (TARGET - 300) * eased))
      setBarProgress(eased * 100)
      if (pct < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  const needleDeg = scoreToAngle(displayScore)
  const needleXY = polarToXY(needleDeg, R - 12, CX, CY)

  return (
    <div className="p-6 space-y-8 min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
          <Star className="w-4.5 h-4.5 text-amber-400" fill="currentColor" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">FPO Trust Index</h2>
          <p className="text-xs text-gray-500 mt-0.5">GreenHarvest FPO &mdash; Operational Health & Reliability Score</p>
        </div>
      </div>

      {/* Hero gauge + breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Gauge */}
        <div className="xl:col-span-2 glass rounded-2xl border border-amber-500/20 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.08)]">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-amber-500/8 blur-3xl pointer-events-none" />

          <svg width={CX * 2} height={CY + R + 24} className="overflow-visible mb-2">
            {/* Background track */}
            <path
              d={describeArc(START_DEG, START_DEG + 300, R, CX, CY)}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={14}
              strokeLinecap="round"
            />

            {/* Color zone arcs */}
            {ZONES.map((zone) => {
              const startA = scoreToAngle(zone.from)
              const endA = scoreToAngle(zone.to)
              return (
                <path
                  key={zone.from}
                  d={describeArc(startA, endA, R, CX, CY)}
                  fill="none"
                  stroke={zone.color}
                  strokeOpacity={0.18}
                  strokeWidth={14}
                  strokeLinecap="butt"
                />
              )
            })}

            {/* Animated progress arc */}
            <path
              d={describeArc(START_DEG, scoreToAngle(displayScore), R, CX, CY)}
              fill="none"
              stroke="url(#gaugeGrad)"
              strokeWidth={14}
              strokeLinecap="round"
            />

            <defs>
              <linearGradient id="gaugeGrad" gradientUnits="userSpaceOnUse"
                x1={polarToXY(START_DEG, R, CX, CY).x}
                y1={polarToXY(START_DEG, R, CX, CY).y}
                x2={polarToXY(START_DEG + 300, R, CX, CY).x}
                y2={polarToXY(START_DEG + 300, R, CX, CY).y}
              >
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="60%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>

            {/* Needle */}
            <circle cx={needleXY.x} cy={needleXY.y} r={5} fill="#F59E0B" />
            <circle cx={needleXY.x} cy={needleXY.y} r={8} fill="none" stroke="#F59E0B" strokeOpacity={0.3} strokeWidth={2} />

            {/* Zone labels */}
            {[
              { score: 400, label: 'Poor' },
              { score: 575, label: 'Fair' },
              { score: 700, label: 'Good' },
              { score: 825, label: 'Excellent' },
            ].map(({ score, label }) => {
              const p = polarToXY(scoreToAngle(score), R + 22, CX, CY)
              return (
                <text key={label} x={p.x} y={p.y} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.25)">{label}</text>
              )
            })}

            {/* Centre text */}
            <text x={CX} y={CY - 6} textAnchor="middle" fontSize={38} fontWeight={800} fill="white">{displayScore}</text>
            <text x={CX} y={CY + 14} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.4)">out of {MAX}</text>
          </svg>

          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl font-extrabold text-amber-400 tracking-wider uppercase">Excellent Reliability</span>
              <p className="text-xs text-gray-500">Last updated today</p>
            </div>
            <motion.button
              onClick={() => setShowExplain(true)}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 px-3 py-1.5 rounded-lg transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Explain Score
            </motion.button>
          </div>
        </div>

        {/* Breakdown cards */}
        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BREAKDOWN.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
              className="glass rounded-xl border border-emerald-500/10 p-4 hover:border-emerald-500/25 transition-colors duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-gray-400 font-medium leading-snug max-w-[70%]">{b.label}</p>
                <span className="text-lg font-extrabold text-emerald-400 shrink-0">{b.score}<span className="text-gray-600 text-xs font-normal">/{b.max}</span></span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-2">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${barProgress * b.score / 100}%` }}
                  transition={{ duration: 0.05 }}
                />
              </div>
              <p className="text-[11px] text-gray-600">{b.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Financing Profile + Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Financing Profile */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.45 }}
          className="lg:col-span-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/[0.07] to-[#0D0D0D] p-6 relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)]"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Landmark className="w-4.5 h-4.5 text-emerald-400" />
              <p className="text-sm font-semibold text-white">Estimated Financing Profile</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              {[
                { label: 'Working Capital', value: '₹50,00,000', sub: 'Estimated range' },
                { label: 'Term Loan', value: '₹1,20,00,000', sub: 'Up to 5 years' },
                { label: 'Interest Rate', value: '8.5% p.a.', sub: 'Indicative' },
              ].map(({ label, value, sub }) => (
                <div key={label} className="bg-black/20 border border-white/[0.06] rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-600 mb-1">{label}</p>
                  <p className="text-xl font-extrabold text-emerald-400">{value}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Partner banks */}
            <div className="flex items-center gap-3 flex-wrap mb-4">
              <p className="text-xs text-gray-600">Network Banks:</p>
              {BANKS.map(bank => (
                <span key={bank} className="text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-gray-300">
                  {bank}
                </span>
              ))}
            </div>

            <p className="text-[10px] text-gray-600 border-t border-white/10 pt-3 mt-3">
              For demonstration purposes. Final lending decisions made by financial institutions. Contact banks directly for formal pre-qualification.
            </p>

            <div className="flex items-center gap-3 flex-wrap mt-4">
              <button className="flex items-center gap-2 shimmer-btn text-[#0A0A0A] font-bold text-sm px-6 py-2.5 rounded-xl hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200">
                <IndianRupee className="w-4 h-4" />
                Apply for Working Capital
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-5 py-2.5 rounded-xl transition-all duration-200">
                <Share2 className="w-3.5 h-3.5" />
                Generate Trust Report
              </button>
            </div>
          </div>
        </motion.div>

        {/* Comparison Panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.45 }}
          className="lg:col-span-2 glass rounded-2xl border border-emerald-500/10 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Trust Index Benchmark</h3>
              <p className="text-xs text-gray-500 mt-0.5">How you compare</p>
            </div>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg transition-all"
            >
              {showComparison ? 'Hide' : 'Show'}
            </button>
          </div>

          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {BENCHMARK.map((item) => {
                  const isYou = item.name === 'GreenHarvest'
                  const percent = (item.value / 900) * 100
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-semibold ${isYou ? 'text-emerald-400' : 'text-gray-400'}`}>
                          {item.name}
                          {isYou && <span className="ml-1 text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">You</span>}
                        </span>
                        <span className={`text-sm font-bold ${isYou ? 'text-emerald-400' : 'text-gray-500'}`}>
                          {item.value}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${isYou ? 'bg-emerald-500' : 'bg-gray-600'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ delay: 0.1, duration: 0.6 }}
                        />
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Score history chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="glass rounded-2xl border border-emerald-500/10 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-white">Score History</h3>
            <p className="text-xs text-gray-500 mt-0.5">6-month credit score trajectory</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full font-medium">
            <TrendingUp className="w-3 h-3" />
            +162 points in 6 months
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={HISTORY} margin={{ top: 4, right: 12, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[620, 880]} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="url(#lineGrad)"
              strokeWidth={2.5}
              dot={{ fill: '#10B981', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#F59E0B' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bottom info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Farmers', value: '825', icon: Users, color: 'text-emerald-400' },
          { label: 'GMV (6 months)', value: '₹2.3Cr', icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Retention Rate', value: '94%', icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Avg Settlement', value: '1.2 days', icon: ArrowUpRight, color: 'text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-xl border border-emerald-500/10 px-4 py-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <Icon className="w-3.5 h-3.5 text-gray-600" />
              <p className="text-xs text-gray-600">{label}</p>
            </div>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Explain Score Modal */}
      <AnimatePresence>
        {showExplain && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowExplain(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0A0A0A] border border-emerald-500/20 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">How Your Trust Index is Calculated</h3>
                <button
                  onClick={() => setShowExplain(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-3xl font-black text-emerald-400">842</p>
                <p className="text-xs text-gray-500 mt-1">Current Trust Index</p>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase">Positive Factors</p>
                {BREAKDOWN.map((item) => (
                  <div key={item.label} className="flex items-start justify-between p-3 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/10">
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{item.label}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{item.detail}</p>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm ml-2 shrink-0">{item.impact}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase">Areas for Improvement</p>
                {NEGATIVES.map((item) => (
                  <div key={item.label} className="flex items-start justify-between p-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/10">
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{item.label}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{item.detail}</p>
                    </div>
                    <span className="text-amber-400 font-bold text-sm ml-2 shrink-0">{item.score}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <p className="text-xs text-gray-400">
                  <span className="font-semibold text-white">How to improve?</span> Complete all settlements on time, retain more farmers, and maintain consistent sales volume.
                </p>
              </div>

              <button
                onClick={() => setShowExplain(false)}
                className="w-full mt-5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
