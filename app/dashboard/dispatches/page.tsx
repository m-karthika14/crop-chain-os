'use client'

import React, { useState, useEffect, useRef, useCallback, Fragment } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck, CheckCircle2, Clock, ChevronDown, ChevronUp, Zap, RefreshCw,
} from 'lucide-react'
import { SaleEntryForm, type SaleData } from '@/app/components/sale-entry-form'
import { PayoutScreen } from '@/app/components/payout-screen'

const DispatchMap = dynamic(() => import('./dispatch-map'), { ssr: false })

const POLL_MS = 20_000

// Fallback coordinates when mandis table has no data for the stored mandi_id
const MANDI_COORDS: Record<string, [number, number]> = {
  // Haryana
  'karnal':      [29.6857, 76.9905],
  'panipat':     [29.3909, 76.9635],
  'ambala':      [30.3752, 76.7821],
  'hisar':       [29.1492, 75.7217],
  'rohtak':      [28.8955, 76.6066],
  'sonipat':     [28.9931, 77.0151],
  'sirsa':       [29.5333, 75.0167],
  // Punjab
  'ludhiana':    [30.9010, 75.8573],
  'amritsar':    [31.6340, 74.8723],
  'jalandhar':   [31.3260, 75.5762],
  'patiala':     [30.3398, 76.3869],
  // UP
  'agra':        [27.1767, 78.0081],
  'lucknow':     [26.8467, 80.9462],
  'kanpur':      [26.4499, 80.3319],
  'varanasi':    [25.3176, 82.9739],
  'meerut':      [28.9845, 77.7064],
  'allahabad':   [25.4358, 81.8463],
  'prayagraj':   [25.4358, 81.8463],
  // Rajasthan
  'jaipur':      [26.9124, 75.7873],
  'jodhpur':     [26.2389, 73.0243],
  'kota':        [25.2138, 75.8648],
  'ajmer':       [26.4499, 74.6399],
  'bikaner':     [28.0229, 73.3119],
  // MP
  'bhopal':      [23.2599, 77.4126],
  'indore':      [22.7196, 75.8577],
  'gwalior':     [26.2183, 78.1828],
  'jabalpur':    [23.1815, 79.9864],
  'ujjain':      [23.1793, 75.7849],
  'harda':       [22.3399, 77.0950],
  'hoshangabad': [22.7503, 77.7152],
  'sehore':      [23.2029, 77.0851],
  'dewas':       [22.9623, 76.0516],
  'narsinghpur': [22.9446, 79.1943],
  'vidisha':     [23.5250, 77.8082],
  'sagar':       [23.8388, 78.7378],
  // Maharashtra
  'nagpur':      [21.1458, 79.0882],
  'mumbai':      [19.0760, 72.8777],
  'pune':        [18.5204, 73.8567],
  'nashik':      [19.9975, 73.7898],
  'aurangabad':  [19.8762, 75.3433],
  'solapur':     [17.6599, 75.9064],
  'latur':       [18.4088, 76.5604],
  // AP / Telangana
  'hyderabad':   [17.3850, 78.4867],
  'vijayawada':  [16.5062, 80.6480],
  'visakhapatnam':[17.6868, 83.2185],
  'warangal':    [17.9689, 79.5941],
  'karimnagar':  [18.4386, 79.1288],
  // Karnataka
  'bangalore':   [12.9716, 77.5946],
  'bengaluru':   [12.9716, 77.5946],
  'hubli':       [15.3647, 75.1240],
  'mysore':      [12.2958, 76.6394],
  'belgaum':     [15.8497, 74.4977],
  // TN
  'chennai':     [13.0827, 80.2707],
  'coimbatore':  [11.0168, 76.9558],
  'madurai':     [9.9252, 78.1198],
  // Gujarat
  'ahmedabad':   [23.0225, 72.5714],
  'surat':       [21.1702, 72.8311],
  'vadodara':    [22.3072, 73.1812],
  'rajkot':      [22.3039, 70.8022],
  // Other
  'delhi':       [28.7041, 77.1025],
  'chandigarh':  [30.7333, 76.7794],
  'patna':       [25.5941, 85.1376],
  'ranchi':      [23.3441, 85.3096],
  'kolkata':     [22.5726, 88.3639],
  'bhubaneswar': [20.2961, 85.8245],
}

