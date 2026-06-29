'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Check, AlertCircle, X, TrendingUp, Loader2 } from 'lucide-react'

interface DispatchInfo {
  id:              string
  mandi:           string
  crop:            string
  quantity:        number
  expectedRevenue: number
  farmerCount:     number
  actualQuantity:  number
}

interface SaleEntryFormProps {
  dispatch: DispatchInfo
  onSuccess: (saleData: SaleData) => void
  onCancel:  () => void
}

export interface SaleData {
  dispatchId:    string
  totalRevenue:  number
  pricePerUnit:  number
  soldAt:        string
  farmerPayouts: Array<{
    farmerId:    string
    farmerName:  string
    quantity:    number
    share:       number
  }>
}

interface FarmerRow {
  farmer_id:   string
  farmer_name: string
  quantity_q:  number
  share_pct:   number
}

function nowTime() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function SaleEntryForm({ dispatch, onSuccess, onCancel }: SaleEntryFormProps) {
  const [step,         setStep]         = useState<'entry' | 'review' | 'calculating' | 'success'>('entry')
  const [totalRevenue, setTotalRevenue] = useState('')
  const [soldAt,       setSoldAt]       = useState(nowTime)
  const [notes,        setNotes]        = useState('')
  const [farmers,      setFarmers]      = useState<FarmerRow[]>([])
  const [farmersLoading, setFarmersLoading] = useState(false)
  const [payouts,      setPayouts]      = useState<SaleData['farmerPayouts']>([])

  // Fetch real farmers when dispatch id is available
  useEffect(() => {
    if (!dispatch.id) return
    setFarmersLoading(true)
    fetch(`/api/dispatches/${dispatch.id}/farmers`)
      .then(r => r.json())
      .then(data => { if (data.success) setFarmers(data.farmers as FarmerRow[]) })
      .catch(() => {})
      .finally(() => setFarmersLoading(false))
  }, [dispatch.id])

  const rev         = parseFloat(totalRevenue) || 0
  const pricePerUnit = dispatch.actualQuantity > 0 ? rev / dispatch.actualQuantity : 0
  const expectedPPQ  = dispatch.quantity > 0 ? dispatch.expectedRevenue / dispatch.quantity : 0
  const variance     = expectedPPQ > 0 ? ((pricePerUnit - expectedPPQ) / expectedPPQ) * 100 : 0

  const buildPayouts = () =>
    farmers.map(f => ({
      farmerId:   f.farmer_id,
      farmerName: f.farmer_name,
      quantity:   f.quantity_q,
      share:      (f.quantity_q / (dispatch.actualQuantity || 1)) * rev,
    }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!totalRevenue) return
    setPayouts(buildPayouts())
    setStep('review')
  }

  const handleConfirm = () => {
    setStep('calculating')
    setTimeout(() => {
      setStep('success')
      setTimeout(() => {
        onSuccess({
          dispatchId:   dispatch.id,
          totalRevenue: rev,
          pricePerUnit,
          soldAt,
          farmerPayouts: payouts,
        })
      }, 1800)
    }, 1800)
  }

  if (step === 'entry') {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.93, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="w-full max-w-md rounded-xl border border-emerald-500/25 bg-[#0A0F0A] p-5 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Mark as Sold</h2>
              <p className="text-xs text-gray-500 mt-0.5">Enter the final sale amount</p>
            </div>
            <button onClick={onCancel} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Dispatch summary strip */}
          <div className="grid grid-cols-4 gap-2 mb-4 p-3 rounded-lg border border-white/10 bg-white/[0.02] text-xs">
            <div>
              <p className="text-gray-500 uppercase font-semibold mb-0.5">Crop</p>
              <p className="font-bold text-white">{dispatch.crop}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase font-semibold mb-0.5">Qty</p>
              <p className="font-bold text-white">{dispatch.actualQuantity}q</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase font-semibold mb-0.5">Mandi</p>
              <p className="font-bold text-white truncate">{dispatch.mandi}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase font-semibold mb-0.5">Farmers</p>
              <p className="font-bold text-white">
                {farmersLoading
                  ? <Loader2 className="w-3 h-3 animate-spin inline" />
                  : farmers.length || dispatch.farmerCount}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Revenue input */}
            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">Total Sale Amount (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="number"
                  value={totalRevenue}
                  onChange={e => setTotalRevenue(e.target.value)}
                  placeholder="e.g. 52000"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white text-sm placeholder-gray-600 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] text-gray-600">Expected: ₹{dispatch.expectedRevenue.toLocaleString('en-IN')}</p>
                {totalRevenue && (
                  <p className={`text-[11px] font-semibold ${variance > 0 ? 'text-emerald-400' : variance < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                    {variance > 0 ? '+' : ''}{variance.toFixed(1)}% vs expected
                  </p>
                )}
              </div>
              {totalRevenue && pricePerUnit > 0 && (
                <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <p className="text-xs text-emerald-400 font-semibold">₹{pricePerUnit.toFixed(0)}/q</p>
                  <p className="text-[11px] text-gray-500">vs expected ₹{expectedPPQ.toFixed(0)}/q</p>
                </div>
              )}
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">Sold At (Time)</label>
              <input
                type="time"
                value={soldAt}
                onChange={e => setSoldAt(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add any notes about the sale..."
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white text-sm placeholder-gray-600 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/8 border border-blue-500/25">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-300">
                {farmersLoading
                  ? 'Loading farmer data…'
                  : `Payouts will be distributed to ${farmers.length || dispatch.farmerCount} farmers based on their godown-verified quantities`}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onCancel}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors text-sm font-medium">
                Cancel
              </button>
              <button type="submit" disabled={!totalRevenue}
                className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-bold flex items-center justify-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Review & Calculate
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )
  }

  if (step === 'review') {
    const farmerCount = payouts.length
    const avgPerFarmer = farmerCount > 0 ? rev / farmerCount : 0
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg rounded-xl border border-emerald-500/25 bg-[#0A0F0A] p-5 shadow-2xl max-h-[85vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-lg font-bold text-white mb-0.5">Review Payouts</h2>
          <p className="text-xs text-gray-500 mb-4">Confirm farmer payouts before recording the sale</p>

          {/* Summary bar */}
          <div className="grid grid-cols-4 gap-2 mb-4 p-3 rounded-lg border border-emerald-500/25 bg-emerald-500/8 text-xs">
            <div>
              <p className="text-gray-400 uppercase font-semibold mb-0.5">Revenue</p>
              <p className="text-base font-bold text-emerald-400">₹{rev.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase font-semibold mb-0.5">Per Quintal</p>
              <p className="text-base font-bold text-white">₹{pricePerUnit.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase font-semibold mb-0.5">Farmers</p>
              <p className="text-base font-bold text-white">{farmerCount}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase font-semibold mb-0.5">Avg / Farmer</p>
              <p className="text-base font-bold text-white">
                {farmerCount > 0 ? `₹${Math.round(avgPerFarmer).toLocaleString('en-IN')}` : '—'}
              </p>
            </div>
          </div>

          {/* Farmer list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <p className="text-xs font-semibold text-white mb-2">Farmer Payout Distribution</p>
            {payouts.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-3xl mb-2">🌾</p>
                <p className="text-sm text-gray-500">No farmers found for this dispatch</p>
                <p className="text-xs text-gray-600 mt-1">Harvest records with GODOWN_RECEIVED status are needed</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {payouts.map((p, i) => (
                  <motion.div
                    key={p.farmerId}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.07]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">{p.farmerName}</p>
                        <p className="text-[11px] text-gray-500">{p.quantity.toFixed(1)}q · {((p.quantity / dispatch.actualQuantity) * 100).toFixed(1)}% share</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-emerald-400">₹{Math.round(p.share).toLocaleString('en-IN')}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-white/[0.06]">
            <button onClick={() => setStep('entry')}
              className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors text-sm font-medium">
              Back
            </button>
            <button onClick={handleConfirm}
              className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors text-sm font-bold flex items-center justify-center gap-1.5">
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
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-bold text-white mb-1">Calculating Payouts</h3>
          <p className="text-sm text-gray-400">Processing {payouts.length} farmer distributions…</p>
        </div>
      </motion.div>
    )
  }

  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Sale Recorded!</h3>
          <p className="text-sm text-gray-400">
            ₹{rev.toLocaleString('en-IN', { maximumFractionDigits: 0 })} distributed to {payouts.length} farmers
          </p>
        </motion.div>
      </motion.div>
    )
  }

  return null
}
