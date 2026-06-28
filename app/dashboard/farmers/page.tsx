'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, MapPin, Phone, User, TrendingUp, AlertCircle, CheckCircle2, X, Clock } from 'lucide-react'

interface Farmer {
  id: string | number
  name: string
  village: string
  phone: string
  crops: string
  status: string
  harvests: number
  earnings: string
  trust: number
}

interface PendingFarmer {
  id: string
  full_name: string
  phone_number: string
  village: string
  email: string
  membership_id: string
  joined_with_code: string
  requested_at: string
}

export default function FarmersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [farmers, setFarmers] = useState<Farmer[]>([
    {
      id: 1,
      name: 'Ramesh Kumar',
      village: 'Sonepat',
      phone: '+91 98765 43210',
      crops: 'Wheat, Rice',
      status: 'Active',
      harvests: 5,
      earnings: '₹31,200',
      trust: 94,
    },
    {
      id: 2,
      name: 'Priya Devi',
      village: 'Panipat',
      phone: '+91 97654 32109',
      crops: 'Cotton, Soybean',
      status: 'Active',
      harvests: 8,
      earnings: '₹42,500',
      trust: 87,
    },
    {
      id: 3,
      name: 'Suresh Patel',
      village: 'Karnal',
      phone: '+91 96543 21098',
      crops: 'Wheat',
      status: 'Active',
      harvests: 3,
      earnings: '₹18,900',
      trust: 92,
    },
    {
      id: 4,
      name: 'Anjali Singh',
      village: 'Hisar',
      phone: '+91 95432 10987',
      crops: 'Maize, Pulses',
      status: 'Inactive',
      harvests: 2,
      earnings: '₹12,300',
      trust: 76,
    },
  ])
  const [pendingFarmers, setPendingFarmers] = useState<PendingFarmer[]>([])

  const [formData, setFormData] = useState({
    name: '',
    village: '',
    phone: '',
    crops: '',
  })

  useEffect(() => {
    const fpoId = localStorage.getItem('fpoId') || 'fpo-001'

    fetch(`/api/farmers?fpoId=${fpoId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.farmers.length > 0) {
          setFarmers(data.farmers.map((f: Record<string, unknown>) => ({
            id: f.id,
            name: f.full_name,
            village: f.village || '',
            phone: f.phone_number || '',
            crops: '',
            status: f.status || 'Active',
            harvests: Number(f.total_sales) || 0,
            earnings: f.total_earnings ? `₹${Number(f.total_earnings).toLocaleString('en-IN')}` : '₹0',
            trust: Number(f.trust_score) || 50,
          })))
        }
      })
      .catch(() => {})

    fetch(`/api/farmers/pending?fpoId=${fpoId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setPendingFarmers(data.pending || [])
      })
      .catch(() => {})
  }, [])

  const handleAddFarmer = () => {
    if (!formData.name || !formData.village || !formData.phone || !formData.crops) return

    const fpoId = localStorage.getItem('fpoId') || 'fpo-001'
    const managerId = localStorage.getItem('userId') || 'mgr-001'

    fetch('/api/farmers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fpoId,
        managerId,
        full_name: formData.name,
        village: formData.village,
        phone_number: formData.phone,
        crops: formData.crops,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const f = data.farmer
          setFarmers(prev => [{
            id: f.id,
            name: f.full_name,
            village: f.village || '',
            phone: f.phone_number || '',
            crops: formData.crops,
            status: f.status || 'Active',
            harvests: 0,
            earnings: '₹0',
            trust: f.trust_score || 85,
          }, ...prev])
          setFormData({ name: '', village: '', phone: '', crops: '' })
          setShowAddModal(false)
        } else {
          alert(data.error || 'Failed to add farmer')
        }
      })
      .catch(() => alert('Something went wrong. Please try again.'))
  }

  const handleApprove = (farmer: PendingFarmer) => {
    const fpoId = localStorage.getItem('fpoId') || 'fpo-001'
    const managerId = localStorage.getItem('userId') || 'mgr-001'

    fetch('/api/farmers/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        membershipId: farmer.membership_id,
        farmerId: farmer.id,
        fpoId,
        managerId,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setPendingFarmers(prev => prev.filter(f => f.id !== farmer.id))
          fetch(`/api/farmers?fpoId=${fpoId}`)
            .then(r => r.json())
            .then(d => {
              if (d.success && d.farmers.length > 0) {
                setFarmers(d.farmers.map((f: Record<string, unknown>) => ({
                  id: f.id,
                  name: f.full_name,
                  village: f.village || '',
                  phone: f.phone_number || '',
                  crops: '',
                  status: f.status || 'Active',
                  harvests: Number(f.total_sales) || 0,
                  earnings: f.total_earnings ? `₹${Number(f.total_earnings).toLocaleString('en-IN')}` : '₹0',
                  trust: Number(f.trust_score) || 50,
                })))
              }
            })
            .catch(() => {})
        }
      })
      .catch(() => alert('Something went wrong'))
  }

  const handleReject = (farmer: PendingFarmer) => {
    const fpoId = localStorage.getItem('fpoId') || 'fpo-001'

    fetch('/api/farmers/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        membershipId: farmer.membership_id,
        fpoId,
        action: 'reject',
        reason: 'Rejected by manager',
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setPendingFarmers(prev => prev.filter(f => f.id !== farmer.id))
        }
      })
      .catch(() => alert('Something went wrong'))
  }

  const filtered = farmers.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.village.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Farmers Directory</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage {farmers.length} registered farmers</p>
        </div>
        <motion.button
          onClick={() => setShowAddModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-[#0A0A0A] font-semibold px-5 py-2.5 rounded-xl transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          Add Farmer
        </motion.button>
      </div>

      {/* Pending Approvals */}
      {pendingFarmers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl border border-amber-500/20 overflow-hidden"
        >
          <div className="flex items-center gap-2 px-6 py-3 border-b border-amber-500/10 bg-amber-500/5">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-400">Pending Approvals</h3>
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">{pendingFarmers.length}</span>
          </div>
          <div className="divide-y divide-white/5">
            {pendingFarmers.map(farmer => (
              <div key={farmer.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{farmer.full_name}</p>
                  <p className="text-xs text-gray-500">{farmer.village} · {farmer.phone_number}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(farmer)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(farmer)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
        <input
          type="text"
          placeholder="Search farmers by name or village..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all duration-200"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Farmers', value: String(farmers.length), icon: User, color: 'emerald' },
          { label: 'Active', value: String(farmers.filter(f => f.status === 'Active').length), icon: CheckCircle2, color: 'emerald' },
          { label: 'Inactive', value: String(farmers.filter(f => f.status !== 'Active').length), icon: AlertCircle, color: 'amber' },
          { label: 'Avg Trust', value: farmers.length ? `${Math.round(farmers.reduce((sum, f) => sum + f.trust, 0) / farmers.length)}%` : '—', icon: TrendingUp, color: 'emerald' },
        ].map((stat, i) => {
          const Icon = stat.icon
          const bgColor = stat.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'
          const textColor = stat.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass rounded-lg border ${bgColor} p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className={`text-2xl font-bold ${textColor} mt-1`}>{stat.value}</p>
                </div>
                <Icon className={`w-6 h-6 ${textColor} opacity-50`} />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl border border-white/10 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Farmer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Village</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Crops</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Harvests</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Earnings</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Trust</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((farmer, i) => (
                <motion.tr
                  key={farmer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-all duration-200"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{farmer.name}</p>
                      <p className="text-xs text-gray-500">{farmer.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-300">
                      <MapPin className="w-3 h-3" />
                      {farmer.village}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{farmer.crops}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      farmer.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      {farmer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{farmer.harvests}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-white">{farmer.earnings}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${farmer.trust}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-emerald-400">{farmer.trust}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Farmer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Add New Farmer</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Farmer's full name"
                    className="w-full mt-1.5 px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                {/* Village */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Village</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="Village or district"
                    className="w-full mt-1.5 px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full mt-1.5 px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                {/* Crops */}
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase">Crops</label>
                  <input
                    type="text"
                    value={formData.crops}
                    onChange={(e) => setFormData({ ...formData, crops: e.target.value })}
                    placeholder="e.g. Wheat, Rice"
                    className="w-full mt-1.5 px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFarmer}
                  disabled={!formData.name || !formData.village || !formData.phone || !formData.crops}
                  className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-[#0A0A0A] font-semibold rounded-lg transition-colors"
                >
                  Add Farmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
