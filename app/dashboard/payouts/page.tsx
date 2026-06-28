'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Banknote, Search, CheckCircle2, Clock, Users,
  IndianRupee, TrendingUp, ArrowDown, Zap, ChevronDown,
} from 'lucide-react'

// Past completed dispatches with farmers and their crops
const COMPLETED_DISPATCHES = [
  {
    id: 'KA-01-AB-1234',
    crop: 'Wheat',
    mandi: 'Karnal',
    date: '2024-01-15',
    total: 18_72_550,
    farmers: [
      { name: 'Ramesh Kumar', village: 'Karnal', qty: 8, upi: 'ram****@upi', amount: 17601 },
      { name: 'Priya Devi', village: 'Ambala', qty: 12, upi: 'pri****@upi', amount: 26402 },
      { name: 'Suresh Patel', village: 'Panipat', qty: 15, upi: 'sur****@upi', amount: 32950 },
      { name: 'Kavitha Rao', village: 'Rohtak', qty: 10, upi: 'kav****@upi', amount: 22001 },
      { name: 'Mohan Singh', village: 'Hisar', qty: 18, upi: 'moh****@upi', amount: 39601 },
    ],
  },
  {
    id: 'KA-02-CD-5678',
    crop: 'Rice',
    mandi: 'Panipat',
    date: '2024-01-16',
    total: 9_45_200,
    farmers: [
      { name: 'Anita Kumari', village: 'Kaithal', qty: 6, upi: 'ani****@upi', amount: 13201 },
      { name: 'Vikram Yadav', village: 'Jind', qty: 31, upi: 'vik****@upi', amount: 68400 },
      { name: 'Sunita Devi', village: 'Fatehabad', qty: 9, upi: 'sun****@upi', amount: 19800 },
      { name: 'Ravi Shankar', village: 'Sirsa', qty: 14, upi: 'rav****@upi', amount: 30800 },
      { name: 'Meena Gupta', village: 'Narwana', qty: 7, upi: 'mee****@upi', amount: 15401 },
    ],
  },
  {
    id: 'KA-03-EF-9012',
    crop: 'Tomato',
    mandi: 'Hubli',
    date: '2024-01-17',
    total: 5_60_800,
    farmers: [
      { name: 'Rajesh Kumar', village: 'Hassan', qty: 20, upi: 'raj****@upi', amount: 28000 },
      { name: 'Lakshmi Amma', village: 'Tumkur', qty: 25, upi: 'lak****@upi', amount: 35000 },
      { name: 'Gopal Singh', village: 'Belgaum', qty: 18, upi: 'gop****@upi', amount: 25200 },
      { name: 'Savitri Devi', village: 'Davangere', qty: 22, upi: 'sav****@upi', amount: 30800 },
      { name: 'Prakash Rao', village: 'Shimoga', qty: 16, upi: 'pra****@upi', amount: 22400 },
    ],
  },
]

// Unique crops and mandis from completed dispatches
const AVAILABLE_CROPS = [...new Set(COMPLETED_DISPATCHES.map(d => d.crop))].sort()
const AVAILABLE_MANDIS = [...new Set(COMPLETED_DISPATCHES.map(d => d.mandi))].sort()
const AVAILABLE_DATES = [...new Set(COMPLETED_DISPATCHES.map(d => d.date))].sort()

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

