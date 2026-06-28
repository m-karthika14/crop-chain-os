'use client'

import { Bell, Search, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const notifications = [
  { text: 'Payout ₹12,400 sent to Ramu Patil', time: '2m ago' },
  { text: 'New mandi price alert: Wheat ₹2,340/q', time: '8m ago' },
  { text: 'Credit score updated to 842', time: '1h ago' },
]

export function DashboardHeader() {
  const [showNotif, setShowNotif] = useState(false)

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-emerald-500/10 bg-[#0D0D0D]/80 backdrop-blur-xl sticky top-0 z-30">
      {/* Left: FPO name + breadcrumb */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-semibold text-white leading-tight">GreenHarvest FPO</h1>
          <p className="text-xs text-gray-500">Dashboard Overview</p>
        </div>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex items-center gap-2 bg-white/[0.03] border border-emerald-500/10 rounded-lg px-3 py-2 w-72 hover:border-emerald-500/25 transition-colors duration-200">
        <Search className="w-3.5 h-3.5 text-gray-500" />
        <input
          type="text"
          placeholder="Search farmers, mandis, crops..."
          className="bg-transparent text-xs text-gray-400 placeholder:text-gray-600 outline-none w-full"
        />
      </div>

      {/* Right: notifications + avatar */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative w-9 h-9 rounded-lg bg-white/[0.03] border border-emerald-500/10 flex items-center justify-center text-gray-500 hover:text-emerald-400 hover:border-emerald-500/25 transition-all duration-200"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0D0D0D]" />
          </button>

          {showNotif && (
            <div className="absolute right-0 top-11 w-72 bg-[#111] border border-emerald-500/15 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-emerald-500/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300">Notifications</span>
                <span className="text-xs text-emerald-400">3 new</span>
              </div>
              {notifications.map((n, i) => (
                <div key={i} className="px-4 py-3 hover:bg-emerald-500/5 transition-colors duration-150 cursor-pointer border-b border-emerald-500/5 last:border-0">
                  <p className="text-xs text-gray-300 leading-relaxed">{n.text}</p>
                  <p className="text-xs text-gray-600 mt-1">{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-emerald-500/10 hover:border-emerald-500/25 transition-all duration-200">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400">
            GH
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-gray-300 leading-tight">Gopal Hegde</p>
            <p className="text-xs text-gray-600 leading-tight">FPO Manager</p>
          </div>
          <ChevronDown className="w-3 h-3 text-gray-500 hidden sm:block" />
        </button>
      </div>
    </header>
  )
}
