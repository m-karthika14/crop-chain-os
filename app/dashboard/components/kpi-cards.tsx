'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Wheat, IndianRupee, Star, MapPin, Clock } from 'lucide-react'
import { VineDecoration } from '@/components/floral-card'

function useCountUp(target: number, duration = 1800, start = false) {
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

function KpiCard({
  icon: Icon,
  label,
  value,
  suffix,
  prefix,
  change,
  changeType,
  badge,
  delay,
  started,
}: {
  icon: React.ElementType
  label: string
  value: number
  suffix?: string
  prefix?: string
  change: string
  changeType: 'positive' | 'neutral' | 'warning'
  badge?: string
  delay: number
  started: boolean
}) {
  const count = useCountUp(value, 1600, started)

  const changeColor = {
    positive: 'text-emerald-400',
    neutral:  'text-gray-400',
    warning:  'text-amber-400',
  }[changeType]

  const badgeColor = {
    positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    neutral:  'bg-gray-500/10 text-gray-400 border-gray-500/20',
    warning:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  }[changeType]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative glass rounded-xl p-5 border border-emerald-500/10 glass-hover overflow-hidden group"
    >
      <div className="pointer-events-none">
        <VineDecoration />
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'radial-gradient(circle at top right, rgba(16,185,129,0.08), transparent 70%)' }}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-emerald-400" />
        </div>
        {badge && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white tracking-tight">
        {prefix}{count.toLocaleString('en-IN')}{suffix}
      </p>
      <p className={`text-xs mt-1.5 font-medium ${changeColor}`}>{change}</p>
    </motion.div>
  )
}

interface Stats {
  farmer_count:          number
  active_harvest_qty:    number
  revenue_month_lakhs:   number
  pending_payouts_lakhs: number
  pending_farmers:       number
  mandi_count:           number
}

interface CreditData {
  score: number
  label: string
}

export function KpiCards() {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [credit, setCredit] = useState<CreditData | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const fpoId = localStorage.getItem('fpoId') || 'fpo-001'
    Promise.all([
      fetch(`/api/stats/fpo?fpoId=${fpoId}`).then(r => r.json()),
      fetch(`/api/credit-score?fpoId=${fpoId}`).then(r => r.json()),
    ]).then(([sData, cData]) => {
      if (sData.success) setStats(sData as Stats)
      if (cData.success) setCredit({ score: cData.score, label: cData.label })
    }).catch(() => {})
  }, [])

  const kpis = [
    {
      icon: Users,
      label: 'Total Farmers',
      value: stats?.farmer_count ?? 0,
      change: stats ? `${stats.farmer_count} registered farmers` : 'Loading...',
      changeType: 'positive' as const,
      delay: 0,
    },
    {
      icon: Wheat,
      label: 'Active Harvest',
      value: stats?.active_harvest_qty ?? 0,
      suffix: ' Q',
      change: 'Pending dispatch',
      changeType: 'neutral' as const,
      delay: 0.08,
    },
    {
      icon: IndianRupee,
      label: 'Revenue This Month',
      value: stats?.revenue_month_lakhs ?? 0,
      prefix: '₹',
      suffix: 'L',
      change: stats ? `₹${stats.revenue_month_lakhs}L settled this month` : 'Loading...',
      changeType: 'positive' as const,
      delay: 0.16,
    },
    {
      icon: Star,
      label: 'FPO Credit Score',
      value: credit?.score ?? 0,
      suffix: '/900',
      change: credit ? `${credit.label} — computed from live data` : 'Loading...',
      changeType: 'positive' as const,
      badge: credit?.label,
      delay: 0.24,
    },
    {
      icon: MapPin,
      label: 'Active Mandis',
      value: stats?.mandi_count ?? 0,
      change: 'Pan-India network',
      changeType: 'neutral' as const,
      delay: 0.32,
    },
    {
      icon: Clock,
      label: 'Pending Payouts',
      value: stats?.pending_payouts_lakhs ?? 0,
      prefix: '₹',
      suffix: 'L',
      change: stats
        ? stats.pending_farmers > 0
          ? `${stats.pending_farmers} farmers awaiting payment`
          : 'All payouts settled ✅'
        : 'Loading...',
      changeType: (stats?.pending_payouts_lakhs ?? 0) > 0 ? 'warning' as const : 'positive' as const,
      badge: (stats?.pending_payouts_lakhs ?? 0) > 0 ? 'Pending' : undefined,
      delay: 0.40,
    },
  ]

  return (
    <div ref={ref} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} {...kpi} started={started} />
      ))}
    </div>
  )
}
