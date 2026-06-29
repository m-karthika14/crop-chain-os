'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingUp } from 'lucide-react'
import { FloralCard } from '@/components/floral-card'
import Link from 'next/link'

function useCountUp(target: number, duration = 1600, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return count
}

interface CreditData {
  score:  number
  label:  string
  loan:   { amount: string; rate: string } | null
}

export function CreditScoreCard() {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)
  const [data, setData] = useState<CreditData | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const fpoId = localStorage.getItem('fpoId') || 'fpo-001'
    fetch(`/api/credit-score?fpoId=${fpoId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setData({ score: d.score, label: d.label, loan: d.loan })
      })
      .catch(() => {})
  }, [])

  const target = data?.score ?? 0
  const maxScore = 900
  const score = useCountUp(target, 1600, started && target > 0)
  const pct = (score / maxScore) * 100

  const loanText = data?.loan
    ? `${data.loan.amount} loan eligible at ${data.loan.rate} p.a.`
    : 'Score too low for loan eligibility'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <FloralCard className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(245,158,11,0.07), transparent 65%)' }}
          aria-hidden="true"
        />

        <div className="flex items-start justify-between mb-4 relative">
          <div>
            <h3 className="text-sm font-semibold text-white">FPO Credit Score</h3>
            <p className="text-xs text-gray-500 mt-0.5">Live from DB</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
          </div>
        </div>

        <div className="flex items-end gap-1.5 mb-1 relative">
          <span className="text-5xl font-black text-amber-400 tabular-nums leading-none">
            {data ? score : '—'}
          </span>
          <span className="text-lg text-gray-500 font-semibold mb-1">/{maxScore}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-4">
          <span className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            <Star className="w-3 h-3" fill="currentColor" />
            {data?.label ?? 'Computing...'}
          </span>
          {data && (
            <div className="flex items-center gap-1 text-xs text-emerald-400">
              <TrendingUp className="w-3 h-3" />
              <span>live score</span>
            </div>
          )}
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1.5">
            <span>300</span>
            <span>900</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(to right, #F59E0B, #FBBF24)',
                boxShadow: '0 0 12px rgba(245,158,11,0.5)',
              }}
              initial={{ width: 0 }}
              animate={{ width: started && target > 0 ? `${pct}%` : '0%' }}
              transition={{ duration: 1.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'].map((label, i) => (
              <span key={label} className={`text-[9px] ${data?.label === label ? 'text-amber-400 font-semibold' : 'text-gray-700'}`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {data?.loan ? (
          <div className="rounded-lg bg-emerald-500/8 border border-emerald-500/15 px-3 py-2.5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <p className="text-xs text-emerald-300 font-medium">{loanText}</p>
          </div>
        ) : (
          <div className="rounded-lg bg-amber-500/8 border border-amber-500/15 px-3 py-2.5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <p className="text-xs text-amber-300 font-medium">Improve score to unlock loans</p>
          </div>
        )}

        <Link
          href="/dashboard/credit-score"
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-emerald-400 transition-colors py-1"
        >
          View full breakdown →
        </Link>
      </FloralCard>
    </motion.div>
  )
}
