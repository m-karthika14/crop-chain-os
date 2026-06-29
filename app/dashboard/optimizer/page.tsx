'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Lightbulb, ChevronDown, Loader2, Trophy, CheckCircle2,
  AlertTriangle, ChevronRight, Truck, ArrowRight, Sparkles,
  MapPin, Clock, Shield,
} from 'lucide-react'
import { DispatchCreationForm } from '@/app/components/dispatch-creation-form'
import Link from 'next/link'

const CROPS = ['Wheat', 'Rice', 'Tomato', 'Onion', 'Potato']

const MANDIS = [
  { rank: 1, name: 'Karnal', state: 'Haryana', price: 2387, transport: 148, commission: 36, net: 2203, trust: 94, payment: 'Same Day', tag: 'best' },
  { rank: 2, name: 'Panipat', state: 'Haryana', price: 2290, transport: 95, commission: 28, net: 2167, trust: 78, payment: '2 Days', tag: 'good' },
  { rank: 3, name: 'Delhi', state: 'Delhi', price: 2400, transport: 287, commission: 48, net: 2065, trust: 52, payment: '6 Days', tag: 'risky' },
  { rank: 4, name: 'Chandigarh', state: 'Punjab', price: 2310, transport: 175, commission: 35, net: 2100, trust: 67, payment: '3 Days', tag: 'ok' },
  { rank: 5, name: 'Ambala', state: 'Haryana', price: 2275, transport: 110, commission: 27, net: 2138, trust: 71, payment: '2 Days', tag: 'good' },
]

