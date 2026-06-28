'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LogOut, Menu, X, Bell, User, LayoutDashboard, Leaf, BarChart3, Truck, Wallet, Globe } from 'lucide-react'
import { useTranslation, type Language } from '@/hooks/useTranslation'

export default function EarningsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [language, setLanguage] = useState<Language>('en')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const { t } = useTranslation(language)

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-emerald-500/10 bg-gradient-to-r from-[#0D0D0D] to-[#1A1A1A]"
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-white/5 rounded-lg transition-all duration-200 lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-white font-bold">Ramesh Kumar</h1>
              <p className="text-xs text-gray-500">Village Sonepat, Haryana</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <button
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-500/5 border border-emerald-500/20"
              >
                <Globe className="w-4 h-4" />
                <span>{language.toUpperCase()}</span>
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-[#1F1F1F] border border-emerald-500/20 rounded-lg overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50">
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
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                      language === lang.code
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
            <button className="text-gray-400 hover:text-emerald-400 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-emerald-400 transition-colors">
              <User className="w-5 h-5" />
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-emerald-500/5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('header.logout')}</span>
            </Link>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ width: sidebarOpen ? 240 : 0 }}
          animate={{ width: sidebarOpen ? 240 : 0 }}
          transition={{ duration: 0.3 }}
          className="hidden lg:block border-r border-emerald-500/10 bg-[#0D0D0D] overflow-hidden"
        >
          <nav className="p-6 space-y-2">
            <Link 
              href="/farmer-dashboard"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]"
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            >
              <Wallet className="w-5 h-5" />
              <span>{t('sidebar.earnings')}</span>
            </Link>
          </nav>
        </motion.aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8 w-full max-w-5xl mx-auto">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white">Your Earnings</h2>
                <p className="text-sm text-gray-500 mt-2">Track your income and financial summary</p>
              </div>

              {/* Earnings Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="glass rounded-xl p-6 border border-emerald-500/10"
                >
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Total Earnings</h3>
                  <p className="text-3xl font-bold text-white">₹15,52,000</p>
                  <p className="text-xs text-emerald-400 mt-2">All time</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass rounded-xl p-6 border border-emerald-500/10"
                >
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">This Month</h3>
                  <p className="text-3xl font-bold text-white">₹3,12,000</p>
                  <p className="text-xs text-emerald-400 mt-2">June 2025</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass rounded-xl p-6 border border-emerald-500/10"
                >
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Pending Amount</h3>
                  <p className="text-3xl font-bold text-white">₹17,55,000</p>
                  <p className="text-xs text-amber-400 mt-2">Awaiting payment</p>
                </motion.div>
              </div>

              {/* Monthly Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-xl border border-emerald-500/10 p-6"
              >
                <h2 className="text-lg font-bold text-white mb-6">Monthly Earnings Breakdown</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-gray-500 font-semibold">Month</th>
                        <th className="text-left py-3 px-4 text-gray-500 font-semibold">Sales</th>
                        <th className="text-left py-3 px-4 text-gray-500 font-semibold">Earnings</th>
                        <th className="text-left py-3 px-4 text-gray-500 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { month: 'June 2025', sales: '680Q', earnings: '₹3,12,000', status: 'Partial' },
                        { month: 'May 2025', sales: '520Q', earnings: '₹2,45,000', status: 'Paid' },
                        { month: 'April 2025', sales: '450Q', earnings: '₹1,95,000', status: 'Paid' },
                        { month: 'March 2025', sales: '380Q', earnings: '₹1,80,000', status: 'Paid' },
                      ].map((record, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4 text-white">{record.month}</td>
                          <td className="py-3 px-4 text-white">{record.sales}</td>
                          <td className="py-3 px-4 text-emerald-400 font-semibold">{record.earnings}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                              record.status === 'Paid'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {record.status}
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
        </main>
      </div>
    </div>
  )
}
