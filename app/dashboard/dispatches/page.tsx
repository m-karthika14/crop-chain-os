'use client'

import React, { useState, useEffect, useRef, useCallback, Fragment } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck, CheckCircle2, Clock, ChevronDown, ChevronUp,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { SaleEntryForm, type SaleData } from '@/app/components/sale-entry-form'
import { PayoutScreen } from '@/app/components/payout-screen'

const DispatchMap = dynamic(() => import('./dispatch-map'), { ssr: false })

const STAGES = [
  { id: 0, label: 'Harvest',  farmerLabel: 'Collected',  emoji: '🌾' },
  { id: 1, label: 'Loading',  farmerLabel: 'Loaded',     emoji: '📦' },
  { id: 2, label: 'Transit',  farmerLabel: 'Travelling', emoji: '🚛' },
  { id: 3, label: 'Arrived',  farmerLabel: 'Reached',    emoji: '📍' },
  { id: 4, label: 'Sold',     farmerLabel: 'Sold',       emoji: '🏪' },
  { id: 5, label: 'Paid',     farmerLabel: 'Paid',       emoji: '💰' },
]

const PAST_DISPATCHES = [
  { date: 'Jun 15', truck: 'KA-02-CD', mandi: 'Panipat', crop: 'Rice', qty: '400q', farmers: 412, revenue: '₹8.2L', status: 'Done' },
  { date: 'Jun 10', truck: 'KA-03-EF', mandi: 'Hubli', crop: 'Tomato', qty: '200q', farmers: 198, revenue: '₹4.1L', status: 'Done' },
  { date: 'Jun 5', truck: 'KA-01-AB', mandi: 'Karnal', crop: 'Wheat', qty: '820q', farmers: 825, revenue: '₹17.1L', status: 'Done' },
]

const PAST_TIMELINES: Record<string, string[]> = {
  'KA-02-CD': ['Jun 15 07:00 — Rice collected — 400q', 'Jun 15 08:30 — Truck dispatched', 'Jun 15 14:00 — Arrived Panipat', 'Jun 15 15:30 — Sold at ₹2,050/q', 'Jun 15 16:00 — Farmers paid'],
  'KA-03-EF': ['Jun 10 06:45 — Tomato collected — 200q', 'Jun 10 07:50 — Truck dispatched', 'Jun 10 11:00 — Arrived Hubli', 'Jun 10 12:30 — Sold at ₹2,050/q', 'Jun 10 13:00 — Farmers paid'],
  'KA-01-AB': ['Jun 5 08:12 — Wheat collected — 820q', 'Jun 5 09:00 — Truck dispatched', 'Jun 5 14:00 — Arrived Karnal', 'Jun 5 15:00 — Sold at ₹2,350/q', 'Jun 5 15:30 — Farmers paid'],
}

const ACTIVE_DISPATCHES = [
  {
    id: 'KA-01-AB-1234',
    truck: 'KA-01-AB-1234',
    from: 'GreenHarvest FPO, Karnataka',
    to: 'Karnal Mandi, Haryana',
    crop: '850 Quintals Wheat',
    farmers: 825,
    departed: '08:37 AM',
    eta: '2:00 PM',
    initialStage: 3,
  },
  {
    id: 'KA-02-CD-5678',
    truck: 'KA-02-CD-5678',
    from: 'GreenHarvest FPO, Karnataka',
    to: 'Panipat Mandi, Haryana',
    crop: '400 Quintals Rice',
    farmers: 412,
    departed: '10:15 AM',
    eta: '3:30 PM',
    initialStage: 2,
  },
  {
    id: 'KA-03-EF-9012',
    truck: 'KA-03-EF-9012',
    from: 'GreenHarvest FPO, Karnataka',
    to: 'Hubli Mandi, Karnataka',
    crop: '200 Quintals Tomato',
    farmers: 198,
    departed: '07:00 AM',
    eta: '11:30 AM',
    initialStage: 1,
  },
]

function getEtaMs() {
  const now = new Date()
  const eta = new Date(now)
  eta.setHours(14, 0, 0, 0)
  return Math.max(0, eta.getTime() - now.getTime())
}

