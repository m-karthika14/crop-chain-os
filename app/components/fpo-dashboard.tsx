'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, MapPin, Warehouse, Leaf, Users, Copy, Share2, RotateCw, QrCode } from 'lucide-react'

const mockFPO = {
  name: 'GreenHarvest FPO',
  code: 'GH-2025-KA',
  state: 'Karnataka',
  district: 'Belgaum',
  godownAddress: 'Near Belgaum Bus Stand, Main Road, Belgaum, Karnataka 590001',
  capacity: 500,
  crops: ['Wheat', 'Rice', 'Cotton'],
  season: 'Kharif',
  contact: '+91 98765 43210',
  totalMembers: 42,
  createdAt: '2025-01-15',
}

export function FPODashboard() {
  const [showQR, setShowQR] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(mockFPO.code)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const regenerateCode = () => {
    if (window.confirm('This will generate a new FPO code. Existing farmers can still use the old code. Continue?')) {
      alert('New code generated: GH-2025-KA-NEW (demo)')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-xl p-8"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{mockFPO.name}</h1>
            <p className="text-gray-400 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {mockFPO.district}, {mockFPO.state}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 mb-1">FPO Code</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono">{mockFPO.code}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/[0.03] rounded-lg p-4 border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Members</p>
            <p className="text-2xl font-bold text-white">{mockFPO.totalMembers}</p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-4 border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Capacity</p>
            <p className="text-2xl font-bold text-white">{mockFPO.capacity}Q</p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-4 border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Season</p>
            <p className="text-2xl font-bold text-white">{mockFPO.season}</p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-4 border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Created</p>
            <p className="text-sm font-bold text-white">Jan 15</p>
          </div>
        </div>
      </motion.div>

      {/* Share Code Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/[0.02] border border-white/10 rounded-xl p-6 space-y-4"
      >
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-emerald-400" />
          Share FPO Code
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0A0F0A] rounded-lg p-4 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Code</p>
              <code className="text-xl font-bold text-emerald-400 font-mono">{mockFPO.code}</code>
            </div>
            <button
              onClick={copyCode}
              className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
              title={codeCopied ? 'Copied!' : 'Copy'}
            >
              <Copy className={`w-5 h-5 ${codeCopied ? 'text-emerald-400' : 'text-gray-400'}`} />
            </button>
          </div>

          <button
            onClick={() => setShowQR(!showQR)}
            className="bg-[#0A0F0A] rounded-lg p-4 border border-white/10 hover:border-emerald-500/30 transition-all flex items-center justify-between group"
          >
            <span className="text-sm font-medium text-gray-400 group-hover:text-emerald-400 transition-colors">QR Code</span>
            <QrCode className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
          </button>
        </div>

        {showQR && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-[#0A0F0A] rounded-lg p-4 border border-emerald-500/20"
          >
            <div className="bg-white rounded-lg p-4 w-32 h-32 mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect width="100" height="100" fill="white" />
                <text x="50" y="50" textAnchor="middle" dy="0.3em" fontSize="12" fill="black">
                  {mockFPO.code}
                </text>
              </svg>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">Share this QR code with farmers</p>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => window.open(`whatsapp://send?text=Join my FPO ${mockFPO.name} with code: ${mockFPO.code}`)}
            className="py-2 rounded-lg bg-[#25D366] text-white font-semibold hover:bg-[#20ba58] transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp
          </button>
          <button
            onClick={() => alert(`Share message: Join ${mockFPO.name} with code ${mockFPO.code}`)}
            className="py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors text-sm flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            SMS
          </button>
        </div>
      </motion.div>

      {/* FPO Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/[0.02] border border-white/10 rounded-xl p-6 space-y-4"
      >
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-400" />
          FPO Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Contact</p>
              <p className="text-white font-medium">{mockFPO.contact}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Season</p>
              <p className="text-white font-medium">{mockFPO.season}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Godown Capacity</p>
              <p className="text-white font-medium">{mockFPO.capacity} Quintals</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Created</p>
              <p className="text-white font-medium">{mockFPO.createdAt}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2">Godown Address</p>
          <div className="bg-[#0A0F0A] rounded-lg p-4 border border-white/10">
            <p className="text-sm text-white leading-relaxed flex gap-2">
              <Warehouse className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              {mockFPO.godownAddress}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-3">Primary Crops</p>
          <div className="flex flex-wrap gap-2">
            {mockFPO.crops.map(crop => (
              <div
                key={crop}
                className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-400 font-medium flex items-center gap-1"
              >
                <Leaf className="w-3 h-3" />
                {crop}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/[0.02] border border-white/10 rounded-xl p-6 space-y-4"
      >
        <h2 className="text-lg font-bold text-white">Settings</h2>

        <button
          onClick={regenerateCode}
          className="w-full py-3 rounded-lg border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCw className="w-4 h-4" />
          Generate New FPO Code
        </button>
      </motion.div>
    </div>
  )
}
