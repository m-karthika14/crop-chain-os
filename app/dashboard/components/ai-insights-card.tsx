'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, IndianRupee, Truck, TrendingUp, RefreshCw, CloudRain, Sparkles } from 'lucide-react'

interface Insight {
  type: string
  title: string
  detail: string
}

const FALLBACK_INSIGHTS: Insight[] = [
  { type: 'price',       title: 'Wheat prices up 4% this week',          detail: 'Azadpur mandi at ₹2,340/q — good time to dispatch' },
  { type: 'opportunity', title: 'Kharif sowing season approaching',       detail: 'Register new crop estimates before July 15' },
  { type: 'dispatch',    title: 'Dispatch godown stock before weekend',   detail: 'Best prices typically drop on Monday — act now' },
]

function accentForType(type: string): string {
  switch (type) {
    case 'payment':     return 'from-rose-400 to-red-300'
    case 'price':       return 'from-emerald-400 to-emerald-300'
    case 'dispatch':    return 'from-blue-400 to-sky-300'
    case 'alert':       return 'from-amber-400 to-yellow-300'
    case 'opportunity': return 'from-violet-400 to-purple-300'
    case 'weather':     return 'from-sky-400 to-cyan-300'
    default:            return 'from-emerald-400 to-emerald-300'
  }
}

function IconForType({ type }: { type: string }) {
  const cls = 'w-3 h-3 text-emerald-400 shrink-0'
  switch (type) {
    case 'payment':     return <IndianRupee className={cls} />
    case 'price':       return <TrendingUp className={cls} />
    case 'dispatch':    return <Truck className={cls} />
    case 'alert':       return <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
    case 'weather':     return <CloudRain className="w-3 h-3 text-sky-400 shrink-0" />
    case 'opportunity': return <Sparkles className="w-3 h-3 text-violet-400 shrink-0" />
    default:            return <IndianRupee className={cls} />
  }
}

function SmallVine() {
  return (
    <svg width="92" height="44" viewBox="0 0 92 44" fill="none"
      className="absolute top-0 right-0 opacity-80 pointer-events-none">
      <path d="M92 4 Q72 8 56 6 Q40 4 20 16"
        stroke="#16A34A" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.55" />
      <ellipse cx="70" cy="7" rx="3.5" ry="5.5" fill="#16A34A" transform="rotate(-28 70 7)" opacity="0.7" />
      <ellipse cx="52" cy="5" rx="3.5" ry="5.5" fill="#16A34A" transform="rotate(18 52 5)" opacity="0.7" />
      <ellipse cx="34" cy="10" rx="3.5" ry="5.5" fill="#16A34A" transform="rotate(-20 34 10)" opacity="0.7" />
      <ellipse cx="24" cy="15" rx="3.5" ry="5.5" fill="#16A34A" transform="rotate(14 24 15)" opacity="0.7" />
    </svg>
  )
}

export function AiInsightsCard() {
  const [insights,    setInsights]    = useState<Insight[]>(FALLBACK_INSIGHTS)
  const [loading,     setLoading]     = useState(true)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    try {
      const fpoId = typeof window !== 'undefined' ? localStorage.getItem('fpoId') || 'fpo-001' : 'fpo-001'
      const res  = await fetch(`/api/ai/insights?fpoId=${fpoId}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.insights) && data.insights.length > 0) {
        setInsights(data.insights)
        setLastFetched(new Date())
      } else {
        setInsights(FALLBACK_INSIGHTS)
      }
    } catch {
      setInsights(FALLBACK_INSIGHTS)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.28 }}
      className="relative overflow-hidden rounded-xl border border-emerald-500/10 bg-[rgba(255,255,255,0.03)] p-5 glass glass-hover"
    >
      <SmallVine />
      <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-70"
        style={{ background: 'radial-gradient(circle at top right, rgba(16,185,129,0.08), transparent 70%)' }}
        aria-hidden="true" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">AI Insights</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20">LIVE</span>
            </div>
            <p className="text-xs text-gray-500">
              {lastFetched
                ? `Updated ${lastFetched.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                : 'Smart recommendations for today'}
            </p>
          </div>
          <button onClick={fetchInsights} disabled={loading}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-600 hover:text-emerald-400 transition-colors disabled:opacity-40">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4">
              {/* Show fallback insights dimmed while Gemini loads */}
              {FALLBACK_INSIGHTS.map((insight, i) => (
                <div key={i} className="flex gap-3 opacity-30 animate-pulse">
                  <div className={`mt-1 shrink-0 w-3.5 h-3.5 rounded-full bg-gradient-to-br ${accentForType(insight.type)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white leading-snug">{insight.title}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                      <IconForType type={insight.type} />
                      <span>{insight.detail}</span>
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-gray-600 text-center">Gemini is analysing your FPO data…</p>
            </motion.div>
          ) : (
            <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 + index * 0.07 }}
                  className="flex gap-3"
                >
                  <div className={`mt-1 shrink-0 w-3.5 h-3.5 rounded-full bg-gradient-to-br ${accentForType(insight.type)} shadow-[0_0_12px_rgba(16,185,129,0.22)]`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white leading-snug">{insight.title}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                      <IconForType type={insight.type} />
                      <span>{insight.detail}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {!lastFetched && (
                <p className="text-[10px] text-gray-700 text-center">Showing cached insights</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
