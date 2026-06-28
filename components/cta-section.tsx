'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="contact" className="relative py-20 sm:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 50%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(16,185,129,0.25)',
          }}
        >
          {/* Top glow border */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            aria-hidden="true"
            style={{
              background:
                'linear-gradient(90deg, transparent 5%, rgba(16,185,129,0.8) 50%, transparent 95%)',
            }}
          />

          {/* Background blobs */}
          <div
            className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
            aria-hidden="true"
            style={{ background: 'rgba(16,185,129,0.08)', filter: 'blur(80px)' }}
          />
          <div
            className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
            aria-hidden="true"
            style={{ background: 'rgba(16,185,129,0.06)', filter: 'blur(80px)' }}
          />

          {/* Grid pattern */}
          <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 px-8 sm:px-12 lg:px-16 py-16 sm:py-20 text-center">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-4 block"
            >
              Get Started Today
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 text-balance leading-tight"
            >
              Your FPO Deserves a{' '}
              <span className="gradient-text">Financial OS</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed text-pretty"
            >
              Join India's 10,000+ FPOs representing 30 lakh farmers already using CropChain OS to trade smarter, pay farmers faster,
              and build lasting financial trust.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button className="shimmer-btn text-[#0A0A0A] font-bold text-base px-10 py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30 flex items-center gap-2 w-full sm:w-auto justify-center glow-pulse">
                Start Free Trial — 14 Days
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 px-8 py-4 rounded-xl glass border border-emerald-500/20 text-white font-semibold text-base hover:bg-emerald-500/5 hover:border-emerald-500/35 transition-all duration-300 w-full sm:w-auto justify-center">
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                Talk to Sales
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="text-sm text-gray-500 mt-6"
            >
              No credit card required &bull; Setup in under 10 minutes &bull; Cancel anytime
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
