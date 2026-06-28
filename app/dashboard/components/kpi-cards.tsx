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
    neutral: 'text-gray-400',
    warning: 'text-amber-400',
  }[changeType]

  const badgeColor = {
    positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    neutral: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  }[changeType]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative glass rounded-xl p-5 border border-emerald-500/10 glass-hover overflow-hidden group"
    >
      {/* Vine decoration */}
      <div className="pointer-events-none">
        <VineDecoration />
      </div>

      {/* Subtle corner glow */}
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

export function KpiCards() {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const kpis = [
    {
      icon: Users,
      label: 'Total Farmers',
      value: 825,
      change: '+12 joined this week',
      changeType: 'positive' as const,
      delay: 0,
    },
    {
      icon: Wheat,
      label: 'Active Harvest',
      value: 850,
      suffix: ' Q',
      change: 'Kharif season ongoing',
      changeType: 'neutral' as const,
      delay: 0.08,
    },
    {
      icon: IndianRupee,
      label: 'Revenue This Month',
      value: 180,
      prefix: '₹',
      suffix: 'L',
      change: '+8.3% vs last month',
      changeType: 'positive' as const,
      delay: 0.16,
    },
    {
      icon: Star,
      label: 'FPO Credit Score',
      value: 842,
      suffix: '/900',
      change: 'Up 6 pts from last month',
      changeType: 'positive' as const,
      badge: 'Excellent',
      delay: 0.24,
    },
    {
      icon: MapPin,
      label: 'Active Mandis',
      value: 1473,
      change: '23 states covered',
      changeType: 'neutral' as const,
      delay: 0.32,
    },
    {
      icon: Clock,
      label: 'Pending Payouts',
      value: 42,
      prefix: '₹',
      suffix: 'L',
      change: '18 farmers awaiting',
      changeType: 'warning' as const,
      badge: 'Pending',
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
