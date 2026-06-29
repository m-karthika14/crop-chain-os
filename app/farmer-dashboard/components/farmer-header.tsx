'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  LogOut, Menu, X, Bell, User, Wheat, Truck, Wallet,
  Leaf, BarChart3, LayoutDashboard, Globe, Banknote,
  AlertCircle, CheckCircle2, MapPin, DoorOpen, Loader2,
} from 'lucide-react'
import { useTranslation, type Language } from '@/hooks/useTranslation'

interface Notification {
  id:   string
  text: string
  time: string
  type: string
}

interface MembershipInfo {
  fpoId:        string
  fpoName:      string
  memberSince:  string
  status:       string
  managerName?: string
  godownAddress?: string
}

interface FarmerHeaderProps {
  subtitle?: string
  onSidebarToggle?: () => void
  sidebarOpen?: boolean
  activeNav?: string
  onLeaveFPO?: () => void
}

function notifIcon(type: string) {
  const cls = 'w-3.5 h-3.5 shrink-0'
  if (type === 'payment')  return <Banknote className={`${cls} text-emerald-400`} />
  if (type === 'dispatch') return <Truck className={`${cls} text-blue-400`} />
  if (type === 'harvest')  return <Wheat className={`${cls} text-amber-400`} />
  if (type === 'join')     return <CheckCircle2 className={`${cls} text-emerald-400`} />
  if (type === 'alert')    return <AlertCircle className={`${cls} text-red-400`} />
  return <Bell className={`${cls} text-gray-400`} />
}

function notifDot(type: string) {
  if (type === 'payment')  return 'bg-emerald-400'
  if (type === 'dispatch') return 'bg-blue-400'
  if (type === 'harvest')  return 'bg-amber-400'
  if (type === 'alert')    return 'bg-red-400'
  return 'bg-gray-500'
}

