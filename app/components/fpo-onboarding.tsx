'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, ArrowRight, Loader, X } from 'lucide-react'

const FPO_DATABASE = {
  'GH-2025-KA': {
    name: 'GreenHarvest FPO',
    state: 'Karnataka',
    established: 2021,
    farmers: 825,
    manager: 'Gopal Hegde',
    crops: ['Wheat', 'Rice', 'Tomato'],
    code: 'GH-2025-KA'
  },
  'PR-2025-MH': {
    name: 'PuneRich FPO',
    state: 'Maharashtra',
    established: 2022,
    farmers: 412,
    manager: 'Anita Sharma',
    crops: ['Onion', 'Tomato'],
    code: 'PR-2025-MH'
  }
}

type FPOStatus = 'NO_FPO' | 'SEARCHING' | 'FOUND' | 'REQUESTED' | 'APPROVED'

export function FPOOnboarding() {
  const [status, setStatus] = useState<FPOStatus>('NO_FPO')
  const [fpoCode, setFpoCode] = useState('')
  const [fpoDetails, setFpoDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFpoCode(e.target.value.toUpperCase())
  }

  const handleJoinFPO = async () => {
    if (!fpoCode.trim()) return

    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200))

    const fpo = FPO_DATABASE[fpoCode as keyof typeof FPO_DATABASE]
    if (fpo) {
      setFpoDetails(fpo)
      setStatus('FOUND')
    } else {
      setFpoCode('')
      setStatus('NO_FPO')
      alert('FPO code not found. Please check and try again.')
    }
    setLoading(false)
  }

  const handleRequestApproval = async () => {
    setStatus('REQUESTED')
    // Mock approval after 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000))
    setStatus('APPROVED')
  }

  const handleReset = () => {
    setStatus('NO_FPO')
    setFpoCode('')
    setFpoDetails(null)
  }

  // Main onboarding screen
  if (status === 'NO_FPO') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-8"
      >
        <div className="w-full max-w-md">
          {/* Logo & Welcome */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-white">CropChain OS OS</span>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Welcome, Ramesh Kumar
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 text-sm"
            >
              Village Sonepat, Haryana
            </motion.p>
          </div>

          {/* FPO Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-8 mb-8 backdrop-blur-sm"
          >
            <p className="text-gray-300 text-center mb-2">
              <span className="text-lg">🌾</span>
            </p>
            <h2 className="text-xl font-semibold text-white text-center mb-3">
              You are not part of any FPO yet
            </h2>
            <p className="text-gray-400 text-center text-sm mb-8">
              Enter your FPO Code to join your local Farmer Producer Organisation
            </p>

            {/* Input */}
            <div className="mb-6">
              <input
                type="text"
                value={fpoCode}
                onChange={handleCodeChange}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinFPO()}
                placeholder="Enter FPO Code e.g. GH-2025-KA"
                className="w-full px-4 py-3 bg-white/5 border border-emerald-500/20 rounded-lg text-white placeholder-gray-500 font-mono text-center focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoinFPO}
              disabled={!fpoCode.trim() || loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold rounded-lg flex items-center justify-center gap-2 transition-all group"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  Join FPO
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.div>

          <p className="text-center text-xs text-gray-500">
            Don't have an FPO code? Contact your local Farmer Producer Organization
          </p>
        </div>
      </motion.div>
    )
  }

  // FPO Preview Screen
  if (status === 'FOUND' && fpoDetails) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-8"
      >
        <div className="w-full max-w-md">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleReset}
            className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            <X className="w-4 h-4" />
            Back
          </motion.button>

          {/* FPO Preview Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-2 border-emerald-500/30 rounded-2xl p-8 mb-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-2xl mb-2">🌾</p>
                <h3 className="text-2xl font-bold text-emerald-400">{fpoDetails.name}</h3>
                <p className="text-gray-400 text-sm">
                  {fpoDetails.state} • Est. {fpoDetails.established}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-8 pb-8 border-b border-emerald-500/10">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Active Farmers</span>
                <span className="text-white font-semibold">{fpoDetails.farmers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Manager</span>
                <span className="text-white font-semibold">{fpoDetails.manager}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-400 text-sm">Crops</span>
                <span className="text-white font-semibold text-right text-sm">
                  {fpoDetails.crops.join(', ')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleRequestApproval}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <span>✅</span>
                Request to Join
              </button>
              <button
                onClick={handleReset}
                className="w-full py-3 border border-gray-600 hover:border-gray-500 text-gray-300 font-semibold rounded-lg transition-all"
              >
                <span>✗</span> Cancel
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  // Requested Screen
  if (status === 'REQUESTED') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-8"
      >
        <div className="w-full max-w-md text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="text-6xl mb-6"
          >
            ⏳
          </motion.div>

          <h2 className="text-3xl font-bold text-white mb-3">Request Pending</h2>
          <p className="text-gray-400 mb-8">
            Waiting for {fpoDetails?.manager} to approve your request...
          </p>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-6 py-4 mb-8">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Status</span>
              <motion.span
                animate={{ opacity: [0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-amber-400 font-semibold"
              >
                ⏸ PENDING
              </motion.span>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Usually approved within 24 hours
          </p>
        </div>
      </motion.div>
    )
  }

  // Approved Screen
  if (status === 'APPROVED') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-8"
      >
        <div className="w-full max-w-md text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
            className="text-6xl mb-6"
          >
            🎉
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-3"
          >
            You're in!
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 mb-8"
          >
            {fpoDetails?.manager} approved your request.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-6 py-4 mb-8"
          >
            <p className="text-gray-400 text-sm mb-2">You are now a member of</p>
            <h3 className="text-2xl font-bold text-emerald-400">{fpoDetails?.name}</h3>
            <p className="text-gray-500 text-xs mt-3">FPO Code: {fpoDetails?.code}</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-all">
              🌾 Submit My First Crop
            </button>
            <button className="w-full py-3 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 font-semibold rounded-lg transition-all">
              📊 View FPO Details
            </button>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return null
}
