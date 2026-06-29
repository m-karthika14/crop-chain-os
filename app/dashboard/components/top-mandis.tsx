'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Star, TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react'
import { FloralCard } from '@/components/floral-card'

const DEFAULT_MANDIS = [
  {
    name: 'Karnal Mandi',
    city: 'Haryana',
    crop: 'Wheat',
    price: 2387,
    trust: 94,
    direction: 'up' as const,
    rank: 1,
  },
  {
    name: 'Panipat Mandi',
    city: 'Haryana',
    crop: 'Wheat',
    price: 2290,
    trust: 78,
    direction: 'up' as const,
    rank: 2,
  },
  {
    name: 'Delhi Azadpur',
    city: 'Delhi',
    crop: 'Wheat',
    price: 2260,
    trust: 52,
    direction: 'down' as const,
    rank: 3,
  },
]

const trustColor = (score: number) =>
  score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'

const trustBg = (score: number) =>
  score >= 80 ? 'bg-emerald-500/10 border-emerald-500/20' : score >= 60 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'

export function TopMandis() {
  const [mandis, setMandis] = useState(DEFAULT_MANDIS)

  useEffect(() => {
    fetch('/api/mandis/top?crop=Wheat&limit=3')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.mandis.length > 0) {
          const mapped = data.mandis.map((m: Record<string, unknown>, i: number) => ({
            name: m.name as string,
            city: m.state as string,
            crop: 'Wheat',
            price: (m.modal_price as number) || 0,
            trust: (m.trust_score as number) || 50,
            direction: ((m.trust_score as number) > 75 ? 'up' : 'down') as 'up' | 'down',
            rank: i + 1,
          }))
          setMandis(mapped)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <FloralCard>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Top Mandis Today</h3>
          <p className="text-xs text-gray-500 mt-0.5">Best price for your wheat</p>
        </div>
        <Link
          href="/dashboard/mandi-map"
          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
        >
          View all <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {mandis.map((mandi, i) => (
          <div
            key={mandi.name}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/20 hover:bg-emerald-500/[0.03] transition-all duration-200 group"
          >
            {/* Rank */}
            <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              i === 0 ? 'bg-emerald-500/20 text-emerald-400' :
              i === 1 ? 'bg-amber-500/15 text-amber-400' :
              'bg-red-500/10 text-red-400'
            }`}>
              {mandi.rank}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-200 truncate">{mandi.name}</p>
              <p className="text-xs text-gray-600 mt-0.5">{mandi.city} · {mandi.crop}</p>
            </div>

            {/* Price + direction */}
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 justify-end">
                {mandi.direction === 'up' ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                ) : mandi.direction === 'down' ? (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                ) : (
                  <Minus className="w-3 h-3 text-gray-500" />
                )}
                <p className="text-xs font-bold text-white">₹{mandi.price.toLocaleString('en-IN')}</p>
              </div>
              <p className="text-[10px] text-gray-600">per quintal</p>
            </div>

            {/* Trust score */}
            <div className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${trustBg(mandi.trust)} ${trustColor(mandi.trust)}`}>
              <Star className="w-2.5 h-2.5" fill="currentColor" />
              {mandi.trust}
            </div>
          </div>
        ))}
        </div>
      </FloralCard>
    </motion.div>
  )
}
