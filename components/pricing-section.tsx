'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check, Zap, Building2 } from 'lucide-react'

const plans = [
  {
    icon: Zap,
    name: 'Starter',
    price: '4,999',
    period: '/month',
    description: 'Perfect for small FPOs getting started with digital operations.',
    cta: 'Start Free Trial',
    highlight: false,
    features: [
      'Up to 200 farmer profiles',
      'Live mandi price feed (1,473 mandis)',
      'Basic trust scoring',
      'Farmer payout processing',
      'Audit ledger (read-only)',
      'Email & WhatsApp support',
      '1 admin user',
    ],
  },
  {
    icon: Building2,
    name: 'Professional',
    price: '9,999',
    period: '/month',
    description: 'Full-stack financial OS for growing FPOs managing significant trade volumes.',
    cta: 'Start Free Trial',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Unlimited farmer profiles',
      'Smart Price Optimizer (AI)',
      'Advanced Trust Score Engine',
      'Instant UPI farmer payouts',
      'Full audit ledger + export',
      'FPO Credit Score report',
      'Custom mandi alerts',
      'Priority 24/7 support',
      'Up to 10 admin users',
      'API access',
    ],
  },
]

export function PricingSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="market-opportunity" className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none"
        aria-hidden="true"
        style={{ background: 'rgba(16,185,129,0.05)', filter: 'blur(100px)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-3xl"
        >
          <span className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-3 block">
            Market Opportunity
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 text-balance">
            Navigate the Market
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Explore how CropChain OS transforms the agricultural market for FPOs and farmers across India.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => {
            const Icon = plan.icon
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className={`relative rounded-2xl overflow-hidden ${
                  plan.highlight
                    ? 'border border-emerald-500/40 shadow-2xl shadow-emerald-500/10'
                    : 'border border-emerald-500/15'
                }`}
                style={{
                  background: plan.highlight
                    ? 'linear-gradient(145deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.03) 50%, rgba(255,255,255,0.01) 100%)'
                    : 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
              >
                {/* Glow top border for highlighted */}
                {plan.highlight && (
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    aria-hidden="true"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent 5%, rgba(16,185,129,0.8) 50%, transparent 95%)',
                    }}
                  />
                )}

                <div className="p-7 sm:p-9">
                  {/* Plan header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                          plan.highlight
                            ? 'bg-emerald-500/20 border-emerald-500/40'
                            : 'bg-emerald-500/10 border-emerald-500/20'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${plan.highlight ? 'text-emerald-300' : 'text-emerald-400'}`}
                        />
                      </div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    </div>
                    {plan.badge && (
                      <span className="text-xs font-bold text-[#0A0A0A] bg-emerald-400 px-3 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold text-emerald-400">₹</span>
                      <span className="text-5xl sm:text-6xl font-bold text-white leading-none">
                        {plan.price}
                      </span>
                      <span className="text-gray-400 mb-1.5">{plan.period}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-7 leading-relaxed">
                    {plan.description}
                  </p>

                  {/* CTA */}
                  <button
                    className={`w-full py-3.5 rounded-xl font-bold text-base transition-all duration-300 hover:scale-[1.02] mb-8 ${
                      plan.highlight
                        ? 'shimmer-btn text-[#0A0A0A] hover:shadow-xl hover:shadow-emerald-500/25'
                        : 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/40'
                    }`}
                  >
                    {plan.cta}
                  </button>

                  {/* Divider */}
                  <div className="border-t border-emerald-500/10 mb-7" />

                  {/* Features */}
                  <ul className="space-y-3.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-emerald-400" strokeWidth={2.5} />
                        </div>
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-sm text-gray-500 mt-10"
        >
          All plans include 14-day free trial. No credit card required.{' '}
          <button className="text-emerald-400 hover:text-emerald-300 transition-colors duration-200 underline underline-offset-2">
            Contact us for Enterprise pricing
          </button>
        </motion.p>
      </div>
    </section>
  )
}