export function FarmerHeader({ subtitle, onSidebarToggle, sidebarOpen, activeNav, onLeaveFPO }: FarmerHeaderProps) {
  const [language,      setLanguage]      = useState<Language>('en')
  const [showLangMenu,  setShowLangMenu]  = useState(false)
  const [farmerName,    setFarmerName]    = useState('')
  const [farmerState,   setFarmerState]   = useState('')
  const [membership,    setMembership]    = useState<MembershipInfo | null>(null)

  // Leave FPO
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [leavingFPO,       setLeavingFPO]       = useState(false)
  const [leaveError,       setLeaveError]       = useState('')

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread,         setUnread]        = useState(0)
  const [showNotifs,     setShowNotifs]    = useState(false)
  const [notifLoading,   setNotifLoading]  = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // Profile
  const [showProfile,  setShowProfile]  = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const { t } = useTranslation(language)

  const fetchNotifications = useCallback(async (id: string) => {
    setNotifLoading(true)
    try {
      const res  = await fetch(`/api/notifications/farmer?farmerId=${id}`)
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications as Notification[])
        setUnread(data.unread ?? 0)
      }
    } catch {}
    setNotifLoading(false)
  }, [])

  const fetchMembership = useCallback(async (id: string) => {
    try {
      const res  = await fetch(`/api/farmers/status?farmerId=${id}`)
      const data = await res.json()
      if (data.success && data.membership?.status === 'ACTIVE') {
        const m = data.membership
        setMembership({
          fpoId:        m.fpo_id,
          fpoName:      m.organization_name,
          memberSince:  m.approved_at
            ? new Date(m.approved_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
            : 'Recently',
          status:       m.status,
          managerName:  m.manager_name,
          godownAddress: m.godown_address,
        })
      }
    } catch {}
  }, [])

  useEffect(() => {
    const farmerId = localStorage.getItem('userId') || ''
    setFarmerName(localStorage.getItem('farmerName') || '')
    setFarmerState(localStorage.getItem('farmerState') || '')
    if (!farmerId) return
    fetchNotifications(farmerId)
    fetchMembership(farmerId)
    const interval = setInterval(() => fetchNotifications(farmerId), 30_000)
    return () => clearInterval(interval)
  }, [fetchNotifications, fetchMembership])

  // Click-outside close
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current  && !notifRef.current.contains(e.target as Node))   setShowNotifs(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLeaveFPO = async () => {
    const farmerId = localStorage.getItem('userId') || ''
    if (!farmerId || !membership?.fpoId) return
    setLeavingFPO(true)
    setLeaveError('')
    try {
      const res  = await fetch('/api/farmers/leave', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ farmerId, fpoId: membership.fpoId, reason: 'Farmer requested to leave' }),
      })
      const data = await res.json()
      if (data.success) {
        setMembership(null)
        setShowLeaveConfirm(false)
        setShowProfile(false)
        onLeaveFPO?.()
      } else {
        setLeaveError(data.error || 'Could not leave FPO. Please try again.')
      }
    } catch {
      setLeaveError('Network error. Please try again.')
    }
    setLeavingFPO(false)
  }

  const initials = farmerName
    ? farmerName.trim().split(/\s+/).filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase()
    : 'F'

  const NAV = [
    { href: '/farmer-dashboard',           icon: LayoutDashboard, key: 'dashboard',   label: t('sidebar.dashboard') },
    { href: '/farmer-dashboard/harvest',    icon: Leaf,            key: 'harvest',     label: t('sidebar.myHarvest') },
    { href: '/farmer-dashboard/sales',      icon: BarChart3,       key: 'sales',       label: t('sidebar.salesHistory') },
    { href: '/farmer-dashboard/dispatches', icon: Truck,           key: 'dispatches',  label: t('sidebar.dispatches') },
    { href: '/farmer-dashboard/earnings',   icon: Wallet,          key: 'earnings',    label: t('sidebar.earnings') },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-500/10 bg-[#0A0A0A]/95 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: hamburger + title */}
        <div className="flex items-center gap-3">
          {onSidebarToggle && (
            <button onClick={onSidebarToggle} className="p-1 hover:bg-white/5 rounded-lg transition-colors lg:hidden">
              {sidebarOpen ? <X className="w-5 h-5 text-gray-400" /> : <Menu className="w-5 h-5 text-gray-400" />}
            </button>
          )}
          <div>
            <h1 className="text-white font-bold leading-tight">{farmerName || 'Farmer'}</h1>
            <p className="text-xs text-gray-500">{subtitle || farmerState || 'Farmer Dashboard'}</p>
          </div>
        </div>

        {/* Right: lang + notif + profile + logout */}
        <div className="flex items-center gap-2">
          {/* Language */}
          <div className="relative">
            <button onClick={() => setShowLangMenu(v => !v)}
              className="flex items-center gap-1.5 text-sm text-gray-400 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
              <Globe className="w-3.5 h-3.5" />
              <span className="text-xs">{language.toUpperCase()}</span>
            </button>
            <AnimatePresence>
              {showLangMenu && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 mt-1 w-36 bg-[#1F1F1F] border border-emerald-500/20 rounded-lg overflow-hidden z-50 shadow-xl">
                  {[{ code: 'en', label: 'English' }, { code: 'hi', label: 'हिंदी' }, { code: 'te', label: 'తెలుగు' }, { code: 'ta', label: 'தமிழ்' }, { code: 'ml', label: 'മലയാളം' }].map(lang => (
                    <button key={lang.code} onClick={() => { setLanguage(lang.code as Language); setShowLangMenu(false) }}
                      className={`block w-full text-left px-3 py-2 text-sm ${language === lang.code ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'}`}>
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => { setShowNotifs(v => !v); setUnread(0) }}
              className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Bell className={`w-5 h-5 ${unread > 0 ? 'text-white' : 'text-gray-400'}`} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-black text-[10px] font-black flex items-center justify-center px-0.5">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifs && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 bg-[#141414] border border-white/10 rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {notifLoading && <div className="w-3 h-3 border border-emerald-500 border-t-transparent rounded-full animate-spin" />}
                      <button onClick={() => { const id = localStorage.getItem('userId') || ''; if (id) fetchNotifications(id) }}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors">Refresh</button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center space-y-2">
                        <Bell className="w-8 h-8 text-gray-700 mx-auto" />
                        <p className="text-xs text-gray-600">No notifications yet</p>
                        <p className="text-[10px] text-gray-700">Updates will appear here</p>
                      </div>
                    ) : notifications.map((n, i) => (
                      <motion.div key={n.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.03] border-b border-white/[0.04] last:border-0 transition-colors">
                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${notifDot(n.type)}`} />
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5">{notifIcon(n.type)}</div>
                          <p className="text-xs text-gray-300 leading-snug">{n.text}</p>
                          <p className="text-[10px] text-gray-600">{n.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-white/[0.06] bg-white/[0.01]">
                    <p className="text-[10px] text-gray-700 text-center">Refreshes every 30 seconds</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button onClick={() => setShowProfile(v => !v)}
              className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center hover:bg-emerald-500/30 transition-colors">
              {initials || <User className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-[#141414] border border-white/10 rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden">
                  {/* Avatar block */}
                  <div className="px-4 py-4 border-b border-white/[0.06] bg-gradient-to-b from-emerald-500/[0.07] to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                        {initials || <User className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate">{farmerName || 'Farmer'}</p>
                        {farmerState && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />{farmerState}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FPO info */}
                  {membership && (
                    <div className="px-4 py-3 border-b border-white/[0.06] space-y-2.5">
                      <div className="flex items-start gap-2">
                        <Wheat className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">FPO</p>
                          <p className="text-xs text-white font-medium truncate">{membership.fpoName}</p>
                          <p className="text-[10px] text-gray-600">Member since {membership.memberSince}</p>
                        </div>
                      </div>
                      {membership.managerName && (
                        <div className="flex items-start gap-2">
                          <User className="w-3.5 h-3.5 text-gray-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-600 mb-0.5">Manager</p>
                            <p className="text-xs text-gray-400">{membership.managerName}</p>
                          </div>
                        </div>
                      )}
                      {membership.godownAddress && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-600 mb-0.5">Godown</p>
                            <p className="text-xs text-gray-400 leading-snug">{membership.godownAddress}</p>
                          </div>
                        </div>
                      )}

                      {/* Leave FPO */}
                      {!showLeaveConfirm ? (
                        <button
                          onClick={() => { setShowLeaveConfirm(true); setLeaveError('') }}
                          className="w-full flex items-center gap-2 mt-1 px-2.5 py-1.5 rounded-lg text-[11px] text-orange-400 hover:text-orange-300 hover:bg-orange-500/[0.08] border border-orange-500/20 hover:border-orange-500/40 transition-colors"
                        >
                          <DoorOpen className="w-3.5 h-3.5 shrink-0" />
                          Leave FPO
                        </button>
                      ) : (
                        <div className="rounded-lg border border-orange-500/30 bg-orange-500/[0.06] p-3 space-y-2">
                          <p className="text-[11px] text-orange-300 font-semibold">Leave {membership.fpoName}?</p>
                          <p className="text-[10px] text-gray-500 leading-snug">You can rejoin another FPO after leaving. Any pending crops or payments must be settled first.</p>
                          {leaveError && (
                            <p className="text-[10px] text-red-400 leading-snug">{leaveError}</p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setShowLeaveConfirm(false); setLeaveError('') }}
                              className="flex-1 py-1 rounded text-[11px] text-gray-400 hover:text-white border border-white/10 hover:bg-white/[0.05] transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleLeaveFPO}
                              disabled={leavingFPO}
                              className="flex-1 py-1 rounded text-[11px] font-bold text-orange-300 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                              {leavingFPO
                                ? <><Loader2 className="w-3 h-3 animate-spin" /> Leaving…</>
                                : 'Yes, Leave'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Nav links */}
                  <div className="px-3 py-2 space-y-0.5">
                    {NAV.map(({ href, icon: Icon, key, label }) => (
                      <Link key={key} href={href} onClick={() => setShowProfile(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${activeNav === key ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'}`}>
                        <Icon className="w-3.5 h-3.5" />{label}
                      </Link>
                    ))}
                    <Link href="/" onClick={() => localStorage.clear()}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-colors mt-1">
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout shortcut */}
          <Link href="/" onClick={() => localStorage.clear()}
            className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-emerald-400 px-3 py-2 rounded-lg hover:bg-emerald-500/5 transition-colors">
            <LogOut className="w-4 h-4" />
            <span>{t('header.logout')}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