const tagMeta: Record<string, { label: string; icon: typeof Trophy; rowCls: string; badgeCls: string }> = {
  best:  { label: 'Best',  icon: Trophy,        rowCls: 'border-amber-500/30 bg-amber-500/[0.04]', badgeCls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  good:  { label: 'Good',  icon: CheckCircle2,  rowCls: 'border-emerald-500/20 bg-emerald-500/[0.03]', badgeCls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  ok:    { label: 'OK',    icon: CheckCircle2,  rowCls: 'border-white/[0.06] bg-white/[0.02]', badgeCls: 'bg-white/[0.08] text-gray-400 border-white/10' },
  risky: { label: 'Risky', icon: AlertTriangle, rowCls: 'border-red-500/20 bg-red-500/[0.03]', badgeCls: 'bg-red-500/15 text-red-400 border-red-500/30' },
}

const WHY = [
  { text: '₹92 better net price than Delhi', positive: true },
  { text: '₹38 lower transport cost', positive: true },
  { text: '4-day faster payment', positive: true },
  { text: '42 point higher Trust Score', positive: true },
  { text: '23% lower payment risk', positive: true },
]

export default function OptimizerPage() {
  const router = useRouter()
  const [crop, setCrop] = useState('Wheat')
  const [qty, setQty] = useState('850')
  const [location, setLocation] = useState('Loading...')

  useEffect(() => {
    const fpoId = localStorage.getItem('fpoId') || 'fpo-001'
    fetch(`/api/fpos/location?fpoId=${fpoId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.location) setLocation(data.location)
        else setLocation('Karnal, Haryana')
      })
      .catch(() => setLocation('Karnal, Haryana'))
  }, [])
  const [cropOpen, setCropOpen] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'loading' | 'results'>('idle')
  const [progress, setProgress] = useState(0)
  const [whyOpen, setWhyOpen] = useState(false)
  const [showDispatchForm, setShowDispatchForm] = useState(false)
  const [dispatchCreated, setDispatchCreated] = useState(false)
  const [selectedMandiName, setSelectedMandiName] = useState('Karnal')
  const [mandis, setMandis] = useState(MANDIS)
  const [aiInsight, setAiInsight] = useState<{
    recommendedMandi: string
    confidence: number
    summary: string
    reasons: string[]
    aiUsed: boolean
  } | null>(null)

  async function handleFind() {
    setPhase('loading')
    setProgress(0)
    setAiInsight(null)

    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 15 + 5
      if (p >= 90) { clearInterval(interval) }
      setProgress(Math.min(p, 90))
    }, 100)

    try {
      const fpoId = localStorage.getItem('fpoId') || 'fpo-001'
      const res = await fetch('/api/mandis/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop, quantityQ: parseInt(qty || '0'), fpoId }),
      })
      const data = await res.json()

      clearInterval(interval)
      setProgress(100)

      if (data.success && data.mandis.length > 0) {
        setMandis(data.mandis)
        setSelectedMandiName(data.winner.name.split('(')[0].trim())
        if (data.fpoLocation) setLocation(data.fpoLocation)
      }
      if (data.aiInsight) {
        setAiInsight(data.aiInsight)
      }
    } catch {
      clearInterval(interval)
    }

    setTimeout(() => setPhase('results'), 300)
  }

  function handleApprove() { setShowDispatchForm(true) }

  const selectedMandiData = mandis.find(m => m.name === selectedMandiName) || mandis[0]

  function handleViewOnMap() {
    // Navigate to mandi map with selected mandi and zoom parameter
    router.push(`/dashboard/mandi-map?mandi=${selectedMandiName}&zoom=true`)
  }

  const winner = mandis.find(m => m.name === selectedMandiName) || mandis[0]
  const totalRevenue = Math.round((winner.net) * parseInt(qty || '0'))
  const secondBest = mandis.find(m => m.name !== winner.name)
  const extraGain = secondBest
    ? Math.round((winner.net - secondBest.net) * parseInt(qty || '0'))
    : 0

  return (
    <div className="p-6 space-y-6 min-h-full relative pb-24">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
          <Lightbulb className="w-4.5 h-4.5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Smart Mandi Finder</h2>
          <p className="text-xs text-gray-500 mt-0.5">AI-powered mandi selection across 1,473 markets</p>
        </div>
      </div>

      {/* Input card */}
      <div className="glass rounded-2xl border border-emerald-500/15 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          {/* Crop dropdown */}
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Crop</label>
            <div className="relative">
              <button
                onClick={() => setCropOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/30 text-sm text-white transition-all duration-200"
              >
                <span>{crop}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${cropOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {cropOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-20 mt-1 w-full rounded-xl bg-[#161616] border border-white/10 overflow-hidden shadow-xl"
                  >
                    {CROPS.map(c => (
                      <li key={c}>
                        <button
                          onClick={() => { setCrop(c); setCropOpen(false) }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${c === crop ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-300 hover:bg-white/[0.04]'}`}
                        >
                          {c}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quantity */}
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">Quantity (Quintals)</label>
            <input
              value={qty}
              onChange={e => setQty(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/30 focus:border-emerald-500/50 focus:outline-none text-sm text-white placeholder-gray-600 transition-all duration-200"
              placeholder="850"
            />
          </div>

          {/* Location */}
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">FPO Location</label>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-gray-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-500/60 shrink-0" />
              <span>{location}</span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleFind}
            disabled={phase === 'loading'}
            className="shrink-0 flex items-center gap-2 shimmer-btn text-[#0A0A0A] font-bold text-sm px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/25 whitespace-nowrap"
          >
            {phase === 'loading' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Find Best Mandi</>
            )}
          </button>
        </div>
      </div>

      {/* Loading state */}
      <AnimatePresence>
        {phase === 'loading' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass rounded-2xl border border-emerald-500/15 p-8 flex flex-col items-center gap-6"
          >
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full border border-emerald-500/20 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-white">Analyzing 1,473 mandis...</p>
              <p className="text-xs text-gray-500">Calculating transport, commission & trust scores</p>
            </div>
            <div className="w-full max-w-sm space-y-1.5">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {phase === 'results' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {/* Winner card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/[0.07] via-[#0D0D0D] to-emerald-500/[0.05] p-6 relative overflow-hidden shadow-[0_0_60px_rgba(245,158,11,0.12)]"
            >
              {/* Glow blob */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">
                          {aiInsight?.aiUsed ? '✨ Gemini Recommended' : 'Recommended'}
                        </p>
                        {aiInsight && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold">
                            {aiInsight.confidence}% confidence
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white">{winner.name}, {winner.state}</h3>
                      {aiInsight?.summary && (
                        <p className="text-xs text-gray-400 mt-1 max-w-xs">{aiInsight.summary}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-400">₹{totalRevenue.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5 p-4 rounded-xl bg-black/30 border border-white/[0.06]">
                  {[
                    { label: 'Market Price', value: `₹${winner.price.toLocaleString('en-IN')}/q`, color: 'text-white' },
                    { label: 'Transport Cost', value: `-₹${winner.transport}/q`, color: 'text-red-400' },
                    { label: 'Commission', value: `-₹${winner.commission}/q`, color: 'text-amber-400' },
                    { label: 'Net Price', value: `₹${winner.net.toLocaleString('en-IN')}/q`, color: 'text-emerald-400 font-bold text-base' },
                    { label: 'Trust Score', value: `${winner.trust}/100`, color: 'text-emerald-400' },
                    { label: 'Payment', value: winner.payment, color: 'text-emerald-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <p className="text-xs text-gray-600 mb-0.5">{label}</p>
                      <p className={`text-sm font-semibold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Extra gain */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-400">
                      {extraGain > 0 ? `+₹${extraGain.toLocaleString('en-IN')} extra gain vs next best mandi` : 'Best net price across all mandis'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {secondBest ? `vs ${secondBest.name} (₹${secondBest.net.toLocaleString('en-IN')}/q net)` : 'vs selling locally without optimization'}
                    </p>
                  </div>
                </div>

                {/* Why this mandi — expandable */}
                <button
                  onClick={() => setWhyOpen(v => !v)}
                  className="w-full flex items-center justify-between text-sm text-gray-400 hover:text-white transition-colors duration-200 py-2"
                >
                  <span className="font-medium">Why this mandi?</span>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${whyOpen ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {whyOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <ul className="space-y-1.5 pt-2 pb-1">
                        {(aiInsight?.reasons?.length ? aiInsight.reasons.map(r => ({ text: r })) : WHY).map((w, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="flex items-center gap-2 text-sm text-gray-300"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            {w.text}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Ranking table */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="glass rounded-2xl border border-emerald-500/10 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white">Mandi Comparison</h3>
                <p className="text-xs text-gray-500 mt-0.5">All costs factored in for {qty} quintals of {crop}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['Rank', 'Mandi', 'Market Price', 'Transport', 'Net Price', 'Trust', 'Recommendation', 'Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mandis.map((m, i) => {
                      const meta = tagMeta[m.tag]
                      const Icon = meta.icon
                      return (
                        <motion.tr
                          key={m.name}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.08, duration: 0.3 }}
                          className={`border-b border-white/[0.04] last:border-0 ${meta.rowCls} transition-colors duration-150`}
                        >
                          <td className="px-4 py-3.5 text-gray-400 font-mono text-xs">#{m.rank}</td>
                          <td className="px-4 py-3.5">
                            <p className="font-semibold text-white">{m.name}</p>
                            <p className="text-xs text-gray-600">{m.state}</p>
                          </td>
                          <td className="px-4 py-3.5 text-white font-medium">₹{m.price.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3.5 text-red-400">-₹{m.transport}</td>
                          <td className="px-4 py-3.5 text-emerald-400 font-bold">₹{m.net.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 max-w-16 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${m.trust >= 80 ? 'bg-emerald-500' : m.trust >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${m.trust}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold ${m.trust >= 80 ? 'text-emerald-400' : m.trust >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{m.trust}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${meta.badgeCls}`}>
                              <Icon className="w-3 h-3" />
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => setSelectedMandiName(m.name)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 ${
                                selectedMandiName === m.name
                                  ? 'bg-emerald-500 text-[#0A0A0A]'
                                  : 'bg-white/[0.08] text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10'
                              }`}
                            >
                              {selectedMandiName === m.name ? '✓ Selected' : 'Select'}
                            </button>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex justify-center gap-4 flex-wrap"
            >
              <button
                onClick={handleViewOnMap}
                className="flex items-center gap-2 glass border border-emerald-500/30 text-emerald-400 font-bold px-8 py-3.5 rounded-xl text-sm hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-200"
              >
                <MapPin className="w-4 h-4" />
                View on Map &amp; Zoom
              </button>
              <button
                onClick={handleApprove}
                className="flex items-center gap-2 shimmer-btn text-[#0A0A0A] font-bold px-10 py-3.5 rounded-xl text-sm hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-200"
              >
                <Truck className="w-4 h-4" />
                Approve &amp; Dispatch to {selectedMandiName} Mandi
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky dispatch bar — always visible when results are ready */}
      <AnimatePresence>
        {phase === 'results' && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.8 }}
            className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-4 px-6 py-3 bg-[#0D0D0D]/95 backdrop-blur-xl border-t border-emerald-500/20 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]"
          >
            <div className="hidden sm:flex flex-col min-w-0">
              <p className="text-xs text-gray-500 truncate">Selected</p>
              <p className="text-sm font-bold text-white truncate">{selectedMandiName} Mandi</p>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={handleViewOnMap}
                className="flex items-center gap-2 glass border border-emerald-500/30 text-emerald-400 font-bold px-5 py-2.5 rounded-xl text-sm hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-200 whitespace-nowrap"
              >
                <MapPin className="w-4 h-4" />
                View on Map
              </button>
              <button
                onClick={handleApprove}
                className="flex items-center gap-2 shimmer-btn text-[#0A0A0A] font-bold px-6 py-2.5 rounded-xl text-sm hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-200 whitespace-nowrap"
              >
                <Truck className="w-4 h-4" />
                Approve &amp; Dispatch
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dispatch Creation Form — fixed modal overlay */}
      <AnimatePresence>
        {showDispatchForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowDispatchForm(false)}
            />
            {/* Form container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <DispatchCreationForm
                mandi={selectedMandiData}
                quantity={qty}
                crop={crop}
                farmers={825}
                onSuccess={(dispatchId) => {
                  setDispatchCreated(true)
                  setTimeout(() => {
                    setShowDispatchForm(false)
                    setPhase('idle')
                  }, 3000)
                }}
                onCancel={() => setShowDispatchForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success notification */}
      <AnimatePresence>
        {dispatchCreated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 right-6 z-40 p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 max-w-sm"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white text-sm">Dispatch Created Successfully</p>
                <p className="text-xs text-gray-400 mt-1">All 825 farmers have been notified</p>
                <Link
                  href="/dashboard/dispatches"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium mt-2 inline-block"
                >
                  View Tracking →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
