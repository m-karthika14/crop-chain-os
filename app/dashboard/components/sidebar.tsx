'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Wheat,
  Map,
  Lightbulb,
  Truck,
  Banknote,
  BookOpen,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Farmers', href: '/dashboard/farmers' },
  { icon: Wheat, label: 'Harvests', href: '/dashboard/harvests' },
  { icon: Map, label: 'Mandi Map', href: '/dashboard/mandi-map' },
  { icon: Lightbulb, label: 'Best Mandi', href: '/dashboard/optimizer' },
  { icon: Truck, label: 'Dispatches', href: '/dashboard/dispatches' },
  { icon: Banknote, label: 'Payouts', href: '/dashboard/payouts' },
  { icon: BookOpen, label: 'Ledger', href: '/dashboard/ledger' },
  { icon: Star, label: 'Credit Score', href: '/dashboard/credit-score' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={`relative flex flex-col h-screen border-r border-emerald-500/10 bg-[#0D0D0D] transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-emerald-500/10">
        <Wheat className="shrink-0 w-6 h-6 text-emerald-400" />
        {!collapsed && (
          <span className="font-bold text-base tracking-tight text-white whitespace-nowrap">
            Crop<span className="text-emerald-400">Chain</span>
            <span className="text-emerald-500/60 text-xs ml-1 font-normal">OS</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-0.5">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Icon
                className={`shrink-0 w-4 h-4 transition-colors duration-200 ${
                  isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'
                }`}
              />
              {!collapsed && <span className="truncate">{label}</span>}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0D0D0D] border border-emerald-500/20 flex items-center justify-center text-gray-500 hover:text-emerald-400 hover:border-emerald-500/40 transition-all duration-200 z-10"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Bottom back link */}
      <div className="px-2 py-4 border-t border-emerald-500/10">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-gray-600 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
        >
          <ChevronLeft className="shrink-0 w-3.5 h-3.5" />
          {!collapsed && <span>Back to Home</span>}
        </Link>
      </div>
    </aside>
  )
}
