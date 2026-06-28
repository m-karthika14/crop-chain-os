'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Search, ChevronDown, Loader2, X, Zap,
  Star, Clock, TrendingUp, Trophy, ArrowRight, Navigation, Sliders, CheckCircle2,
} from 'lucide-react'
import { mandis, FPO_LOCATION, WINNER_MANDI, COMPARISON_MANDIS, MandiData } from './data'

// ---------- helpers ----------
const trustColor = (score: number) =>
  score > 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'

const trustLabel = (score: number) =>
  score > 75 ? 'High' : score >= 50 ? 'Medium' : 'Low'

const volumeRadius = (volume: number) => {
  if (volume > 2500) return 10
  if (volume > 1500) return 8
  if (volume > 800)  return 6
  return 4
}

const CROPS = ['Wheat', 'Rice', 'Tomato', 'Onion', 'Potato', 'Soybean']

// ---------- Ticker data ----------
const TICKER_PRICES = mandis
  .filter(m => m.trustScore > 70)
  .slice(0, 30)
  .map(m => ({ name: m.name.split(' ')[0], price: m.price, change: m.trustScore > 80 ? '+' : '-' }))

export default function MandiMapClient() {
  const searchParams = useSearchParams()
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<import('leaflet').Map | null>(null)
  const markersLayerRef = useRef<import('leaflet').LayerGroup | null>(null)
  const routeLayerRef = useRef<import('leaflet').Polyline | null>(null)
  const [selectedMandi, setSelectedMandi] = useState<MandiData | null>(null)
  const [searching, setSearching] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [selectedCrop, setSelectedCrop] = useState('Wheat')
  const [quantity, setQuantity] = useState('500')
  const [winnerPulsing, setWinnerPulsing] = useState(false)
  const [cropOpen, setCropOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'high-trust' | 'best-price' | 'nearby'>('all')
  const [showFilter, setShowFilter] = useState(false)
  const winnerMarkerRef = useRef<import('leaflet').CircleMarker | null>(null)

  // Initialise Leaflet (client-only)
  useEffect(() => {
    if (!mapRef.current) return
    let mounted = true

    import('leaflet').then(L => {
      if (!mounted || leafletMapRef.current) return

      // Fix default icon paths
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

      // Dark CartoDB tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map)

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Attribution hidden for clean look
      L.control.attribution({ prefix: false, position: 'bottomright' }).addTo(map)

      // Markers layer
      const layer = L.layerGroup().addTo(map)
      markersLayerRef.current = layer

      // FPO home marker (pulsing star)
      const fpoIcon = L.divIcon({
        html: `<div style="
          width:20px;height:20px;border-radius:50%;
          background:#10B981;border:3px solid #fff;
          box-shadow:0 0 0 4px rgba(16,185,129,0.4),0 0 20px rgba(16,185,129,0.6);
          animation: fpoPulse 2s infinite;
        "></div>`,
        className: '',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })
      L.marker(FPO_LOCATION, { icon: fpoIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindTooltip('<b style="color:#10B981">Your FPO</b><br>GreenHarvest FPO', {
          permanent: false,
          className: 'leaflet-dark-tooltip',
        })

      // Draw all mandi markers
      mandis.forEach(mandi => {
        const color = trustColor(mandi.trustScore)
        const r = volumeRadius(mandi.volume)
        const isWinner = mandi.id === WINNER_MANDI.id

        const marker = L.circleMarker([mandi.lat, mandi.lng], {
          radius: r,
          fillColor: color,
          color: mandi.isTop10 ? '#fff' : color,
          weight: mandi.isTop10 ? 1.5 : 0.5,
          fillOpacity: mandi.isTop10 ? 0.95 : 0.7,
        })

        if (isWinner) winnerMarkerRef.current = marker

        // Top-10 glow ring
        if (mandi.isTop10) {
          L.circleMarker([mandi.lat, mandi.lng], {
            radius: r + 5,
            fillColor: 'transparent',
            color: color,
            weight: 1,
            opacity: 0.35,
            fillOpacity: 0,
            className: 'top10-ring',
          }).addTo(layer)
        }

        marker.on('click', () => setSelectedMandi(mandi))
        marker.addTo(layer)
      })

      leafletMapRef.current = map
      if (mounted) setMapReady(true)
    })

    return () => { mounted = false }
  }, [])

  // Handle zoom when coming from Best Mandi page
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current) return

    const mandiParam = searchParams.get('mandi')
    const shouldZoom = searchParams.get('zoom') === 'true'

    if (mandiParam && shouldZoom) {
      const mandi = mandis.find(m => m.name.startsWith(mandiParam))
      if (mandi) {
        // Fly to the selected mandi
        leafletMapRef.current.flyTo([mandi.lat, mandi.lng], 9, { duration: 2, easeLinearity: 0.35 })
        setSelectedMandi(mandi)
        setShowSidebar(true)
        setWinnerPulsing(true)
      }
    }
  }, [mapReady, searchParams])

  const handleFindBestMandi = useCallback(async () => {
    if (!leafletMapRef.current) return
    setSearching(true)
    setShowSidebar(false)

    // Simulate AI processing delay
    await new Promise(r => setTimeout(r, 1800))

    const L = await import('leaflet')
    const map = leafletMapRef.current

    // Remove old route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove()
      routeLayerRef.current = null
    }

    // Fly to winner
    map.flyTo([WINNER_MANDI.lat, WINNER_MANDI.lng], 9, { duration: 2.2, easeLinearity: 0.35 })

    await new Promise(r => setTimeout(r, 2400))

    // Animate route line from FPO to winner
    const routeCoords: [number, number][] = [FPO_LOCATION, [WINNER_MANDI.lat, WINNER_MANDI.lng]]
    const route = L.polyline(routeCoords, {
      color: '#10B981',
      weight: 3,
      opacity: 0.9,
      dashArray: '8 6',
      lineCap: 'round',
    }).addTo(map)
    routeLayerRef.current = route

    // Pulse winner
    setWinnerPulsing(true)
    setSearching(false)
    setShowSidebar(true)
    setSelectedMandi(WINNER_MANDI)
  }, [])

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Leaflet CSS */}
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        @keyframes fpoPulse { 0%,100%{box-shadow:0 0 0 4px rgba(16,185,129,.4),0 0 20px rgba(16,185,129,.6)} 50%{box-shadow:0 0 0 8px rgba(16,185,129,.2),0 0 30px rgba(16,185,129,.8)} }
        @keyframes winnerGlow { 0%,100%{opacity:.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
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

      {/* Top control panel — glassmorphism */}
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
            <span className="ml-auto text-xs text-gray-600">AI-Powered · Real-time</span>
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
              disabled={searching}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-[#0A0A0A] font-bold text-sm px-6 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/30 whitespace-nowrap"
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Find Best Mandi
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Filter toggle button */}
      <button
        onClick={() => setShowFilter(!showFilter)}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#0A0A0A]/85 backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 rounded-xl px-3 py-2.5 text-sm text-emerald-400 font-medium transition-all duration-200 hover:bg-emerald-500/5"
      >
        <Sliders className="w-4 h-4" />
        Filters
      </button>

      {/* Legend + Filter sidebar */}
      <AnimatePresence>
        <div className="absolute top-16 left-4 z-20 space-y-3">
          {/* Filter buttons - only show when toggled */}
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
                  { id: 'nearby', label: 'Nearby' },
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
                    {id === 'all' && <span className="ml-1.5 text-[10px] text-gray-700">1,473</span>}
                    {id === 'high-trust' && <span className="ml-1.5 text-[10px] text-gray-700">612</span>}
                    {id === 'best-price' && <span className="ml-1.5 text-[10px] text-gray-700">218</span>}
                    {id === 'nearby' && <span className="ml-1.5 text-[10px] text-gray-700">43</span>}
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
          </motion.div>
        </div>
      </AnimatePresence>



      {/* Right sidebar — dual panel (Selected Mandi + AI Recommendation) */}
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
            {/* Panel 1: Selected Mandi Details */}
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
                      {selectedMandi.isTop10 && (
                        <span className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          <Zap className="w-2.5 h-2.5" fill="currentColor" />
                          AI Pick
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{selectedMandi.state}</p>
                  </div>
                  <button onClick={() => setSelectedMandi(null)} className="text-gray-600 hover:text-white transition-colors p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-1">Current Price</p>
                    <p className="text-lg font-bold text-emerald-400">₹{selectedMandi.price.toLocaleString()}</p>
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
                      <p className="text-[10px] text-gray-600">Payment Delay</p>
                      <p className="text-sm font-bold text-white">{selectedMandi.paymentDelay} day{selectedMandi.paymentDelay !== 1 ? 's' : ''}</p>
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

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{selectedMandi.distance} km from your FPO</span>
                </div>
              </motion.div>
            )}

            {/* Panel 2: AI Recommendation */}
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
                {COMPARISON_MANDIS.map((m, i) => (
                  <motion.div
                    key={m.name}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 + 0.1 }}
                    className={`relative rounded-xl p-3.5 border transition-all duration-200 ${
                      m.winner
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                        : 'bg-white/[0.02] border-white/5'
                    }`}
                  >
                    {m.winner && (
                      <div className="absolute -top-2.5 left-3 flex items-center gap-1 bg-emerald-500 text-[#0A0A0A] text-[10px] font-black px-2 py-0.5 rounded-full">
                        <Trophy className="w-2.5 h-2.5" fill="currentColor" />
                        WINNER
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <p className={`text-sm font-bold ${m.winner ? 'text-emerald-400' : 'text-gray-500 line-through'}`}>
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
                      <span className={m.winner ? 'text-white font-semibold' : 'text-gray-600 line-through'}>
                        ₹{m.price.toLocaleString()}/Q
                      </span>
                      <span className={`font-bold ${m.winner ? 'text-emerald-400 text-sm' : 'text-gray-600 line-through'}`}>
                        {m.net}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                <p className="text-[10px] text-gray-500 mb-1">Net Revenue for {quantity} Q of {selectedCrop}</p>
                <p className="text-emerald-400 font-bold text-lg">₹{(2387 * parseInt(quantity || '0') / 100).toFixed(1)}L</p>
                <p className="text-[10px] text-emerald-600">+₹2.4L vs next best option</p>
              </div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0A] font-bold text-sm py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/30"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm {selectedMandi?.name || 'Mandi'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom live price ticker */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-emerald-500/15 py-2 overflow-hidden">
        <div className="flex items-center gap-3 px-4 mb-1">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-widest whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Prices
          </span>
        </div>
        <div className="relative overflow-hidden">
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 35, ease: 'linear', repeat: Infinity }}
            className="flex gap-6 whitespace-nowrap px-4"
          >
            {[...TICKER_PRICES, ...TICKER_PRICES].map((item, i) => (
              <span key={i} className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium">{item.name}</span>
                <span className="text-white font-bold">₹{item.price.toLocaleString()}</span>
                <span className={`text-[10px] font-semibold ${item.change === '+' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.change === '+' ? '▲' : '▼'}
                </span>
                <span className="text-white/10">|</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Winner pulse overlay when active */}
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
