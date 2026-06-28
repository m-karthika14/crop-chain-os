'use client'

import { Wheat, Check, Users, Zap, BarChart3 } from 'lucide-react'

const technologies = [
  'AWS Aurora DSQL',
  'Vercel',
  'Next.js',
  'Gemini AI',
]

const impactMetrics = [
  { label: '35,000+', description: 'FPOs' },
  { label: '30 Lakh+', description: 'Farmers' },
  { label: 'AI-powered', description: 'Mandi Intelligence' },
  { label: 'Transparent', description: 'Digital Settlements' },
]

export function Footer() {
  return (
    <footer className="relative border-t border-emerald-500/10 overflow-hidden">
      {/* Top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)',
        }}
      />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 pointer-events-none"
        aria-hidden="true"
        style={{ background: 'rgba(16,185,129,0.04)', filter: 'blur(60px)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Three-column layout with enhanced spacing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-20 mb-16">
          {/* Left - Brand & Mission */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Wheat className="w-7 h-7 text-emerald-400" />
              <span className="font-bold text-lg text-white">
                Crop<span className="text-emerald-400">Chain</span>
                <span className="text-emerald-500/60 text-sm ml-1 font-normal">OS</span>
              </span>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-400 leading-relaxed">
                Building the digital infrastructure for India's 35,000+ Farmer Producer Organizations.
              </p>

              <p className="text-sm text-gray-500 leading-relaxed">
                Helping FPOs maximize profits while ensuring every farmer gets better prices, transparent settlements, and fair payments.
              </p>
            </div>
          </div>

          {/* Center - Technology */}
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Powered By</h4>
            <ul className="space-y-4">
              {technologies.map((tech) => (
                <li key={tech} className="flex items-center gap-3 text-sm text-gray-500 hover:text-emerald-400 transition-colors duration-200">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{tech}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right - Impact */}
          <div className="space-y-6">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Target Market</h4>
            <div className="space-y-6">
              {impactMetrics.map((metric) => (
                <div key={metric.label} className="space-y-1">
                  <div className="text-xl font-bold text-emerald-400">{metric.label}</div>
                  <div className="text-sm text-gray-500">{metric.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar with better spacing */}
        <div className="border-t border-emerald-500/10 pt-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <p className="text-sm text-gray-600">
              Built with Vercel v0 for H0 Hackathon 2026
            </p>
            <p className="text-sm text-gray-600">
              Powered by AWS Aurora DSQL • Next.js • Gemini AI
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
