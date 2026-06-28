'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Wheat, Map, IndianRupee, BookOpen, ArrowRight } from 'lucide-react'

const actions = [
  {
    icon: Wheat,
    label: 'New Harvest',
    description: 'Log crop collection',
    href: '#',
    color: 'amber',
    colorClasses: {
      icon: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      hover: 'hover:border-amber-500/40 hover:bg-amber-500/5',
      arrow: 'group-hover:text-amber-400',
    },
  },
  {
    icon: Map,
    label: 'Find Best Mandi',
    description: 'AI-powered optimizer',
    href: '/dashboard/mandi-map',
    color: 'emerald',
    colorClasses: {
      icon: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      hover: 'hover:border-emerald-500/40 hover:bg-emerald-500/5',
      arrow: 'group-hover:text-emerald-400',
    },
  },
  {
    icon: IndianRupee,
    label: 'Process Payouts',
    description: '18 farmers pending',
    href: '/dashboard/payouts',
    color: 'green',
    colorClasses: {
      icon: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      hover: 'hover:border-emerald-500/40 hover:bg-emerald-500/5',
      arrow: 'group-hover:text-emerald-400',
    },
  },
  {
    icon: BookOpen,
    label: 'View Ledger',
    description: 'Audit trail & records',
    href: '/dashboard/ledger',
    color: 'blue',
    colorClasses: {
      icon: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      hover: 'hover:border-blue-500/40 hover:bg-blue-500/5',
      arrow: 'group-hover:text-blue-400',
    },
  },
]

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass rounded-xl border border-emerald-500/10 p-5"
    >
      <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>

      <div className="space-y-2">
        {actions.map(({ icon: Icon, label, description, href, colorClasses }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.35 + i * 0.07 }}
          >
            <Link
              href={href}
              className={`group flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] ${colorClasses.hover} transition-all duration-200`}
            >
              <div className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center ${colorClasses.iconBg}`}>
                <Icon className={`w-4 h-4 ${colorClasses.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-200 leading-tight">{label}</p>
                <p className="text-xs text-gray-600 mt-0.5 leading-tight">{description}</p>
              </div>
              <ArrowRight className={`w-3.5 h-3.5 text-gray-700 shrink-0 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 ${colorClasses.arrow} transition-all duration-200`} />
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
