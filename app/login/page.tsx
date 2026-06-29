'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTranslation, type Language } from '@/hooks/useTranslation'
import { Wheat, Globe, Eye, EyeOff, LogIn } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role')
  const [language, setLanguage] = useState<Language>('en')
  const { t } = useTranslation(language)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState<'farmer' | 'fpo'>(
    roleParam === 'fpo' ? 'fpo' : 'farmer'
  )

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password, userType }),
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem('role', data.role)
        localStorage.setItem('userId', data.user.id)
        if (data.role === 'manager') {
          localStorage.setItem('fpoId', data.user.fpo?.id || '')
          localStorage.setItem('fpoName', data.user.fpo?.organization_name || '')
          localStorage.setItem('managerName', data.user.name || '')
          router.push('/dashboard')
        } else {
          localStorage.setItem('farmerName',  data.user.full_name || '')
          localStorage.setItem('farmerState', data.user.state || '')
          router.push('/farmer-dashboard')
        }
      } else {
        alert(data.error || 'Login failed. Check your email and password.')
        setLoading(false)
      }
    } catch {
      alert('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

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
            <Link href="/register" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
              ← Back to roles
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
                  { code: 'ta', label: 'தமిழ்' },
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
      <main className="flex-1 flex items-start justify-center px-6 py-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Title */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <LogIn className="w-6 h-6 text-emerald-400" />
              <h1 className="text-3xl font-bold text-white">{t('auth.login')}</h1>
            </div>
            <p className="text-gray-500">
              {t('auth.loginToAccount')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User Type Selection */}
            <div className="flex gap-2 p-1 bg-white/[0.05] border border-white/10 rounded-lg">
              {(['farmer', 'fpo'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setUserType(type)}
                  className={`flex-1 py-2.5 px-3 rounded-md font-medium transition-all text-sm ${
                    userType === type
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {type === 'farmer' ? t('auth.farmer') : t('auth.fpo')}
                </button>
              ))}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                placeholder="ramesh@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>


            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {t('auth.login')}
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-[#0A0A0A] via-[#0D1117] to-[#0A0A0A] text-gray-500">
                {t('auth.or')}
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center space-y-3">
            <p className="text-gray-500">
              Not a member?{' '}
              <Link
                href={userType === 'farmer' ? '/register/farmer' : '/register/fpo'}
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              >
                Register here
              </Link>
            </p>
            <Link
              href={userType === 'farmer' ? '/register/farmer' : '/register/fpo'}
              className="inline-block w-full py-3 rounded-lg border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 font-semibold transition-all hover:bg-emerald-500/5"
            >
              Create new account
            </Link>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6 pt-6 border-t border-white/10">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
            >
              {t('auth.backToHome')}
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
