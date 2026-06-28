'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTranslation, type Language } from '@/hooks/useTranslation'
import { Wheat, Globe, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function FarmerRegisterPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>('en')
  const { t } = useTranslation(language)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    state: '',
    district: '',
    village: '',
    crops: [] as string[],
    farmSize: '',
    bankAccount: '',
    ifsc: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const [customCrop, setCustomCrop] = useState('')

  const toggleCrop = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      crops: prev.crops.includes(crop)
        ? prev.crops.filter(c => c !== crop)
        : [...prev.crops, crop]
    }))
  }

  const addCustomCrop = () => {
    const name = customCrop.trim()
    if (!name || formData.crops.includes(name)) return
    setFormData(prev => ({ ...prev, crops: [...prev.crops, name] }))
    setCustomCrop('')
  }

  const CROPS = [
    'Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Sugarcane',
    'Groundnut', 'Mustard', 'Turmeric', 'Onion', 'Tomato', 'Potato',
    'Chilli', 'Garlic', 'Ginger', 'Jowar', 'Bajra', 'Tur Dal',
    'Moong Dal', 'Chana',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register-farmer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        router.push('/farmer-dashboard')
      } else {
        alert(data.error || 'Registration failed. Please try again.')
        setLoading(false)
      }
    } catch {
      alert('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0D1117] to-[#0A0A0A]">
      {/* Header */}
      <header className="border-b border-emerald-500/10 bg-[#0A0A0A]/95 backdrop-blur-xl sticky top-0 z-40">
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
            <Link href="/register" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-emerald-400 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back
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
      <main className="flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {t('auth.registerAsNewMember')}
            </h1>
            <p className="text-gray-500">{t('auth.farmer')}</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full"
          >
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Information Section */}
            <div className="p-6 rounded-xl border border-emerald-500/10 bg-white/[0.02]">
              <h2 className="text-lg font-semibold text-white mb-4">Personal Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {t('auth.fullName')}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                    placeholder="Ramesh Kumar"
                  />
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
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                    placeholder="ramesh@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {t('auth.phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                    placeholder="+91 98765 43210"
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
                      className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {t('auth.confirmPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="p-6 rounded-xl border border-emerald-500/10 bg-white/[0.02]">
              <h2 className="text-lg font-semibold text-white mb-4">Farm Location</h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {t('auth.state')}
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                    placeholder="Haryana"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {t('auth.district')}
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                    placeholder="Sonepat"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {t('auth.village')}
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                    placeholder="Village Name"
                  />
                </div>
              </div>
            </div>

            {/* Farm Information Section */}
            <div className="p-6 rounded-xl border border-emerald-500/10 bg-white/[0.02]">
              <h2 className="text-lg font-semibold text-white mb-4">Farm Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Crops Grown
                    <span className="text-gray-600 font-normal ml-2">— select all that apply</span>
                  </label>
                  {formData.crops.length === 0 && (
                    <p className="text-xs text-amber-500/80 mb-2">Please select at least one crop</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {CROPS.map(crop => {
                      const selected = formData.crops.includes(crop)
                      return (
                        <button
                          key={crop}
                          type="button"
                          onClick={() => toggleCrop(crop)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                            selected
                              ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                              : 'bg-white/[0.03] border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
                          }`}
                        >
                          {selected && <span className="mr-1">✓</span>}
                          {crop}
                        </button>
                      )
                    })}

                    {/* Custom crops added by user */}
                    {formData.crops
                      .filter(c => !CROPS.includes(c))
                      .map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleCrop(c)}
                          className="px-3 py-1.5 rounded-full text-sm font-medium border bg-emerald-500/20 border-emerald-500/60 text-emerald-300 transition-all duration-150"
                        >
                          ✓ {c}
                        </button>
                      ))}
                  </div>

                  {/* Add other crop */}
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={customCrop}
                      onChange={e => setCustomCrop(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomCrop())}
                      placeholder="Other crop…"
                      className="flex-1 px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-white text-sm placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={addCustomCrop}
                      disabled={!customCrop.trim()}
                      className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Farm Size (Hectares)
                  </label>
                  <input
                    type="number"
                    name="farmSize"
                    value={formData.farmSize}
                    onChange={handleChange}
                    required
                    step="0.1"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                    placeholder="5.5"
                  />
                </div>
              </div>
            </div>

            {/* Bank Information Section */}
            <div className="p-6 rounded-xl border border-emerald-500/10 bg-white/[0.02]">
              <h2 className="text-lg font-semibold text-white mb-4">Bank Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {t('auth.bankAccount')}
                  </label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                    placeholder="1234567890123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {t('auth.ifsc')}
                  </label>
                  <input
                    type="text"
                    name="ifsc"
                    value={formData.ifsc}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                    placeholder="SBIN0001234"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold transition-all duration-200"
            >
              {loading ? 'Creating Account...' : t('auth.signup')}
            </motion.button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-gray-500 mb-2">
                {t('auth.alreadyHaveAccount')}
              </p>
              <Link
                href="/login"
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              >
                {t('auth.login')}
              </Link>
            </div>
          </form>
            </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
