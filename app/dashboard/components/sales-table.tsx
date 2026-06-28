'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { FloralCard } from '@/components/floral-card'

const sales = [
  { mandi: 'Azadpur Mandi, Delhi', crop: 'Wheat', qty: '120 Q', revenue: '₹2.8L', status: 'Settled' },
  { mandi: 'Vashi APMC, Mumbai', crop: 'Tomato', qty: '85 Q', revenue: '₹1.4L', status: 'Settled' },
  { mandi: 'Koyambedu, Chennai', crop: 'Onion', qty: '200 Q', revenue: '₹3.1L', status: 'In Transit' },
  { mandi: 'Gultekdi, Pune', crop: 'Soybean', qty: '60 Q', revenue: '₹0.9L', status: 'Pending' },
  { mandi: 'Bowenpally, Hyderabad', crop: 'Maize', qty: '140 Q', revenue: '₹1.7L', status: 'Settled' },
  { mandi: 'Yeshwanthpur, Bengaluru', crop: 'Paddy', qty: '95 Q', revenue: '₹1.2L', status: 'In Transit' },
]

const statusStyle: Record<string, string> = {
  Settled: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'In Transit': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

export function SalesTable() {
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
        <button className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors duration-200">
          View all <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      <div className="overflow-x-auto">
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
            {sales.map((row, i) => (
              <tr
                key={i}
                className="border-b border-emerald-500/5 last:border-0 hover:bg-emerald-500/3 transition-colors duration-150"
              >
                <td className="px-5 py-3 text-gray-300 font-medium whitespace-nowrap">{row.mandi}</td>
                <td className="px-3 py-3 text-gray-400">{row.crop}</td>
                <td className="px-3 py-3 text-right text-gray-400">{row.qty}</td>
                <td className="px-3 py-3 text-right text-white font-semibold">{row.revenue}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyle[row.status]}`}>
                    {row.status}
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
