'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LogOut, Menu, X, Bell, User, LayoutDashboard, Leaf, BarChart3, Truck, Wallet } from 'lucide-react'

const DispatchMap = dynamic(() => import('@/app/dashboard/dispatches/dispatch-map'), { ssr: false })

const ROUTE = [
  { pos: [12.97, 77.59] as [number, number], label: 'Karnataka — FPO Origin',    stage: 0 },
  { pos: [14.46, 78.82] as [number, number], label: 'Andhra Pradesh',             stage: 1 },
  { pos: [17.38, 78.48] as [number, number], label: 'Telangana',                  stage: 2 },
  { pos: [21.14, 79.09] as [number, number], label: 'Maharashtra',                stage: 2 },
  { pos: [23.25, 77.41] as [number, number], label: 'Madhya Pradesh',             stage: 2 },
  { pos: [26.91, 75.78] as [number, number], label: 'Rajasthan',                  stage: 2 },
  { pos: [29.68, 76.98] as [number, number], label: 'Karnal, Haryana — Mandi',    stage: 3 },
]

const STAGES = [
  { id: 0, label: 'Harvest',  farmerLabel: 'Collected', icon: '🌾' },
  { id: 1, label: 'Loading',  farmerLabel: 'Loaded',    icon: '📦' },
  { id: 2, label: 'Transit',  farmerLabel: 'Travelling', icon: '🚛' },
  { id: 3, label: 'Arrived',  farmerLabel: 'Reached',   icon: '📍' },
  { id: 4, label: 'Sold',     farmerLabel: 'Sold',      icon: '💼' },
  { id: 5, label: 'Paid',     farmerLabel: 'Paid ✅',   icon: '💸' },
]

