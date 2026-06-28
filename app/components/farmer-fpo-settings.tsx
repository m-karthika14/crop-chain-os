'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Leaf, AlertCircle, LogOut } from 'lucide-react'

interface FPOStatus {
  fpoName: string
  fpoCode: string
  manager: string
  memberSince: string
  status: 'ACTIVE' | 'PENDING'
}

interface PendingItem {
  type: 'crop' | 'payment'
  description: string
  amount?: string
}

export function FarmerFPOSettings() {
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  // Mock FPO data
  const fpoStatus: FPOStatus = {
    fpoName: 'GreenHarvest FPO',
    fpoCode: 'GH-2025-KA',
    manager: 'Gopal Hegde',
    memberSince: 'Jan 2024',
    status: 'ACTIVE'
  }

  // Mock pending items
  const pendingItems: PendingItem[] = [
    { type: 'crop', description: 'Rice 420Q — awaiting sale' },
    { type: 'payment', description: 'Payment ₹16,500 — pending', amount: '₹16,500' }
  ]

  const hasPendingItems = pendingItems.length > 0

  const handleLeaveClick = () => {
    if (hasPendingItems) {
      setShowWarningModal(true)
    } else {
      setShowLeaveModal(true)
    }
  }

  const handleConfirmLeave = async () => {
    setIsLeaving(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLeaving(false)
    setShowLeaveModal(false)
    // TODO: Trigger re-render to show onboarding screen
  }

  return (
    <div className="space-y-6">
      {/* My FPO Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-8"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-emerald-400">{fpoStatus.fpoName}</h3>
            <p className="text-gray-500 text-sm mt-1">FPO Code: {fpoStatus.fpoCode}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-emerald-500/10">
          <div>
            <p className="text-gray-400 text-sm mb-2">Manager</p>
            <p className="text-white font-semibold">{fpoStatus.manager}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2">Member Since</p>
            <p className="text-white font-semibold">{fpoStatus.memberSince}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-400 text-sm mb-2">Status</p>
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-emerald-400"
              />
              <span className="text-emerald-400 font-semibold">✅ ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Leave Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLeaveClick}
          className="text-red-400 hover:text-red-300 font-semibold text-sm transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Request to Leave FPO
        </motion.button>
      </motion.div>

      {/* Warning Modal - Pending Items */}
      {showWarningModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0A0A0A] border border-red-500/30 rounded-2xl max-w-md w-full p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Cannot Leave Yet</h3>
            </div>

            <p className="text-gray-300 mb-6">
              You have pending items:
            </p>

            <ul className="space-y-3 mb-8 pb-8 border-b border-red-500/10">
              {pendingItems.map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <span className="text-red-400">•</span>
                  <span>{item.description}</span>
                </motion.li>
              ))}
            </ul>

            <p className="text-sm text-gray-400 mb-8">
              Please wait for all crops to be sold and payments to be received before leaving.
            </p>

            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              OK, Got it
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Confirmation Modal - Leave FPO */}
      {showLeaveModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0A0A0A] border border-emerald-500/20 rounded-2xl max-w-md w-full p-8"
          >
            <h3 className="text-xl font-bold text-white mb-6">
              Are you sure you want to leave {fpoStatus.fpoName}?
            </h3>

            <div className="bg-white/5 rounded-lg p-6 mb-8 space-y-3">
              <p className="text-gray-300 text-sm">
                ✓ Your earnings history will be saved to your profile forever
              </p>
              <p className="text-gray-300 text-sm">
                ✓ You can join another FPO anytime
              </p>
              <p className="text-gray-300 text-sm">
                ✓ Your portable history will be preserved
              </p>
            </div>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirmLeave}
                disabled={isLeaving}
                className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-lg transition-all"
              >
                {isLeaving ? 'Processing...' : 'Yes, Leave FPO'}
              </motion.button>
              <button
                onClick={() => setShowLeaveModal(false)}
                disabled={isLeaving}
                className="w-full py-3 border border-gray-600 hover:border-gray-500 text-gray-300 font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
