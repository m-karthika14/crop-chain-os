'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play, TrendingUp, Shield } from 'lucide-react'
import { ParticleCanvas } from './particle-canvas'

export function HeroSection() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Radial gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 40%, transparent 70%)',
        }}
      />

      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" aria-hidden="true" />

      {/* Particle canvas */}
      <ParticleCanvas />

      {/* Blurred glow blobs */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        aria-hidden="true"
        style={{ background: 'rgba(16,185,129,0.06)', filter: 'blur(80px)' }}
      />
      <div
        className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
        aria-hidden="true"
        style={{ background: 'rgba(16,185,129,0.04)', filter: 'blur(60px)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">


        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
        >
          <span className="text-white">Crop</span>
          <span className="gradient-text">Chain</span>
          <span className="text-white"> OS</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="text-lg sm:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto mb-4 leading-relaxed text-pretty"
        >
          {"India's First Financial OS built for"}
          <span className="text-white font-semibold"> 35,000+ registered FPOs</span>
          {" ("}
          <span className="text-emerald-400 font-semibold">10,000+ government-supported</span>
          {") representing"}
          <span className="text-white font-semibold"> 30 lakh farmers</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed text-pretty"
        >
          AI-powered decisions for FPOs. Complete transparency for every farmer. Better prices, faster settlements,
          and stronger trust.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={() => scrollTo('#login-modal')}
            className="shimmer-btn text-[#0A0A0A] font-bold text-base px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            Start Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>



        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8 }}
          className="mt-20 relative max-w-5xl mx-auto"
        >
          {/* Glow under mockup */}
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-20 pointer-events-none"
            aria-hidden="true"
            style={{ background: 'rgba(16,185,129,0.15)', filter: 'blur(40px)' }}
          />

          <div className="glass rounded-2xl border border-emerald-500/15 overflow-hidden shadow-2xl shadow-emerald-500/5">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-emerald-500/10 bg-white/[0.02]">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <div className="flex-1 mx-4 h-6 rounded-md bg-white/[0.04] border border-white/5 flex items-center px-3">
                <span className="text-xs text-gray-500">app.mandipilot.in/dashboard</span>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Live Mandi Price', value: '₹2,340/q', change: '+4.2%', positive: true },
                { label: 'Active Farmers', value: '825', change: '+12 today', positive: true },
                { label: 'Revenue MTD', value: '₹1.8 Cr', change: '+8.3%', positive: true },
                { label: 'Trust Score', value: '94%', change: '↑ Stable', positive: true },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white/[0.02] border border-emerald-500/10 rounded-xl p-4 hover:border-emerald-500/25 transition-colors duration-300"
                >
                  <p className="text-xs text-gray-500 mb-2">{item.label}</p>
                  <p className="text-xl font-bold text-white mb-1">{item.value}</p>
                  <p className={`text-xs font-medium ${item.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.change}
                  </p>
                </div>
              ))}
            </div>

            {/* Mini chart area */}
            <div className="px-6 pb-6">
              <div className="bg-white/[0.02] border border-emerald-500/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-300">Price Trend — Last 30 Days</span>
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">Live</span>
                </div>
                {/* Decorative bars */}
                <div className="flex items-end gap-1 h-16">
                  {[40, 55, 48, 62, 58, 72, 65, 78, 70, 85, 80, 90, 76, 88, 82, 95, 89, 92, 86, 98, 91, 96, 88, 99, 93, 97, 90, 100, 95, 98].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          background:
                            i > 25
                              ? 'rgba(16,185,129,0.8)'
                              : `rgba(16,185,129,${0.2 + (h / 100) * 0.3})`,
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
