'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Building2, Zap, TrendingUp, MapPin, BarChart3, Eye, Gauge } from 'lucide-react'
import { LightFloralCard } from './light-floral-card'

type Role = 'farmer' | 'fpo' | null

interface RoleSelectionProps {
  onSelectRole?: (role: Role) => void
}

const fpoFeatures = [
  { icon: Zap, text: 'AI-powered selling decisions' },
  { icon: TrendingUp, text: 'Maximize harvest value' },
  { icon: MapPin, text: 'Smarter mandi selection' },
  { icon: BarChart3, text: 'Faster settlements' },
  { icon: Gauge, text: 'Better operational efficiency' },
]

const farmerFeatures = [
  { icon: TrendingUp, text: 'Better prices for every harvest' },
  { icon: Eye, text: 'Complete transparency into crop sales' },
  { icon: BarChart3, text: 'Clear payment calculations' },
  { icon: Zap, text: 'Fair and timely payouts' },
  { icon: Users, text: 'Greater trust in the FPO' },
]

export function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const router = useRouter()
  const [hoveredRole, setHoveredRole] = useState<Role>(null)

  function handleSelect(role: NonNullable<Role>) {
    if (onSelectRole) {
      onSelectRole(role)
    } else {
      router.push(`/login?role=${role}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-white mb-2"
        >
          Choose Your Role
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-gray-500"
        >
          Select your account type to continue
        </motion.p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* FPO Manager card */}
        <LightFloralCard showTopFlower={true} showVine={true} index={0}>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect('fpo')}
            onMouseEnter={() => setHoveredRole('fpo')}
            onMouseLeave={() => setHoveredRole(null)}
            className="glass rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 overflow-hidden transition-all duration-300 group text-left w-full"
          >
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-14 h-14 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all duration-300"
              >
                <Building2 className="w-7 h-7 text-emerald-400" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-white">For FPO Managers</h3>
                <p className="text-xs text-gray-500">Farmer Producer Organization</p>
              </div>
            </div>

            <AnimatePresence>
              {hoveredRole === 'fpo' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 mb-6"
                >
                  {fpoFeatures.map((feature, i) => (
                    <motion.div
                      key={feature.text}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="flex items-center gap-3 text-sm text-gray-300"
                    >
                      <feature.icon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feature.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.p
              animate={{ color: hoveredRole === 'fpo' ? '#D1FAE5' : '#9CA3AF' }}
              transition={{ duration: 0.3 }}
              className="text-sm"
            >
              {hoveredRole === 'fpo'
                ? 'Manage harvests, optimize sales, track payouts'
                : 'Manage harvests, optimize sales, track payouts'}
            </motion.p>
          </div>
          </motion.button>
        </LightFloralCard>

        {/* Farmer card */}
        <LightFloralCard showTopFlower={true} showVine={true} showBottomFlower={true} index={1}>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect('farmer')}
            onMouseEnter={() => setHoveredRole('farmer')}
            onMouseLeave={() => setHoveredRole(null)}
            className="glass rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 overflow-hidden transition-all duration-300 group text-left w-full"
          >
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-14 h-14 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all duration-300"
              >
                <Users className="w-7 h-7 text-emerald-400" />
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-white">For Farmers</h3>
                <p className="text-xs text-gray-500">Individual harvest seller</p>
              </div>
            </div>

            <AnimatePresence>
              {hoveredRole === 'farmer' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 mb-6"
                >
                  {farmerFeatures.map((feature, i) => (
                    <motion.div
                      key={feature.text}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="flex items-center gap-3 text-sm text-gray-300"
                    >
                      <feature.icon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feature.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.p
              animate={{ color: hoveredRole === 'farmer' ? '#D1FAE5' : '#9CA3AF' }}
              transition={{ duration: 0.3 }}
              className="text-sm"
            >
              {hoveredRole === 'farmer'
                ? 'Access your harvest, sales, and earnings'
                : 'Access your harvest, sales, and earnings'}
            </motion.p>
          </div>
          </motion.button>
        </LightFloralCard>
      </div>
    </div>
  )
}
