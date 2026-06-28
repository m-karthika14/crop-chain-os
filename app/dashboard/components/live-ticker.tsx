'use client'

import { motion } from 'framer-motion'
import { Banknote } from 'lucide-react'

const payouts = [
  'Ramu Patil received ₹12,400 — Wheat, Azadpur Mandi',
  'Sunita Devi received ₹8,200 — Onion, Koyambedu',
  'Ganesh Yadav received ₹19,500 — Soybean, Gultekdi',
  'Parvati Bai received ₹6,750 — Tomato, Vashi APMC',
  'Kishan Lal received ₹14,100 — Maize, Bowenpally',
  'Meena Kumari received ₹9,300 — Paddy, Yeshwanthpur',
  'Arun Patil received ₹11,200 — Wheat, Azadpur Mandi',
  'Bhima Rao received ₹7,650 — Cotton, Guntur APMC',
]

// Duplicate for seamless loop
const tickerItems = [...payouts, ...payouts]

export function LiveTicker() {
  const totalWidth = payouts.length * 340 // approximate per-item pixel width

  return (
    <div className="glass rounded-xl border border-emerald-500/10 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-emerald-500/10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <Banknote className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">Live Payouts</span>
        </div>
        <div className="h-px flex-1 bg-emerald-500/10" />
        <span className="text-xs text-gray-600">Auto-updating</span>
      </div>

      <div className="relative overflow-hidden py-2.5">
        {/* Fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #0D0D0D, transparent)' }}
          aria-hidden="true"
        />
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #0D0D0D, transparent)' }}
          aria-hidden="true"
        />

        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: [-totalWidth, 0] }}
          transition={{
            duration: 35,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          {tickerItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-500">{item}</span>
              <span className="text-emerald-500/40">•</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
