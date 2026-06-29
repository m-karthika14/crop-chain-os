'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wheat, ArrowRight, Loader, X } from 'lucide-react'

type FPOStatus = 'NO_FPO' | 'SEARCHING' | 'FOUND' | 'REQUESTED' | 'APPROVED'

interface FPODetails {
  name: string
  state: string
  established?: number
  farmers: number
  manager: string
  crops: string[]
  code: string
}

interface FPOListItem {
  id: string
  organization_name: string
  fpo_code: string
  state: string
  member_count: number
  manager_name: string
}

interface FPOOnboardingProps {
  onComplete?: () => void
}

export function FPOOnboarding(_props: FPOOnboardingProps) {
  const [status, setStatus] = useState<FPOStatus>('NO_FPO')
  const [fpoCode, setFpoCode] = useState('')
  const [fpoDetails, setFpoDetails] = useState<FPODetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [fpoList, setFpoList] = useState<FPOListItem[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedFpo, setSelectedFpo] = useState<FPOListItem | null>(null)

  useEffect(() => {
    fetch('/api/fpos')
      .then(r => r.json())
      .then(data => { if (data.success) setFpoList(data.fpos) })
      .catch(() => {})
  }, [])

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFpoCode(e.target.value.toUpperCase())
    setSelectedFpo(null)
  }

  const handleSelectFpo = (fpo: FPOListItem) => {
    setSelectedFpo(fpo)
    setFpoCode(fpo.fpo_code)
    setDropdownOpen(false)
  }

  const handleJoinFPO = async () => {
    if (!fpoCode.trim()) return

    setLoading(true)

    const farmerId = localStorage.getItem('userId') || ''

    try {
      const res = await fetch('/api/farmers/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId, fpoCode }),
      })
      const data = await res.json()

      if (data.success) {
        setFpoDetails(data.fpoDetails)
        setStatus('FOUND')
      } else {
        setFpoCode('')
        alert(data.error || 'FPO code not found. Please check and try again.')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestApproval = () => {
    // Join request was already created in handleJoinFPO — just update UI state
    setStatus('REQUESTED')
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
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Wheat className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                Crop<span className="text-emerald-400">Chain</span>
                <span className="text-emerald-500/70 text-sm ml-1 font-normal">OS</span>
              </span>
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

            {/* Dropdown */}
            {fpoList.length > 0 && (
              <div className="mb-3 relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(o => !o)}
                  className="w-full px-4 py-3 bg-white/5 border border-emerald-500/20 rounded-lg text-left flex items-center justify-between transition-all hover:border-emerald-500/40 focus:outline-none focus:border-emerald-500/50"
                >
                  <span className={selectedFpo ? 'text-white font-medium' : 'text-gray-500 text-sm'}>
                    {selectedFpo ? selectedFpo.organization_name : 'Select an FPO from the list'}
                  </span>
                  <motion.span
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-emerald-400 text-xs"
                  >
                    ▼
                  </motion.span>
                </button>

                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute z-50 w-full mt-1 bg-[#111] border border-emerald-500/20 rounded-lg overflow-hidden shadow-xl"
                  >
                    {fpoList.map(fpo => (
                      <button
                        key={fpo.id}
                        type="button"
                        onClick={() => handleSelectFpo(fpo)}
                        className="w-full px-4 py-3 text-left hover:bg-emerald-500/10 transition-colors border-b border-white/5 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm font-semibold">{fpo.organization_name}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{fpo.state} · {fpo.member_count} farmers · {fpo.manager_name}</p>
                          </div>
                          <span className="text-emerald-400 font-mono text-xs ml-3 flex-shrink-0">{fpo.fpo_code}</span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            )}

            {/* Manual Input */}
            <div className="mb-6">
              <input
                type="text"
                value={fpoCode}
                onChange={handleCodeChange}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinFPO()}
                placeholder="e.g. GRE-2025-KA-342"
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
            Don&apos;t have an FPO code? Contact your local Farmer Producer Organization
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
                  {fpoDetails.state}{fpoDetails.established ? ` • Est. ${fpoDetails.established}` : ''}
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
              {fpoDetails.crops.length > 0 && (
                <div className="flex justify-between items-start">
                  <span className="text-gray-400 text-sm">Crops</span>
                  <span className="text-white font-semibold text-right text-sm">
                    {fpoDetails.crops.join(', ')}
                  </span>
                </div>
              )}
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
            You&apos;re in!
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
