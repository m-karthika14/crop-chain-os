'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslation, type Language } from '@/hooks/useTranslation'
import { Users, Globe, Wheat, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const [language, setLanguage] = useState<Language>('en')
  const { t } = useTranslation(language)

  const roles = [
    {
      id: 'farmer',
      icon: Wheat,
      label: t('auth.farmer'),
      href: '/login?role=farmer',
      description: 'Individual farmer account'
    },
    {
      id: 'fpo',
      icon: Users,
      label: t('auth.fpo'),
      href: '/login?role=fpo',
      description: 'Farmer Producer Organization'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0D1117] to-[#0A0A0A] flex flex-col">
      {/* Header */}
      <header className="border-b border-emerald-500/10 bg-[#0A0A0A]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Wheat className="w-6 h-6 text-emerald-400" />
            <span className="font-bold text-lg tracking-tight text-white">
              Crop<span className="text-emerald-400">Chain</span>
              <span className="text-emerald-500/70 text-sm ml-1 font-normal">OS</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-500/5 border border-white/10 hover:border-emerald-500/30">
              Home
            </Link>
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
                  onClick={() => setLanguage(lang.code as Language)}
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              {t('auth.selectRole')}
            </h1>
            <p className="text-gray-400 text-lg">
              Choose your account type to get started with CropChain OS
            </p>
          </motion.div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {roles.map((role, index) => {
              const Icon = role.icon
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Link
                    href={role.href}
                    className="group block h-full p-8 rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] hover:border-emerald-500/30 hover:bg-white/[0.05] transition-all duration-300"
                  >
                    <div className="flex flex-col h-full">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                        <Icon className="w-6 h-6 text-emerald-400" />
                      </div>
                      
                      <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                        {role.label}
                      </h2>
                      
                      <p className="text-gray-500 text-sm mb-6 flex-1">
                        {role.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-emerald-400 group-hover:gap-3 transition-all">
                        <span className="text-sm font-semibold">{t('auth.register')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center pt-8 border-t border-white/10"
          >
            <p className="text-gray-500 mb-4">
              {t('auth.alreadyHaveAccount')}
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              {t('auth.loginToAccount')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
