'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Wallet, ArrowDownRight, CheckCircle2, Download, Share2, Home } from 'lucide-react'
import Link from 'next/link'

interface PayoutScreenProps {
  saleData: {
    dispatchId: string
    totalRevenue: number
    pricePerUnit: number
    soldAt: string
    farmerPayouts: Array<{
      farmerId: string
      farmerName: string
      quantity: number
      share: number
    }>
  }
  dispatch: {
    mandi: string
    crop: string
    quantity: number
    farmerCount: number
  }
}

export function PayoutScreen({ saleData, dispatch }: PayoutScreenProps) {
  const [showDetails, setShowDetails] = useState(false)

  const fpoCut = saleData.totalRevenue * 0.02 // 2% FPO commission
  const farmerTotal = saleData.totalRevenue - fpoCut
  const avgPayout = farmerTotal / dispatch.farmerCount

  // Calculate percentile distribution
  const sorted = [...saleData.farmerPayouts].sort((a, b) => b.share - a.share)
  const top10Pct = sorted.slice(0, Math.ceil(sorted.length * 0.1))
  const top25Pct = sorted.slice(0, Math.ceil(sorted.length * 0.25))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0A0F0A] p-4 md:p-8"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Sale Complete & Payouts Calculated</h1>
            <p className="text-gray-400 text-sm">Dispatch {saleData.dispatchId} — {dispatch.crop} — {dispatch.mandi}</p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center"
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </motion.div>
        </motion.div>

        {/* Main Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {/* Total Revenue */}
          <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase text-gray-500 font-semibold">Total Revenue</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              ₹{saleData.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">At ₹{saleData.pricePerUnit.toFixed(2)}/quintal</p>
          </div>

          {/* FPO Commission */}
          <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase text-gray-500 font-semibold">FPO Commission (2%)</span>
              <Wallet className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-amber-400">
              ₹{fpoCut.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">Operational & logistics</p>
          </div>

          {/* Farmer Distribution */}
          <div className="p-6 rounded-2xl border border-blue-500/30 bg-blue-500/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase text-gray-500 font-semibold">Farmer Distribution</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-400">
              ₹{farmerTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">To {dispatch.farmerCount} farmers</p>
          </div>

          {/* Average Per Farmer */}
          <div className="p-6 rounded-2xl border border-purple-500/30 bg-purple-500/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase text-gray-500 font-semibold">Avg Per Farmer</span>
              <ArrowDownRight className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">
              ₹{avgPayout.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">Based on quantities</p>
          </div>
        </motion.div>

        {/* Breakdown */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <h2 className="text-lg font-bold text-white mb-6">Revenue Breakdown</h2>
          <div className="space-y-4">
            {/* Stacked bar visualization */}
            <div>
              <div className="flex gap-2 mb-3">
                <div className="flex-1 flex">
                  <div
                    className="bg-emerald-500 rounded-l-lg h-12 flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${(farmerTotal / saleData.totalRevenue) * 100}%` }}
                  >
                    Farmers
                  </div>
                  <div
                    className="bg-amber-500 rounded-r-lg h-12 flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${(fpoCut / saleData.totalRevenue) * 100}%` }}
                  >
                    FPO
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <p className="text-gray-400 mb-2">Farmers ({dispatch.farmerCount})</p>
                  <p className="text-xl font-bold text-emerald-400">
                    {((farmerTotal / saleData.totalRevenue) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-2">FPO Commission</p>
                  <p className="text-xl font-bold text-amber-400">
                    {((fpoCut / saleData.totalRevenue) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
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
          <div className="space-y-3">
            {sorted.slice(0, 5).map((payout, idx) => (
              <motion.div
                key={payout.farmerId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-emerald-400">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{payout.farmerName}</p>
                    <p className="text-xs text-gray-500">{payout.quantity}q contributed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400">
                    ₹{payout.share.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {((payout.quantity / dispatch.quantity) * 100).toFixed(1)}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* All Farmers */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h2 className="text-lg font-bold text-white">All {dispatch.farmerCount} Farmers</h2>
            <div className={`transition-transform ${showDetails ? 'rotate-180' : ''}`}>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 max-h-96 overflow-y-auto"
            >
              {saleData.farmerPayouts.map((payout, idx) => (
                <div
                  key={payout.farmerId}
                  className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.01]"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{payout.farmerName}</p>
                    <p className="text-xs text-gray-500">{payout.quantity}q</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-400">
                    ₹{payout.share.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 pt-4"
        >
          <button className="flex-1 px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors font-medium flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download Report
          </button>
          <button className="flex-1 px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors font-medium flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" />
            Share with Farmers
          </button>
          <Link
            href="/dashboard/dispatches"
            className="flex-1 px-6 py-3 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Dispatches
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}