function formatCountdown(ms: number) {
  if (ms <= 0) return '0h 0m 0s'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${h}h ${m}m ${s}s`
}

function PipelinePills({ currentStage, farmer }: { currentStage: number; farmer?: boolean }) {
  const pct = Math.round((currentStage / (STAGES.length - 1)) * 100)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-2">
        {STAGES.map((stage, i) => {
          const done = stage.id < currentStage
          const active = stage.id === currentStage

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: active ? 1.05 : 1, y: active ? -4 : 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg ${
                done
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                  : active
                  ? 'bg-amber-500/20 border-2 border-amber-500/80 text-amber-400'
                  : 'bg-gray-700/20 border border-gray-600/50 text-gray-500'
              }`}
            >
              {done ? (
                <span className="text-lg">✅</span>
              ) : (
                <span className={`text-xl ${!active ? 'opacity-30' : ''}`}>{stage.emoji}</span>
              )}
              <span className="text-[11px] font-semibold text-center">
                {farmer ? stage.farmerLabel : stage.label}
              </span>
            </motion.div>
          )
        })}
      </div>

      <div className="space-y-1.5">
        <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-gray-400 text-center">
          {STAGES[currentStage]?.label} • Stage {currentStage + 1}/{STAGES.length}
        </p>
      </div>
    </div>
  )
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-500 text-black font-semibold text-sm px-5 py-3 rounded-xl shadow-2xl shadow-emerald-500/40"
    >
      <CheckCircle2 className="w-4 h-4 shrink-0" />
      {msg}
    </motion.div>
  )
}

