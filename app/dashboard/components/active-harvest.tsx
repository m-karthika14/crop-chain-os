'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wheat, CheckCircle2, Clock, Plus, X } from 'lucide-react'
import { FloralCard } from '@/components/floral-card'

const initialHarvests = [
  { id: 1, farmer: 'Ramesh Kumar', crop: 'Wheat', quintals: 8, status: 'Collected' as const },
  { id: 2, farmer: 'Priya Devi', crop: 'Wheat', quintals: 12, status: 'Collected' as const },
  { id: 3, farmer: 'Suresh Patel', crop: 'Wheat', quintals: 15, status: 'Pending' as const },
  { id: 4, farmer: 'Anita Sharma', crop: 'Soybean', quintals: 10, status: 'Collected' as const },
  { id: 5, farmer: 'Mohan Das', crop: 'Rice', quintals: 20, status: 'Pending' as const },
]

type Status = 'Collected' | 'Pending'

interface Harvest {
  id: number
  farmer: string
  crop: string
  quintals: number
  status: Status
}

export function ActiveHarvest() {
  const [harvests, setHarvests] = useState<Harvest[]>(initialHarvests)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ farmer: '', crop: 'Wheat', quintals: '', status: 'Pending' as Status })

  const crops = ['Wheat', 'Rice', 'Tomato', 'Onion', 'Soybean', 'Maize', 'Cotton']

  function handleAdd() {
    if (!form.farmer || !form.quintals) return
    setHarvests(prev => [
      ...prev,
      { id: Date.now(), farmer: form.farmer, crop: form.crop, quintals: Number(form.quintals), status: form.status },
    ])
    setForm({ farmer: '', crop: 'Wheat', quintals: '', status: 'Pending' })
    setShowForm(false)
  }

  const totalQ = harvests.reduce((s, h) => s + h.quintals, 0)
  const collected = harvests.filter(h => h.status === 'Collected').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <FloralCard showBottomFlower>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-500/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Wheat className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Active Harvest</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {collected}/{harvests.length} collected &middot; {totalQ} Q total
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0A] font-semibold text-xs px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-[1.03]"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Harvest
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-emerald-500/10"
          >
            <div className="px-5 py-4 grid grid-cols-2 gap-3 bg-emerald-500/[0.03]">
              <input
                className="col-span-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-emerald-500/40 transition-colors"
                placeholder="Farmer Name"
                value={form.farmer}
                onChange={e => setForm(f => ({ ...f, farmer: e.target.value }))}
              />
              <select
                className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40 transition-colors"
                value={form.crop}
                onChange={e => setForm(f => ({ ...f, crop: e.target.value }))}
              >
                {crops.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
              </select>
              <input
                type="number"
                className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-emerald-500/40 transition-colors"
                placeholder="Quintals"
                value={form.quintals}
                onChange={e => setForm(f => ({ ...f, quintals: e.target.value }))}
              />
              <select
                className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/40 transition-colors"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))}
              >
                <option value="Pending" className="bg-[#111]">Pending</option>
                <option value="Collected" className="bg-[#111]">Collected</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0A] font-semibold text-xs py-2 rounded-lg transition-all duration-200"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-3 py-2 rounded-lg border border-white/10 text-gray-500 hover:text-white text-xs transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-emerald-500/10">
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Farmer</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Crop</th>
              <th className="text-center px-5 py-3 text-gray-500 font-medium">Q</th>
              <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {harvests.map((h, i) => (
              <tr key={h.id} className="border-b border-emerald-500/5 hover:bg-emerald-500/5 transition-colors">
                <td className="px-5 py-3 text-white font-medium">{h.farmer}</td>
                <td className="px-5 py-3 text-gray-400">{h.crop}</td>
                <td className="px-5 py-3 text-center text-white">{h.quintals}q</td>
                <td className="px-5 py-3">
                  <span className={`flex items-center gap-1.5 text-xs w-fit ${h.status === 'Collected' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {h.status === 'Collected' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {h.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </FloralCard>
    </motion.div>
  )
}