function mandiCoordsFallback(mandiName: string): [number, number] | undefined {
  const key = mandiName.toLowerCase().split(',')[0].trim()
  return MANDI_COORDS[key]
}

const STAGES = [
  { id: 0, label: 'Harvest', emoji: '🌾' },
  { id: 1, label: 'Loading', emoji: '📦' },
  { id: 2, label: 'Transit', emoji: '🚛' },
  { id: 3, label: 'Arrived', emoji: '📍' },
  { id: 4, label: 'Sold',    emoji: '🏪' },
  { id: 5, label: 'Paid',    emoji: '💰' },
]

interface DispatchRow {
  id:              string
  truck_number:    string
  crop:            string
  total_quantity:  number
  current_stage:   number
  mandi_name:      string
  mandi_state:     string
  mandi_lat:       string | null
  mandi_lng:       string | null
  departed_at:     string | null
  eta:             string | null
  arrived_at:      string | null
  sold_at:         string | null
  actual_revenue:  number
  expected_revenue: number
  price_per_quintal: number | null
  created_at:      string
}

function fmtTime(iso: string | null | undefined) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
  catch { return '—' }
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }
  catch { return '—' }
}

function fmtRevenue(v: number) {
  if (!v) return '—'
  const l = v / 100000
  return l >= 1 ? `₹${l.toFixed(1)}L` : `₹${Math.round(v / 1000)}K`
}

