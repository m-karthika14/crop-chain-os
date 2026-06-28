'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Camera, Loader2, CheckCircle2, AlertCircle, Copy } from 'lucide-react'

interface GodownVerificationProps {
  onVerificationComplete?: () => void
}

export function GodownVerification({ onVerificationComplete }: GodownVerificationProps) {
  const [tokenInput, setTokenInput] = useState('')
  const [foundRequest, setFoundRequest] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [actualQty, setActualQty] = useState('')
  const [qualityChecks, setQualityChecks] = useState({
    moisture: false,
    foreign: false,
    size: false,
    color: false,
  })
  const [verifiedGrade, setVerifiedGrade] = useState<'A' | 'B' | 'C'>('A')
  const [notes, setNotes] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [verified, setVerified] = useState(false)

  // Mock search token
  const handleSearchToken = async () => {
    if (!tokenInput) return
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock finding a request
    setFoundRequest({
      token: tokenInput,
      farmer: 'Ramesh Kumar',
      village: 'Sonepat, Haryana',
      memberSince: 'Jan 2024',
      phone: '+91 987** 3210',
      crop: 'Wheat',
      variety: 'HD-2967',
      estimatedQty: 8,
      submittedGrade: 'A',
      submittedAt: '8:12 AM',
    })
    setLoading(false)
  }

  const handleVerify = async () => {
    if (!actualQty) return
    setConfirming(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setVerified(true)
    setConfirming(false)
  }

  if (verified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center space-y-4 py-8"
        >
          <div className="text-6xl">✅</div>
          <h2 className="text-3xl font-bold text-white">Verified!</h2>
          <p className="text-gray-400">Crop recorded in FPO ledger</p>
        </motion.div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Farmer:</span>
            <span className="text-white font-medium">{foundRequest.farmer}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Crop:</span>
            <span className="text-white font-medium">{foundRequest.crop} ({foundRequest.variety})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Est. Qty:</span>
            <span className="text-gray-500">{foundRequest.estimatedQty}Q</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-emerald-500/20">
            <span className="text-gray-400">Actual Verified:</span>
            <span className="text-emerald-400 font-bold text-lg">{actualQty}Q</span>
          </div>
        </div>

        <button
          onClick={() => {
            setTokenInput('')
            setFoundRequest(null)
            setActualQty('')
            setVerified(false)
            onVerificationComplete?.()
          }}
          className="w-full py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
        >
          Next Farmer
        </button>
      </motion.div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Token Lookup */}
      {!foundRequest && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-bold text-white">🏚️ Godown Verification</h2>
          <p className="text-gray-400">Verify physical crop delivery</p>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter or Scan Token Number"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-3 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearchToken()}
            />
            <button
              onClick={handleSearchToken}
              disabled={!tokenInput || loading}
              className="px-6 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {!loading && 'Find'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Farmer Details */}
      <AnimatePresence>
        {foundRequest && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white/[0.03] border border-emerald-500/20 rounded-lg p-6 space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-emerald-400 font-mono font-semibold">{foundRequest.token}</p>
                <p className="text-xs text-emerald-400">✅ Valid Token</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500 uppercase text-xs mb-1">Farmer</p>
                <p className="text-white font-medium">{foundRequest.farmer}</p>
                <p className="text-xs text-gray-600">{foundRequest.village}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div>
                  <p className="text-gray-500 uppercase text-xs mb-1">Member Since</p>
                  <p className="text-white text-sm">{foundRequest.memberSince}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase text-xs mb-1">Phone</p>
                  <p className="text-white text-sm">{foundRequest.phone}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 space-y-2">
              <p className="text-xs text-amber-200 uppercase font-semibold mb-2">Submitted Request</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Crop:</span>
                  <span className="text-white font-medium">{foundRequest.crop} ({foundRequest.variety})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Quantity:</span>
                  <span className="text-white font-medium">{foundRequest.estimatedQty}Q</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Grade:</span>
                  <span className="text-white font-medium">{foundRequest.submittedGrade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Submitted:</span>
                  <span className="text-white font-medium">{foundRequest.submittedAt}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification Form */}
      <AnimatePresence>
        {foundRequest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white/[0.03] border border-white/10 rounded-lg p-6 space-y-6"
          >
            <h3 className="font-bold text-white">Now enter the ACTUAL verified quantities:</h3>

            {/* Actual Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Actual Weight</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  step="0.1"
                  value={actualQty}
                  onChange={(e) => setActualQty(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                  placeholder="7.8"
                />
                <span className="text-gray-400 text-sm font-medium">Quintals</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Weighing scale reading</p>
            </div>

            {/* Quality Checks */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Quality Verification</label>
              <div className="space-y-2">
                {Object.entries(qualityChecks).map(([check, value]) => (
                  <label key={check} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setQualityChecks({ ...qualityChecks, [check]: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-300 capitalize">
                      {check === 'moisture' && 'Moisture within range'}
                      {check === 'foreign' && 'No foreign material'}
                      {check === 'size' && 'Grain size consistent'}
                      {check === 'color' && 'Colour acceptable'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grade Verification */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Verified Grade</label>
              <div className="flex gap-3">
                {(['A', 'B', 'C'] as const).map(grade => (
                  <button
                    key={grade}
                    onClick={() => setVerifiedGrade(grade)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      verifiedGrade === grade
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {grade} · {grade === 'A' ? 'Premium' : grade === 'B' ? 'Standard' : 'Basic'}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Condition Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Some moisture at edges — acceptable..."
                className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 resize-none"
                rows={3}
              />
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={!actualQty || confirming}
              className="w-full py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {confirming ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Confirm Godown Receipt
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
