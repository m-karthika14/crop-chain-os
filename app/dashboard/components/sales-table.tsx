'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { FloralCard } from '@/components/floral-card'
import Link from 'next/link'

interface DispatchRow {
  id: string
  crop:           string
  total_quantity: number
  actual_revenue: number
  current_stage:  number
  mandi_name:     string
  mandi_state:    string
  sold_at:        string | null
}

const statusStyle: Record<string, string> = {
  Settled:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'In Transit': 'bg-blue-500/10  text-blue-400   border-blue-500/20',
  Pending:    'bg-amber-500/10 text-amber-400   border-amber-500/20',
}

function stageToStatus(stage: number): string {
  if (stage >= 4) return 'Settled'
  if (stage >= 2) return 'In Transit'
  return 'Pending'
}

function fmtRevenue(v: number): string {
  if (!v) return '—'
  const l = v / 100000
  return l >= 1 ? `₹${l.toFixed(1)}L` : `₹${Math.round(v / 1000)}K`
}

export function SalesTable() {
  const [rows, setRows] = useState<DispatchRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fpoId = localStorage.getItem('fpoId') || 'fpo-001'
    fetch(`/api/dispatches?fpoId=${fpoId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          // Show latest 6 dispatches that have been started
          const active = (data.dispatches as DispatchRow[])
            .filter(d => d.current_stage >= 1)
            .slice(0, 6)
          setRows(active)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <FloralCard>
        <div className="flex items-center justify-between px-5 py-4 border-b border-emerald-500/10">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Sales</h3>
            <p className="text-xs text-gray-500 mt-0.5">Latest mandi transactions</p>
          </div>
          <Link
            href="/dashboard/dispatches"
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
          >
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">📦</p>
              <p className="text-sm text-gray-500">No dispatches yet</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-emerald-500/5">
                  <th className="text-left text-gray-600 font-medium px-5 py-3">Mandi</th>
                  <th className="text-left text-gray-600 font-medium px-3 py-3">Crop</th>
                  <th className="text-right text-gray-600 font-medium px-3 py-3">Qty</th>
                  <th className="text-right text-gray-600 font-medium px-3 py-3">Revenue</th>
                  <th className="text-center text-gray-600 font-medium px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const status = stageToStatus(row.current_stage)
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-emerald-500/5 last:border-0 hover:bg-emerald-500/[0.03] transition-colors duration-150"
                    >
                      <td className="px-5 py-3 text-gray-300 font-medium whitespace-nowrap">
                        {row.mandi_name}, {row.mandi_state}
                      </td>
                      <td className="px-3 py-3 text-gray-400">{row.crop}</td>
                      <td className="px-3 py-3 text-right text-gray-400">
                        {Math.round(row.total_quantity)}Q
                      </td>
                      <td className="px-3 py-3 text-right text-white font-semibold">
                        {fmtRevenue(row.actual_revenue)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyle[status]}`}>
                          {status}
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
