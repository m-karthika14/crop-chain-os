'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, MapPin, Warehouse, Leaf, Calendar, ArrowRight, ArrowLeft, CheckCircle2, Copy, Share2, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface FPOFormData {
  name: string
  state: string
  district: string
  godownAddress: string
  godownCapacity: string
  primaryCrops: string[]
  season: string
  contact: string
}

const STATES = ['Haryana', 'Punjab', 'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh', 'Karnataka', 'Tamil Nadu', 'Maharashtra']
const CROPS = ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Soybean', 'Pulses', 'Vegetables']
const SEASONS = ['Kharif', 'Rabi', 'Summer']

export function FPORegistration() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [fpoCode, setFpoCode] = useState('')
  const [formData, setFormData] = useState<FPOFormData>({
    name: '',
    state: '',
    district: '',
    godownAddress: '',
    godownCapacity: '',
    primaryCrops: [],
    season: '',
    contact: '',
  })

  const generateFPOCode = () => {
    const stateCode = formData.state.substring(0, 2).toUpperCase()
    const year = new Date().getFullYear()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `GH-${year}-${stateCode}`
  }

  const handleInputChange = (field: keyof FPOFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleCrop = (crop: string) => {
    setFormData(prev => ({
      ...prev,
      primaryCrops: prev.primaryCrops.includes(crop)
        ? prev.primaryCrops.filter(c => c !== crop)
        : [...prev.primaryCrops, crop]
    }))
  }

  const handleNextStep = async () => {
    if (step === 1) {
      if (!formData.name || !formData.state || !formData.district) {
        alert('Please fill all fields')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!formData.godownAddress || !formData.godownCapacity || formData.primaryCrops.length === 0) {
        alert('Please fill all fields')
        return
      }
      setStep(3)
    } else if (step === 3) {
      if (!formData.season || !formData.contact) {
        alert('Please fill all fields')
        return
      }
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      const code = generateFPOCode()
      setFpoCode(code)
      setLoading(false)
      setStep(4)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fpoCode)
    alert('FPO Code copied to clipboard!')
  }

  if (step === 4) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-[#0A0F0A] flex items-center justify-center p-6"
      >
        <div className="text-center space-y-8 max-w-md">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <CheckCircle2 className="w-24 h-24 text-emerald-400 mx-auto" />
          </motion.div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white">FPO Created</h2>
            <p className="text-gray-400">{formData.name} is ready to onboard farmers</p>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 space-y-3">
            <p className="text-sm text-gray-400">Your FPO Code</p>
            <div className="flex items-center justify-between bg-[#0A0F0A] rounded-lg p-4 border border-emerald-500/20">
              <code className="text-2xl font-bold text-emerald-400 font-mono">{fpoCode}</code>
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
              >
                <Copy className="w-5 h-5 text-emerald-400" />
              </button>
            </div>
            <p className="text-xs text-gray-500">Share this code with farmers to join your FPO</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => window.open(`whatsapp://send?text=Join my FPO with code: ${fpoCode}`)}
              className="w-full py-3 rounded-lg bg-[#25D366] text-white font-semibold hover:bg-[#20ba58] transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share on WhatsApp
            </button>
            <Link
              href="/dashboard"
              className="inline-block w-full py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors text-center"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0F0A] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/login?role=fpo"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">
              Step {step} of 3 · {step === 1 ? 'Basic Info' : step === 2 ? 'Godown Details' : 'Finalize'}
            </h1>
            <span className="text-sm text-gray-400">{step === 1 ? '33%' : step === 2 ? '66%' : '100%'}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">FPO Name</label>
                <input
                  type="text"
                  placeholder="e.g., GreenHarvest FPO"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="">Select State</option>
                    {STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">District</label>
                  <input
                    type="text"
                    placeholder="e.g., Karnal"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Godown Details */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Godown Address</label>
                <textarea
                  placeholder="Full address with street, area, locality"
                  value={formData.godownAddress}
                  onChange={(e) => handleInputChange('godownAddress', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Storage Capacity (Quintals)</label>
                <input
                  type="number"
                  placeholder="e.g., 500"
                  value={formData.godownCapacity}
                  onChange={(e) => handleInputChange('godownCapacity', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Primary Crops (Select at least 2)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {CROPS.map(crop => (
                    <motion.button
                      key={crop}
                      onClick={() => toggleCrop(crop)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.primaryCrops.includes(crop)
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <Leaf className={`w-4 h-4 mx-auto mb-1 ${formData.primaryCrops.includes(crop) ? 'text-emerald-400' : 'text-gray-400'}`} />
                      <div className="text-xs font-medium text-white">{crop}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Finalize */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Season</label>
                  <select
                    value={formData.season}
                    onChange={(e) => handleInputChange('season', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="">Select Season</option>
                    {SEASONS.map(season => (
                      <option key={season} value={season}>{season}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.contact}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-white text-sm">FPO Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Name:</span>
                    <span className="text-white font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Location:</span>
                    <span className="text-white font-medium">{formData.district}, {formData.state}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Crops:</span>
                    <span className="text-white font-medium">{formData.primaryCrops.length} selected</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Capacity:</span>
                    <span className="text-white font-medium">{formData.godownCapacity} Q</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 rounded-lg border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <button
            onClick={handleNextStep}
            disabled={loading}
            className="flex-1 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating FPO...
              </>
            ) : (
              <>
                {step === 3 ? 'Create FPO' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