export default function PayoutsPage() {
  const [selectedCrop, setSelectedCrop] = useState(AVAILABLE_CROPS[0] || '')
  const [selectedMandi, setSelectedMandi] = useState(AVAILABLE_MANDIS[0] || '')
  const [selectedDate, setSelectedDate] = useState(AVAILABLE_DATES[0] || '')
  const [search, setSearch] = useState('')
  const [phase, setPhase] = useState<'idle' | 'fetched' | 'processing' | 'done'>('idle')
  const [paidCount, setPaidCount] = useState(0)
  const [paidRows, setPaidRows] = useState<Set<number>>(new Set())
  const [showConfetti, setShowConfetti] = useState(false)
  const [flowActive, setFlowActive] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Get available mandis for selected crop
  const availableMandisForCrop = [...new Set(
    COMPLETED_DISPATCHES
      .filter(d => d.crop === selectedCrop)
      .map(d => d.mandi)
  )].sort()

  // Get available dates for selected crop and mandi
  const availableDatesForSelection = [...new Set(
    COMPLETED_DISPATCHES
      .filter(d => d.crop === selectedCrop && d.mandi === selectedMandi)
      .map(d => d.date)
  )].sort()

  // Get selected dispatch data
  const selectedDispatch = COMPLETED_DISPATCHES.find(d =>
    d.crop === selectedCrop && d.mandi === selectedMandi && d.date === selectedDate
  )

  const farmers = selectedDispatch?.farmers || []
  const totalAmount = selectedDispatch?.total || 0
  const totalFarmers = farmers.length

  const filtered = farmers.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.village.toLowerCase().includes(search.toLowerCase())
  )

  // Update mandi if current one is not available
  useEffect(() => {
    if (availableMandisForCrop.length > 0 && !availableMandisForCrop.includes(selectedMandi)) {
      setSelectedMandi(availableMandisForCrop[0])
    }
  }, [selectedCrop, availableMandisForCrop, selectedMandi])

  // Update date if current one is not available
  useEffect(() => {
    if (availableDatesForSelection.length > 0 && !availableDatesForSelection.includes(selectedDate)) {
      setSelectedDate(availableDatesForSelection[0])
    }
  }, [selectedMandi, availableDatesForSelection, selectedDate])

  function handleGo() {
    setPhase('fetched')
  }

  function handlePay() {
    setPhase('processing')
    setFlowActive(true)
    setPaidCount(0)
    setPaidRows(new Set())

    let count = 0
    let rowIndex = 0

    // Tick paidCount rapidly
    intervalRef.current = setInterval(() => {
      count += Math.floor(Math.random() * Math.max(1, Math.ceil(totalFarmers / 5)))
      if (count >= totalFarmers) {
        count = totalFarmers
        clearInterval(intervalRef.current!)
        setPhase('done')
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 4000)
      }
      setPaidCount(count)
    }, 60)

    // Animate rows one by one
    const rowInterval = setInterval(() => {
      if (rowIndex >= filtered.length) { clearInterval(rowInterval); return }
      setPaidRows(prev => new Set([...prev, rowIndex]))
      rowIndex++
    }, 220)
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  return (
    <div className="p-6 space-y-6 min-h-full relative">
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
                initial={{ y: -20, opacity: 1, rotate: 0, scale: 1 }}
                animate={{ y: window.innerHeight + 40, opacity: 0, rotate: Math.random() * 720 - 360, scale: 0.3 }}
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
            <Banknote className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Farmer Payout Distribution</h2>
            <p className="text-xs text-gray-500 mt-0.5">Distribute sale proceeds to 825 farmers instantly</p>
          </div>
        </div>
        {phase === 'processing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-4 py-2 rounded-full"
          >
            <Zap className="w-4 h-4 animate-pulse" fill="currentColor" />
            Paid {paidCount.toLocaleString('en-IN')}/{totalFarmers}
          </motion.div>
        )}
        {phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-sm font-semibold text-emerald-400"
          >
            <CheckCircle2 className="w-4.5 h-4.5" />
            All 825 farmers paid in 0.3 seconds
          </motion.div>
        )}
      </div>

      {/* Filter controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl border border-emerald-500/10 p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Crop Dropdown */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Select Crop</label>
            <div className="relative">
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full appearance-none bg-white/[0.04] border border-emerald-500/25 rounded-lg px-4 py-2.5 text-white text-sm font-medium focus:outline-none focus:border-emerald-500/60 transition-colors"
              >
                {AVAILABLE_CROPS.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
            </div>
          </div>

          {/* Mandi Dropdown */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Select Mandi</label>
            <div className="relative">
              <select
                value={selectedMandi}
                onChange={(e) => setSelectedMandi(e.target.value)}
                className="w-full appearance-none bg-white/[0.04] border border-emerald-500/25 rounded-lg px-4 py-2.5 text-white text-sm font-medium focus:outline-none focus:border-emerald-500/60 transition-colors"
              >
                {availableMandisForCrop.map(mandi => (
                  <option key={mandi} value={mandi}>{mandi}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
            </div>
          </div>

          {/* Date Dropdown */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Select Date</label>
            <div className="relative">
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full appearance-none bg-white/[0.04] border border-emerald-500/25 rounded-lg px-4 py-2.5 text-white text-sm font-medium focus:outline-none focus:border-emerald-500/60 transition-colors"
              >
                {availableDatesForSelection.map(date => (
                  <option key={date} value={date}>{new Date(date).toLocaleDateString('en-IN')}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Go and Pay Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGo}
            disabled={phase === 'processing' || phase === 'fetched'}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/25"
          >
            {phase === 'fetched' ? 'Fetched ✓' : 'Go'}
          </motion.button>

          {phase === 'fetched' && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePay}
              disabled={phase === 'processing'}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 text-[#0A0A0A] font-bold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/25"
            >
              {phase === 'processing' ? 'Processing...' : 'Pay'}
            </motion.button>
          )}

          {phase === 'done' && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setPhase('idle')}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#0A0A0A] font-bold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/25"
            >
              Process More
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Sale details summary */}
      {selectedDispatch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: 'Total Amount', value: fmt(totalAmount), color: 'text-emerald-400' },
            { label: 'Farmers', value: totalFarmers.toString(), color: 'text-white' },
            { label: 'Per Farmer Avg', value: fmt(Math.round(totalAmount / Math.max(1, totalFarmers))), color: 'text-white' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass rounded-xl border border-emerald-500/10 px-4 py-3">
              <p className="text-xs text-gray-600 mb-0.5">{label}</p>
              <p className={`text-sm font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Money flow animation */}
      {selectedDispatch && farmers.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl border border-emerald-500/10 p-6 overflow-hidden"
        >
          <h3 className="text-sm font-semibold text-white mb-5">Money Flow - {selectedCrop} Distribution</h3>
          <div className="relative">
            {/* Top node — Sale Revenue */}
            <div className="flex justify-center mb-4">
              <div className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all duration-500 ${flowActive ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.25)]' : 'border-white/10 bg-white/[0.03] text-white'}`}>
                {fmt(totalAmount)} Sale Revenue
              </div>
            </div>

            {/* Vertical line down to FPO Wallet */}
            <div className="flex justify-center mb-0">
              <div className="relative w-0.5 h-8 bg-white/[0.08] overflow-hidden rounded-full">
                {flowActive && (
                  <motion.div
                    className="absolute inset-x-0 top-0 h-3 rounded-full bg-emerald-500"
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                  />
                )}
              </div>
            </div>

            {/* FPO Wallet */}
            <div className="flex justify-center mb-4">
              <div className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all duration-500 ${flowActive ? 'border-amber-500/50 bg-amber-500/8 text-amber-400' : 'border-white/10 bg-white/[0.03] text-white'}`}>
                FPO Wallet
              </div>
            </div>

            {/* Fan-out lines to farmers */}
            <div className="relative h-10 mb-4">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                {farmers.slice(0, 8).map((farmer, i) => {
                  const x = 8 + (i * 84 / Math.min(farmers.length - 1, 7))
                  return (
                    <motion.line
                      key={i}
                      x1="50%"
                      y1="0%"
                      x2={`${x}%`}
                      y2="100%"
                      stroke={flowActive ? '#10B981' : 'rgba(255,255,255,0.06)'}
                      strokeWidth={flowActive ? '1.5' : '1'}
                      strokeDasharray={flowActive ? '4 3' : '0'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, strokeDashoffset: flowActive ? [0, -28] : 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3, strokeDashoffset: { duration: 0.8, repeat: Infinity, ease: 'linear' } }}
                    />
                  )
                })}
              </svg>
            </div>

            {/* Farmer nodes */}
            <div className="flex justify-between px-2">
              {farmers.slice(0, 8).map((farmer, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.5, scale: 0.9 }}
                  animate={flowActive ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className={`flex flex-col items-center gap-1 transition-all duration-300 ${flowActive ? '' : 'opacity-40'}`}
                >
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-500 ${flowActive ? 'bg-emerald-500/15 border-emerald-500/40' : 'bg-white/[0.04] border-white/10'}`}>
                    <ArrowDown className={`w-3 h-3 ${flowActive ? 'text-emerald-400' : 'text-gray-600'}`} />
                  </div>
                  <span className="text-[10px] text-gray-600 truncate max-w-14 text-center">{farmer.name.split(' ')[0]}</span>
                </motion.div>
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
        </motion.div>
      )}

      {/* Farmer table */}
      {selectedDispatch && farmers.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl border border-emerald-500/10 overflow-hidden"
        >
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
            <div className="relative flex-1 max-w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search farmer or village..."
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/40 transition-colors duration-200"
              />
            </div>
            <span className="text-xs text-gray-600 ml-auto">{filtered.length} farmers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Farmer Name', 'Village', 'Quintals', 'Share %', 'Amount', 'UPI', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, idx) => {
                const isPaid = phase === 'done' || paidRows.has(idx)
                return (
                  <motion.tr
                    key={`farmer-${idx}-${f.name}`}
                    layout
                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors duration-150"
                  >
                    <td className="px-4 py-3.5 font-medium text-gray-200">{f.name}</td>
                    <td className="px-4 py-3.5 text-gray-500">{f.village}</td>
                    <td className="px-4 py-3.5 text-gray-400">{f.qty}q</td>
                    <td className="px-4 py-3.5 text-gray-500">{f.share}%</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-400">{fmt(f.amount)}</td>
                    <td className="px-4 py-3.5 text-gray-600 font-mono text-xs">{f.upi}</td>
                    <td className="px-4 py-3.5">
                      <AnimatePresence mode="wait">
                        {isPaid ? (
                          <motion.span
                            key="paid"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-500/12 text-emerald-400 border border-emerald-500/25 font-medium"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Paid
                          </motion.span>
                        ) : (
                          <motion.span
                            key="pending"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 font-medium"
                          >
                            <Clock className="w-3 h-3" />
                            Pending
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
        </motion.div>
      )}

      {/* Summary cards */}
      {selectedDispatch && farmers.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Total Farmers Paid', value: phase === 'done' ? totalFarmers.toLocaleString('en-IN') : (paidCount > 0 ? paidCount.toLocaleString('en-IN') : totalFarmers), icon: Users, color: 'text-emerald-400' },
            { label: 'Total Amount', value: fmt(totalAmount), icon: IndianRupee, color: 'text-emerald-400' },
            { label: 'Average Per Farmer', value: fmt(Math.round(totalAmount / Math.max(1, totalFarmers))), icon: TrendingUp, color: 'text-white' },
            { label: 'Largest Payout', value: fmt(Math.max(...farmers.map(f => f.amount))), icon: Banknote, color: 'text-amber-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass rounded-xl border border-emerald-500/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5 text-gray-600" />
                <p className="text-xs text-gray-600">{label}</p>
              </div>
              <p className={`text-lg font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Done banner */}
      <AnimatePresence>
        {phase === 'done' && selectedDispatch && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/8 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">All {totalFarmers} farmers paid {fmt(totalAmount)} for {selectedCrop} in 0.3 seconds</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {fmt(TOTAL)} distributed via UPI instantly &mdash; every transaction recorded in the Audit Ledger
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
