'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wheat,
  Search,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
  TrendingUp,
} from 'lucide-react'
import { ManagerPendingRequests } from '@/app/components/manager-pending-requests'

// ─── Data ─────────────────────────────────────────────────────────────────────

const FARMER_SUGGESTIONS = [
  { id: 1,  name: 'Ramesh Kumar',   village: 'Karnal',   upi: 'ram***@upi' },
  { id: 2,  name: 'Priya Devi',     village: 'Ambala',   upi: 'pri***@upi' },
  { id: 3,  name: 'Suresh Patel',   village: 'Panipat',  upi: 'sur***@upi' },
  { id: 4,  name: 'Anita Sharma',   village: 'Rohtak',   upi: 'ani***@upi' },
  { id: 5,  name: 'Mohan Das',      village: 'Sonipat',  upi: 'moh***@upi' },
  { id: 6,  name: 'Kavita Singh',   village: 'Kurukshetra', upi: 'kav***@upi' },
  { id: 7,  name: 'Dinesh Yadav',   village: 'Jind',     upi: 'din***@upi' },
  { id: 8,  name: 'Leela Bai',      village: 'Kaithal',  upi: 'lee***@upi' },
  { id: 9,  name: 'Vinod Kumar',    village: 'Fatehabad', upi: 'vin***@upi' },
  { id: 10, name: 'Sunita Verma',   village: 'Hisar',    upi: 'sun***@upi' },
]

const CROPS = ['Wheat', 'Rice', 'Tomato', 'Onion', 'Potato', 'Maize'] as const
type Crop = typeof CROPS[number]
type Grade = 'A' | 'B' | 'C'

interface HarvestRow {
  id: number
  farmer: string
  village: string
  crop: Crop
  qty: number
  grade: Grade
  time: string
  isNew?: boolean
}

const SEED_ROWS: HarvestRow[] = [
  { id: 1,  farmer: 'Ramesh Kumar', village: 'Karnal',   crop: 'Wheat',  qty: 8,  grade: 'A', time: '08:12' },
  { id: 2,  farmer: 'Priya Devi',   village: 'Ambala',   crop: 'Wheat',  qty: 12, grade: 'A', time: '08:15' },
  { id: 3,  farmer: 'Suresh Patel', village: 'Panipat',  crop: 'Wheat',  qty: 15, grade: 'B', time: '08:18' },
  { id: 4,  farmer: 'Anita Sharma', village: 'Rohtak',   crop: 'Rice',   qty: 10, grade: 'A', time: '08:22' },
  { id: 5,  farmer: 'Mohan Das',    village: 'Sonipat',  crop: 'Rice',   qty: 18, grade: 'B', time: '08:27' },
  { id: 6,  farmer: 'Kavita Singh', village: 'Kurukshetra', crop: 'Wheat', qty: 9, grade: 'A', time: '08:31' },
  { id: 7,  farmer: 'Dinesh Yadav', village: 'Jind',     crop: 'Maize',  qty: 22, grade: 'B', time: '08:35' },
  { id: 8,  farmer: 'Leela Bai',    village: 'Kaithal',  crop: 'Wheat',  qty: 7,  grade: 'C', time: '08:40' },
  { id: 9,  farmer: 'Vinod Kumar',  village: 'Fatehabad', crop: 'Rice',  qty: 14, grade: 'A', time: '08:45' },
  { id: 10, farmer: 'Sunita Verma', village: 'Hisar',    crop: 'Wheat',  qty: 11, grade: 'B', time: '08:50' },
]

function nowTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const GRADE_COLORS: Record<Grade, string> = {
  A: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  B: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  C: 'bg-red-500/15 text-red-400 border-red-500/30',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HarvestsPage() {
  const [rows, setRows]       = useState<HarvestRow[]>(SEED_ROWS)
  const [displayQty, setDisplayQty] = useState(850) // animated counter

  // form state
  const [farmerQuery, setFarmerQuery] = useState('')
  const [selectedFarmer, setSelectedFarmer] = useState<typeof FARMER_SUGGESTIONS[0] | null>(null)
  const [dropdownOpen, setDropdownOpen]       = useState(false)
  const [crop, setCrop]         = useState<Crop>('Wheat')
  const [cropOpen, setCropOpen] = useState(false)
  const [qty, setQty]           = useState('')
  const [grade, setGrade]       = useState<Grade>('A')
  const [notes, setNotes]       = useState('')

  const searchRef  = useRef<HTMLDivElement>(null)
  const cropRef    = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setDropdownOpen(false)
      if (cropRef.current && !cropRef.current.contains(e.target as Node)) setCropOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const filteredFarmers = FARMER_SUGGESTIONS.filter(
    f => f.name.toLowerCase().includes(farmerQuery.toLowerCase()) && farmerQuery.length > 0
  )

  // Animated counter whenever rows change
  useEffect(() => {
    const target = rows.reduce((s, r) => s + r.qty, 0)
    const diff = target - displayQty
    if (diff === 0) return
    const steps = 20
    const step = diff / steps
    let i = 0
    const t = setInterval(() => {
      i++
      setDisplayQty(prev => (i >= steps ? target : Math.round(prev + step)))
      if (i >= steps) clearInterval(t)
    }, 20)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  function handleAdd() {
    if (!selectedFarmer || !qty || Number(qty) <= 0) return
    const newRow: HarvestRow = {
      id: Date.now(),
      farmer:  selectedFarmer.name,
      village: selectedFarmer.village,
      crop,
      qty:     Number(qty),
      grade,
      time:    nowTime(),
      isNew:   true,
    }
    setRows(prev => [newRow, ...prev])
    // reset form
    setFarmerQuery(''); setSelectedFarmer(null)
    setQty(''); setGrade('A'); setNotes('')
  }

  function handleDelete(id: number) {
    setRows(prev => prev.filter(r => r.id !== id))
  }

  // Summary
  const totalFarmers  = rows.length
  const totalQty      = rows.reduce((s, r) => s + r.qty, 0)
  const wheatQty      = rows.filter(r => r.crop === 'Wheat').reduce((s, r) => s + r.qty, 0)
  const riceQty       = rows.filter(r => r.crop === 'Rice').reduce((s, r) => s + r.qty, 0)

  return (
    <div className="flex flex-col min-h-full pb-24">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <Wheat className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Harvest Collection</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">Record farmer contributions for this season</p>
        </div>
        {/* Live total badge */}
        <motion.div
          key={displayQty}
          className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2"
        >
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-amber-400">
            {displayQty} Quintals Collected
          </span>
        </motion.div>
      </div>

      <div className="px-6 space-y-5">
        {/* ── Pending Requests ──────────────────────────────────────────────── */}
        <div>
          <ManagerPendingRequests />
        </div>

        {/* ── Add Harvest Form ──────────────────────────────────────────────── */}
        <div className="glass rounded-xl border border-emerald-500/10 p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            Add Harvest Entry
          </h3>

          <div className="space-y-3">
            {/* Row 1 — Farmer autocomplete */}
            <div ref={searchRef} className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                <input
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-emerald-500/50 transition-colors duration-200"
                  placeholder="Search farmer by name…"
                  value={selectedFarmer ? selectedFarmer.name : farmerQuery}
                  onChange={e => {
                    setFarmerQuery(e.target.value)
                    setSelectedFarmer(null)
                    setDropdownOpen(true)
                  }}
                  onFocus={() => farmerQuery.length > 0 && setDropdownOpen(true)}
                />
                {selectedFarmer && (
                  <button
                    onClick={() => { setSelectedFarmer(null); setFarmerQuery('') }}
                    className="absolute right-3 text-gray-600 hover:text-gray-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {/* Autocomplete dropdown */}
              <AnimatePresence>
                {dropdownOpen && filteredFarmers.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-30 top-full mt-1 w-full bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-xl shadow-black/40"
                  >
                    {filteredFarmers.map(f => (
                      <li key={f.id}>
                        <button
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-emerald-500/10 transition-colors duration-150 text-left"
                          onClick={() => {
                            setSelectedFarmer(f)
                            setFarmerQuery(f.name)
                            setDropdownOpen(false)
                          }}
                        >
                          <span className="text-sm text-white font-medium">{f.name}</span>
                          <span className="text-xs text-gray-500">
                            Village: {f.village} &nbsp;|&nbsp; UPI: {f.upi}
                          </span>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
              {/* Selected farmer detail chip */}
              <AnimatePresence>
                {selectedFarmer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 flex items-center gap-3 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-lg px-3 py-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
                        {selectedFarmer.name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{selectedFarmer.name}</p>
                        <p className="text-[11px] text-gray-500">Village: {selectedFarmer.village} &nbsp;·&nbsp; UPI: {selectedFarmer.upi}</p>
                      </div>
                      <CheckCircle2 className="ml-auto w-4 h-4 text-emerald-400" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Row 2 — Crop dropdown */}
            <div ref={cropRef} className="relative">
              <button
                onClick={() => setCropOpen(v => !v)}
                className="w-full flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white outline-none hover:border-emerald-500/40 transition-colors duration-200"
              >
                <span>{crop}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${cropOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {cropOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-30 top-full mt-1 w-full bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-xl shadow-black/40"
                  >
                    {CROPS.map(c => (
                      <li key={c}>
                        <button
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                            crop === c
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-gray-300 hover:bg-white/[0.04]'
                          }`}
                          onClick={() => { setCrop(c); setCropOpen(false) }}
                        >
                          {c}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Row 3 — Quantity */}
            <input
              type="number"
              min={1}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-emerald-500/50 transition-colors duration-200"
              placeholder="Quantity (quintals)"
              value={qty}
              onChange={e => setQty(e.target.value)}
            />

            {/* Row 4 — Quality grade toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 shrink-0">Quality Grade:</span>
              <div className="flex gap-2">
                {(['A', 'B', 'C'] as Grade[]).map(g => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={`w-9 h-9 rounded-lg border font-bold text-sm transition-all duration-150 ${
                      grade === g
                        ? GRADE_COLORS[g] + ' border'
                        : 'bg-white/[0.03] border-white/10 text-gray-500 hover:text-gray-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-600 ml-1">
                {grade === 'A' ? 'Premium quality' : grade === 'B' ? 'Standard quality' : 'Below standard'}
              </span>
            </div>

            {/* Row 5 — Notes */}
            <input
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-emerald-500/50 transition-colors duration-200"
              placeholder="Notes (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />

            {/* Submit */}
            <button
              onClick={handleAdd}
              disabled={!selectedFarmer || !qty || Number(qty) <= 0}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0A0A] font-bold text-sm py-3 rounded-xl transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:shadow-emerald-500/25"
            >
              <Plus className="w-4 h-4" />
              Add to Harvest
            </button>
          </div>
        </div>

        {/* ── Harvest Table ─────────────────────────────────────────────────── */}
        <div className="glass rounded-xl border border-emerald-500/10 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-500/10">
            <div>
              <h3 className="text-sm font-semibold text-white">Harvest Records</h3>
              <p className="text-xs text-gray-500 mt-0.5">{rows.length} entries &middot; {totalQty} quintals total</p>
            </div>
            <span className="text-xs text-gray-600 bg-white/[0.03] border border-white/[0.06] px-3 py-1 rounded-full">
              Kharif 2025
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {['#', 'Farmer', 'Village', 'Crop', 'Qty', 'Grade', 'Time', 'Action'].map(h => (
                    <th
                      key={h}
                      className={`text-gray-600 font-medium px-4 py-3 whitespace-nowrap ${
                        h === '#' || h === 'Qty' || h === 'Time' ? 'text-center' :
                        h === 'Action' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {rows.map((row, idx) => (
                    <motion.tr
                      key={row.id}
                      initial={row.isNew ? { opacity: 0, y: -16, backgroundColor: 'rgba(16,185,129,0.12)' } : { opacity: 1, y: 0 }}
                      animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(16,185,129,0)' }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: row.isNew ? 0.4 : 0.2 }}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-emerald-500/[0.025] transition-colors duration-150 group"
                    >
                      <td className="px-4 py-3 text-center text-gray-600 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3 text-gray-100 font-semibold whitespace-nowrap">{row.farmer}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{row.village}</td>
                      <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{row.crop}</td>
                      <td className="px-4 py-3 text-center text-white font-bold">{row.qty}q</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block border rounded-md px-2 py-0.5 font-bold text-xs ${GRADE_COLORS[row.grade]}`}>
                          {row.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500 font-mono">{row.time}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <button
                            aria-label="Edit"
                            className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all duration-150"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            aria-label="Delete"
                            onClick={() => handleDelete(row.id)}
                            className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-all duration-150"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Sticky Summary Bar ────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
        <div className="ml-56 pointer-events-auto">
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4, type: 'spring', stiffness: 200, damping: 22 }}
            className="mx-6 mb-4 flex items-center gap-4 bg-[#0F0F0F]/90 backdrop-blur-xl border border-emerald-500/20 rounded-2xl px-5 py-3.5 shadow-2xl shadow-black/60"
          >
            {/* Stats */}
            <div className="flex items-center gap-6 flex-1 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Total Farmers</span>
                <span className="text-sm font-bold text-white">{totalFarmers}</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Total Quintals</span>
                <motion.span key={totalQty} className="text-sm font-bold text-emerald-400">
                  {totalQty}q
                </motion.span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-gray-500">Crops:</span>
                {wheatQty > 0 && (
                  <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                    Wheat {wheatQty}q
                  </span>
                )}
                {riceQty > 0 && (
                  <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    Rice {riceQty}q
                  </span>
                )}
                {rows.filter(r => r.crop !== 'Wheat' && r.crop !== 'Rice').length > 0 && (
                  <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                    Other {rows.filter(r => r.crop !== 'Wheat' && r.crop !== 'Rice').reduce((s, r) => s + r.qty, 0)}q
                  </span>
                )}
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/dashboard/optimizer"
              className="shrink-0 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0A] font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/30 whitespace-nowrap"
            >
              Proceed to Optimizer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
