'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Banknote, Search, CheckCircle2, Clock, Users,
  IndianRupee, TrendingUp, ArrowDown, Zap, ChevronDown, RefreshCw, AlertCircle,
} from 'lucide-react'

interface DispatchOption {
  id:              string
  truck_number:    string
  crop:            string
  mandi_name:      string
  mandi_state:     string
  current_stage:   number
  actual_revenue:  number
  expected_revenue: number
  sold_at:         string | null
  created_at:      string
}

interface FarmerPayout {
  id:             string
  farmer_id:      string
  farmer_name:    string
  quantity_q:     number
  share_pct:      number
  net_amount:     number
  payment_status: string
  paid_at:        string | null
  upi_id?:        string
  village?:       string
}

function fmt(n: number) {
  if (!n) return '₹0'
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

export default function PayoutsPage() {
  const [dispatches,     setDispatches]     = useState<DispatchOption[]>([])
  const [crops,          setCrops]          = useState<string[]>([])
  const [selectedCrop,   setSelectedCrop]   = useState('')
  const [selectedId,     setSelectedId]     = useState('')
  const [farmers,        setFarmers]        = useState<FarmerPayout[]>([])
  const [totalRevenue,   setTotalRevenue]   = useState(0)
  const [estimated,      setEstimated]      = useState(false)
  const [loading,        setLoading]        = useState(true)
  const [farmersLoading, setFarmersLoading] = useState(false)
  const [search,         setSearch]         = useState('')
  const [phase,          setPhase]          = useState<'idle' | 'processing' | 'done'>('idle')
  const [paidCount,      setPaidCount]      = useState(0)
  const [paidRows,       setPaidRows]       = useState<Set<number>>(new Set())
  const [showConfetti,   setShowConfetti]   = useState(false)
  const [error,          setError]          = useState('')

  const fpoIdRef   = useRef('fpo-001')
  const intervalRef= useRef<ReturnType<typeof setInterval> | null>(null)

  // ─── Fetch dispatches (paid or sold) ──────────────────────────────────────
  const fetchDispatches = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/dispatches?fpoId=${fpoIdRef.current}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.dispatches)) {
        // Show dispatches that are sold (stage 4) or paid (stage 5)
        const eligible = (data.dispatches as DispatchOption[]).filter(d => d.current_stage >= 4)
        setDispatches(eligible)

        const uniqueCrops = [...new Set(eligible.map(d => d.crop))].sort()
        setCrops(uniqueCrops)

        if (uniqueCrops.length > 0 && !selectedCrop) {
          setSelectedCrop(uniqueCrops[0])
        }
      }
    } catch {}
    setLoading(false)
  }, [selectedCrop])

  // Bootstrap
  useEffect(() => {
    fpoIdRef.current = localStorage.getItem('fpoId') || 'fpo-001'
    fetchDispatches()
  }, [fetchDispatches])

  // Dispatches for the selected crop
  const cropDispatches = dispatches.filter(d => d.crop === selectedCrop)

  // Auto-select first dispatch when crop changes
  useEffect(() => {
    if (cropDispatches.length > 0) {
      setSelectedId(prev => cropDispatches.find(d => d.id === prev) ? prev : cropDispatches[0].id)
    } else {
      setSelectedId('')
    }
    setPhase('idle')
    setPaidRows(new Set())
    setPaidCount(0)
  }, [selectedCrop]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Fetch farmers whenever dispatch changes ───────────────────────────────
  useEffect(() => {
    if (!selectedId) { setFarmers([]); return }
    setFarmersLoading(true)
    setPhase('idle')
    setPaidRows(new Set())
    setPaidCount(0)

    fetch(`/api/payouts/dispatch?dispatchId=${selectedId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setFarmers(data.payouts as FarmerPayout[])
          setEstimated(Boolean(data.estimated))
          const revenue = data.dispatch?.actual_revenue || data.dispatch?.expected_revenue || 0
          setTotalRevenue(parseFloat(revenue))
          // If all already paid, show done state
          if ((data.payouts as FarmerPayout[]).length > 0 &&
              (data.payouts as FarmerPayout[]).every(p => p.payment_status === 'PAID')) {
            setPhase('done')
            setPaidCount((data.payouts as FarmerPayout[]).length)
            setPaidRows(new Set((data.payouts as FarmerPayout[]).map((_, i) => i)))
          }
        }
      })
      .catch(() => setError('Failed to load farmers'))
      .finally(() => setFarmersLoading(false))
  }, [selectedId])

  // ─── Pay ──────────────────────────────────────────────────────────────────
  async function handlePay() {
    if (!selectedId) return
    setPhase('processing')
    setError('')
    setPaidCount(0)
    setPaidRows(new Set())

    // Animate rows
    let rowIdx = 0
    const rowIv = setInterval(() => {
      if (rowIdx >= filtered.length) { clearInterval(rowIv); return }
      setPaidRows(prev => new Set([...prev, rowIdx]))
      rowIdx++
    }, 200)

    // Animate counter
    let cnt = 0
    intervalRef.current = setInterval(() => {
      cnt += 1
      setPaidCount(cnt)
      if (cnt >= farmers.length) clearInterval(intervalRef.current!)
    }, Math.max(60, 1200 / farmers.length))

    try {
      const res = await fetch('/api/payouts/pay', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispatchId: selectedId, fpoId: fpoIdRef.current }),
      })
      const data = await res.json()
      if (data.success) {
        setTimeout(() => {
          setPhase('done')
          setPaidCount(farmers.length)
          setPaidRows(new Set(farmers.map((_, i) => i)))
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 4000)
          // Refresh farmer list with updated PAID status
          fetch(`/api/payouts/dispatch?dispatchId=${selectedId}`)
            .then(r => r.json())
            .then(d => { if (d.success) setFarmers(d.payouts) })
        }, Math.max(farmers.length * 200 + 400, 1200))
      } else {
        setError(data.error || 'Payment failed')
        setPhase('idle')
      }
    } catch (err) {
      setError(String(err))
      setPhase('idle')
    }
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  const selectedDispatch = dispatches.find(d => d.id === selectedId)
  const filtered = farmers.filter(f =>
    f.farmer_name.toLowerCase().includes(search.toLowerCase())
  )
  const pendingCount = farmers.filter(f => f.payment_status !== 'PAID').length
  const avgPayout    = farmers.length > 0 ? totalRevenue * 0.98 / farmers.length : 0
  const maxPayout    = farmers.length > 0 ? Math.max(...farmers.map(f => Number(f.net_amount))) : 0

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center" style={{ backgroundColor: '#0A0F0A' }}>
        <div className="text-center space-y-3">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-emerald-400 text-sm font-semibold">Loading payout data…</p>
        </div>
      </div>
    )
  }

  // ─── Empty (no eligible dispatches) ───────────────────────────────────────
  if (dispatches.length === 0) {
    return (
      <div className="min-h-full flex items-center justify-center p-8" style={{ backgroundColor: '#0A0F0A' }}>
        <div className="text-center space-y-3 max-w-sm">
          <p className="text-5xl">🏪</p>
          <p className="text-white font-semibold text-lg">No Sold Dispatches Yet</p>
          <p className="text-gray-500 text-sm">
            Once a dispatch reaches the "Sold" stage, it will appear here for payout processing.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 space-y-5 min-h-full relative pb-10" style={{ backgroundColor: '#0A0F0A' }}>

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(48)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-sm"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#10B981', '#34D399', '#6EE7B7', '#F59E0B', '#FCD34D'][i % 5],
                }}
                initial={{ y: -20, opacity: 1, rotate: 0 }}
                animate={{ y: typeof window !== 'undefined' ? window.innerHeight + 40 : 800, opacity: 0, rotate: Math.random() * 720 - 360 }}
                transition={{ duration: 2.5 + Math.random() * 1.5, delay: Math.random() * 0.8, ease: 'easeIn' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
            <Banknote className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Farmer Payout Distribution</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {dispatches.length} dispatches · {dispatches.filter(d => d.current_stage < 5).length} pending payout
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {phase === 'processing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-4 py-2 rounded-full"
            >
              <Zap className="w-4 h-4 animate-pulse" fill="currentColor" />
              Paying {paidCount}/{farmers.length}
            </motion.div>
          )}
          {phase === 'done' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm font-semibold text-emerald-400"
            >
              <CheckCircle2 className="w-4 h-4" /> All {farmers.length} farmers paid
            </motion.div>
          )}
          <button
            onClick={fetchDispatches}
            className="p-2 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crop + Dispatch selectors */}
      <div className="rounded-xl border border-emerald-500/10 bg-white/[0.02] p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Crop */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Crop</label>
            <div className="relative">
              <select
                value={selectedCrop}
                onChange={e => { setSelectedCrop(e.target.value) }}
                className="w-full appearance-none bg-white/[0.04] border border-emerald-500/25 rounded-lg px-4 py-2.5 text-white text-sm font-medium focus:outline-none focus:border-emerald-500/60 transition-colors"
              >
                {crops.map(c => (
                  <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
            </div>
          </div>

          {/* Dispatch */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Dispatch</label>
            <div className="relative">
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                className="w-full appearance-none bg-white/[0.04] border border-emerald-500/25 rounded-lg px-4 py-2.5 text-white text-sm font-medium focus:outline-none focus:border-emerald-500/60 transition-colors"
              >
                {cropDispatches.map(d => (
                  <option key={d.id} value={d.id} className="bg-[#1a1a1a]">
                    {d.truck_number} — {d.mandi_name} · {fmtDate(d.sold_at || d.created_at)}
                    {d.current_stage >= 5 ? ' ✅' : ' ⏳'}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Dispatch summary strip */}
        {selectedDispatch && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Truck',    value: selectedDispatch.truck_number },
              { label: 'Mandi',   value: `${selectedDispatch.mandi_name}${selectedDispatch.mandi_state ? `, ${selectedDispatch.mandi_state}` : ''}` },
              { label: 'Revenue', value: fmt(Number(selectedDispatch.actual_revenue) || Number(selectedDispatch.expected_revenue)) },
              { label: 'Status',  value: selectedDispatch.current_stage >= 5 ? '✅ Paid' : '⏳ Pending' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-white mt-0.5 truncate">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Pay button */}
        {pendingCount > 0 && phase !== 'done' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePay}
            disabled={phase === 'processing' || farmersLoading || farmers.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition-all shadow-lg shadow-emerald-500/20"
          >
            <Zap className="w-4 h-4" fill="currentColor" />
            {phase === 'processing'
              ? `Paying ${paidCount} / ${farmers.length} farmers…`
              : `Pay ${pendingCount} Farmer${pendingCount !== 1 ? 's' : ''} · ${fmt(totalRevenue * 0.98)}`}
          </motion.button>
        )}
      </div>

      {/* KPI cards */}
      {selectedDispatch && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Farmers',    value: farmers.length.toString(),       icon: Users,       color: 'text-white' },
            { label: 'Total Pool',       value: fmt(totalRevenue * 0.98),        icon: IndianRupee, color: 'text-emerald-400' },
            { label: 'Avg Per Farmer',   value: fmt(avgPayout),                  icon: TrendingUp,  color: 'text-white' },
            { label: 'Largest Payout',   value: fmt(maxPayout),                  icon: Banknote,    color: 'text-amber-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-3.5 h-3.5 text-gray-600" />
                <p className="text-xs text-gray-600">{label}</p>
              </div>
              <p className={`text-lg font-bold ${color}`}>{farmersLoading ? '…' : value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Money flow diagram */}
      {farmers.length > 0 && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h3 className="text-sm font-semibold text-white mb-5">
            Money Flow — {selectedCrop}
            {estimated && <span className="ml-2 text-xs text-amber-400 font-normal">(estimated)</span>}
          </h3>
          <div className="relative">
            <div className="flex justify-center mb-4">
              <div className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all duration-500 ${phase !== 'idle' ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.25)]' : 'border-white/10 text-white'}`}>
                {fmt(totalRevenue)} Sale Revenue
              </div>
            </div>
            <div className="flex justify-center mb-0">
              <div className="relative w-0.5 h-8 bg-white/[0.08] overflow-hidden rounded-full">
                {phase !== 'idle' && (
                  <motion.div
                    className="absolute inset-x-0 top-0 h-3 rounded-full bg-emerald-500"
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                  />
                )}
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <div className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${phase !== 'idle' ? 'border-amber-500/50 bg-amber-500/8 text-amber-400' : 'border-white/10 text-white'}`}>
                FPO Wallet (2% commission)
              </div>
            </div>
            <div className="relative h-10 mb-4">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                {farmers.slice(0, 8).map((_, i) => {
                  const n = Math.min(farmers.length, 8)
                  const x = n > 1 ? 8 + (i * 84 / (n - 1)) : 50
                  return (
                    <line
                      key={i}
                      x1="50%" y1="0%" x2={`${x}%`} y2="100%"
                      stroke={phase !== 'idle' ? '#10B981' : 'rgba(255,255,255,0.06)'}
                      strokeWidth={phase !== 'idle' ? '1.5' : '1'}
                    />
                  )
                })}
              </svg>
            </div>
            <div className="flex justify-between px-2">
              {farmers.slice(0, 8).map((f, i) => (
                <div key={i} className={`flex flex-col items-center gap-1 transition-all duration-300 ${phase !== 'idle' ? '' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${phase !== 'idle' ? 'bg-emerald-500/15 border-emerald-500/40' : 'bg-white/[0.04] border-white/10'}`}>
                    <ArrowDown className={`w-3 h-3 ${phase !== 'idle' ? 'text-emerald-400' : 'text-gray-600'}`} />
                  </div>
                  <span className="text-[10px] text-gray-600 truncate max-w-14 text-center">{f.farmer_name.split(' ')[0]}</span>
                </div>
              ))}
              {farmers.length > 8 && (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full border bg-white/[0.04] border-white/10 flex items-center justify-center">
                    <span className="text-[10px] text-gray-600">+{farmers.length - 8}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Farmer table */}
      {selectedId && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] flex-wrap gap-y-2">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search farmer…"
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/40"
              />
            </div>
            <span className="text-xs text-gray-600 ml-auto">
              {farmersLoading ? 'Loading…' : `${filtered.length} farmers`}
            </span>
            {estimated && (
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Amounts estimated
              </span>
            )}
          </div>

          {farmersLoading ? (
            <div className="flex items-center justify-center py-10 gap-3 text-gray-500">
              <div className="w-4 h-4 rounded-full border-2 border-gray-600 border-t-emerald-400 animate-spin" />
              Loading farmers…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-600 text-sm">No farmers found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['#', 'Farmer', 'Qty', 'Share', 'Amount', 'UPI', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f, idx) => {
                    const isPaid = f.payment_status === 'PAID' || paidRows.has(idx)
                    return (
                      <motion.tr
                        key={f.id || idx}
                        className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"
                      >
                        <td className="px-4 py-3.5">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-emerald-500">{idx + 1}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-white">{f.farmer_name}</p>
                          <p className="text-xs text-gray-600 font-mono">{f.farmer_id.slice(0, 8)}…</p>
                        </td>
                        <td className="px-4 py-3.5 text-gray-400">{Math.round(Number(f.quantity_q))}q</td>
                        <td className="px-4 py-3.5 text-gray-500">{Number(f.share_pct).toFixed(1)}%</td>
                        <td className="px-4 py-3.5 font-bold text-emerald-400">{fmt(Number(f.net_amount))}</td>
                        <td className="px-4 py-3.5 text-gray-600 font-mono text-xs">
                          {f.upi_id ? `${f.upi_id.slice(0, 6)}…` : '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <AnimatePresence mode="wait">
                            {isPaid ? (
                              <motion.span
                                key="paid"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-500/12 text-emerald-400 border border-emerald-500/25 font-medium"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Paid
                              </motion.span>
                            ) : (
                              <motion.span
                                key="pending"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 font-medium"
                              >
                                <Clock className="w-3 h-3" /> Pending
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Done banner */}
      <AnimatePresence>
        {phase === 'done' && selectedDispatch && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/[0.08]"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                All {farmers.length} farmers paid {fmt(totalRevenue * 0.98)} for {selectedCrop}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Distributed via UPI — recorded in the Audit Ledger
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
