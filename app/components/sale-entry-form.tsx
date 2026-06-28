'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Check, AlertCircle, X, Package, Users, TrendingUp, Clock } from 'lucide-react'

interface SaleEntryFormProps {
  dispatch: {
    id: string
    mandi: string
    crop: string
    quantity: number
    expectedRevenue: number
    farmerCount: number
    actualQuantity: number
  }
  onSuccess: (saleData: SaleData) => void
  onCancel: () => void
}

export interface SaleData {
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

export function SaleEntryForm({ dispatch, onSuccess, onCancel }: SaleEntryFormProps) {
  const [step, setStep] = useState<'entry' | 'review' | 'calculating' | 'success'>('entry')
  const [totalRevenue, setTotalRevenue] = useState('')
  const [soldAt, setSoldAt] = useState(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
  const [notes, setNotes] = useState('')
  const [payouts, setPayouts] = useState<SaleData['farmerPayouts']>([])

  const pricePerUnit = totalRevenue ? parseFloat(totalRevenue) / dispatch.actualQuantity : 0
  const variantPrice = ((pricePerUnit - (dispatch.expectedRevenue / dispatch.quantity)) / (dispatch.expectedRevenue / dispatch.quantity)) * 100

  // Generate mock farmer payouts
  const generatePayouts = () => {
    const mockFarmers = [
      { id: 'F001', name: 'Ramesh Kumar', quantity: 12.5 },
      { id: 'F002', name: 'Priya Singh', quantity: 8.3 },
      { id: 'F003', name: 'Ajay Patel', quantity: 15.0 },
      { id: 'F004', name: 'Lakshmi Devi', quantity: 10.2 },
      { id: 'F005', name: 'Vikram Reddy', quantity: 18.7 },
      { id: 'F006', name: 'Sunita Gupta', quantity: 9.5 },
      { id: 'F007', name: 'Mohan Singh', quantity: 11.8 },
      { id: 'F008', name: 'Ananya Sharma', quantity: 14.3 },
    ]

    const totalRev = parseFloat(totalRevenue)
    return mockFarmers.map(farmer => ({
      farmerId: farmer.id,
      farmerName: farmer.name,
      quantity: farmer.quantity,
      share: (farmer.quantity / dispatch.actualQuantity) * totalRev,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!totalRevenue) return

    const generatedPayouts = generatePayouts()
    setPayouts(generatedPayouts)
    setStep('review')
  }

  const handleConfirm = () => {
    setStep('calculating')
    setTimeout(() => {
      setStep('success')
      setTimeout(() => {
        onSuccess({
          dispatchId: dispatch.id,
          totalRevenue: parseFloat(totalRevenue),
          pricePerUnit,
          soldAt,
          farmerPayouts: payouts,
        })
      }, 2000)
    }, 2000)
  }

  if (step === 'entry') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-2xl rounded-2xl border border-emerald-500/30 bg-[#0A0F0A] p-8 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-white">Mark as Sold</h2>
              <button
                onClick={onCancel}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-400">Enter the final sale amount and details</p>
          </div>

          {/* Dispatch Summary */}
          <div className="grid grid-cols-4 gap-4 mb-8 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <div>
              <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Crop</p>
              <p className="text-base font-bold text-white">{dispatch.crop}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Quantity</p>
              <p className="text-base font-bold text-white">{dispatch.actualQuantity}q</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Mandi</p>
              <p className="text-base font-bold text-white">{dispatch.mandi}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-500 font-semibold mb-1">Farmers</p>
              <p className="text-base font-bold text-white">{dispatch.farmerCount}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Total Revenue */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Total Sale Amount (₹)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <DollarSign className="w-5 h-5" />
                </div>
                <input
                  type="number"
                  value={totalRevenue}
                  onChange={e => setTotalRevenue(e.target.value)}
                  placeholder="18,72,550"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Expected: ₹{dispatch.expectedRevenue.toLocaleString()}
                {totalRevenue && (
                  <span className={variantPrice > 0 ? 'text-emerald-400' : variantPrice < 0 ? 'text-red-400' : ''}>
                    {' '}(Variance: {variantPrice > 0 ? '+' : ''}{variantPrice.toFixed(1)}%)
                  </span>
                )}
              </p>
            </div>

            {/* Price Per Unit - Auto-calculated */}
            {totalRevenue && (
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Price Per Quintal (Auto-calculated)
                </label>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-lg font-bold text-emerald-400">
                    ₹{pricePerUnit.toFixed(2)} per quintal
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Vs expected: ₹{(dispatch.expectedRevenue / dispatch.quantity).toFixed(2)}/q
                  </p>
                </div>
              </div>
            )}

            {/* Sold At Time */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Sold At (Time)</label>
              <input
                type="time"
                value={soldAt}
                onChange={e => setSoldAt(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/10 text-white focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add any notes about the sale..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder-gray-600 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Info box */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-300">
                System will calculate and distribute {dispatch.farmerCount} farmer payouts based on godown-verified quantities
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!totalRevenue}
                className="flex-1 px-4 py-3 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Review & Calculate
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )
  }

  if (step === 'review') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-2xl rounded-2xl border border-emerald-500/30 bg-[#0A0F0A] p-8 shadow-2xl max-h-[80vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-white mb-2">Review Payouts</h2>
          <p className="text-sm text-gray-400 mb-8">Calculate and review farmer payouts before confirming</p>

          {/* Summary */}
          <div className="grid grid-cols-4 gap-4 mb-8 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
            <div>
              <p className="text-xs uppercase text-gray-400 font-semibold">Total Revenue</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">₹{parseFloat(totalRevenue).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400 font-semibold">Per Quintal</p>
              <p className="text-xl font-bold text-white mt-1">₹{pricePerUnit.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400 font-semibold">Total Farmers</p>
              <p className="text-xl font-bold text-white mt-1">{dispatch.farmerCount}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400 font-semibold">Avg Per Farmer</p>
              <p className="text-xl font-bold text-white mt-1">₹{(parseFloat(totalRevenue) / dispatch.farmerCount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>

          {/* Farmer Payouts Table */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-white mb-4">Farmer Payout Distribution</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {payouts.slice(0, 8).map((payout, idx) => (
                <motion.div
                  key={payout.farmerId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/10"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{payout.farmerName}</p>
                    <p className="text-xs text-gray-500">{payout.quantity}q</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-400">₹{payout.share.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </motion.div>
              ))}
            </div>
            {payouts.length > 8 && (
              <p className="text-xs text-gray-500 mt-3 text-center">
                +{payouts.length - 8} more farmers...
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep('entry')}
              className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors font-medium"
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-3 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Confirm & Complete
            </button>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  if (step === 'calculating') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 mx-auto mb-6"
          />
          <h3 className="text-xl font-bold text-white mb-2">Calculating Payouts</h3>
          <p className="text-gray-400 text-sm">Processing {dispatch.farmerCount} farmer distributions...</p>
        </motion.div>
      </motion.div>
    )
  }

  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2 }}
            >
              <Check className="w-10 h-10 text-emerald-400" />
            </motion.div>
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">Sale Recorded Successfully!</h3>
          <p className="text-gray-400 text-sm mb-4">
            ₹{parseFloat(totalRevenue).toLocaleString()} distributed to {dispatch.farmerCount} farmers
          </p>
          <motion.div
            animate={{ opacity: [0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-xs text-emerald-400"
          >
            Redirecting to payouts...
          </motion.div>
        </motion.div>
      </motion.div>
    )
  }

  return null
}
