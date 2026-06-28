'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

const data = [
  { month: 'Jan', revenue: 82, target: 75 },
  { month: 'Feb', revenue: 95, target: 85 },
  { month: 'Mar', revenue: 110, target: 95 },
  { month: 'Apr', revenue: 128, target: 110 },
  { month: 'May', revenue: 155, target: 130 },
  { month: 'Jun', revenue: 180, target: 150 },
]

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number; dataKey: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#111] border border-emerald-500/15 rounded-xl px-4 py-3 shadow-xl shadow-black/50">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className={`text-sm font-semibold ${p.dataKey === 'revenue' ? 'text-emerald-400' : 'text-gray-500'}`}>
          {p.dataKey === 'revenue' ? 'Revenue' : 'Target'}: ₹{p.value}L
        </p>
      ))}
    </div>
  )
}

export function RevenueChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-xl border border-emerald-500/10 p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-white">Revenue Trend</h3>
          <p className="text-xs text-gray-500 mt-0.5">Last 6 months • in Lakhs (₹)</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <TrendingUp className="w-3 h-3" />
          <span>+119% YoY</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-gray-500">Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
          <span className="text-xs text-gray-500">Target</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.06)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${v}L`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="target"
            stroke="#374151"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="none"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#10B981"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={{ fill: '#10B981', r: 4, strokeWidth: 0 }}
            activeDot={{ fill: '#10B981', r: 6, strokeWidth: 2, stroke: 'rgba(16,185,129,0.3)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
