'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Search, ChevronDown, Loader2, X, Zap,
  Clock, TrendingUp, Trophy, Navigation, Sliders, CheckCircle2,
} from 'lucide-react'
import { FPO_LOCATION, SOUTH_INDIA_MANDIS } from './data'

// ---------- types ----------
interface DbMandi {
  id: string
  name: string
  state: string
  district: string
  lat: number
  lng: number
  price: number         // modal_price
  minPrice: number
  maxPrice: number
  trustScore: number    // trust_score
  paymentDelay: number  // avg_payment_delay_days
  commission: number    // commission_pct
  paymentSpeed: string
}

interface OptimizeMandi {
  mandiId: string
  name: string
  state: string
  lat: number
  lng: number
  price: number
  transport: number
  distKm: number
  commission: number
  net: number
  trust: number
  payment: string
  totalRevenue: number
  tag: string
  rank: number
}

// ---------- helpers ----------
const trustColor = (score: number) =>
  score > 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'

const trustLabel = (score: number) =>
  score > 75 ? 'High' : score >= 50 ? 'Medium' : 'Low'

const priceRadius = (price: number) => {
  if (price > 4000) return 10
  if (price > 3000) return 8
  if (price > 2000) return 6
  return 4
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

const CROPS = ['Onion', 'Potato', 'Rice', 'Tomato', 'Wheat']

export default function MandiMapClient() {
  const searchParams = useSearchParams()
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<import('leaflet').Map | null>(null)
  const markersLayerRef = useRef<import('leaflet').LayerGroup | null>(null)
  const routeLayerRef = useRef<import('leaflet').Polyline | null>(null)
  const fpoMarkerRef = useRef<import('leaflet').Marker | null>(null)

  const [dbMandis, setDbMandis] = useState<DbMandi[]>([])
  const [selectedMandi, setSelectedMandi] = useState<DbMandi | null>(null)
  const [optimizeResult, setOptimizeResult] = useState<OptimizeMandi[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [loadingMandis, setLoadingMandis] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [selectedCrop, setSelectedCrop] = useState('Wheat')
  const [quantity, setQuantity] = useState('500')
  const [winnerPulsing, setWinnerPulsing] = useState(false)
  const [cropOpen, setCropOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'high-trust' | 'best-price' | 'nearby'>('all')
  const [showFilter, setShowFilter] = useState(false)
  const [confirmingDispatch, setConfirmingDispatch] = useState(false)
  const [fpoCoords, setFpoCoords] = useState<[number, number]>(FPO_LOCATION)

  // ---------- fetch FPO location ----------
  useEffect(() => {
    const fpoId = localStorage.getItem('fpoId') || 'fpo-001'
    fetch(`/api/fpos/location?fpoId=${fpoId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.lat && data.lng) {
          setFpoCoords([data.lat, data.lng])
        }
      })
      .catch(() => {})
  }, [])

  // ---------- fetch real mandis from DB whenever crop changes ----------
  useEffect(() => {
    setLoadingMandis(true)
    fetch(`/api/mandis?crop=${encodeURIComponent(selectedCrop)}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const mapped: DbMandi[] = data.mandis.map((m: Record<string, unknown>) => ({
            id: String(m.id),
            name: String(m.name),
            state: String(m.state),
            district: String(m.district ?? ''),
            lat: parseFloat(String(m.lat)),
            lng: parseFloat(String(m.lng)),
            price: parseFloat(String(m.modal_price)) || 0,
            minPrice: parseFloat(String(m.min_price)) || 0,
            maxPrice: parseFloat(String(m.max_price)) || 0,
            trustScore: parseInt(String(m.trust_score)) || 60,
            paymentDelay: parseFloat(String(m.avg_payment_delay_days)) || 3,
            commission: parseFloat(String(m.commission_pct)) || 1.5,
            paymentSpeed: String(m.payment_speed || '2-3 Days'),
          }))
          setDbMandis(mapped)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMandis(false))
  }, [selectedCrop])

  // ---------- init Leaflet (once) ----------
  useEffect(() => {
    if (!mapRef.current) return
    let mounted = true

    import('leaflet').then(L => {
      if (!mounted || leafletMapRef.current) return

      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [22.5, 80.5],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)
      L.control.attribution({ prefix: false, position: 'bottomright' }).addTo(map)

      const layer = L.layerGroup().addTo(map)
      markersLayerRef.current = layer

      // FPO marker
      const fpoIcon = L.divIcon({
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#10B981;border:3px solid #fff;box-shadow:0 0 0 4px rgba(16,185,129,0.4),0 0 20px rgba(16,185,129,0.6);animation:fpoPulse 2s infinite;"></div>`,
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })
      const fpoMarker = L.marker(FPO_LOCATION, { icon: fpoIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindTooltip('<b style="color:#10B981">Your FPO</b>', {
          permanent: false,
          className: 'leaflet-dark-tooltip',
        })
      fpoMarkerRef.current = fpoMarker

      leafletMapRef.current = map
      if (mounted) setMapReady(true)
    })

    return () => { mounted = false }
  }, [])

  // ---------- update FPO marker position ----------
  useEffect(() => {
    if (fpoMarkerRef.current && mapReady) {
      fpoMarkerRef.current.setLatLng(fpoCoords)
    }
  }, [fpoCoords, mapReady])

  // ---------- re-render markers when mandis or filter changes ----------
  useEffect(() => {
    if (!markersLayerRef.current || !mapReady) return

    import('leaflet').then(L => {
      const layer = markersLayerRef.current!
      layer.clearLayers()

      let filtered = dbMandis
      if (activeFilter === 'high-trust') filtered = dbMandis.filter(m => m.trustScore > 75)
      else if (activeFilter === 'best-price') filtered = [...dbMandis].sort((a, b) => b.price - a.price).slice(0, Math.ceil(dbMandis.length * 0.15))
      else if (activeFilter === 'nearby') filtered = dbMandis.filter(m => haversineKm(fpoCoords[0], fpoCoords[1], m.lat, m.lng) < 200)

      filtered.forEach(mandi => {
        const color = trustColor(mandi.trustScore)
        const r = priceRadius(mandi.price)
        const isTop10 = mandi.trustScore > 75

        if (isTop10) {
          L.circleMarker([mandi.lat, mandi.lng], {
            radius: r + 5,
            fillColor: 'transparent',
            color,
            weight: 1,
            opacity: 0.35,
            fillOpacity: 0,
          }).addTo(layer)
        }

        const marker = L.circleMarker([mandi.lat, mandi.lng], {
          radius: r,
          fillColor: color,
          color: isTop10 ? '#fff' : color,
          weight: isTop10 ? 1.5 : 0.5,
          fillOpacity: isTop10 ? 0.95 : 0.7,
        })

        marker.on('click', () => {
          setSelectedMandi(mandi)
          setShowSidebar(true)
          setOptimizeResult(null)
        })
        marker.addTo(layer)
      })

      // South India visual coverage (static, dimmed)
      SOUTH_INDIA_MANDIS.forEach(m => {
        const color = trustColor(m.trustScore)
        L.circleMarker([m.lat, m.lng], {
          radius: 5,
          fillColor: color,
          color,
          weight: 0.5,
          fillOpacity: 0.45,
        })
          .bindTooltip(`<b>${m.name}</b><br>${m.state}<br>₹${m.price.toLocaleString('en-IN')} (indicative)`, {
            className: 'leaflet-dark-tooltip',
          })
          .addTo(layer)
      })
    })
  }, [dbMandis, activeFilter, mapReady, fpoCoords])

  // ---------- handle zoom-to-mandi from query params ----------
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current) return
    const mandiParam = searchParams.get('mandi')
    const shouldZoom = searchParams.get('zoom') === 'true'
    if (!mandiParam || !shouldZoom || dbMandis.length === 0) return

    const mandi = dbMandis.find(m => m.name.toLowerCase().includes(mandiParam.toLowerCase()))
    if (!mandi) return

    const map = leafletMapRef.current

    import('leaflet').then(L => {
      // Remove any existing route
      if (routeLayerRef.current) {
        routeLayerRef.current.remove()
        routeLayerRef.current = null
      }

      // Fly to the mandi
      map.flyTo([mandi.lat, mandi.lng], 8, { duration: 2, easeLinearity: 0.35 })

      // Draw route line from FPO to the mandi
      const route = L.polyline([fpoCoords, [mandi.lat, mandi.lng]], {
        color: '#10B981',
        weight: 3,
        opacity: 0.9,
        dashArray: '8 6',
        lineCap: 'round',
      }).addTo(map)
      routeLayerRef.current = route

      // Pulse glow at destination
      const pulse = L.circleMarker([mandi.lat, mandi.lng], {
        radius: 18,
        fillColor: '#10B981',
        color: '#10B981',
        weight: 1.5,
        fillOpacity: 0.15,
        opacity: 0.5,
      }).addTo(map)
      setTimeout(() => pulse.remove(), 4000)
    })

    setSelectedMandi(mandi)
    setShowSidebar(true)
    setWinnerPulsing(true)
  }, [mapReady, searchParams, dbMandis, fpoCoords])

  // ---------- confirm dispatch ----------
  const handleConfirmMandi = async () => {
    if (!selectedMandi) return
    const fpoId = localStorage.getItem('fpoId') || 'fpo-001'
    const managerId = localStorage.getItem('userId') || 'mgr-001'
    setConfirmingDispatch(true)
    try {
      const res = await fetch('/api/dispatches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fpoId,
          mandiId: selectedMandi.id,
          crop: selectedCrop,
          totalQuantity: parseInt(quantity || '0'),
          truckNumber: 'KA-01-AB-1234',
          driverName: 'Driver',
          driverPhone: '+91 98765 43210',
          departureTime: new Date().toISOString(),
          expectedRevenue: Math.round(selectedMandi.price * parseInt(quantity || '0')),
          pricePerQuintal: selectedMandi.price,
          managerId,
          trustScoreAtDispatch: selectedMandi.trustScore,
          netPriceAtDispatch: selectedMandi.price,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert(`✅ Dispatch created! ID: ${data.dispatchId}\nAll farmers notified.`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setConfirmingDispatch(false)
    }
  }

  // ---------- Find Best Mandi ----------
  const handleFindBestMandi = useCallback(async () => {
    if (!leafletMapRef.current) return
    setSearching(true)
    setShowSidebar(false)
    setOptimizeResult(null)

    try {
      const fpoId = localStorage.getItem('fpoId') || 'fpo-001'
      const res = await fetch('/api/mandis/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop: selectedCrop, quantityQ: parseInt(quantity || '0'), fpoId }),
      })
      const data = await res.json()

      if (!data.success || !data.mandis?.length) {
        setSearching(false)
        return
      }

      const winner: OptimizeMandi = data.mandis[0]
      const top3: OptimizeMandi[] = data.mandis.slice(0, 3)

      const L = await import('leaflet')
      const map = leafletMapRef.current!

      if (routeLayerRef.current) {
        routeLayerRef.current.remove()
        routeLayerRef.current = null
      }

      map.flyTo([winner.lat, winner.lng], 9, { duration: 2.2, easeLinearity: 0.35 })
      await new Promise(r => setTimeout(r, 2400))

      const route = L.polyline([fpoCoords, [winner.lat, winner.lng]], {
        color: '#10B981',
        weight: 3,
        opacity: 0.9,
        dashArray: '8 6',
        lineCap: 'round',
      }).addTo(map)
      routeLayerRef.current = route

      // Map winner to DbMandi shape for the selected-mandi panel
      const winnerDbMandi: DbMandi = {
        id: winner.mandiId,
        name: winner.name,
        state: winner.state,
        district: '',
        lat: winner.lat,
        lng: winner.lng,
        price: winner.price,
        minPrice: winner.price,
        maxPrice: winner.price,
        trustScore: winner.trust,
        paymentDelay: 0,
        commission: winner.commission,
        paymentSpeed: winner.payment,
      }

      setSelectedMandi(winnerDbMandi)
      setOptimizeResult(top3)
      setWinnerPulsing(true)
      setShowSidebar(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }, [selectedCrop, quantity, fpoCoords])

  // ---------- legend stats (computed from already-loaded dbMandis) ----------
  const highCount   = dbMandis.filter(m => m.trustScore > 75).length
  const mediumCount = dbMandis.filter(m => m.trustScore >= 50 && m.trustScore <= 75).length
  const lowCount    = dbMandis.filter(m => m.trustScore < 50).length
  const avgPrice    = dbMandis.length > 0
    ? Math.round(dbMandis.reduce((s, m) => s + m.price, 0) / dbMandis.length)
    : 0
  const minPrice = dbMandis.length > 0
    ? Math.min(...dbMandis.filter(m => m.price > 0).map(m => m.price))
    : 0
  const maxPrice = dbMandis.length > 0
    ? Math.max(...dbMandis.map(m => m.price))
    : 0

  // ---------- ticker from real mandis ----------
  const tickerItems = dbMandis
    .filter(m => m.trustScore > 70)
    .slice(0, 30)
    .map(m => ({ name: m.name.split(' ')[0], price: m.price, up: m.trustScore > 80 }))

  // winner and net revenue for the sidebar comparison panel
  const winner = optimizeResult?.[0]
  const netRevenue = winner ? ((winner.net * parseInt(quantity || '0')) / 100000).toFixed(1) : '0'

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#0A0A0A]">
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        @keyframes fpoPulse { 0%,100%{box-shadow:0 0 0 4px rgba(16,185,129,.4),0 0 20px rgba(16,185,129,.6)} 50%{box-shadow:0 0 0 8px rgba(16,185,129,.2),0 0 30px rgba(16,185,129,.8)} }
        .leaflet-dark-tooltip { background:#0D0D0D!important; border:1px solid rgba(16,185,129,.3)!important; color:#e5e7eb!important; font-size:12px!important; border-radius:8px!important; padding:6px 10px!important; }
        .leaflet-dark-tooltip::before { display:none!important; }
        .leaflet-container { background:#0A0A0A; }
        .leaflet-control-zoom a { background:#111!important; color:#10B981!important; border-color:rgba(16,185,129,.3)!important; }
        .leaflet-control-zoom a:hover { background:#1a1a1a!important; }
        .leaflet-popup-content-wrapper { background:#0D0D0D!important; border:1px solid rgba(16,185,129,.25)!important; color:#e5e7eb!important; border-radius:12px!important; }
        .leaflet-popup-tip { background:#0D0D0D!important; }
        .leaflet-popup-close-button { color:#6b7280!important; }
      `}</style>

      {/* Map container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Loading overlay */}
      {loadingMandis && (
        <div className="absolute top-4 right-20 z-30 flex items-center gap-2 bg-[#0A0A0A]/80 backdrop-blur border border-emerald-500/20 rounded-xl px-3 py-2">
          <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          <span className="text-xs text-emerald-400">Loading {selectedCrop} prices…</span>
        </div>
      )}

      {/* Top control panel */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-[#0A0A0A]/80 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl p-4 shadow-2xl shadow-black/60"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-emerald-400" fill="currentColor" />
            <span className="text-emerald-400 font-semibold text-sm tracking-wide">Smart Mandi Finder</span>
            <span className="ml-auto text-xs text-gray-600">
              {dbMandis.length > 0 ? `${dbMandis.length} mandis loaded` : 'AI-Powered · Real-time'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Crop selector */}
            <div className="relative flex-1">
              <button
                onClick={() => setCropOpen(!cropOpen)}
                className="w-full flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white hover:border-emerald-500/30 transition-colors duration-200"
              >
                <span className="flex-1 text-left">{selectedCrop}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${cropOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {cropOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute top-full mt-1 left-0 right-0 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-30"
                  >
                    {CROPS.map(c => (
                      <li key={c}>
                        <button
                          onClick={() => { setSelectedCrop(c); setCropOpen(false) }}
                          className={`w-full px-4 py-2.5 text-sm text-left hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors ${c === selectedCrop ? 'text-emerald-400' : 'text-gray-400'}`}
                        >
                          {c}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Quantity */}
            <div className="relative sm:w-40">
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="Qty (Q)"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">Q</span>
            </div>

            {/* Find button */}
            <button
              onClick={handleFindBestMandi}
              disabled={searching || dbMandis.length === 0}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-[#0A0A0A] font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/30 whitespace-nowrap"
            >
              {searching ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Analyzing…</>
              ) : (
                <><Search className="w-4 h-4" />Find Best Mandi</>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Filter toggle */}
      <button
        onClick={() => setShowFilter(!showFilter)}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#0A0A0A]/85 backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 rounded-xl px-3 py-2.5 text-sm text-emerald-400 font-medium transition-all duration-200 hover:bg-emerald-500/5"
      >
        <Sliders className="w-4 h-4" />
        Filters
      </button>

      {/* Legend + filter sidebar */}
      <AnimatePresence>
        <div className="absolute top-16 left-4 z-20 space-y-3">
          {showFilter && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0A0A0A]/85 backdrop-blur-xl border border-white/10 rounded-xl p-3"
            >
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2.5">Filter Mandis</p>
              <div className="space-y-1.5">
                {([
                  { id: 'all', label: 'All Mandis' },
                  { id: 'high-trust', label: 'High Trust' },
                  { id: 'best-price', label: 'Best Price' },
                  { id: 'nearby', label: 'Nearby (<200km)' },
                ] as const).map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveFilter(id)}
                    className={`w-full text-left text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-150 ${
                      activeFilter === id
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Legend */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: showFilter ? 0.2 : 0.35, duration: 0.4 }}
            className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 space-y-1.5"
          >
            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Trust Score</p>
            {[
              { color: '#10B981', label: 'High (75+)' },
              { color: '#F59E0B', label: 'Medium (50-75)' },
              { color: '#EF4444', label: 'Low (<50)' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            ))}
            <div className="border-t border-white/5 pt-1.5 mt-1.5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0 border-2 border-emerald-400" />
              <span className="text-xs text-gray-400">Top 10 AI Pick</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_#10B981]" />
              <span className="text-xs text-gray-400">Your FPO</span>
            </div>
            <div className="border-t border-white/5 pt-1.5 mt-1.5">
              <p className="text-[10px] text-gray-600 mb-1">Size = Trade Volume</p>
              <div className="flex items-end gap-1.5">
                {[4, 6, 8, 10].map(r => (
                  <div key={r} className="flex flex-col items-center gap-0.5">
                    <span className="rounded-full bg-emerald-500/60" style={{ width: r * 2, height: r * 2 }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Live DB stats — only rendered once mandis are loaded */}
            {dbMandis.length > 0 && (
              <div className="border-t border-white/5 pt-2 mt-1 space-y-2">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                  Market Snapshot · {selectedCrop}
                </p>

                {/* Trust tier distribution bars */}
                <div className="space-y-1.5">
                  {[
                    { label: 'High', count: highCount,   color: '#10B981', textCls: 'text-emerald-400' },
                    { label: 'Med',  count: mediumCount, color: '#F59E0B', textCls: 'text-amber-400' },
                    { label: 'Low',  count: lowCount,    color: '#EF4444', textCls: 'text-red-400' },
                  ].map(({ label, count, color, textCls }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-[10px] font-semibold ${textCls}`}>{label}</span>
                        <span className={`text-[10px] font-bold tabular-nums ${textCls}`}>{count}</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.round((count / dbMandis.length) * 100)}%`,
                            background: color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price stats */}
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">Avg Price</span>
                    <span className="text-[10px] font-bold text-cyan-400">
                      ₹{avgPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">Range</span>
                    <span className="text-[10px] text-gray-400">
                      ₹{minPrice.toLocaleString('en-IN')} – ₹{maxPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">Mandis</span>
                    <span className="text-[10px] font-bold text-violet-400">{dbMandis.length}</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Right sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-4 z-20 w-80 overflow-y-auto pb-4"
            style={{ top: '240px', bottom: '80px', maxHeight: 'calc(100vh - 340px)' }}
          >
            {/* Selected Mandi Details */}
            {selectedMandi && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#0D0D0D]/95 backdrop-blur-2xl border border-emerald-500/25 rounded-2xl p-5 shadow-2xl shadow-black/80 mb-4"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-white font-bold text-base">{selectedMandi.name}</h3>
                      {selectedMandi.trustScore > 75 && (
                        <span className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          <Zap className="w-2.5 h-2.5" fill="currentColor" />
                          AI Pick
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{selectedMandi.state}</p>
                  </div>
                  <button onClick={() => { setSelectedMandi(null); setShowSidebar(false) }} className="text-gray-600 hover:text-white transition-colors p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-1">Modal Price</p>
                    <p className="text-lg font-bold text-emerald-400">₹{selectedMandi.price.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-gray-600">per quintal</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-1">Trust Score</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-lg font-bold" style={{ color: trustColor(selectedMandi.trustScore) }}>
                        {selectedMandi.trustScore}
                      </p>
                      <p className="text-gray-600 text-sm">/100</p>
                    </div>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{
                      background: trustColor(selectedMandi.trustScore) + '22',
                      color: trustColor(selectedMandi.trustScore),
                    }}>
                      {trustLabel(selectedMandi.trustScore)}
                    </span>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <div>
                      <p className="text-[10px] text-gray-600">Payment</p>
                      <p className="text-sm font-bold text-white">{selectedMandi.paymentSpeed}</p>
                    </div>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
                    <div>
                      <p className="text-[10px] text-gray-600">Commission</p>
                      <p className="text-sm font-bold text-white">{selectedMandi.commission}%</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{haversineKm(fpoCoords[0], fpoCoords[1], selectedMandi.lat, selectedMandi.lng)} km from your FPO</span>
                </div>

                <button
                  onClick={handleConfirmMandi}
                  disabled={confirmingDispatch}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-[#0A0A0A] font-bold text-sm py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm {selectedMandi.name}
                </button>
              </motion.div>
            )}

            {/* AI Recommendation — only after Find Best Mandi */}
            {optimizeResult && optimizeResult.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-[#0D0D0D]/95 backdrop-blur-2xl border border-emerald-500/25 rounded-2xl p-5 shadow-2xl shadow-black/80"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-4 h-4 text-amber-400" fill="currentColor" />
                  <h3 className="text-white font-bold text-sm">AI Recommendation</h3>
                  <button onClick={() => setShowSidebar(false)} className="ml-auto text-gray-600 hover:text-white transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {optimizeResult.map((m, i) => (
                    <motion.div
                      key={m.mandiId}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 + 0.1 }}
                      className={`relative rounded-xl p-3.5 border transition-all duration-200 ${
                        i === 0
                          ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                          : 'bg-white/[0.02] border-white/5'
                      }`}
                    >
                      {i === 0 && (
                        <div className="absolute -top-2.5 left-3 flex items-center gap-1 bg-emerald-500 text-[#0A0A0A] text-[10px] font-black px-2 py-0.5 rounded-full">
                          <Trophy className="w-2.5 h-2.5" fill="currentColor" />
                          WINNER
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-2">
                        <p className={`text-sm font-bold ${i === 0 ? 'text-emerald-400' : 'text-gray-500 line-through'}`}>
                          {m.name}
                        </p>
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: trustColor(m.trust) + '22', color: trustColor(m.trust) }}
                        >
                          {m.trust}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className={i === 0 ? 'text-white font-semibold' : 'text-gray-600 line-through'}>
                          ₹{m.price.toLocaleString('en-IN')}/Q
                        </span>
                        <span className={`font-bold ${i === 0 ? 'text-emerald-400 text-sm' : 'text-gray-600 line-through'}`}>
                          Net ₹{m.net.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                  <p className="text-[10px] text-gray-500 mb-1">Net Revenue for {quantity} Q of {selectedCrop}</p>
                  <p className="text-emerald-400 font-bold text-lg">₹{netRevenue}L</p>
                  {optimizeResult.length > 1 && (
                    <p className="text-[10px] text-emerald-600">
                      +₹{(optimizeResult[0].net - optimizeResult[1].net).toLocaleString('en-IN')}/q vs next best
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom live price ticker */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-emerald-500/15 py-2 overflow-hidden">
        <div className="flex items-center gap-3 px-4 mb-1">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-widest whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Prices · {selectedCrop}
          </span>
        </div>
        <div className="relative overflow-hidden">
          {tickerItems.length > 0 ? (
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 35, ease: 'linear', repeat: Infinity }}
              className="flex gap-6 whitespace-nowrap px-4"
            >
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 font-medium">{item.name}</span>
                  <span className="text-white font-bold">₹{item.price.toLocaleString('en-IN')}</span>
                  <span className={`text-[10px] font-semibold ${item.up ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.up ? '▲' : '▼'}
                  </span>
                  <span className="text-white/10">|</span>
                </span>
              ))}
            </motion.div>
          ) : (
            <p className="px-4 text-xs text-gray-600">Loading prices…</p>
          )}
        </div>
      </div>

      {/* Winner pulse overlay */}
      {winnerPulsing && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 1.5, repeat: 2 }}
            className="absolute inset-0 bg-emerald-500"
            onAnimationComplete={() => setWinnerPulsing(false)}
          />
        </div>
      )}
    </div>
  )
}
