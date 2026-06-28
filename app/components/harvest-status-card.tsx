'use client'

import { motion } from 'framer-motion'
import { Copy, Share2, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

type HarvestStatus = 'SUBMITTED' | 'APPROVED' | 'GODOWN_RECEIVED' | 'IN_TRANSIT' | 'SOLD' | 'PAID'

interface HarvestStatusCardProps {
  cropType: string
  variety: string
  grade: string
  estimatedQty: number
  status: HarvestStatus
  tokenNumber?: string
  actualQty?: number
  timestamp: string
  godownAddress?: string
  contact?: string
  actualEarnings?: string
}

const statusConfig = {
  SUBMITTED: {
    icon: '📱',
    label: 'SUBMITTED',
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-400',
    description: 'Waiting for manager approval...',
  },
  APPROVED: {
    icon: '✅',
    label: 'APPROVED',
    color: 'amber',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    textColor: 'text-amber-400',
    description: 'Please bring crop to godown',
  },
  GODOWN_RECEIVED: {
    icon: '🏚️',
    label: 'GODOWN RECEIVED',
    color: 'emerald',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    textColor: 'text-emerald-400',
    description: 'Crop verified and in FPO stock',
  },
  IN_TRANSIT: {
    icon: '🚛',
    label: 'IN TRANSIT',
    color: 'purple',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    textColor: 'text-purple-400',
    description: 'Dispatched to mandi',
  },
  SOLD: {
    icon: '💼',
    label: 'SOLD',
    color: 'indigo',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
    textColor: 'text-indigo-400',
    description: 'Sold at mandi',
  },
  PAID: {
    icon: '💰',
    label: 'PAID',
    color: 'amber',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    textColor: 'text-amber-400',
    description: 'Payment received',
  },
}

export function HarvestStatusCard(props: HarvestStatusCardProps) {
  const config = statusConfig[props.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-6 space-y-4`}
    >
      {/* Header with crop info and status */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-white font-bold">
            🌾 {props.cropType} {props.variety ? `(${props.variety})` : ''}
          </h3>
          <p className="text-sm text-gray-400">Est. {props.estimatedQty}Q · Grade {props.grade}</p>
        </div>
        <motion.div
          animate={{ scale: props.status === 'APPROVED' ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 2, repeat: props.status === 'APPROVED' ? Infinity : 0 }}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}
        >
          <span>{config.icon}</span>
          <span>{config.label}</span>
        </motion.div>
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Clock className="w-4 h-4" />
        {props.timestamp}
      </div>

      {/* Status-specific content */}
      {props.status === 'APPROVED' && props.tokenNumber && props.godownAddress && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 pt-4 border-t border-white/10"
        >
          <div className="space-y-2">
            <p className="text-sm text-gray-400 font-medium">📍 Bring your crop to:</p>
            <p className="text-white font-semibold">{props.godownAddress}</p>
            {props.contact && (
              <p className="text-sm text-gray-400">Contact: {props.contact}</p>
            )}
          </div>

          <div className="bg-white/[0.03] rounded-lg p-4 border border-emerald-500/20">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Your Token Number</p>
            <div className="text-2xl font-bold text-emerald-400 font-mono tracking-wider mb-3">
              {props.tokenNumber}
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded text-sm font-medium text-emerald-400 hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                <Copy className="w-4 h-4" />
                Copy Token
              </button>
              <button className="flex-1 py-2 rounded text-sm font-medium text-emerald-400 hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {props.status === 'GODOWN_RECEIVED' && props.actualQty !== undefined && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4 pt-4 border-t border-white/10"
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase mb-1">Est. Quantity</p>
              <p className="text-white font-semibold">{props.estimatedQty}Q</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase mb-1">Actual Verified</p>
              <p className="text-emerald-400 font-semibold">{props.actualQty}Q</p>
            </div>
          </div>
          {props.actualEarnings && (
            <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
              <p className="text-xs text-gray-500 uppercase mb-1">Est. Earnings</p>
              <p className="text-xl font-bold text-emerald-400">{props.actualEarnings}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Status message */}
      <p className="text-sm text-gray-400">{config.description}</p>
    </motion.div>
  )
}
