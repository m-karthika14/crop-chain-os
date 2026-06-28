'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Leaf, Copy, RotateCw, Share2, Printer, Mail, Download } from 'lucide-react'

export function ManagerFPOSettings() {
  const [copied, setCopied] = useState(false)

  const fpoData = {
    name: 'GreenHarvest FPO',
    code: 'GH-2025-KA',
    activeMembers: 825,
    pendingRequests: 3,
    leftThisYear: 12
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fpoData.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGenerateNewCode = () => {
    alert('New FPO code generated and sent to all managers!')
  }

  const handleDownload = () => {
    alert('Member list PDF downloaded!')
  }

  return (
    <div className="space-y-6">
      {/* FPO Code Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{fpoData.name}</h3>
            <p className="text-gray-500 text-sm">FPO Management Hub</p>
          </div>
        </div>

        {/* Code Display */}
        <div className="mb-8 pb-8 border-b border-emerald-500/10">
          <p className="text-gray-400 text-sm mb-3">FPO Code</p>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 px-4 py-3 bg-white/5 border border-emerald-500/20 rounded-lg">
              <p className="text-white font-mono text-lg tracking-widest">{fpoData.code}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyCode}
              className="px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-semibold rounded-lg transition-all flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateNewCode}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            Generate New Code
          </motion.button>
        </div>

        {/* Share Options */}
        <div className="mb-8 pb-8 border-b border-emerald-500/10">
          <p className="text-gray-400 text-sm mb-4">Share FPO Code</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-emerald-500/20 text-emerald-400 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-emerald-500/20 text-emerald-400 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Printer className="w-4 h-4" />
              Print Poster
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3 px-4 bg-white/5 hover:bg-white/10 border border-emerald-500/20 text-emerald-400 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Mail className="w-4 h-4" />
              Email
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Active Members</p>
            <p className="text-3xl font-bold text-emerald-400">{fpoData.activeMembers}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Pending Requests</p>
            <p className="text-3xl font-bold text-amber-400">{fpoData.pendingRequests}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Left This Year</p>
            <p className="text-3xl font-bold text-gray-400">{fpoData.leftThisYear}</p>
          </motion.div>
        </div>

        {/* Download Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownload}
          className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Member List PDF
        </motion.button>
      </motion.div>
    </div>
  )
}