function PipelinePills({ currentStage, farmer }: { currentStage: number; farmer?: boolean }) {
  const pct = Math.round((currentStage / (STAGES.length - 1)) * 100)
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-0">
        {STAGES.map((stage, i) => {
          const done    = stage.id < currentStage
          const active  = stage.id === currentStage
          const pending = stage.id > currentStage
          const isLast  = i === STAGES.length - 1

          return (
            <div key={stage.id} className="flex items-center flex-1 min-w-0">
              <div
                className={`
                  relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-lg text-center transition-all duration-500 w-full
                  ${done    ? 'bg-emerald-500 text-white'                  : ''}
                  ${active  ? 'bg-amber-500 text-white'                    : ''}
                  ${pending ? 'bg-[#1F2937] text-[#6B7280] border border-[#374151]' : ''}
                `}
                style={active ? {
                  boxShadow: '0 0 20px #F59E0B',
                  animation: 'dispatchPulse 1.5s infinite',
                } : undefined}
              >
                <span className="text-base leading-none">
                  {done ? '✅' : stage.icon}
                </span>
                <span className="text-[10px] font-semibold leading-tight truncate w-full text-center px-0.5">
                  {farmer ? stage.farmerLabel : stage.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className="h-[3px] w-3 shrink-0 transition-all duration-700"
                  style={{
                    background: i < currentStage ? '#10B981' : '#374151',
                    borderTop: i >= currentStage ? '3px dashed #374151' : undefined,
                    height: i >= currentStage ? 0 : 3,
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="w-full bg-[#1F2937] rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(to right, #10B981, #34D399)',
          }}
        />
      </div>
      <p className="text-center text-xs text-gray-500">
        Stage {currentStage + 1} of {STAGES.length} — {STAGES[currentStage]?.farmerLabel}
      </p>
    </div>
  )
}

export default function FarmerDispatchesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [truckIndex, setTruckIndex] = useState(1)
  const [currentStage, setCurrentStage] = useState(2)
  const [isMoving, setIsMoving] = useState(true)

  useEffect(() => {
    if (!isMoving) return
    const iv = setInterval(() => {
      setTruckIndex((prev) => {
        if (prev >= ROUTE.length - 1) {
          setCurrentStage((s) => {
            if (s >= STAGES.length - 1) return s
            return s + 1
          })
          return ROUTE.length - 1
        }
        return prev + 1
      })
    }, 4000)
    return () => clearInterval(iv)
  }, [isMoving])

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-emerald-500/10 bg-[#0A0A0A]/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-white/5 rounded-lg transition-all duration-200 lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-white font-bold">Ramesh Kumar</h1>
              <p className="text-xs text-gray-500">Village Sonepat, Haryana</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-white/5 rounded-lg transition-all duration-200">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full" />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-all duration-200">
              <User className="w-5 h-5 text-gray-400" />
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-emerald-500/5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 256 : 0 }}
          transition={{ duration: 0.3 }}
          className="hidden lg:block border-r border-emerald-500/10 bg-[#0D0D0D] overflow-hidden"
        >
          <nav className="p-6 space-y-2">
            <NavItemIcon 
              icon={LayoutDashboard}
              label="Dashboard" 
              href="/farmer-dashboard"
            />
            <NavItemIcon 
              icon={Leaf}
              label="My Harvest" 
              href="/farmer-dashboard/harvest"
            />
            <NavItemIcon 
              icon={BarChart3}
              label="Sales History" 
              href="/farmer-dashboard/sales"
            />
            <NavItemIcon 
              icon={Truck}
              label="Dispatches" 
              href="/farmer-dashboard/dispatches"
              active
            />
            <NavItemIcon 
              icon={Wallet}
              label="Earnings" 
              href="/farmer-dashboard/earnings"
            />
          </nav>
        </motion.aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8 w-full max-w-5xl mx-auto">
            <div className="space-y-8">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white">Dispatches</h2>
                <p className="text-sm text-gray-500 mt-2">Track your crop dispatch status in real-time</p>
              </div>

              {/* Hero status */}
              <div
                className="rounded-2xl border p-6 text-center"
                style={{ background: 'rgba(10,20,10,0.8)', borderColor: 'rgba(16,185,129,0.3)' }}
              >
                <div className="text-5xl mb-4">🌾</div>
                <p className="text-2xl font-black text-white">Your Wheat</p>
                <p className="text-base text-gray-400 mt-1">8 Quintals</p>
                <div
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-black font-bold text-sm"
                  style={{ background: '#10B981', boxShadow: '0 0 24px rgba(16,185,129,0.4)', animation: 'dispatchPulse 1.5s infinite' }}
                >
                  <span>{STAGES[currentStage]?.icon}</span>
                  <span>Current Status: {STAGES[currentStage]?.farmerLabel}</span>
                </div>
              </div>

              {/* Pipeline */}
              <div className="glass rounded-xl border border-emerald-500/10 p-6">
                <PipelinePills currentStage={currentStage} farmer />
              </div>

              {/* Map */}
              <div className="glass rounded-xl border border-emerald-500/10 p-6">
                <DispatchMap truckIndex={truckIndex} height={350} />
                <p className="text-center mt-4 text-base font-semibold text-amber-400">
                  Your crop is currently in <br />
                  <span className="text-lg">{ROUTE[truckIndex].label}</span>
                </p>
              </div>

              {/* Journey Cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    icon: '🌾', title: 'Your crop collected',
                    sub: 'June 25, 8:12 AM', done: true,
                  },
                  {
                    icon: '🚛', title: 'Truck is on the way',
                    sub: 'Left at 8:37 AM', done: true,
                  },
                  {
                    icon: '📍', title: 'Currently travelling',
                    sub: `In ${ROUTE[truckIndex].label}`, live: true,
                  },
                  {
                    icon: '💰', title: 'Your payment',
                    sub: 'Expected ₹16,500 by 3 PM', pending: true,
                  },
                ].map(({ icon, title, sub, done, live, pending }) => (
                  <div
                    key={title}
                    className={`rounded-xl p-4 border transition-all duration-300 ${
                      done    ? 'bg-emerald-500/[0.07] border-emerald-500/20' :
                      live    ? 'bg-amber-500/[0.07] border-amber-500/40'     :
                      'bg-white/[0.02] border-white/[0.06]'
                    }`}
                    style={live ? { animation: 'dispatchPulse 1.5s infinite' } : undefined}
                  >
                    <div className="text-2xl mb-2">{icon}</div>
                    <p className={`text-sm font-semibold ${done ? 'text-emerald-400' : live ? 'text-amber-400' : 'text-gray-500'}`}>
                      {title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Payment Card */}
              <div
                className="rounded-2xl border p-6"
                style={{
                  background: 'rgba(10,20,10,0.8)',
                  borderColor: currentStage >= 5 ? '#10B981' : 'rgba(16,185,129,0.2)',
                  boxShadow: currentStage >= 5 ? '0 0 30px rgba(16,185,129,0.3)' : undefined,
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">💰</span>
                  <h3 className="text-base font-bold text-white">Your Expected Payment</h3>
                </div>
                <p className="text-4xl font-black text-emerald-400 mb-4">₹16,500</p>
                <div className="space-y-1.5 text-sm border-t border-white/[0.06] pt-3">
                  <div className="flex justify-between text-gray-400">
                    <span>8 quintals × ₹2,387</span>
                    <span className="text-white font-semibold">₹19,096</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Minus transport share</span>
                    <span className="text-red-400">-₹148</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Minus commission</span>
                    <span className="text-red-400">-₹36</span>
                  </div>
                  <div className="flex justify-between border-t border-white/[0.06] pt-1.5 text-base font-bold">
                    <span className="text-white">Your share</span>
                    <span className="text-emerald-400">₹16,500</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Sent to: ram****@upi</p>
                </div>
                <div className={`mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold ${
                  currentStage >= 5
                    ? 'bg-emerald-500 text-black'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}>
                  {currentStage >= 5 ? '✅ PAID — check your UPI now' : '⏳ PENDING — will arrive by 3 PM'}
                </div>
              </div>

              {/* Timeline */}
              <div className="glass rounded-xl border border-emerald-500/10 p-6 space-y-3">
                <h3 className="text-sm font-semibold text-white">Your Crop Journey</h3>
                {[
                  { icon: '✅', text: 'We collected your wheat', sub: 'June 25' },
                  { icon: '✅', text: 'Truck left our centre', sub: '8:37 AM' },
                  { icon: '🔄', text: `Travelling to Karnal — ${ROUTE[truckIndex].label} right now`, live: true },
                  { icon: '⏳', text: 'Will reach Karnal by 2:00 PM', pending: true },
                  { icon: '⏳', text: 'Will be sold for ₹2,387/quintal', pending: true },
                  { icon: '⏳', text: '₹16,500 will reach your UPI by 3 PM', pending: true },
                ].map(({ icon, text, sub, live, pending }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">{icon}</span>
                    <div>
                      <p className={`text-sm font-medium ${live ? 'text-amber-400' : pending ? 'text-gray-600' : 'text-gray-300'}`}>
                        {text}
                      </p>
                      {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function NavItemIcon({ icon: Icon, label, href, active }: { icon: React.ComponentType<{ className?: string }>; label: string; href?: string; active?: boolean }) {
  const className = `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
    active
      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]'
  }`

  if (href) {
    return (
      <Link href={href} className={className}>
        <Icon className="w-5 h-5" />
        <span>{label}</span>
      </Link>
    )
  }

  return (
    <button className={className}>
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  )
}