function PipelinePills({ currentStage }: { currentStage: number }) {
  const pct = Math.round((currentStage / (STAGES.length - 1)) * 100)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-2">
        {STAGES.map((stage, i) => {
          const done   = stage.id < currentStage
          const active = stage.id === currentStage
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: active ? 1.05 : 1, y: active ? -4 : 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg ${
                done   ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400' :
                active ? 'bg-amber-500/20  border-2 border-amber-500/80  text-amber-400'  :
                         'bg-gray-700/20  border border-gray-600/50     text-gray-500'
              }`}
              style={active ? { boxShadow: '0 0 18px rgba(245,158,11,0.35)' } : undefined}
            >
              {done ? <span className="text-lg">✅</span>
                    : <span className={`text-xl ${!active ? 'opacity-30' : ''}`}>{stage.emoji}</span>}
              <span className="text-[11px] font-semibold text-center leading-tight">{stage.label}</span>
            </motion.div>
          )
        })}
      </div>
      <div className="space-y-1">
        <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-gray-500 text-center">
          {STAGES[currentStage]?.emoji} {STAGES[currentStage]?.label} · Stage {currentStage + 1}/{STAGES.length}
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
  const [dispatches,      setDispatches]      = useState<DispatchRow[]>([])
  const [selectedId,      setSelectedId]      = useState<string>('')
  const [fpoPos,          setFpoPos]          = useState<[number, number] | undefined>()
  const [loading,         setLoading]         = useState(true)
  const [refreshing,      setRefreshing]      = useState(false)
  const [nextRefresh,     setNextRefresh]     = useState(POLL_MS / 1000)
  const [toast,           setToast]           = useState('')
  const [showSaleForm,    setShowSaleForm]    = useState(false)
  const [showPayoutScreen,setShowPayoutScreen]= useState(false)
  const [payoutDispatchId,setPayoutDispatchId]= useState('')
  const [expandedRow,     setExpandedRow]     = useState<string | null>(null)

  const fpoIdRef  = useRef<string>('fpo-001')
  const mgrIdRef  = useRef<string>('mgr-001')

  // ─── Fetch dispatches ──────────────────────────────────────────────────────
  const fetchDispatches = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    else        setRefreshing(true)
    try {
      const res  = await fetch(`/api/dispatches?fpoId=${fpoIdRef.current}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.dispatches)) {
        setDispatches(data.dispatches as DispatchRow[])
        setSelectedId(prev => {
          // Keep selection if still valid, else pick first active
          const active = (data.dispatches as DispatchRow[]).filter(d => d.current_stage < 5)
          if (active.find((d: DispatchRow) => d.id === prev)) return prev
          return active[0]?.id ?? (data.dispatches as DispatchRow[])[0]?.id ?? ''
        })
      }
    } catch {}
    setLoading(false)
    setRefreshing(false)
  }, [])

  // ─── Bootstrap ────────────────────────────────────────────────────────────
  useEffect(() => {
    fpoIdRef.current = localStorage.getItem('fpoId')  || 'fpo-001'
    mgrIdRef.current = localStorage.getItem('userId') || 'mgr-001'
    fetchDispatches()

    fetch(`/api/fpos/location?fpoId=${fpoIdRef.current}`)
      .then(r => r.json())
      .then(d => { if (d.success && d.lat && d.lng) setFpoPos([parseFloat(d.lat), parseFloat(d.lng)]) })
      .catch(() => {})
  }, [fetchDispatches])

  // ─── Poll every 20 s ──────────────────────────────────────────────────────
  useEffect(() => {
    let countdown = POLL_MS / 1000

    const tick = setInterval(() => {
      countdown -= 1
      setNextRefresh(countdown)
      if (countdown <= 0) {
        countdown = POLL_MS / 1000
        fetchDispatches(true)
      }
    }, 1000)

    return () => clearInterval(tick)
  }, [fetchDispatches])

  // ─── Demo auto-advance (stages 1–3 only) ──────────────────────────────────
  useEffect(() => {
    const iv = setInterval(async () => {
      setDispatches(prev => {
        const next = prev.map(d => {
          if (d.current_stage >= 1 && d.current_stage <= 3) {
            // Advance locally for demo
            const advanced = { ...d, current_stage: d.current_stage + 1 }
            // Fire-and-forget API call
            fetch(`/api/dispatches/${d.id}`, {
              method:  'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'advance_stage', managerId: mgrIdRef.current }),
            }).catch(() => {})
            return advanced
          }
          return d
        })
        return next
      })
    }, POLL_MS)

    return () => clearInterval(iv)
  }, [])

  // ─── Derived data ─────────────────────────────────────────────────────────
  const activeDispatches = dispatches.filter(d => d.current_stage < 5)
  const pastDispatches   = dispatches.filter(d => d.current_stage >= 5)

  const selected = dispatches.find(d => d.id === selectedId) ?? dispatches[0]
  const currentStage = selected ? Math.min(selected.current_stage, STAGES.length - 1) : 0

  const mandiPos: [number, number] | undefined =
    selected?.mandi_lat && selected?.mandi_lng
      ? [parseFloat(selected.mandi_lat), parseFloat(selected.mandi_lng)]
      : selected?.mandi_name
        ? mandiCoordsFallback(selected.mandi_name)
        : undefined

  const truckRouteIndex =
    currentStage <= 0 ? 0 :
    currentStage === 1 ? 1 :
    currentStage === 2 ? 3 : 6

  // ─── Advance stage ────────────────────────────────────────────────────────
  const advanceStage = useCallback(async () => {
    if (!selected) return
    const stage = selected.current_stage

    if (stage === 4) { setShowSaleForm(true); return }
    if (stage === 5) {
      try {
        await fetch(`/api/dispatches/${selected.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'calculate_payouts', fpoId: fpoIdRef.current, managerId: mgrIdRef.current }),
        })
      } catch {}
      setPayoutDispatchId(selected.id)
      setShowPayoutScreen(true)
      return
    }
    if (stage >= STAGES.length - 1) return

    // Update locally immediately
    setDispatches(prev => prev.map(d => d.id === selected.id ? { ...d, current_stage: d.current_stage + 1 } : d))

    try {
      await fetch(`/api/dispatches/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'advance_stage', managerId: mgrIdRef.current }),
      })
      setToast(`✅ Advanced to ${STAGES[stage + 1]?.label}`)
    } catch { setToast('Stage updated locally') }
  }, [selected])

  // ─── Early returns ────────────────────────────────────────────────────────
  if (showSaleForm && selected) {
    return (
      <SaleEntryForm
        dispatch={{
          id:              selected.id,
          mandi:           `${selected.mandi_name}, ${selected.mandi_state}`,
          crop:            selected.crop,
          quantity:        Math.round(selected.total_quantity),
          expectedRevenue: selected.expected_revenue || 2000000,
          farmerCount:     0,
          actualQuantity:  Math.round(selected.total_quantity),
        }}
        onSuccess={async (data: SaleData) => {
          try {
            await fetch(`/api/dispatches/${selected.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'mark_sold', actualRevenue: data.totalRevenue, managerId: mgrIdRef.current }),
            })
          } catch {}
          setToast('✅ Sale recorded! Advancing to payout...')
          setDispatches(prev => prev.map(d => d.id === selected.id ? { ...d, current_stage: 5 } : d))
          setTimeout(() => setShowSaleForm(false), 1500)
        }}
        onCancel={() => setShowSaleForm(false)}
      />
    )
  }

  if (showPayoutScreen) {
    return (
      <PayoutScreen
        dispatchId={payoutDispatchId}
        onBack={() => { setShowPayoutScreen(false); fetchDispatches(true) }}
      />
    )
  }

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center" style={{ backgroundColor: '#0A0F0A' }}>
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20" />
            <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-emerald-400 font-semibold">Loading dispatches from DB...</p>
        </div>
      </div>
    )
  }

  // ─── Empty state ──────────────────────────────────────────────────────────
  if (dispatches.length === 0) {
    return (
      <div className="min-h-full flex items-center justify-center" style={{ backgroundColor: '#0A0F0A' }}>
        <div className="text-center space-y-3">
          <p className="text-6xl">🚛</p>
          <p className="text-white font-semibold text-lg">No dispatches yet</p>
          <p className="text-sm text-gray-500">Create a dispatch from the Optimizer page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full p-5 space-y-5" style={{ backgroundColor: '#0A0F0A' }}>

      {/* Header bar: active dispatch tabs + refresh indicator */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          {activeDispatches.length === 0
            ? <p className="text-sm text-gray-500 italic">No active dispatches — check past dispatches below</p>
            : activeDispatches.map(d => (
              <motion.button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                  selectedId === d.id
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                    : 'bg-white/10 text-emerald-300 border border-emerald-500/30 hover:bg-white/20'
                }`}
              >
                <Truck className="w-4 h-4" />
                {d.truck_number}
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  selectedId === d.id ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {STAGES[Math.min(d.current_stage, 5)]?.emoji}
                </span>
              </motion.button>
            ))
          }
        </div>

        {/* Demo refresh badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
          refreshing
            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            : 'bg-white/[0.04] border-white/10 text-gray-500'
        }`}>
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : 'text-gray-600'}`} />
          {refreshing ? 'Updating...' : `Auto-refresh in ${nextRefresh}s`}
        </div>
      </div>

      {selected && (
        <div className="space-y-5">
          {/* Hero card */}
          <motion.div
            key={selected.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
                    <span className="text-xs text-amber-400 font-semibold uppercase tracking-widest">
                      {STAGES[currentStage]?.emoji} {STAGES[currentStage]?.label}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">{selected.truck_number}</h2>
                </div>
              </div>
              {selected.eta && (
                <div className="flex items-center gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-mono font-semibold">ETA {fmtTime(selected.eta)}</span>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Destination', value: `${selected.mandi_name}, ${selected.mandi_state}` },
                { label: 'Crop',        value: `${Math.round(selected.total_quantity)}Q ${selected.crop}` },
                { label: 'Departed',    value: fmtTime(selected.departed_at) },
                { label: 'ETA',         value: fmtTime(selected.eta) },
                selected.arrived_at  ? { label: 'Arrived',    value: fmtTime(selected.arrived_at) } : null,
                selected.sold_at     ? { label: 'Sold At',    value: fmtDate(selected.sold_at) } : null,
                { label: selected.actual_revenue ? 'Revenue' : 'Expected Revenue', value: fmtRevenue(Number(selected.actual_revenue) || Number(selected.expected_revenue)) },
                selected.price_per_quintal ? { label: 'Price/Q', value: `₹${Number(selected.price_per_quintal).toLocaleString('en-IN')}` } : null,
              ].filter((x): x is { label: string; value: string } => x !== null).map(({ label, value }) => (
                <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pipeline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-emerald-500/10 bg-white/[0.02] p-6 backdrop-blur"
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-white">Stage Progress</h3>
              <span className="text-xs text-gray-500 bg-white/[0.04] border border-white/[0.06] px-2 py-1 rounded-lg">
                Demo: auto-advances every {POLL_MS / 1000}s
              </span>
            </div>
            <PipelinePills currentStage={currentStage} />
            <button
              onClick={advanceStage}
              disabled={currentStage >= STAGES.length - 1}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0A0A] font-bold px-6 py-3 rounded-lg transition-all duration-200"
            >
              <Zap className="w-4 h-4" />
              {currentStage === 4 ? 'Record Sale & Continue'
                : currentStage === 5 ? 'Process Payouts'
                : `Advance to ${STAGES[currentStage + 1]?.label || 'Next'}`}
            </button>
          </motion.div>

          {/* Live Map */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border border-emerald-500/10 overflow-hidden bg-white/[0.02]"
          >
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <p className="text-xs font-semibold text-emerald-400">Live Location</p>
              <span className="text-xs text-gray-600 ml-auto">
                {selected.mandi_name}, {selected.mandi_state}
              </span>
            </div>
            <DispatchMap
              key={`${fpoPos?.join(',')}-${mandiPos?.join(',')}-${truckRouteIndex}`}
              truckIndex={truckRouteIndex}
              startPos={fpoPos}
              endPos={mandiPos}
              height={384}
            />
          </motion.div>
        </div>
      )}

      {/* Past Dispatches */}
      {pastDispatches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-emerald-500/10 bg-white/[0.02] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Past Dispatches</h3>
            <span className="text-xs text-gray-600">{pastDispatches.length} completed</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Date', 'Truck', 'Mandi', 'Crop', 'Qty', 'Revenue', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pastDispatches.map((row) => (
                  <Fragment key={row.id}>
                    <tr
                      className="border-b border-white/[0.04] hover:bg-emerald-500/[0.03] cursor-pointer transition-colors"
                      onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                    >
                      <td className="px-4 py-3 text-amber-400 font-semibold whitespace-nowrap">{fmtDate(row.sold_at || row.created_at)}</td>
                      <td className="px-4 py-3 text-amber-300 font-mono">{row.truck_number}</td>
                      <td className="px-4 py-3 text-gray-300">{row.mandi_name}, {row.mandi_state}</td>
                      <td className="px-4 py-3 text-gray-400">{row.crop}</td>
                      <td className="px-4 py-3 text-gray-400">{Math.round(row.total_quantity)}Q</td>
                      <td className="px-4 py-3 font-semibold text-white">{fmtRevenue(Number(row.actual_revenue) || Number(row.expected_revenue))}</td>
                      <td className="px-4 py-3">
                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold text-xs">✅ Settled</span>
                      </td>
                      <td className="px-4 py-3">
                        {expandedRow === row.id
                          ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                          : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedRow === row.id && (
                        <motion.tr
                          key="exp"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b border-white/[0.04]"
                        >
                          <td colSpan={8} className="px-4 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {[
                                { label: 'Departed',    value: fmtTime(row.departed_at) },
                                { label: 'Arrived',     value: fmtTime(row.arrived_at)  },
                                { label: 'Sold at',     value: fmtDate(row.sold_at)     },
                                { label: 'Price/Q',     value: row.price_per_quintal ? `₹${Number(row.price_per_quintal).toLocaleString('en-IN')}` : '—' },
                                { label: 'Total Qty',   value: `${Math.round(row.total_quantity)}Q` },
                                { label: row.actual_revenue ? 'Revenue' : 'Expected Revenue', value: fmtRevenue(Number(row.actual_revenue) || Number(row.expected_revenue)) },
                              ].map(({ label, value }) => (
                                <div key={label} className="bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2">
                                  <p className="text-[10px] text-gray-600 uppercase tracking-wider">{label}</p>
                                  <p className="text-sm font-semibold text-white mt-0.5">{value}</p>
                                </div>
                              ))}
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast} onDone={() => setToast('')} />}
      </AnimatePresence>
    </div>
  )
}
