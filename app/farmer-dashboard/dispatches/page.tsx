'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LayoutDashboard, Leaf, BarChart3, Truck, Wallet } from 'lucide-react'
import { FarmerHeader } from '@/app/farmer-dashboard/components/farmer-header'

const DispatchMap = dynamic(() => import('@/app/dashboard/dispatches/dispatch-map'), { ssr: false })

const STAGES = [
  { id: 0, farmerLabel: 'Collected',  emoji: '🌾' },
  { id: 1, farmerLabel: 'Loaded',     emoji: '📦' },
  { id: 2, farmerLabel: 'Travelling', emoji: '🚛' },
  { id: 3, farmerLabel: 'Reached',    emoji: '📍' },
  { id: 4, farmerLabel: 'Sold',       emoji: '🏪' },
  { id: 5, farmerLabel: 'Paid ✅',    emoji: '💰' },
]

const CROP_EMOJI: Record<string, string> = {
  wheat: '🌾', rice: '🌾', tomato: '🍅', onion: '🧅', potato: '🥔',
}

// Fallback coordinates for Indian mandis when DB has no lat/lng
const MANDI_COORDS: Record<string, [number, number]> = {
  'azadpur':       [28.7240, 77.1770], 'vashi':         [19.0771, 73.0003],
  'koyambedu':     [13.0716, 80.1946], 'gultekdi':      [18.4956, 73.8527],
  'yeshwanthpur':  [13.0302, 77.5348], 'sector 26':     [30.7358, 76.8013],
  'gaddiannaram':  [17.3850, 78.5707], 'bowenpally':    [17.4700, 78.4940],
  'harda':         [22.3399, 77.0950], 'indore':        [22.7196, 75.8577],
  'bhopal':        [23.2599, 77.4126], 'nagpur':        [21.1458, 79.0882],
  'pune':          [18.5204, 73.8567], 'mumbai':        [19.0760, 72.8777],
  'delhi':         [28.7041, 77.1025], 'chennai':       [13.0827, 80.2707],
  'hyderabad':     [17.3850, 78.4867], 'bengaluru':     [12.9716, 77.5946],
  'kolkata':       [22.5726, 88.3639], 'ahmedabad':     [23.0225, 72.5714],
  'jaipur':        [26.9124, 75.7873], 'lucknow':       [26.8467, 80.9462],
  'kanpur':        [26.4499, 80.3319], 'patna':         [25.5941, 85.1376],
  'surat':         [21.1702, 72.8311], 'agra':          [27.1767, 78.0081],
  'amritsar':      [31.6340, 74.8723], 'chandigarh':    [30.7333, 76.7794],
  'coimbatore':    [11.0168, 76.9558], 'madurai':       [9.9252,  78.1198],
  'visakhapatnam': [17.6868, 83.2185], 'vijayawada':    [16.5062, 80.6480],
  'warangal':      [17.9784, 79.5941], 'rajkot':        [22.3039, 70.8022],
  'vadodara':      [22.3072, 73.1812], 'nashik':        [19.9975, 73.7898],
  'aurangabad':    [19.8762, 75.3433], 'solapur':       [17.6805, 75.9064],
}

const STATE_COORDS: Record<string, [number, number]> = {
  'andhra pradesh': [15.9129, 79.7400], 'haryana': [29.0588, 76.0856],
  'madhya pradesh': [22.9734, 78.6569], 'maharashtra': [19.7515, 75.7139],
  'punjab': [31.1471, 75.3412],         'rajasthan': [27.0238, 74.2179],
  'uttar pradesh': [26.8467, 80.9462],  'gujarat': [22.2587, 71.1924],
  'karnataka': [15.3173, 75.7139],      'telangana': [18.1124, 79.0193],
  'tamil nadu': [11.1271, 78.6569],     'west bengal': [22.9868, 87.8550],
  'bihar': [25.0961, 85.3131],          'odisha': [20.9517, 85.0985],
  'kerala': [10.8505, 76.2711],         'jharkhand': [23.6102, 85.2799],
  'chhattisgarh': [21.2787, 81.8661],   'uttarakhand': [30.0668, 79.0193],
}

