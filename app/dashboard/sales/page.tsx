'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Download, TrendingUp, Calendar } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function SalesPage() {
  const [dateRange, setDateRange] = useState('month')

  const salesData = [
    { date: 'Mon', sales: 12, amount: '₹2.4L' },
    { date: 'Tue', sales: 19, amount: '₹3.8L' },
    { date: 'Wed', sales: 15, amount: '₹3.0L' },
    { date: 'Thu', sales: 22, amount: '₹4.4L' },
    { date: 'Fri', sales: 28, amount: '₹5.6L' },
    { date: 'Sat', sales: 25, amount: '₹5.0L' },
    { date: 'Sun', sales: 18, amount: '₹3.6L' },
  ]

  const cropSales = [
    { name: 'Wheat', value: 45, amount: 85.2 },
    { name: 'Rice', value: 30, amount: 56.4 },
    { name: 'Cotton', value: 15, amount: 28.3 },
    { name: 'Others', value: 10, amount: 18.9 },
  ]

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#6366F1']

  const recentSales = [
    { id: 1, farmer: 'Ramesh Kumar', crop: 'Wheat', qty: '280Q', price: 2387, mandi: 'Karnal', date: '2 hours ago', status: 'Completed' },
    { id: 2, farmer: 'Priya Devi', crop: 'Cotton', qty: '120Q', price: 4200, mandi: 'Delhi', date: '4 hours ago', status: 'Completed' },
    { id: 3, farmer: 'Suresh Patel', crop: 'Rice', qty: '150Q', price: 3100, mandi: 'Panipat', date: '6 hours ago', status: 'Completed' },
    { id: 4, farmer: 'Anjali Singh', crop: 'Maize', qty: '95Q', price: 1850, mandi: 'Hisar', date: '8 hours ago', status: 'Pending' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Sales Management</h2>
          <p className="text-xs text-gray-500 mt-0.5">Weekly sales overview and analytics</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold px-5 py-2.5 rounded-lg transition-all duration-300"
        >
          <Download className="w-4 h-4" />
          Export Report
        </motion.button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sales', value: '139', icon: TrendingUp, change: '+12%' },
          { label: 'Total Revenue', value: '₹26.2L', icon: TrendingUp, change: '+8%' },
          { label: 'Avg Sale Price', value: '₹2,387', icon: TrendingUp, change: '+4%' },
          { label: 'Active Crops', value: '12', icon: TrendingUp, change: 'All' },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-lg border border-emerald-500/10 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">{card.label}</p>
                <Icon className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-xs text-emerald-400 mt-1">{card.change}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass rounded-lg border border-white/10 p-6"
        >
          <h3 className="text-sm font-bold text-white mb-6">Weekly Sales Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#10B9811a" />
              <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0A0A0A',
                  border: '1px solid #10B98133',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#10B981' }}
              />
              <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-lg border border-white/10 p-6"
        >
          <h3 className="text-sm font-bold text-white mb-6">Sales by Crop</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={cropSales} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                {cropSales.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0A0A0A',
                  border: '1px solid #10B98133',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#10B981' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Sales Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-lg border border-white/10 overflow-hidden"
      >
        <div className="p-6 border-b border-white/5">
          <h3 className="text-sm font-bold text-white">Recent Sales</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Farmer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Crop</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Quantity</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Price</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Mandi</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-all duration-200">
                  <td className="px-6 py-4 text-sm text-white">{sale.farmer}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{sale.crop}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{sale.qty}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-white">₹{sale.price.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{sale.mandi}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{sale.date}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      sale.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
