'use client'

import { useState, useEffect } from 'react'
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

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return mins + ' mins ago'
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return hrs + ' hours ago'
  return Math.floor(hrs / 24) + ' days ago'
}

export function ManagerPendingRequests({ requests = defaultRequests }: ManagerPendingRequestsProps) {
  const [items, setItems] = useState(requests)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [selectedReason, setSelectedReason] = useState('')
  const [managerNote, setManagerNote] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const fpoId = localStorage.getItem('fpoId') || 'fpo-001'
    fetch(`/api/harvests/pending?fpoId=${fpoId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.pending) {
          const mapped = data.pending.map((h: Record<string, unknown>) => ({
            id: h.id as string,
            farmer: h.farmer_name as string,
            village: h.farmer_village as string,
            cropType: h.crop_type as string,
            variety: (h.variety as string) || '-',
            grade: (h.grade_submitted as string) || 'A',
            estimatedQty: parseFloat(h.quantity_estimated as string),
            submittedAt: h.submitted_at as string,
            timeAgo: getTimeAgo(h.submitted_at as string),
          }))
          setItems(mapped)
        }
      })
      .catch(() => {})
  }, [])

  const handleApprove = async (id: string) => {
    setLoadingId(id)
    try {
      const managerId = localStorage.getItem('userId') || 'mgr-001'
      const res = await fetch(`/api/harvests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          managerId,
          managerNote: managerNote[id] || '',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setItems(prev => prev.filter(r => r.id !== id))
        if (data.tokenNumber) {
          alert(`✅ Approved! Token sent to farmer: ${data.tokenNumber}`)
        }
      } else {
        alert(data.error || 'Failed to approve')
      }
    } catch {
      alert('Something went wrong')
    } finally {
      setLoadingId(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!selectedReason) return
    setRejectingId(id)
    try {
      const res = await fetch(`/api/harvests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          rejectionReason: selectedReason,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setItems(prev => prev.filter(r => r.id !== id))
        setSelectedReason('')
      } else {
        alert(data.error || 'Failed to reject')
      }
    } catch {
      alert('Something went wrong')
    } finally {
      setRejectingId(null)
    }
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