function mandiCoordsFallback(name: string): [number, number] | undefined {
  const key = name?.toLowerCase().trim()
  for (const [k, v] of Object.entries(MANDI_COORDS)) {
    if (key?.includes(k)) return v
  }
  return undefined
}

function cropEmoji(crop: string) {
  return CROP_EMOJI[crop?.toLowerCase()] || '🌿'
}

function PipelinePills({ currentStage }: { currentStage: number }) {
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
                className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-lg text-center transition-all duration-500 w-full
                  ${done    ? 'bg-emerald-500 text-white' : ''}
                  ${active  ? 'bg-amber-500 text-white'   : ''}
                  ${pending ? 'bg-[#1F2937] text-[#6B7280] border border-[#374151]' : ''}
                `}
                style={active ? { boxShadow: '0 0 18px #F59E0B' } : undefined}
              >
                <span className="text-base leading-none">{done ? '✅' : stage.emoji}</span>
                <span className="text-[10px] font-semibold leading-tight truncate w-full text-center px-0.5">
                  {stage.farmerLabel}
                </span>
              </div>
              {!isLast && (
                <div
                  className="shrink-0 transition-all duration-700"
                  style={{
                    width: 12, height: 3,
                    background: i < currentStage ? '#10B981' : '#374151',
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
          style={{ width: `${pct}%`, background: 'linear-gradient(to right, #10B981, #34D399)' }}
        />
      </div>
      <p className="text-center text-xs text-gray-500">
        Stage {currentStage + 1} of {STAGES.length} — {STAGES[currentStage]?.farmerLabel}
      </p>
    </div>
  )
}

function NavItemIcon({ icon: Icon, label, href, active }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
        active
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  )
}

export default function FarmerDispatchesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dispatches,  setDispatches]  = useState<Record<string, unknown>[]>([])
  const [selected,    setSelected]    = useState<Record<string, unknown> | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [farmerState, setFarmerState] = useState('')

  useEffect(() => {
    const farmerId = localStorage.getItem('userId') || ''
    const state    = localStorage.getItem('farmerState') || ''
    setFarmerState(state)
    if (!farmerId) { setLoading(false); return }

    fetch(`/api/dispatches/farmer?farmerId=${farmerId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.dispatches.length > 0) {
          setDispatches(data.dispatches)
          setSelected(data.dispatches[0])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const currentStage = selected ? Math.max(0, Math.min(Number(selected.current_stage) || 0, STAGES.length - 1)) : 0

  const mapTruckIndex = currentStage <= 0 ? 0
    : currentStage === 1 ? 1
    : currentStage === 2 ? 3
    : 6

  const mandiPos: [number, number] | undefined =
    selected?.mandi_lat && selected?.mandi_lng
      ? [parseFloat(selected.mandi_lat as string), parseFloat(selected.mandi_lng as string)]
      : selected?.mandi_name
        ? mandiCoordsFallback(selected.mandi_name as string)
        : undefined

  const startPos: [number, number] | undefined =
    farmerState
      ? STATE_COORDS[farmerState.toLowerCase().trim()] ?? [22.9734, 78.6569]
      : [22.9734, 78.6569] // default: MP centre

  const farmerQty = selected?.farmer_quantity ? parseFloat(selected.farmer_quantity as string) : null
  const totalQty = selected?.total_quantity ? parseFloat(selected.total_quantity as string) : 1
  const actualRevenue = selected?.actual_revenue ? parseFloat(selected.actual_revenue as string) : 0
  const pricePerQ = actualRevenue > 0 && totalQty > 0 ? actualRevenue / totalQty : null
  const farmerPayout = selected?.farmer_payout ? parseFloat(selected.farmer_payout as string) : null
  const payoutStatus = selected?.payout_status as string | undefined

  // Estimate payout if not yet calculated
  const estimatedPayout = farmerQty && pricePerQ
    ? Math.round(farmerQty * pricePerQ)
    : null

  function fmtTime(iso: string | undefined | null) {
    if (!iso) return null
    try { return new Date(iso as string).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
    catch { return null }
  }

  const departedStr = fmtTime(selected?.departed_at as string)
  const etaStr = fmtTime(selected?.eta as string)

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <FarmerHeader subtitle="Dispatch Tracker" activeNav="dispatches" sidebarOpen={sidebarOpen} onSidebarToggle={() => setSidebarOpen(v => !v)} />

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 256 : 0 }}
          transition={{ duration: 0.3 }}
          className="hidden lg:block border-r border-emerald-500/10 bg-[#0D0D0D] overflow-hidden"
        >
          <nav className="p-6 space-y-2">
            <NavItemIcon icon={LayoutDashboard} label="Dashboard"     href="/farmer-dashboard" />
            <NavItemIcon icon={Leaf}            label="My Harvest"    href="/farmer-dashboard/harvest" />
            <NavItemIcon icon={BarChart3}       label="Sales History" href="/farmer-dashboard/sales" />
            <NavItemIcon icon={Truck}           label="Dispatches"    href="/farmer-dashboard/dispatches" active />
            <NavItemIcon icon={Wallet}          label="Earnings"      href="/farmer-dashboard/earnings" />
          </nav>
        </motion.aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 w-full max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">My Dispatch</h2>
              <p className="text-sm text-gray-500 mt-1">Track your crop in real-time</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-2 border-emerald-500/20" />
                  <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  <div className="absolute inset-2 w-10 h-10 rounded-full bg-emerald-500/10 animate-pulse" />
                </div>
              </div>
            ) : dispatches.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <p className="text-6xl">🌾</p>
                <p className="text-white font-semibold text-lg">No active dispatches yet</p>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Your FPO will dispatch your crop once enough harvest is collected from all farmers.
                </p>
                <Link href="/farmer-dashboard/submit-harvest"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-sm"
                >
                  + Submit Harvest
                </Link>
              </div>
            ) : (
              <>
                {/* Crop tabs (if multiple dispatches) */}
                {dispatches.length > 1 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {dispatches.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => setSelected(d)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                          selected === d
                            ? 'bg-emerald-500 text-black'
                            : 'bg-white/10 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        <span>{cropEmoji(d.crop as string)}</span>
                        {d.crop as string}
                      </button>
                    ))}
                  </div>
                )}

                {/* Hero status card */}
                <div
                  className="rounded-2xl border p-6 text-center"
                  style={{ background: 'rgba(10,20,10,0.8)', borderColor: 'rgba(16,185,129,0.3)' }}
                >
                  <div className="text-5xl mb-3">{cropEmoji(selected?.crop as string)}</div>
                  <p className="text-2xl font-black text-white">{selected?.crop as string}</p>
                  {farmerQty && (
                    <p className="text-sm text-gray-400 mt-1">{farmerQty} Quintals — your share</p>
                  )}
                  <div
                    className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-black font-bold text-sm"
                    style={{ background: '#10B981', boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}
                  >
                    <span>{STAGES[currentStage]?.emoji}</span>
                    <span>Status: {STAGES[currentStage]?.farmerLabel}</span>
                  </div>
                </div>

                {/* Pipeline */}
                <div className="glass rounded-xl border border-emerald-500/10 p-5">
                  <PipelinePills currentStage={currentStage} />
                </div>

                {/* Truck tracking map */}
                <div className="glass rounded-xl border border-emerald-500/10 p-5">
                  <p className="text-sm font-semibold text-white mb-3">Live Location</p>
                  <DispatchMap
                    key={`${startPos?.join(',')}-${mandiPos?.join(',')}`}
                    truckIndex={mapTruckIndex}
                    startPos={startPos}
                    endPos={mandiPos}
                    height={300}
                  />
                  <p className="text-center mt-3 text-sm font-semibold text-amber-400">
                    Heading to {selected?.mandi_name as string}, {selected?.mandi_state as string}
                  </p>
                </div>

                {/* Journey cards */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      emoji: '🌾',
                      title: 'Your crop collected',
                      sub: departedStr ? `Collected by FPO` : 'Pending collection',
                      done: currentStage >= 1,
                    },
                    {
                      emoji: '🚛',
                      title: 'Truck dispatched',
                      sub: departedStr ? `Left at ${departedStr}` : 'Not departed yet',
                      done: currentStage >= 2,
                      live: currentStage === 1,
                    },
                    {
                      emoji: '📍',
                      title: 'Currently travelling',
                      sub: currentStage >= 3
                        ? `Arrived at ${selected?.mandi_name as string}`
                        : currentStage === 2
                        ? 'In transit to mandi'
                        : 'Not yet in transit',
                      live: currentStage === 2,
                      done: currentStage >= 3,
                    },
                    {
                      emoji: '💰',
                      title: 'Your payment',
                      sub: farmerPayout
                        ? `₹${farmerPayout.toLocaleString('en-IN')} ${payoutStatus === 'PAID' ? '— Paid!' : '— Ready'}`
                        : estimatedPayout
                        ? `~₹${estimatedPayout.toLocaleString('en-IN')} expected`
                        : `ETA: ${etaStr || 'after sale'}`,
                      done: payoutStatus === 'PAID',
                      live: currentStage >= 4 && payoutStatus !== 'PAID',
                    },
                  ].map(({ emoji, title, sub, done, live }) => (
                    <div
                      key={title}
                      className={`rounded-xl p-4 border transition-all duration-300 ${
                        done ? 'bg-emerald-500/[0.07] border-emerald-500/20'
                          : live ? 'bg-amber-500/[0.07] border-amber-500/40'
                          : 'bg-white/[0.02] border-white/[0.06]'
                      }`}
                    >
                      <div className="text-2xl mb-2">{emoji}</div>
                      <p className={`text-sm font-semibold ${done ? 'text-emerald-400' : live ? 'text-amber-400' : 'text-gray-500'}`}>
                        {title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Payment card */}
                <div
                  className="rounded-2xl border p-6"
                  style={{
                    background: 'rgba(10,20,10,0.8)',
                    borderColor: payoutStatus === 'PAID' ? '#10B981' : 'rgba(16,185,129,0.2)',
                    boxShadow: payoutStatus === 'PAID' ? '0 0 30px rgba(16,185,129,0.3)' : undefined,
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">💰</span>
                    <h3 className="text-base font-bold text-white">Your Payment</h3>
                  </div>

                  {farmerPayout ? (
                    <>
                      <p className="text-4xl font-black text-emerald-400 mb-4">
                        ₹{farmerPayout.toLocaleString('en-IN')}
                      </p>
                      {farmerQty && pricePerQ && (
                        <div className="space-y-1.5 text-sm border-t border-white/[0.06] pt-3">
                          <div className="flex justify-between text-gray-400">
                            <span>{farmerQty}q × ₹{Math.round(pricePerQ).toLocaleString('en-IN')}/q</span>
                            <span className="text-white font-semibold">₹{Math.round(farmerQty * pricePerQ).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>FPO commission (2%)</span>
                            <span className="text-red-400">-₹{Math.round(farmerQty * pricePerQ * 0.02).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between border-t border-white/[0.06] pt-1.5 text-base font-bold">
                            <span className="text-white">Your share</span>
                            <span className="text-emerald-400">₹{farmerPayout.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : estimatedPayout ? (
                    <>
                      <p className="text-3xl font-black text-emerald-400/60 mb-2">
                        ~₹{estimatedPayout.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-500">Estimated based on current sale price</p>
                    </>
                  ) : (
                    <p className="text-3xl font-black text-gray-600 mb-2">Calculating...</p>
                  )}

                  <div className={`mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold ${
                    payoutStatus === 'PAID'
                      ? 'bg-emerald-500 text-black'
                      : currentStage >= 5
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    {payoutStatus === 'PAID'
                      ? '✅ PAID — check your UPI'
                      : currentStage >= 5
                      ? '⏳ Processing payment...'
                      : '⏳ PENDING — awaiting sale'}
                  </div>
                </div>

                {/* Dispatch details */}
                <div className="glass rounded-xl border border-emerald-500/10 p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-white">Dispatch Details</h3>
                  {[
                    { label: 'Truck',      value: selected?.truck_number as string },
                    { label: 'Destination', value: `${selected?.mandi_name as string}, ${selected?.mandi_state as string}` },
                    { label: 'Departed',   value: departedStr || 'Pending' },
                    { label: 'ETA',        value: etaStr || 'Pending' },
                    { label: 'Your Qty',   value: farmerQty ? `${farmerQty} Quintals` : '—' },
                    { label: 'FPO Total',  value: `${totalQty} Quintals` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="text-white font-medium text-right">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
