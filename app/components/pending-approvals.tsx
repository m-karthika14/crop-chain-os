'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X, Clock, Loader2 } from 'lucide-react'

interface PendingRequest {
  id: string
  membership_id: string
  name: string
  village: string
  phone: string
  requestedAt: string
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 10) return `+91 ${digits.slice(-10, -7)}***`
  return phone ? `${phone.slice(0, 4)}***` : '—'
}

const POLL_MS = 30_000

export function PendingApprovals() {
  const [requests,  setRequests]  = useState<PendingRequest[]>([])
  const [loading,   setLoading]   = useState(true)
  const [acting,    setActing]    = useState<Record<string, boolean>>({})
  const [toasts,    setToasts]    = useState<{ id: string; message: string; type: 'success' | 'reject' }[]>([])
  const fpoIdRef  = useRef('')
  const managerIdRef = useRef('')

  const addToast = useCallback((message: string, type: 'success' | 'reject') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  const fetchPending = useCallback(async () => {
    const fpoId = fpoIdRef.current
    if (!fpoId) return
    try {
      const res  = await fetch(`/api/farmers/pending?fpoId=${fpoId}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.pending)) {
        setRequests(data.pending.map((r: Record<string, string>) => ({
          id:           String(r.id),
          membership_id: String(r.membership_id),
          name:         String(r.full_name  || ''),
          village:      String(r.village    || '—'),
          phone:        maskPhone(String(r.phone_number || '')),
          requestedAt:  r.requested_at ? timeAgo(r.requested_at) : '—',
        })))
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [])

  useEffect(() => {
    fpoIdRef.current     = localStorage.getItem('fpoId')     || 'fpo-001'
    managerIdRef.current = localStorage.getItem('userId')    || ''
    fetchPending()
    const iv = setInterval(fetchPending, POLL_MS)
    return () => clearInterval(iv)
  }, [fetchPending])

  const handleAction = useCallback(async (req: PendingRequest, action: 'approve' | 'reject') => {
    setActing(a => ({ ...a, [req.id]: true }))
    try {
      const res = await fetch('/api/farmers/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          membershipId: req.membership_id,
          fpoId:        fpoIdRef.current,
          managerId:    managerIdRef.current,
          action,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setRequests(r => r.filter(x => x.id !== req.id))
        addToast(
          action === 'approve' ? `${req.name} approved ✅` : `Request rejected`,
          action === 'approve' ? 'success' : 'reject'
        )
      } else {
        addToast('Action failed — try again', 'reject')
      }
    } catch {
      addToast('Network error — try again', 'reject')
    }
    setActing(a => ({ ...a, [req.id]: false }))
  }, [addToast])

  if (!loading && requests.length === 0) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Pending Approval Requests</h3>
        {loading ? (
          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
        ) : (
          <motion.span
            key={requests.length}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-semibold rounded-full"
          >
            {requests.length} Pending
          </motion.span>
        )}
      </div>

      {/* Table */}
      <motion.div layout className="overflow-hidden rounded-xl border border-emerald-500/10 bg-white/[0.02] backdrop-blur-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-gray-600 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading pending requests…
          </div>
        ) : (
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
                  {requests.map((req, i) => (
                    <motion.tr
                      key={req.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.04 }}
                      className="hover:bg-white/[0.04] transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-white">{req.name}</td>
                      <td className="px-6 py-4 text-gray-400">{req.village}</td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{req.phone}</td>
                      <td className="px-6 py-4 text-gray-400 text-xs">{req.requestedAt}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            disabled={acting[req.id]}
                            onClick={() => handleAction(req, 'approve')}
                            className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold rounded-lg transition-colors flex items-center gap-1 text-xs disabled:opacity-50"
                          >
                            {acting[req.id]
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <CheckCircle2 className="w-4 h-4" />}
                            Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            disabled={acting[req.id]}
                            onClick={() => handleAction(req, 'reject')}
                            className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-lg transition-colors flex items-center gap-1 text-xs disabled:opacity-50"
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
        )}
      </motion.div>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
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
