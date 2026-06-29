'use client'

import { Bell, Search, ChevronDown, Truck, Banknote, Users, Wheat, X } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'

interface Notification {
  id:   string
  text: string
  time: string
  type: string
}

const TYPE_ICON: Record<string, React.ElementType> = {
  dispatch: Truck,
  payment:  Banknote,
  join:     Users,
  harvest:  Wheat,
}

function relativeTime(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)         return 'just now'
  if (diff < 3600)       return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)      return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function DashboardHeader() {
  const [showNotif,  setShowNotif]  = useState(false)
  const [notifs,     setNotifs]     = useState<Notification[]>([])
  const [unread,     setUnread]     = useState(0)
  const [managerName, setManagerName] = useState('')
  const [fpoName,    setFpoName]    = useState('')
  const [initials,   setInitials]   = useState('FP')
  const [fpoId,      setFpoId]      = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  // Read identity from localStorage once on mount
  useEffect(() => {
    const name  = localStorage.getItem('managerName') || ''
    const fpo   = localStorage.getItem('fpoName')     || 'My FPO'
    const id    = localStorage.getItem('fpoId')       || 'fpo-001'
    setManagerName(name)
    setFpoName(fpo)
    setFpoId(id)

    const parts = name.trim().split(/\s+/)
    setInitials(
      parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : (name.slice(0, 2) || 'FP').toUpperCase()
    )
  }, [])

  const fetchNotifs = useCallback(async (id: string) => {
    if (!id) return
    try {
      const res  = await fetch(`/api/notifications/fpo?fpoId=${id}`)
      const data = await res.json()
      if (data.success) {
        setNotifs(data.notifications)
        setUnread(data.unread)
      }
    } catch {}
  }, [])

  // Fetch on fpoId set + every 30 s
  useEffect(() => {
    if (!fpoId) return
    fetchNotifs(fpoId)
    const iv = setInterval(() => fetchNotifs(fpoId), 30_000)
    return () => clearInterval(iv)
  }, [fpoId, fetchNotifs])

  // Close panel on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotif(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-emerald-500/10 bg-[#0D0D0D]/80 backdrop-blur-xl sticky top-0 z-30">
      {/* Left: FPO name */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-semibold text-white leading-tight">{fpoName || 'Dashboard'}</h1>
          <p className="text-xs text-gray-500">FPO Manager Portal</p>
        </div>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex items-center gap-2 bg-white/[0.03] border border-emerald-500/10 rounded-lg px-3 py-2 w-72 hover:border-emerald-500/25 transition-colors duration-200">
        <Search className="w-3.5 h-3.5 text-gray-500" />
        <input
          type="text"
          placeholder="Search farmers, mandis, crops…"
          className="bg-transparent text-xs text-gray-400 placeholder:text-gray-600 outline-none w-full"
        />
      </div>

      {/* Right: bell + avatar */}
      <div className="flex items-center gap-3">

        {/* Notification bell */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => { setShowNotif(v => !v); if (!showNotif) setUnread(0) }}
            className="relative w-9 h-9 rounded-lg bg-white/[0.03] border border-emerald-500/10 flex items-center justify-center text-gray-500 hover:text-emerald-400 hover:border-emerald-500/25 transition-all duration-200"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-emerald-400 text-[10px] font-bold text-black flex items-center justify-center ring-2 ring-[#0D0D0D]">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-11 w-80 bg-[#111] border border-emerald-500/15 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-emerald-500/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300">Notifications</span>
                <div className="flex items-center gap-2">
                  {notifs.length > 0 && (
                    <span className="text-xs text-emerald-400">{notifs.length} recent</span>
                  )}
                  <button onClick={() => setShowNotif(false)} className="text-gray-600 hover:text-gray-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {notifs.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">No recent activity</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notifs.map((n) => {
                    const Icon = TYPE_ICON[n.type] || Bell
                    return (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-emerald-500/5 transition-colors duration-150 border-b border-emerald-500/5 last:border-0"
                      >
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-3 h-3 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-300 leading-relaxed">{n.text}</p>
                          <p className="text-[10px] text-gray-600 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="px-4 py-2 border-t border-emerald-500/10">
                <button
                  onClick={() => fetchNotifs(fpoId)}
                  className="text-[10px] text-emerald-500/60 hover:text-emerald-400 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-emerald-500/10 hover:border-emerald-500/25 transition-all duration-200">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-gray-300 leading-tight">{managerName || 'Manager'}</p>
            <p className="text-xs text-gray-600 leading-tight">FPO Manager</p>
          </div>
          <ChevronDown className="w-3 h-3 text-gray-500 hidden sm:block" />
        </button>
      </div>
    </header>
  )
}
