'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { LogOut, Menu, X, Bell, User, Wheat, TrendingUp, DollarSign, CheckCircle2, AlertCircle, Globe, LayoutDashboard, Leaf, BarChart3, Truck, Wallet, Plus, ChevronRight } from 'lucide-react'
import { useTranslation, type Language } from '@/hooks/useTranslation'
import { FPOOnboarding } from '@/app/components/fpo-onboarding'
import { HarvestStatusCard } from '@/app/components/harvest-status-card'

export default function FarmerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [earnings, setEarnings] = useState(0)
  const [isCountingUp, setIsCountingUp] = useState(true)
  const [language, setLanguage] = useState<Language>('en')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [hasFPO, setHasFPO] = useState(true)
  const [showFPOOnboarding, setShowFPOOnboarding] = useState(!hasFPO)
  const [showFPOModal, setShowFPOModal] = useState(false)
  const [fpoFormData, setFpoFormData] = useState({
    farmerName: 'Ramesh Kumar',
    village: 'Karnal',
    state: 'Haryana',
    fpoName: 'GreenHarvest FPO',
  })
  const [membershipInfo, setMembershipInfo] = useState<{
    fpoName: string
    memberSince: string
    status: string
    fpoId: string
  } | null>(null)
  const { t } = useTranslation(language)

  // Check FPO membership on mount
  useEffect(() => {
    const farmerId = localStorage.getItem('userId') || ''
    if (!farmerId) return

    fetch(`/api/farmers/status?farmerId=${farmerId}`)
      .then(r => r.json())
      .then(data => {
        if (!data.success || !data.membership) {
          setHasFPO(false)
          setShowFPOOnboarding(true)
        } else if (data.membership.status === 'PENDING') {
          setHasFPO(false)
          setShowFPOOnboarding(true)
        } else {
          setHasFPO(true)
          setShowFPOOnboarding(false)
          const m = data.membership
          setMembershipInfo({
            fpoName: m.organization_name,
            memberSince: m.approved_at
              ? new Date(m.approved_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
              : 'Recently',
            status: m.status,
            fpoId: m.fpo_id,
          })
        }
      })
      .catch(() => {})

    fetch(`/api/farmers/my-stats?farmerId=${farmerId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.total_earnings) {
          const target = Number(data.total_earnings)
          if (target > 0) {
            setIsCountingUp(false)
            setEarnings(target)
          }
        }
      })
      .catch(() => {})

    fetch(`/api/harvests/my-harvests?farmerId=${farmerId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.harvests.length > 0) {
          setHarvests(data.harvests.map((h: Record<string, unknown>) => ({
            cropType: h.crop_type,
            variety: h.variety || '',
            grade: h.grade_submitted || 'A',
            estimatedQty: parseFloat(h.quantity_estimated as string),
            actualQty: h.quantity_actual ? parseFloat(h.quantity_actual as string) : undefined,
            status: h.status,
            tokenNumber: h.token_number,
            timestamp: new Date(h.submitted_at as string).toLocaleString('en-IN'),
            godownAddress: h.godown_address,
            contact: h.godown_contact,
            actualEarnings: h.quantity_final
              ? `₹${(parseFloat(h.quantity_final as string) * 2200).toLocaleString('en-IN')} – ₹${(parseFloat(h.quantity_final as string) * 2400).toLocaleString('en-IN')}`
              : undefined,
          })))
        }
      })
      .catch(() => {})
  }, [])

  // Animate earnings counter on mount
  useEffect(() => {
    if (!isCountingUp) return
    let current = 0
    const target = 31200
    const increment = target / 30
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        current = target
        setIsCountingUp(false)
        clearInterval(timer)
      }
      setEarnings(Math.floor(current))
    }, 20)
    return () => clearInterval(timer)
  }, [isCountingUp])

  const crops = [
    { name: 'Wheat', qty: '850Q', status: 'collected', color: 'bg-amber-500' },
    { name: 'Rice', qty: '420Q', status: 'pending', color: 'bg-blue-500' },
    { name: 'Corn', qty: '180Q', status: 'collected', color: 'bg-yellow-600' },
  ]

  const sales = [
    { crop: 'Wheat', qty: '280Q', price: 2387, mandi: 'Karnal', date: '2 days ago', status: 'Paid' },
    { crop: 'Wheat', qty: '250Q', price: 2265, mandi: 'Delhi', date: '5 days ago', status: 'Paid' },
    { crop: 'Rice', qty: '150Q', price: 3100, mandi: 'Panipat', date: '8 days ago', status: 'Paid' },
    { crop: 'Wheat', qty: '320Q', price: 2150, mandi: 'Karnal', date: '12 days ago', status: 'Paid' },
  ]

  const [harvests, setHarvests] = useState<Record<string, unknown>[]>([])

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-emerald-500/10 bg-[#0A0A0A]/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-white/5 rounded-lg transition-all duration-200 lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-white font-bold">{t('header.name')}</h1>
              <p className="text-xs text-gray-500">{t('header.location')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-white/5 rounded-lg transition-all duration-200">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full" />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-all duration-200">
              <User className="w-5 h-5 text-gray-400" />
            </button>
            
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-emerald-500/5 border border-emerald-500/20"
              >
                <Globe className="w-4 h-4" />
                <span>{language.toUpperCase()}</span>
              </button>
              {showLanguageMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-1 bg-[#1F1F1F] border border-emerald-500/20 rounded-lg overflow-hidden z-50"
                >
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'hi', label: 'हिंदी' },
                    { code: 'te', label: 'తెలుగు' },
                    { code: 'ta', label: 'தமிழ்' },
                    { code: 'ml', label: 'മലയാളം' },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as Language)
                        setShowLanguageMenu(false)
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                        language === lang.code
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-emerald-500/5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('header.logout')}</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 256 : 0 }}
          transition={{ duration: 0.3 }}
          className="hidden lg:block border-r border-emerald-500/10 bg-[#0D0D0D] overflow-hidden"
        >
          <nav className="p-6 space-y-2">
            <Link 
              href="/farmer-dashboard"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>{t('sidebar.dashboard')}</span>
            </Link>
            <Link 
              href="/farmer-dashboard/harvest"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]"
            >
              <Leaf className="w-5 h-5" />
              <span>{t('sidebar.myHarvest')}</span>
            </Link>
            <Link 
              href="/farmer-dashboard/sales"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]"
            >
              <BarChart3 className="w-5 h-5" />
              <span>{t('sidebar.salesHistory')}</span>
            </Link>
            <Link 
              href="/farmer-dashboard/dispatches"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]"
            >
              <Truck className="w-5 h-5" />
              <span>{t('sidebar.dispatches')}</span>
            </Link>
            <Link 
              href="/farmer-dashboard/earnings"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]"
            >
              <Wallet className="w-5 h-5" />
              <span>{t('sidebar.earnings')}</span>
            </Link>
          </nav>
        </motion.aside>

        {/* Main content - Desktop First */}
        <main className="flex-1 overflow-auto">
          {showFPOOnboarding ? (
            <FPOOnboarding onComplete={() => setShowFPOOnboarding(false)} />
          ) : (
            <div className="p-8 w-full">
              {/* Overview */}
              <div className="space-y-8">
                {/* FPO Membership Card - Desktop Only */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="glass rounded-2xl p-6 border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-blue-600/10 hidden lg:block"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">FPO Membership</p>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {membershipInfo?.fpoName ?? '—'}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {membershipInfo
                          ? `Member since ${membershipInfo.memberSince} • ${membershipInfo.status === 'ACTIVE' ? 'Active' : membershipInfo.status} Status`
                          : 'Loading...'}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowFPOModal(true)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-semibold transition-all duration-200 whitespace-nowrap"
                    >
                      <LogOut className="w-4 h-4" />
                      Leave FPO
                    </motion.button>
                  </div>
                </motion.div>

                {/* Hero cards grid - Desktop: 4 columns */}
                <div className="grid grid-cols-4 gap-6">
                  {/* Total Earnings */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="glass rounded-xl p-6 border border-emerald-500/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-400">{t('dashboard.totalEarnings')}</h3>
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">₹{earnings.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-emerald-400 mt-2">+12% {t('dashboard.thisMonth')}</p>
                  </motion.div>

                  {/* Harvest Submitted */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-xl p-6 border border-emerald-500/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-400">{t('dashboard.harvestSubmitted')}</h3>
                      <Wheat className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">1,450Q</p>
                    <p className="text-xs text-amber-400 mt-2">{t('stats.acrossAllCrops')}</p>
                  </motion.div>

                  {/* Sales Completed */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-xl p-6 border border-emerald-500/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-400">{t('dashboard.salesCompleted')}</h3>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">680Q</p>
                    <p className="text-xs text-emerald-400 mt-2">{t('stats.allPaymentsReceived')}</p>
                  </motion.div>

                  {/* Best Price */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-xl p-6 border border-emerald-500/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-400">{t('dashboard.bestPrice')}</h3>
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">₹2,387</p>
                    <p className="text-xs text-gray-500 mt-2">{t('stats.wheatAtKarnal')}</p>
                  </motion.div>
                </div>

                {/* My Harvests - Full width */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wheat className="w-5 h-5 text-emerald-400" />
                      <h2 className="text-lg font-bold text-white">My Harvests</h2>
                    </div>
                    <Link
                      href="/farmer-dashboard/submit-harvest"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      Submit Crop
                    </Link>
                  </div>
                  <div className="grid gap-4">
                    {harvests.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm border border-white/5 rounded-xl">
                        No harvests submitted yet
                      </div>
                    ) : harvests.map((harvest, idx) => (
                      <HarvestStatusCard
                        key={idx}
                        {...harvest}
                      />
                    ))}
                  </div>
                </div>

                {/* Crops and Quick Stats - Desktop: 2-1 layout */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Crops */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="col-span-2 glass rounded-xl border border-emerald-500/10 p-6"
                  >
                    <h2 className="text-lg font-bold text-white mb-6">{t('dashboard.myCrops')}</h2>
                    <div className="space-y-4">
                      {crops.map((crop) => (
                        <div key={crop.name} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg hover:bg-white/[0.04] transition-all duration-200">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${crop.color}`} />
                            <div>
                              <p className="text-white font-semibold">{crop.name}</p>
                              <p className="text-xs text-gray-500">{crop.qty}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            crop.status === 'collected'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {crop.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Quick stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass rounded-xl border border-emerald-500/10 p-6"
                  >
                    <h2 className="text-lg font-bold text-white mb-6">{t('dashboard.quickStats')}</h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-white/[0.02] rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">{t('dashboard.averagePrice')}</p>
                        <p className="text-2xl font-bold text-emerald-400">₹2,283</p>
                      </div>
                      <div className="p-4 bg-white/[0.02] rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">{t('dashboard.pendingSales')}</p>
                        <p className="text-2xl font-bold text-amber-400">770Q</p>
                      </div>
                      <div className="p-4 bg-white/[0.02] rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">{t('dashboard.thisMonth')}</p>
                        <p className="text-2xl font-bold text-white">₹31.2K</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Recent Sales - Desktop: Full width */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="glass rounded-xl border border-emerald-500/10 p-6"
                >
                  <h2 className="text-lg font-bold text-white mb-6">{t('dashboard.recentSales')}</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-4 text-gray-500 font-semibold">{t('table.crop')}</th>
                          <th className="text-left py-3 px-4 text-gray-500 font-semibold">{t('table.quantity')}</th>
                          <th className="text-left py-3 px-4 text-gray-500 font-semibold">{t('table.price')}</th>
                          <th className="text-left py-3 px-4 text-gray-500 font-semibold">{t('table.mandi')}</th>
                          <th className="text-left py-3 px-4 text-gray-500 font-semibold">{t('table.date')}</th>
                          <th className="text-left py-3 px-4 text-gray-500 font-semibold">{t('table.status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.map((sale, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-all duration-200">
                            <td className="py-3 px-4 text-white font-semibold">{sale.crop}</td>
                            <td className="py-3 px-4 text-gray-400">{sale.qty}</td>
                            <td className="py-3 px-4 text-white font-semibold">₹{sale.price.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4 text-gray-400">{sale.mandi}</td>
                            <td className="py-3 px-4 text-gray-500 text-xs">{sale.date}</td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full">
                              {t('table.paid')}
                            </span>
                          </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </main>

        {/* FPO Change Modal - Desktop Only */}
        {showFPOModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-white/10 rounded-2xl p-8 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Change FPO</h2>
                <button
                  onClick={() => setShowFPOModal(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-2">Farmer Name</label>
                  <input
                    type="text"
                    value={fpoFormData.farmerName}
                    onChange={(e) => setFpoFormData({ ...fpoFormData, farmerName: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-2">Village</label>
                  <input
                    type="text"
                    value={fpoFormData.village}
                    onChange={(e) => setFpoFormData({ ...fpoFormData, village: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-2">State</label>
                  <input
                    type="text"
                    value={fpoFormData.state}
                    onChange={(e) => setFpoFormData({ ...fpoFormData, state: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-2">New FPO Name</label>
                  <input
                    type="text"
                    value={fpoFormData.fpoName}
                    onChange={(e) => setFpoFormData({ ...fpoFormData, fpoName: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFPOModal(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowFPOModal(false)}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold py-2.5 rounded-lg transition-all duration-200"
                  >
                    Update FPO
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
