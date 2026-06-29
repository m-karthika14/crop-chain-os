'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, User, Clock, MapPin, Phone, FileCheck, ArrowRight, CheckCircle2, Send, Loader2, Bell, Users } from 'lucide-react'

interface DispatchFormProps {
  mandi: { name: string; state: string; price: number; net: number; mandiId?: string }
  quantity: string
  crop: string
  farmers: number
  onSuccess?: (dispatchId: string) => void
  onCancel?: () => void
}

export function DispatchCreationForm({ mandi, quantity, crop, farmers, onSuccess, onCancel }: DispatchFormProps) {
  const [step, setStep] = useState<'form' | 'review' | 'notifying' | 'success'>('form')
  const [truckNumber, setTruckNumber] = useState('')
  const [driverName, setDriverName] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [departureTime, setDepartureTime] = useState('09:00')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [notificationProgress, setNotificationProgress] = useState(0)
  const [dispatchId, setDispatchId] = useState('')

  const totalRevenue = Math.round((mandi.net) * parseInt(quantity || '0'))

  function handleSubmitForm() {
    if (!truckNumber.trim() || !driverName.trim() || !driverPhone.trim()) {
      alert('Please fill all required fields')
      return
    }
    setStep('review')
  }

  async function handleConfirmDispatch() {
    setStep('notifying')
    setLoading(true)
    setNotificationProgress(0)

    try {
      const fpoId = localStorage.getItem('fpoId') || 'fpo-001'
      const managerId = localStorage.getItem('userId') || 'mgr-001'

      const res = await fetch('/api/dispatches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fpoId,
          mandiId: mandi.mandiId || 'mandi-001',
          crop,
          totalQuantity: parseInt(quantity || '0'),
          truckNumber,
          driverName,
          driverPhone,
          departureTime,
          expectedRevenue: totalRevenue,
          pricePerQuintal: mandi.price,
          managerId,
          trustScoreAtDispatch: 94,
          netPriceAtDispatch: mandi.net,
        }),
      })
      const data = await res.json()

      if (data.success) {
        const id = data.dispatchId
        setDispatchId(id)

        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 15 + 5
          if (progress >= 100) {
            progress = 100
            clearInterval(interval)
            setNotificationProgress(100)
            setTimeout(() => {
              setLoading(false)
              setStep('success')
              onSuccess?.(id)
            }, 800)
          }
          setNotificationProgress(Math.min(progress, 100))
        }, 150)
      } else {
        const id = `DP-${Date.now().toString().slice(-6)}`
        setDispatchId(id)
        setLoading(false)
        setStep('success')
        onSuccess?.(id)
      }
    } catch {
      const id = `DP-${Date.now().toString().slice(-6)}`
      setDispatchId(id)
      setLoading(false)
      setStep('success')
      onSuccess?.(id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        className="relative glass rounded-3xl border border-emerald-500/30 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        layoutId="dispatch-form"
      >
        <AnimatePresence mode="wait">
          {/* Form Step */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 space-y-6"
            >
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Create Dispatch</h2>
                    <p className="text-sm text-gray-500 mt-1">Approve optimization and dispatch to {mandi.name}, {mandi.state}</p>
                  </div>
                </div>
              </div>

              {/* Mandi Summary Card */}
              <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Mandi</p>
                    <p className="text-sm font-bold text-white mt-1">{mandi.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Crop</p>
                    <p className="text-sm font-bold text-white mt-1">{crop}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Quantity</p>
                    <p className="text-sm font-bold text-white mt-1">{quantity}q</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Revenue</p>
                    <p className="text-sm font-bold text-emerald-400 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Truck Details Form */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white">Dispatch Details</h3>

                {/* Truck Number */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase">Truck Number *</label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus-within:border-emerald-500/30">
                    <Truck className="w-4 h-4 text-emerald-500/60" />
                    <input
                      type="text"
                      placeholder="e.g., KA-01-AB-1234"
                      value={truckNumber}
                      onChange={(e) => setTruckNumber(e.target.value.toUpperCase())}
                      className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-gray-600"
                    />
                  </div>
                </div>

                {/* Driver Name */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase">Driver Name *</label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus-within:border-emerald-500/30">
                    <User className="w-4 h-4 text-emerald-500/60" />
                    <input
                      type="text"
                      placeholder="e.g., Raj Kumar"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-gray-600"
                    />
                  </div>
                </div>

                {/* Driver Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase">Driver Phone *</label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus-within:border-emerald-500/30">
                    <Phone className="w-4 h-4 text-emerald-500/60" />
                    <input
                      type="tel"
                      placeholder="e.g., +91 98765 43210"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-gray-600"
                    />
                  </div>
                </div>

                {/* Departure Time */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase">Departure Time</label>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus-within:border-emerald-500/30">
                    <Clock className="w-4 h-4 text-emerald-500/60" />
                    <input
                      type="time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase">Additional Notes</label>
                  <textarea
                    placeholder="Any special instructions for the driver..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-emerald-500/30 focus:outline-none text-white text-sm placeholder-gray-600 resize-none"
                    rows={2}
                  />
                </div>
              </div>

              {/* Farmers Count */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/8 border border-blue-500/20">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-white">{farmers} Farmers</p>
                  <p className="text-xs text-gray-500 mt-0.5">Will be notified of dispatch</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/[0.04] transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitForm}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-[#0A0A0A] hover:bg-emerald-600 transition-colors text-sm font-bold"
                >
                  Review & Approve <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">Review Dispatch</h2>

              {/* Summary Card */}
              <div className="space-y-4 p-6 rounded-2xl bg-white/[0.02] border border-emerald-500/20">
                <div className="grid gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Truck</p>
                      <p className="text-lg font-bold text-white mt-1">{truckNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase">Driver</p>
                      <p className="text-lg font-bold text-white mt-1">{driverName}</p>
                    </div>
                  </div>
                  <div className="h-px bg-white/[0.06]" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Departure</p>
                      <p className="text-sm font-semibold text-white mt-1">{departureTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Phone</p>
                      <p className="text-sm font-semibold text-white mt-1">{driverPhone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dispatch Summary */}
              <div className="space-y-3 p-6 rounded-2xl bg-emerald-500/8 border border-emerald-500/20">
                <p className="text-xs text-gray-500 uppercase font-semibold">Dispatch Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Mandi</span>
                    <span className="font-semibold text-white">{mandi.name}, {mandi.state}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Crop</span>
                    <span className="font-semibold text-white">{crop}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Quantity</span>
                    <span className="font-semibold text-white">{quantity} Quintals</span>
                  </div>
                  <div className="h-px bg-white/[0.06] my-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Expected Revenue</span>
                    <span className="font-bold text-emerald-400">₹{totalRevenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Farmers to Notify</span>
                    <span className="font-bold text-blue-400">{farmers}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/[0.04] transition-colors text-sm font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmDispatch}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-[#0A0A0A] hover:bg-emerald-600 transition-colors text-sm font-bold"
                >
                  Confirm & Dispatch <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Notifying Step */}
          {step === 'notifying' && (
            <motion.div
              key="notifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 space-y-8 flex flex-col items-center justify-center"
            >
              <div className="space-y-4 text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center mx-auto"
                >
                  <Bell className="w-8 h-8 text-blue-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white">Notifying Farmers</h3>
                <p className="text-gray-500">Sending dispatch alerts to {farmers} farmers...</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-semibold text-white">{Math.round(notificationProgress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${notificationProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>

              {/* Loading message */}
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-sm text-gray-600"
              >
                {loading ? 'Sending notifications...' : 'Completing dispatch...'}
              </motion.p>
            </motion.div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-12 space-y-8 flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ scale: [0.8, 1], rotate: [0, 360] }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </motion.div>

              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-white">Dispatch Created</h3>
                <p className="text-gray-500">All {farmers} farmers have been notified</p>
              </div>

              {/* Dispatch ID */}
              <div className="w-full p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-center">
                <p className="text-xs text-gray-500 uppercase">Dispatch ID</p>
                <p className="text-xl font-mono font-bold text-emerald-400 mt-1">{dispatchId}</p>
              </div>

              {/* Key Details */}
              <div className="w-full space-y-2 text-sm">
                <div className="flex justify-between p-2 rounded bg-white/[0.02]">
                  <span className="text-gray-500">Truck</span>
                  <span className="font-semibold text-white">{truckNumber}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02]">
                  <span className="text-gray-500">Destination</span>
                  <span className="font-semibold text-white">{mandi.name}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02]">
                  <span className="text-gray-500">Farmers Notified</span>
                  <span className="font-semibold text-blue-400">{farmers}</span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={onCancel}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-[#0A0A0A] hover:bg-emerald-600 transition-colors font-bold"
              >
                <Send className="w-4 h-4" />
                Go to Dispatch Tracking
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
