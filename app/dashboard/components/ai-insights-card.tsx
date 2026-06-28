'use client'

import { motion } from 'framer-motion'
import { Bot, CloudRain, IndianRupee, Clock3 } from 'lucide-react'

const insights = [
  {
    icon: IndianRupee,
    title: 'Sell Wheat at Azadpur today',
    detail: 'Expected profit: +₹1.6L',
    accent: 'from-emerald-400 to-emerald-300',
  },
  {
    icon: IndianRupee,
    title: "18 farmers' payments are pending",
    detail: 'Prioritize payout approvals today',
    accent: 'from-rose-400 to-red-300',
  },
  {
    icon: CloudRain,
    title: 'Rain in Pune tomorrow',
    detail: 'Dispatch soybean today',
    accent: 'from-sky-400 to-cyan-300',
  },
]

function SmallVine() {
  return (
    <svg
      width="92"
      height="44"
      viewBox="0 0 92 44"
      fill="none"
      className="absolute top-0 right-0 opacity-80 pointer-events-none"
    >
      <path
        d="M92 4 Q72 8 56 6 Q40 4 20 16"
        stroke="#16A34A"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
      <ellipse cx="70" cy="7" rx="3.5" ry="5.5" fill="#16A34A" transform="rotate(-28 70 7)" opacity="0.7" />
      <ellipse cx="52" cy="5" rx="3.5" ry="5.5" fill="#16A34A" transform="rotate(18 52 5)" opacity="0.7" />
      <ellipse cx="34" cy="10" rx="3.5" ry="5.5" fill="#16A34A" transform="rotate(-20 34 10)" opacity="0.7" />
      <ellipse cx="24" cy="15" rx="3.5" ry="5.5" fill="#16A34A" transform="rotate(14 24 15)" opacity="0.7" />
    </svg>
  )
}

export function AiInsightsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.28 }}
      className="relative overflow-hidden rounded-xl border border-emerald-500/10 bg-[rgba(255,255,255,0.03)] p-5 glass glass-hover"
    >
      <SmallVine />

      <div
        className="absolute top-0 right-0 w-24 h-24 pointer-events-none opacity-70"
        style={{ background: 'radial-gradient(circle at top right, rgba(16,185,129,0.08), transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">AI Insights</h3>
            </div>
            <p className="text-xs text-gray-500">Smart recommendations for today</p>
          </div>
        </div>

        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon
            return (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.06 }}
                className="flex gap-3"
              >
                <div className={`mt-1 shrink-0 w-3.5 h-3.5 rounded-full bg-gradient-to-br ${insight.accent} shadow-[0_0_12px_rgba(16,185,129,0.22)]`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white leading-snug">{insight.title}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                    <Icon className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{insight.detail}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