export default function DispatchesPage() {
  const [realDispatches, setRealDispatches] = useState<Record<string, unknown>[]>([])
  const [fpoPos, setFpoPos] = useState<[number, number] | undefined>(undefined)

  useEffect(() => {
    const fpoId = localStorage.getItem('fpoId') || 'fpo-001'
    fetch(`/api/dispatches?fpoId=${fpoId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.dispatches.length > 0) {
          setRealDispatches(data.dispatches)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const fpoId = localStorage.getItem('fpoId') || 'fpo-001'
    fetch(`/api/fpos/location?fpoId=${fpoId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.lat && data.lng) {
          setFpoPos([parseFloat(data.lat), parseFloat(data.lng)])
        }
      })
      .catch(() => {})
  }, [])

  const [selectedDispatchId, setSelectedDispatchId] = useState('KA-01-AB-1234')
  const [stageMap, setStageMap] = useState<Record<string, number>>({
    'KA-01-AB-1234': 3,
    'KA-02-CD-5678': 2,
    'KA-03-EF-9012': 1,
  })
  const [countdown, setCountdown] = useState(getEtaMs())
  const [toast, setToast] = useState<string>('')
  const [showSaleForm, setShowSaleForm] = useState(false)
  const [showPayoutScreen, setShowPayoutScreen] = useState(false)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [payoutDispatchId, setPayoutDispatchId] = useState<string>('')

  const selectedDispatch = ACTIVE_DISPATCHES.find(d => d.id === selectedDispatchId) || ACTIVE_DISPATCHES[0]
  const currentStage = stageMap[selectedDispatchId] ?? selectedDispatch.initialStage

  const heroDispatch = realDispatches.length > 0 ? {
    ...selectedDispatch,
    truck: realDispatches[0].truck_number as string || selectedDispatch.truck,
    from: 'GreenHarvest FPO',
    to: `${realDispatches[0].mandi_name as string}, ${realDispatches[0].mandi_state as string}`,
    crop: `${realDispatches[0].total_quantity as string} Quintals ${realDispatches[0].crop as string}`,
    departed: realDispatches[0].departed_at
      ? new Date(realDispatches[0].departed_at as string).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : selectedDispatch.departed,
    eta: realDispatches[0].eta
      ? new Date(realDispatches[0].eta as string).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      : selectedDispatch.eta,
  } : selectedDispatch

  // Real mandi coordinates from first real dispatch
  const mandiPos: [number, number] | undefined =
    realDispatches[0]?.mandi_lat && realDispatches[0]?.mandi_lng
      ? [parseFloat(realDispatches[0].mandi_lat as string), parseFloat(realDispatches[0].mandi_lng as string)]
      : undefined

  // Map stage → truck route index (0–6 along 7-waypoint route)
  const truckRouteIndex = currentStage <= 0 ? 0
    : currentStage === 1 ? 1
    : currentStage === 2 ? 3
    : 6

  // Countdown timer
  useEffect(() => {
    const iv = setInterval(() => setCountdown(getEtaMs()), 1000)
    return () => clearInterval(iv)
  }, [])

  const advanceStage = useCallback(async () => {
    const current = stageMap[selectedDispatchId] ?? selectedDispatch.initialStage

    if (current === 4) {
      setShowSaleForm(true)
      return
    }
    if (current === 5) {
      const dispatchId = realDispatches[0]?.id as string
      if (dispatchId) {
        const fpoId = localStorage.getItem('fpoId') || 'fpo-001'
        const managerId = localStorage.getItem('userId') || 'mgr-001'
        try {
          await fetch(`/api/dispatches/${dispatchId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'calculate_payouts', fpoId, managerId }),
          })
        } catch {}
      }
      setPayoutDispatchId(dispatchId || selectedDispatchId)
      setShowPayoutScreen(true)
      return
    }
    if (current >= STAGES.length - 1) return

    setStageMap(prev => ({ ...prev, [selectedDispatchId]: current + 1 }))

    const dispatchId = realDispatches[0]?.id as string
    if (dispatchId) {
      try {
        const managerId = localStorage.getItem('userId') || 'mgr-001'
        await fetch(`/api/dispatches/${dispatchId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'advance_stage', managerId }),
        })
      } catch (e) {
        console.error('Stage advance error:', e)
      }
    }
  }, [selectedDispatchId, stageMap, selectedDispatch.initialStage, realDispatches])

  if (showSaleForm) {
    const dispatchId = realDispatches[0]?.id as string || selectedDispatchId
    const expectedQty = parseInt(heroDispatch.crop) || 850
    return (
      <SaleEntryForm
        dispatch={{
          id: dispatchId,
          mandi: heroDispatch.to,
          crop: crop(heroDispatch.crop),
          quantity: expectedQty,
          expectedRevenue: 2000000,
          farmerCount: heroDispatch.farmers,
          actualQuantity: expectedQty,
        }}
        onSuccess={async (data: SaleData) => {
          if (dispatchId && dispatchId !== selectedDispatchId) {
            try {
              const managerId = localStorage.getItem('userId') || 'mgr-001'
              await fetch(`/api/dispatches/${dispatchId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'mark_sold',
                  actualRevenue: data.totalRevenue,
                  managerId,
                }),
              })
            } catch (e) {
              console.error('mark_sold error:', e)
            }
          }
          setToast('✅ Sale recorded! Advancing to payout...')
          setTimeout(() => {
            setShowSaleForm(false)
            setStageMap(prev => ({ ...prev, [selectedDispatchId]: 5 }))
          }, 1500)
        }}
        onCancel={() => setShowSaleForm(false)}
      />
    )
  }

  if (showPayoutScreen) {
    return (
      <PayoutScreen
        dispatchId={payoutDispatchId || (realDispatches[0]?.id as string) || selectedDispatchId}
        onBack={() => setShowPayoutScreen(false)}
      />
    )
  }

  return (
    <div className="min-h-full p-5 space-y-5" style={{ backgroundColor: '#0A0F0A' }}>
      {/* Dispatch Selector */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2"
      >
        {ACTIVE_DISPATCHES.map((dispatch) => (
          <motion.button
            key={dispatch.id}
            onClick={() => setSelectedDispatchId(dispatch.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
              selectedDispatchId === dispatch.id
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                : 'bg-white/10 text-emerald-300 border border-emerald-500/30 hover:bg-white/20'
            }`}
          >
            <Truck className="w-4 h-4" />
            {dispatch.truck}
          </motion.button>
        ))}
      </motion.div>

      {/* Manager View */}
      <div className="space-y-5">
        {/* Hero Card */}
        <motion.div
          key={selectedDispatch.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-emerald-500/25 p-5 backdrop-blur"
          style={{
            background: 'rgba(10,20,10,0.7)',
            borderLeft: '4px solid #10B981',
            boxShadow: '0 0 30px rgba(245,158,11,0.08)',
          }}
        >
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Truck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-400 font-semibold uppercase tracking-widest">Truck in Transit</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">{heroDispatch.truck}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono font-semibold">{formatCountdown(countdown)} remaining</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'From', value: heroDispatch.from },
              { label: 'To', value: heroDispatch.to },
              { label: 'Crop', value: heroDispatch.crop },
              { label: 'Farmers', value: heroDispatch.farmers },
              { label: 'Departed', value: heroDispatch.departed },
              { label: 'ETA', value: heroDispatch.eta },
            ].map(({ label, value }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2"
              >
                <p className="text-[10px] text-gray-600 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-emerald-500/10 bg-white/[0.02] p-6 backdrop-blur"
        >
          <PipelinePills currentStage={currentStage} farmer={false} />
          <button
            onClick={advanceStage}
            disabled={currentStage >= STAGES.length - 1}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#0A0A0A] font-bold px-6 py-3 rounded-lg transition-all duration-200"
          >
            <Zap className="w-4 h-4" />
            {currentStage === 4 ? 'Record Sale & Continue' : currentStage === 5 ? 'Process Payouts' : `Advance to ${STAGES[currentStage + 1]?.label || 'Next'}`}
          </button>
        </motion.div>

        {/* Dispatch Map */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-emerald-500/10 overflow-hidden h-96 bg-white/[0.02]"
        >
          <DispatchMap
            key={`${fpoPos?.join(',')}-${mandiPos?.join(',')}`}
            truckIndex={truckRouteIndex}
            startPos={fpoPos}
            endPos={mandiPos}
            height={384}
          />
        </motion.div>

        {/* Past Dispatches */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-emerald-500/10 bg-white/[0.02] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-white">Past Dispatches</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Date', 'Truck', 'Mandi', 'Crop', 'Qty', 'Farmers', 'Revenue', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAST_DISPATCHES.map((row, idx) => (
                <Fragment key={`past-${idx}-${row.truck}`}>
                  <tr
                    className="border-b border-white/[0.04] hover:bg-emerald-500/[0.03] cursor-pointer transition-colors duration-150"
                    onClick={() => setExpandedRow(expandedRow === row.truck ? null : row.truck)}
                  >
                    <td className="py-3 pr-4 text-amber-400 font-semibold">{row.date}</td>
                    <td className="py-3 pr-4 text-amber-300">{row.truck}</td>
                    <td className="py-3 pr-4 text-gray-300">{row.mandi}</td>
                    <td className="py-3 pr-4 text-gray-400">{row.crop}</td>
                    <td className="py-3 pr-4 text-gray-400">{row.qty}</td>
                    <td className="py-3 pr-4 text-gray-400">{row.farmers}</td>
                    <td className="py-3 pr-4 font-semibold text-white">{row.revenue}</td>
                    <td className="py-3 pr-4">
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">✅ {row.status}</span>
                    </td>
                    <td className="py-3">
                      {expandedRow === row.truck ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
                    </td>
                  </tr>
                  {expandedRow === row.truck && (
                    <AnimatePresence>
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-b border-white/[0.04]"
                      >
                        <td colSpan={9} className="px-4 py-4">
                          <div className="space-y-2">
                            {PAST_TIMELINES[row.truck]?.map((event, i) => (
                              <div key={i} className="flex items-center gap-3 text-xs text-gray-400">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{event}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </motion.tr>
                    </AnimatePresence>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast} onDone={() => setToast('')} />}
      </AnimatePresence>
    </div>
  )
}

function crop(heroStr: string): string {
  const parts = heroStr.split(' ')
  return parts.length >= 3 ? parts.slice(2).join(' ') : heroStr
}
