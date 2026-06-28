'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation, type Language } from '@/hooks/useTranslation'
import { Users, Globe, ArrowLeft, Eye, EyeOff, Copy, Check, ArrowRight, Wheat, Leaf } from 'lucide-react'

function generateFPOCode(orgName: string): string {
  const prefix = orgName.trim().slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X') || 'FPO'
  const num = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}-${num}`
}

export default function FPORegisterPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>('en')
  const { t } = useTranslation(language)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fpoCode, setFpoCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [selectedCrops, setSelectedCrops] = useState<string[]>([])

  const FPO_CROPS = ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Soybean', 'Pulses', 'Vegetables', 'Onion', 'Tomato']
  const SEASONS = ['Kharif', 'Rabi', 'Summer']

  const toggleCrop = (crop: string) => {
    setSelectedCrops(prev =>
      prev.includes(crop) ? prev.filter(c => c !== crop) : [...prev, crop]
    )
  }

  const [formData, setFormData] = useState({
    organizationName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactPerson: '',
    contactPhone: '',
    state: '',
    district: '',
    village: '',
    godownAddress: '',
    godownCapacity: '',
    season: '',
    bankName: '',
    bankAccount: '',
    ifsc: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register-fpo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, primaryCrops: selectedCrops }),
      })

      const data = await res.json()

      if (data.success) {
        setFpoCode(data.fpoCode)
      } else {
        alert(data.error || 'Registration failed. Please try again.')
        setLoading(false)
      }
    } catch {
      alert('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!fpoCode) return
    navigator.clipboard.writeText(fpoCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-500/5 border border-emerald-500/20">
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
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Register your FPO</h1>
            <p className="text-gray-500">Farmer Producer Organization</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Organization Information */}
            <div className="p-6 rounded-xl border border-emerald-500/10 bg-white/[0.02]">
              <h2 className="text-lg font-semibold text-white mb-4">Organization Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Organization Name</label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                    placeholder="Farmer Cooperative Ltd."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('auth.email')}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                    placeholder="contact@fpo.com"
                  />
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="p-6 rounded-xl border border-emerald-500/10 bg-white/[0.02]">
              <h2 className="text-lg font-semibold text-white mb-4">Contact Person</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('auth.contactPerson')}</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('auth.contactPhone')}</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="p-6 rounded-xl border border-emerald-500/10 bg-white/[0.02]">
              <h2 className="text-lg font-semibold text-white mb-4">Location</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('auth.state')}</label>
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
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('auth.district')}</label>
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
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('auth.village')}</label>
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

            {/* Godown & Operations */}
            <div className="p-6 rounded-xl border border-emerald-500/10 bg-white/[0.02]">
              <h2 className="text-lg font-semibold text-white mb-4">Godown & Operations</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Godown Address</label>
                  <textarea
                    name="godownAddress"
                    value={formData.godownAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, godownAddress: e.target.value }))}
                    required
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all resize-none"
                    placeholder="Full address with street, area, locality"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Storage Capacity (Quintals)</label>
                    <input
                      type="number"
                      name="godownCapacity"
                      value={formData.godownCapacity}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Season</label>
                    <select
                      name="season"
                      value={formData.season}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white focus:border-emerald-500/50 focus:outline-none transition-all"
                    >
                      <option value="">Select Season</option>
                      {SEASONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">Primary Crops</label>
                  <div className="flex flex-wrap gap-2">
                    {FPO_CROPS.map(crop => (
                      <button
                        key={crop}
                        type="button"
                        onClick={() => toggleCrop(crop)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                          selectedCrops.includes(crop)
                            ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                            : 'border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/20 hover:text-gray-300'
                        }`}
                      >
                        <Leaf className="w-3.5 h-3.5" />
                        {crop}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="p-6 rounded-xl border border-emerald-500/10 bg-white/[0.02]">
              <h2 className="text-lg font-semibold text-white mb-4">Security</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('auth.password')}</label>
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
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('auth.confirmPassword')}</label>
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
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Information */}
            <div className="p-6 rounded-xl border border-emerald-500/10 bg-white/[0.02]">
              <h2 className="text-lg font-semibold text-white mb-4">Bank Information</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('auth.bankName')}</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                    placeholder="State Bank of India"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('auth.bankAccount')}</label>
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
                  <label className="block text-sm font-medium text-gray-400 mb-2">{t('auth.ifsc')}</label>
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

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                t('auth.signup')
              )}
            </motion.button>

            <div className="text-center pt-4">
              <p className="text-gray-500 mb-2">{t('auth.alreadyHaveAccount')}</p>
              <Link href="/login?role=fpo" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                {t('auth.login')}
              </Link>
            </div>
          </form>
        </motion.div>
      </main>

      {/* FPO Code Popup */}
      <AnimatePresence>
        {fpoCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-md bg-[#0D1117] border border-emerald-500/30 rounded-2xl p-8 shadow-2xl shadow-emerald-500/10"
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Users className="w-8 h-8 text-emerald-400" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white text-center mb-1">Account Created!</h2>
              <p className="text-gray-500 text-center text-sm mb-8">
                Share this code with your farmers so they can join your FPO.
              </p>

              {/* FPO Code box */}
              <div className="mb-8">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 text-center">Your FPO Code</p>
                <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/30 rounded-xl px-5 py-4">
                  <span className="flex-1 text-2xl font-mono font-bold text-emerald-400 tracking-widest text-center">
                    {fpoCode}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 p-2 rounded-lg hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400 transition-all"
                  >
                    {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-600 text-center mt-2">
                  Save this code — you can also find it in your dashboard settings.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
