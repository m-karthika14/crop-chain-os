'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Map,
  Zap,
  Shield,
  Banknote,
  BookOpen,
  CreditCard,
  ArrowRight,
} from 'lucide-react'
import { LightFloralCard } from './light-floral-card'

const features = [
  {
    icon: Map,
    title: 'Live Mandi Map',
    description:
      'Real-time price intelligence from 1,473 mandis across India. Interactive heatmap with price spreads, demand signals, and transport cost overlays.',
    tag: 'Real-time',
    highlight: true,
  },
  {
    icon: Zap,
    title: 'Smart Optimizer',
    description:
      'AI-powered price and route optimization engine that recommends the best mandi to sell, maximizing net realisation for each crop batch.',
    tag: 'AI-Powered',
    highlight: false,
  },
  {
    icon: Shield,
    title: 'Trust Score Engine',
    description:
      'Proprietary 0–100 trust score for buyers and sellers based on payment history, dispute resolution, and trade behaviour — your on-chain reputation.',
    tag: 'Proprietary',
    highlight: false,
  },
  {
    icon: Banknote,
    title: 'Farmer Payouts',
    description:
      'Instant, transparent payouts to farmers via UPI and bank transfer. Every rupee is traceable — from buyer payment to farmer wallet.',
    tag: 'Instant',
    highlight: false,
  },
  {
    icon: BookOpen,
    title: 'Audit Ledger',
    description:
      'Immutable, tamper-proof transaction records for every trade. One-click audit-ready reports for NABARD, banks, and government compliance.',
    tag: 'Compliance-ready',
    highlight: false,
  },
  {
    icon: CreditCard,
    title: 'FPO Credit Score',
    description:
      'Bank-grade creditworthiness scoring for FPOs, enabling access to institutional credit, working capital loans, and buyer credit lines.',
    tag: 'Fintech',
    highlight: true,
  },
]

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="features" className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" aria-hidden="true" />

      {/* Left glow */}
      <div
        className="absolute top-1/2 left-0 w-80 h-80 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
        style={{ background: 'rgba(16,185,129,0.06)', filter: 'blur(80px)' }}
      />
      {/* Right glow */}
      <div
        className="absolute top-1/3 right-0 w-80 h-80 pointer-events-none"
        aria-hidden="true"
        style={{ background: 'rgba(16,185,129,0.05)', filter: 'blur(80px)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-3 block">
            Platform Features
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 text-balance">
            Everything an FPO Needs,{' '}
            <span className="gradient-text">in One OS</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto text-pretty">
            CropChain OS integrates financial intelligence, trade automation, and compliance
            tooling into a single, easy-to-use platform.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
              <LightFloralCard
                showTopFlower={true}
                showVine={i % 2 === 0}
                showBottomFlower={i % 3 === 0}
                className="h-full"
                index={i}
              >
                  <div className={`relative glass glass-hover rounded-2xl p-6 sm:p-7 flex flex-col group overflow-hidden cursor-default h-64 ${
                    feature.highlight ? 'border-emerald-500/30' : ''
                  }`}>
                {/* Highlight top border */}
                {feature.highlight && (
                  <div
                    className="absolute top-0 left-6 right-6 h-px"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(16,185,129,0.6), transparent)',
                    }}
                    aria-hidden="true"
                  />
                )}

                {/* Tag */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/15 group-hover:border-emerald-500/35 transition-all duration-300">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                    {feature.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-emerald-50 transition-colors duration-200">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-400 leading-relaxed flex-1 mb-0">
                  {feature.description}
                </p>

                {/* Background glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  aria-hidden="true"
                  style={{
                    background:
                      'radial-gradient(circle at 30% 30%, rgba(16,185,129,0.06) 0%, transparent 60%)',
                  }}
                />
                  </div>
                </LightFloralCard>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
