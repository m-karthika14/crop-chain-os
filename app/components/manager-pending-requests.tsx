'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Loader2, Eye, MessageSquare } from 'lucide-react'

interface PendingRequest {
  id: string
  farmer: string
  village: string
  cropType: string
  variety: string
  grade: string
  estimatedQty: number
  photoUrl?: string
  submittedAt: string
  timeAgo: string
}

interface ManagerPendingRequestsProps {
  requests?: PendingRequest[]
}

const defaultRequests: PendingRequest[] = [
  {
    id: '1',
    farmer: 'Ramesh Kumar',
    village: 'Sonepat',
    cropType: 'Wheat',
    variety: 'HD-2967',
    grade: 'A',
    estimatedQty: 8,
    submittedAt: '2025-01-15 08:12',
    timeAgo: '2 mins ago',
  },
  {
    id: '2',
    farmer: 'Priya Devi',
    village: 'Panipat',
    cropType: 'Rice',
    variety: 'Basmati',
    grade: 'A',
    estimatedQty: 12,
    submittedAt: '2025-01-15 08:05',
    timeAgo: '9 mins ago',
  },
  {
    id: '3',
    farmer: 'Suresh Patel',
    village: 'Karnal',
    cropType: 'Corn',
    variety: 'Hybrid',
    grade: 'B',
    estimatedQty: 6.5,
    submittedAt: '2025-01-15 07:58',
    timeAgo: '16 mins ago',
  },
]

export function ManagerPendingRequests({ requests = defaultRequests }: ManagerPendingRequestsProps) {
  const [items, setItems] = useState(requests)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [selectedReason, setSelectedReason] = useState('')
  const [managerNote, setManagerNote] = useState<{ [key: string]: string }>({})

  const handleApprove = async (id: string) => {
    setLoadingId(id)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const request = items.find(r => r.id === id)
    if (request) {
      // Mock token generation
      const token = `GH-2025-${Math.floor(1000 + Math.random() * 9000)}`
      console.log(`Approved token: ${token}`)
    }
    
    setItems(items.filter(r => r.id !== id))
    setLoadingId(null)
  }

  const handleReject = async (id: string) => {
    if (!selectedReason) return
    setRejectingId(id)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setItems(items.filter(r => r.id !== id))
    setRejectingId(null)
    setSelectedReason('')
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-8 text-center"
      >
        <p className="text-emerald-400 font-medium">✅ No pending requests</p>
        <p className="text-sm text-gray-500">All crop submissions have been reviewed.</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">📱 Pending Requests</h3>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30"
        >
          <span className="text-sm font-medium text-amber-400">{items.length}</span>
        </motion.div>
      </div>

      <AnimatePresence>
        {items.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-lg border border-white/10 bg-white/[0.03] p-6 space-y-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white font-bold">{request.farmer}</p>
                <p className="text-sm text-gray-400">{request.village} · {request.timeAgo}</p>
              </div>
              <div className="text-right space-y-1">
                <div className="text-sm font-semibold text-emerald-400">
                  🌾 {request.cropType}
                </div>
                <div className="text-xs text-gray-500">
                  {request.variety} · Grade {request.grade} · {request.estimatedQty}Q
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white/[0.02] rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Crop</p>
                  <p className="text-white font-medium">{request.cropType}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Variety</p>
                  <p className="text-white font-medium">{request.variety}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Grade</p>
                  <p className="text-white font-medium">{request.grade}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Est. Qty</p>
                  <p className="text-white font-medium">{request.estimatedQty}Q</p>
                </div>
              </div>
            </div>

            {/* Manager Note */}
            <div>
              <label className="text-xs text-gray-400 uppercase mb-2 block">Manager Note (optional)</label>
              <textarea
                placeholder="Type note to farmer..."
                value={managerNote[request.id] || ''}
                onChange={(e) => setManagerNote({ ...managerNote, [request.id]: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                rows={2}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setRejectingId(request.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => handleApprove(request.id)}
                disabled={loadingId === request.id}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {loadingId === request.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Approve & Send Token
                  </>
                )}
              </button>
            </div>

            {/* Reject Modal */}
            <AnimatePresence>
              {rejectingId === request.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 border-t border-red-500/20 space-y-3"
                >
                  <label className="text-xs text-gray-400 uppercase block">Rejection Reason</label>
                  <div className="space-y-2">
                    {[
                      'Quality concerns',
                      'Wrong season crop',
                      'Quantity too small',
                      'Duplicate submission',
                      'Other',
                    ].map(reason => (
                      <label key={reason} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name={`reason-${request.id}`}
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={(e) => setSelectedReason(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-300">{reason}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setRejectingId(null)}
                      className="flex-1 py-2 rounded text-sm font-medium text-gray-400 hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={!selectedReason || rejectingId !== request.id}
                      className="flex-1 py-2 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 text-sm font-medium transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
