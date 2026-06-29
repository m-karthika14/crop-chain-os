'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Wheat, CheckCircle2, Clock, ExternalLink } from 'lucide-react'
import { FloralCard } from '@/components/floral-card'
import Link from 'next/link'

interface HarvestRow {
  id: string
  farmer_name:   string
  farmer_village: string
  crop_type:     string
  quantity_final: number
  quantity_estimated: number
  status:        string
}

function statusDisplay(s: string): { label: string; active: boolean } {
  const u = s?.toUpperCase() ?? ''
  if (u === 'APPROVED' || u === 'DISPATCHED' || u === 'SOLD')
    return { label: 'Collected', active: true }
  return { label: 'Pending', active: false }
}

export function ActiveHarvest() {
  const [harvests, setHarvests] = useState<HarvestRow[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const fpoId = localStorage.getItem('fpoId') || 'fpo-001'
    fetch(`/api/harvests?fpoId=${fpoId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          // Show latest 10, exclude sold/rejected
          const active = (data.harvests as HarvestRow[])
            .filter(h => !['SOLD', 'REJECTED'].includes(h.status?.toUpperCase() ?? ''))
            .slice(0, 10)
          setHarvests(active)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const totalQ    = harvests.reduce((s, h) => s + (h.quantity_final || h.quantity_estimated || 0), 0)
  const collected = harvests.filter(h => statusDisplay(h.status).active).length

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
                {loading ? 'Loading...' : `${collected}/${harvests.length} collected · ${Math.round(totalQ)} Q total`}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/harvests"
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0A] font-semibold text-xs px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-[1.03]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Manage
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              </div>
            </div>
          ) : harvests.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-2">🌾</p>
              <p className="text-sm text-gray-500">No active harvests yet</p>
              <Link href="/dashboard/harvests" className="text-xs text-emerald-400 hover:underline mt-1 inline-block">
                Add first harvest →
              </Link>
            </div>
          ) : (
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
                {harvests.map(h => {
                  const { label, active } = statusDisplay(h.status)
                  return (
                    <tr key={h.id} className="border-b border-emerald-500/5 hover:bg-emerald-500/5 transition-colors">
                      <td className="px-5 py-3 text-white font-medium">{h.farmer_name}</td>
                      <td className="px-5 py-3 text-gray-400">{h.crop_type}</td>
                      <td className="px-5 py-3 text-center text-white">
                        {Math.round(h.quantity_final || h.quantity_estimated || 0)}q
                      </td>
                      <td className="px-5 py-3">
                        <span className={`flex items-center gap-1.5 text-xs w-fit ${active ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </FloralCard>
    </motion.div>
  )
}
