'use client'

import { motion } from 'framer-motion'
import { BarChart3, Download, Share2, Star } from 'lucide-react'

export function FarmerPortableHistory() {
  const stats = {
    totalSeasons: 3,
    totalEarned: '₹2,31,400',
    cropsSold: 47,
    averagePrice: '₹2,283/q',
    disputes: 0,
    fposServed: 2,
    trustRating: 5
  }

  const handleShare = () => {
    alert('PDF certificate generated and ready to share!')
  }

  const handleDownload = () => {
    alert('PDF certificate downloaded successfully!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">📊 My Farming Record</h3>
          <p className="text-gray-400 text-sm">This travels with you to any FPO</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-amber-500/10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Total Seasons</p>
          <p className="text-3xl font-bold text-white">{stats.totalSeasons}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Total Earned</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.totalEarned}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Crops Sold</p>
          <p className="text-3xl font-bold text-white">{stats.cropsSold}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Avg Price</p>
          <p className="text-xl font-bold text-white">{stats.averagePrice}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Disputes</p>
          <p className="text-3xl font-bold text-green-400">{stats.disputes}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">FPOs Served</p>
          <p className="text-3xl font-bold text-white">{stats.fposServed}</p>
        </motion.div>
      </div>

      {/* Trust Rating */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Trust Rating</h4>
          <div className="flex items-center gap-1">
            {[...Array(stats.trustRating)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-2xl"
              >
                ⭐
              </motion.span>
            ))}
          </div>
        </div>
        <p className="text-gray-300 text-sm italic">
          "Excellent farmer member — no bank has given you this before."
        </p>
      </motion.div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
          className="py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share with New FPO
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownload}
          className="py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 hover:border-amber-500/60 text-amber-400 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </motion.button>
      </div>
    </motion.div>
  )
}
