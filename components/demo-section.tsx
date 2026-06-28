'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Play, BarChart2, MapPin, Users, CreditCard } from 'lucide-react'

const tabs = [
  { id: 'map', label: 'Live Map', icon: MapPin },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'farmers', label: 'Farmers', icon: Users },
  { id: 'payouts', label: 'Payouts', icon: CreditCard },
]

const mockData = {
  map: {
    title: 'Live Mandi Price Map',
    rows: [
      { mandi: 'Azadpur, Delhi', crop: 'Wheat', price: '₹2,340/q', trend: '+4.2%', up: true },
      { mandi: 'Vashi, Mumbai', crop: 'Onion', price: '₹1,820/q', trend: '+1.8%', up: true },
      { mandi: 'Kolkata, WB', crop: 'Rice', price: '₹3,120/q', trend: '-0.5%', up: false },
      { mandi: 'Ahmedabad, GJ', crop: 'Cotton', price: '₹6,450/q', trend: '+2.3%', up: true },
    ],
  },
  analytics: {
    title: 'Revenue Analytics',
    rows: [
      { mandi: 'April 2025', crop: 'Total Trades', price: '₹48.2L', trend: '+12%', up: true },
      { mandi: 'May 2025', crop: 'Total Trades', price: '₹52.7L', trend: '+9.3%', up: true },
      { mandi: 'June 2025', crop: 'Total Trades', price: '₹61.0L', trend: '+15.7%', up: true },
      { mandi: 'YTD 2025', crop: 'Total Trades', price: '₹1.8Cr', trend: '+32%', up: true },
    ],
  },
  farmers: {
    title: 'Farmer Profiles',
    rows: [
      { mandi: 'Raju Patil', crop: 'Pune, MH', price: 'Trust: 98', trend: 'Active', up: true },
      { mandi: 'Sunita Devi', crop: 'Gorakhpur, UP', price: 'Trust: 91', trend: 'Active', up: true },
      { mandi: 'Hardev Singh', crop: 'Ludhiana, PB', price: 'Trust: 87', trend: 'Active', up: true },
      { mandi: 'Meena Kumari', crop: 'Kota, RJ', price: 'Trust: 95', trend: 'Active', up: true },
    ],
  },
  payouts: {
    title: 'Recent Payouts',
    rows: [
      { mandi: 'Raju Patil', crop: 'Wheat · 12q', price: '₹28,080', trend: 'Settled', up: true },
      { mandi: 'Sunita Devi', crop: 'Tomato · 8q', price: '₹14,560', trend: 'Settled', up: true },
      { mandi: 'Hardev Singh', crop: 'Cotton · 20q', price: '₹1,29,000', trend: 'Pending', up: false },
      { mandi: 'Meena Kumari', crop: 'Soybean · 15q', price: '₹52,500', trend: 'Settled', up: true },
    ],
  },
}

export function DemoSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [activeTab, setActiveTab] = useState<keyof typeof mockData>('map')

  const data = mockData[activeTab]

  return (
    <section id="demo" className="relative py-20 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold text-emerald-400 uppercase tracking-widest mb-3 block">
            Live Demo
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 text-balance">
            See CropChain OS OS in Action
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Explore the platform with real-time data from across India&apos;s agricultural network.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="glass rounded-2xl border border-emerald-500/15 overflow-hidden shadow-2xl shadow-emerald-500/5 max-w-5xl mx-auto"
        >
          {/* App chrome */}
          <div className="flex items-center gap-2 px-5 py-4 border-b border-emerald-500/10 bg-white/[0.02]">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
            <div className="flex-1 mx-4 h-6 rounded-md bg-white/[0.04] border border-white/5 flex items-center px-3">
              <span className="text-xs text-gray-500">app.mandipilot.in</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-emerald-500/10 bg-white/[0.01] overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as keyof typeof mockData)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  activeTab === id
                    ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">{data.title}</h3>
              <button className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-lg hover:bg-emerald-400/15 transition-colors duration-200">
                <Play className="w-3 h-3" fill="currentColor" />
                Watch walkthrough
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-emerald-500/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-emerald-500/10 bg-white/[0.02]">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {activeTab === 'map' ? 'Market' : activeTab === 'analytics' ? 'Period' : 'Name'}
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      {activeTab === 'map' ? 'Commodity' : activeTab === 'analytics' ? 'Category' : activeTab === 'farmers' ? 'Location' : 'Details'}
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {activeTab === 'map' ? 'Price' : activeTab === 'analytics' ? 'Revenue' : activeTab === 'farmers' ? 'Score' : 'Amount'}
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-emerald-500/5 last:border-0 hover:bg-emerald-500/3 transition-colors duration-150"
                    >
                      <td className="px-4 py-3.5 text-white font-medium">{row.mandi}</td>
                      <td className="px-4 py-3.5 text-gray-400 hidden sm:table-cell">{row.crop}</td>
                      <td className="px-4 py-3.5 text-right text-white font-mono font-semibold">{row.price}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${row.up ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                          {row.trend}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
