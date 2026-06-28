'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X, Clock } from 'lucide-react'

interface PendingRequest {
  id: string
  name: string
  village: string
  phone: string
  requestedAt: string
  timestamp: number
}

const MOCK_REQUESTS: PendingRequest[] = [
  {
    id: '1',
    name: 'Ramesh Kumar',
    village: 'Sonepat',
    phone: '+91 987***',
    requestedAt: '2 mins ago',
    timestamp: 2
  },
  {
    id: '2',
    name: 'Priya Devi',
    village: 'Ambala',
    phone: '+91 876***',
    requestedAt: '1 hour ago',
    timestamp: 60
  },
  {
    id: '3',
    name: 'Suresh Patel',
    village: 'Karnal',
    phone: '+91 765***',
    requestedAt: '3 hours ago',
    timestamp: 180
  }
]

export function PendingApprovals() {
  const [requests, setRequests] = useState<PendingRequest[]>(MOCK_REQUESTS)
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'reject' }[]>([])

  const handleApprove = (id: string) => {
    const request = requests.find(r => r.id === id)
    if (!request) return

    // Remove from pending
    setRequests(requests.filter(r => r.id !== id))

    // Show toast
    const toastId = Math.random().toString()
    setToasts([...toasts, {
      id: toastId,
      message: `${request.name} approved ✅`,
      type: 'success'
    }])

    setTimeout(() => {
      setToasts(toasts => toasts.filter(t => t.id !== toastId))
    }, 3000)
  }

  const handleReject = (id: string) => {
    const request = requests.find(r => r.id === id)
    if (!request) return

    // Remove from pending
    setRequests(requests.filter(r => r.id !== id))

    // Show toast
    const toastId = Math.random().toString()
    setToasts([...toasts, {
      id: toastId,
      message: `Request rejected`,
      type: 'reject'
    }])

    setTimeout(() => {
      setToasts(toasts => toasts.filter(t => t.id !== toastId))
    }, 3000)
  }

  if (requests.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header with badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Pending Approval Requests</h3>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-semibold rounded-full"
          >
            {requests.length} Pending
          </motion.span>
        </div>
      </div>

      {/* Requests Table */}
      <motion.div
        layout
        className="overflow-hidden rounded-xl border border-emerald-500/10 bg-white/[0.02] backdrop-blur-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-emerald-500/10 bg-white/[0.02]">
                <th className="px-6 py-4 text-left text-gray-400 font-semibold">Farmer Name</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold">Village</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold">Phone</th>
                <th className="px-6 py-4 text-left text-gray-400 font-semibold">Requested</th>
                <th className="px-6 py-4 text-right text-gray-400 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10">
              <AnimatePresence>
                {requests.map((request, index) => (
                  <motion.tr
                    key={request.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-white/[0.04] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-white">{request.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400">{request.village}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 font-mono text-xs">{request.phone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 text-xs">{request.requestedAt}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprove(request.id)}
                          className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold rounded-lg transition-colors flex items-center gap-1 text-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReject(request.id)}
                          className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg transition-colors flex items-center gap-1 text-xs"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`px-4 py-3 rounded-lg font-semibold text-sm ${
                toast.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
