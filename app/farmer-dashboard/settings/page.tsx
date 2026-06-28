'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X, Bell, Globe, User, LogOut } from 'lucide-react'
import { useTranslation, type Language } from '@/hooks/useTranslation'
import { FarmerFPOSettings } from '@/app/components/farmer-fpo-settings'
import { FarmerPortableHistory } from '@/app/components/farmer-portable-history'
import Link from 'next/link'

export default function FarmerSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [language, setLanguage] = useState<Language>('en')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const { t } = useTranslation(language)

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <div className="border-b border-emerald-500/10 bg-[#0D0D0D] backdrop-blur-lg sticky top-0 z-40">
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

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-white/5 rounded-lg transition-all"
            >
              <Bell className="w-5 h-5 text-gray-400" />
            </motion.button>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400 flex items-center gap-2 transition-all"
              >
                <Globe className="w-4 h-4" />
                <span className="uppercase">{language}</span>
              </motion.button>

              {showLanguageMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full right-0 mt-2 w-32 bg-[#0D0D0D] border border-emerald-500/20 rounded-lg overflow-hidden z-50 shadow-lg"
                >
                  {['en', 'hi', 'pa', 'mr', 'te'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang as Language)
                        setShowLanguageMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-white/5 rounded-lg transition-all"
            >
              <User className="w-5 h-5 text-gray-400" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5 text-red-400" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
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
              <span>Dashboard</span>
            </Link>
            <Link
              href="/farmer-dashboard/settings"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            >
              <span>Settings</span>
            </Link>
          </nav>
        </motion.aside>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8 w-full max-w-7xl mx-auto">
            <div className="space-y-8">
              {/* Page Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-2">My Account Settings</h1>
                <p className="text-gray-400">Manage your FPO membership and farming records</p>
              </div>

              {/* FPO Settings Section */}
              <FarmerFPOSettings />

              {/* Portable History Section */}
              <FarmerPortableHistory />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
