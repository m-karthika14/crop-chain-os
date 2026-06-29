'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, TrendingUp, Users, Wallet, ArrowDownRight, Download, Share2 } from 'lucide-react'

interface PayoutRow {
  id: string
  farmer_id: string
  farmer_name: string
  quantity_q: number
  share_pct: number
  net_amount: number
  payment_status: string
  paid_at: string | null
}

interface DispatchRow {
  id: string
  crop: string
  total_quantity: number
  actual_revenue: number
  expected_revenue: number
  price_per_quintal: number
  mandi_name: string
  mandi_state: string
  truck_number: string
  current_stage: number
  [key: string]: unknown
}

interface PayoutScreenProps {
  dispatchId: string
  onBack: () => void
}

export function PayoutScreen({ dispatchId, onBack }: PayoutScreenProps) {
  const [loading, setLoading] = useState(true)
  const [dispatch, setDispatch] = useState<DispatchRow | null>(null)
  const [payouts, setPayouts] = useState<PayoutRow[]>([])
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (!dispatchId) {
      setLoading(false)
      return
    }
    fetch(`/api/payouts/dispatch?dispatchId=${dispatchId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setDispatch(data.dispatch as DispatchRow)
          setPayouts(data.payouts as PayoutRow[])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [dispatchId])

  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#0A0F0A' }}>
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <div className="absolute inset-2 w-12 h-12 rounded-full bg-emerald-500/10 animate-pulse" />
        </div>
        <p className="text-emerald-400 font-semibold text-sm">Calculating payouts...</p>
      </div>
    )
  }

  const actualRevenue = dispatch ? Number(dispatch.actual_revenue) || 0 : 0
  const fpoCut = actualRevenue * 0.02
  const farmerTotal = actualRevenue * 0.98
  const avgPerFarmer = payouts.length > 0 ? farmerTotal / payouts.length : 0
  const sorted = [...payouts].sort((a, b) => Number(b.net_amount) - Number(a.net_amount))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-full p-4 md:p-8 space-y-6"
      style={{ backgroundColor: '#0A0F0A' }}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between gap-4 flex-wrap"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Sale Complete &amp; Payouts Calculated
            </h1>
            <p className="text-gray-400 text-sm">
              {dispatch
                ? `${dispatch.mandi_name}, ${dispatch.mandi_state} — ${dispatch.crop}`
                : 'Loading dispatch details...'}
            </p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center shrink-0"
          >
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          </motion.div>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase text-gray-500 font-semibold">Total Revenue</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              ₹{actualRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {dispatch?.price_per_quintal ? `At ₹${Number(dispatch.price_per_quintal).toLocaleString('en-IN')}/quintal` : 'Final sale amount'}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase text-gray-500 font-semibold">FPO Commission (2%)</span>
              <Wallet className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-amber-400">
              ₹{fpoCut.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">Operational &amp; logistics</p>
          </div>

          <div className="p-6 rounded-2xl border border-blue-500/30 bg-blue-500/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase text-gray-500 font-semibold">Farmer Distribution</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400">
              ₹{farmerTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">To {payouts.length} farmers</p>
          </div>

          <div className="p-6 rounded-2xl border border-purple-500/30 bg-purple-500/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase text-gray-500 font-semibold">Avg Per Farmer</span>
              <ArrowDownRight className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">
              ₹{avgPerFarmer.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">Based on quantities</p>
          </div>
        </motion.div>

        {/* Stacked bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <h2 className="text-lg font-bold text-white mb-6">Revenue Breakdown</h2>
          <div className="flex rounded-lg overflow-hidden h-12 mb-4">
            <div
              className="bg-emerald-500 flex items-center justify-center text-white text-xs font-bold transition-all"
              style={{ width: `${actualRevenue > 0 ? 98 : 0}%` }}
            >
              Farmers 98%
            </div>
            <div
              className="bg-amber-500 flex items-center justify-center text-white text-xs font-bold transition-all"
              style={{ width: `${actualRevenue > 0 ? 2 : 0}%` }}
            >
              FPO 2%
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Farmers ({payouts.length})</p>
              <p className="text-xl font-bold text-emerald-400">98%</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">FPO Commission</p>
              <p className="text-xl font-bold text-amber-400">2%</p>
            </div>
          </div>
        </motion.div>

        {/* Top Contributors */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <h2 className="text-lg font-bold text-white mb-6">Top Contributors</h2>
          {sorted.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No payout data yet</p>
          ) : (
            <div className="space-y-3">
              {sorted.slice(0, 5).map((payout, idx) => (
                <motion.div
                  key={payout.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-emerald-400">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{payout.farmer_name}</p>
                      <p className="text-xs text-gray-500">{payout.quantity_q}q contributed</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-emerald-400">
                      ₹{Number(payout.net_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* All Farmers expandable */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between mb-2"
          >
            <h2 className="text-lg font-bold text-white">All {payouts.length} Farmers</h2>
            <span className={`text-gray-400 text-lg transition-transform ${showDetails ? 'rotate-180' : ''}`}>
              &#8964;
            </span>
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 mt-4 max-h-80 overflow-y-auto"
              >
                {sorted.map((payout, idx) => (
                  <div
                    key={payout.id || idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.01]"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{payout.farmer_name}</p>
                      <p className="text-xs text-gray-500">{payout.quantity_q}q</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-400">
                      ₹{Number(payout.net_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 pt-2"
        >
          <button className="flex-1 px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors font-medium flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download Report
          </button>
          <button className="flex-1 px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors font-medium flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" />
            Share with Farmers
          </button>
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors font-bold flex items-center justify-center gap-2"
          >
            Back to Dispatches
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
