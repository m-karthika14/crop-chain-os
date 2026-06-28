'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Users, TrendingUp, MapPin, Star } from 'lucide-react'
import { LightFloralCard } from './light-floral-card'

interface StatItem {
  icon: React.ComponentType<{ className?: string }>
  value: number
  suffix: string
  prefix: string
  label: string
  description: string
}

const stats: StatItem[] = [
  {
    icon: Users,
    value: 30,
    suffix: ' Lakh',
    prefix: '',
    label: 'Farmers Represented',
    description: 'Across 35,000+ FPOs (10,000+ government-supported)',
  },
  {
    icon: TrendingUp,
    value: 6865,
    suffix: ' Crore',
    prefix: '₹',
    label: 'Government Investment',
    description: 'In FPO ecosystem — zero operational software built',
  },
  {
    icon: MapPin,
    value: 471,
    suffix: ' Billion',
    prefix: '$',
    label: 'India Agriculture Market 2026',
    description: 'CropChain OS total addressable market',
  },
  {
    icon: Star,
    value: 484000,
    suffix: ' Crore',
    prefix: '₹',
    label: 'Total Mandi Trade Value',
    description: 'e-NAM cumulative 2016–2026',
  },
]

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    const isDecimal = target % 1 !== 0

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = isDecimal
        ? parseFloat((eased * target).toFixed(1))
        : Math.floor(eased * target)
      setCount(current)
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [target, duration, start])

  return count
}

function StatCard({ stat, index, inView }: { stat: StatItem; index: number; inView: boolean }) {
  const count = useCountUp(stat.value, 2200, inView)
  const Icon = stat.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      className="mt-10"
    >
      <LightFloralCard
        showTopFlower={true}
        showVine={index % 2 === 0}
        showBottomFlower={index % 3 === 0}
        className="h-full"
        index={index}
      >
        <div className="relative glass glass-hover rounded-2xl p-8 flex flex-col items-center justify-start text-center group overflow-hidden h-96 pt-10">
      {/* Corner glow */}
      <div
        className="absolute top-0 left-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
        }}
        aria-hidden="true"
      />

      {/* Icon */}
      <div className="relative w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:bg-emerald-500/15 group-hover:border-emerald-500/40 transition-all duration-300">
        <Icon className="w-6 h-6 text-emerald-400" />
        <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
      </div>

      {/* Number */}
      <div className="text-4xl sm:text-5xl font-bold text-white mb-3 tabular-nums leading-tight">
        <span className="text-emerald-400">{stat.prefix}</span>
        <span>{count.toLocaleString('en-IN')}</span>
        <span className="text-emerald-400">{stat.suffix}</span>
      </div>

      {/* Label */}
      <p className="text-base font-semibold text-white mb-2">{stat.label}</p>
      <p className="text-sm text-gray-500 leading-relaxed">{stat.description}</p>
        </div>
      </LightFloralCard>
    </motion.div>
  )
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(16,185,129,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-3 block">
            Market Opportunity
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-balance">
            10,000+ FPOs, 30 Lakh Farmers, Zero Software
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-start mt-8">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  )
}
