'use client'

import { useEffect, useRef } from 'react'

// Inject Leaflet CSS once — without this, tiles stack in the top-left corner
function ensureLeafletCSS() {
  if (typeof document === 'undefined') return
  if (document.getElementById('leaflet-css-dispatch')) return
  const link = document.createElement('link')
  link.id   = 'leaflet-css-dispatch'
  link.rel  = 'stylesheet'
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  document.head.appendChild(link)
}

const DEFAULT_ROUTE: Array<{ pos: [number, number]; label: string; stage: number }> = [
  { pos: [12.97, 77.59], label: 'FPO Origin', stage: 0 },
  { pos: [14.46, 78.82], label: 'Andhra Pradesh', stage: 1 },
  { pos: [17.38, 78.48], label: 'Telangana', stage: 2 },
  { pos: [21.14, 79.09], label: 'Maharashtra', stage: 2 },
  { pos: [23.25, 77.41], label: 'Madhya Pradesh', stage: 2 },
  { pos: [26.91, 75.78], label: 'Rajasthan', stage: 2 },
  { pos: [29.68, 76.98], label: 'Mandi Destination', stage: 3 },
]

function buildRoute(
  startPos?: [number, number],
  endPos?: [number, number],
): typeof DEFAULT_ROUTE {
  if (!startPos || !endPos) return DEFAULT_ROUTE
  return Array.from({ length: 7 }, (_, i) => {
    const t = i / 6
    return {
      pos: [
        startPos[0] + (endPos[0] - startPos[0]) * t,
        startPos[1] + (endPos[1] - startPos[1]) * t,
      ] as [number, number],
      label: i === 0 ? 'FPO Origin' : i === 6 ? 'Mandi Destination' : `Waypoint ${i}`,
      stage: i < 2 ? i : i < 5 ? 2 : 3,
    }
  })
}

interface Props {
  truckIndex: number
  startPos?: [number, number]
  endPos?: [number, number]
  height?: number
}

export default function DispatchMap({ truckIndex: rawTruckIndex, startPos, endPos, height = 350 }: Props) {
  const ROUTE = buildRoute(startPos, endPos)
  const truckIndex = Number.isFinite(rawTruckIndex)
    ? Math.max(0, Math.min(rawTruckIndex, ROUTE.length - 1))
    : 0
  const containerRef    = useRef<HTMLDivElement>(null)
  const mapRef          = useRef<import('leaflet').Map | null>(null)
  const truckMarkerRef  = useRef<import('leaflet').Marker | null>(null)
  const completedLineRef= useRef<import('leaflet').Polyline | null>(null)
  const remainingLineRef= useRef<import('leaflet').Polyline | null>(null)
  const sizeTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  // initialise map once on mount
  useEffect(() => {
    ensureLeafletCSS()
    if (!containerRef.current || mapRef.current) return
    let mounted = true

    import('leaflet').then((L) => {
      if (!mounted || !containerRef.current || mapRef.current) return

      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
      })

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        { maxZoom: 18 }
      ).addTo(map)

      const allLats = ROUTE.map(r => r.pos[0])
      const allLngs = ROUTE.map(r => r.pos[1])
      map.fitBounds(
        [[Math.min(...allLats) - 1, Math.min(...allLngs) - 1], [Math.max(...allLats) + 1, Math.max(...allLngs) + 1]],
        { padding: [40, 40] }
      )

      const startIcon = L.divIcon({
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        html: '<div style="background:linear-gradient(135deg,#10B981,#059669);border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 0 20px rgba(16,185,129,0.6),inset 0 0 10px rgba(255,255,255,0.2);border:2px solid rgba(255,255,255,0.3)">🌾</div>',
      })
      L.marker(ROUTE[0].pos, { icon: startIcon }).addTo(map).bindPopup(ROUTE[0].label)

      const endIcon = L.divIcon({
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        html: '<div style="background:linear-gradient(135deg,#F59E0B,#D97706);border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 0 20px rgba(245,158,11,0.6),inset 0 0 10px rgba(255,255,255,0.2);border:2px solid rgba(255,255,255,0.3)">🏪</div>',
      })
      L.marker(ROUTE[ROUTE.length - 1].pos, { icon: endIcon }).addTo(map).bindPopup(ROUTE[ROUTE.length - 1].label)

      const completedLine = L.polyline(
        ROUTE.slice(0, truckIndex + 1).map((r) => r.pos),
        { color: '#10B981', weight: 4, opacity: 1 }
      ).addTo(map)
      completedLineRef.current = completedLine

      const remainingLine = L.polyline(
        ROUTE.slice(truckIndex).map((r) => r.pos),
        { color: '#374151', weight: 3, dashArray: '10,8', opacity: 0.8 }
      ).addTo(map)
      remainingLineRef.current = remainingLine

      if (!ROUTE[truckIndex]) return
      const truckIcon = L.divIcon({
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        html: '<div style="font-size:28px;filter:drop-shadow(0 0 12px #F59E0B)">🚛</div>',
      })
      const truckMarker = L.marker(ROUTE[truckIndex].pos, { icon: truckIcon })
        .addTo(map)
        .bindPopup(ROUTE[truckIndex].label)
      truckMarkerRef.current = truckMarker

      mapRef.current = map

      // Force Leaflet to recalculate container size after CSS loads
      sizeTimerRef.current = setTimeout(() => {
        if (mapRef.current) mapRef.current.invalidateSize()
      }, 100)
    })

    return () => {
      mounted = false
      if (sizeTimerRef.current) clearTimeout(sizeTimerRef.current)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        truckMarkerRef.current    = null
        completedLineRef.current  = null
        remainingLineRef.current  = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // update truck position when truckIndex changes
  useEffect(() => {
    if (!mapRef.current) return

    import('leaflet').then(() => {
      const map = mapRef.current
      if (!map || !ROUTE[truckIndex]) return

      if (truckMarkerRef.current) {
        truckMarkerRef.current.setLatLng(ROUTE[truckIndex].pos)
        truckMarkerRef.current.bindPopup(ROUTE[truckIndex].label)
      }

      if (completedLineRef.current) {
        completedLineRef.current.setLatLngs(ROUTE.slice(0, truckIndex + 1).map((r) => r.pos))
      }

      if (remainingLineRef.current) {
        const remaining = ROUTE.slice(truckIndex).map((r) => r.pos)
        if (remaining.length >= 2) {
          remainingLineRef.current.setLatLngs(remaining)
        }
      }

      map.panTo(ROUTE[truckIndex].pos, { animate: true, duration: 1 })
    })
  }, [truckIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%', borderRadius: '0.75rem', overflow: 'hidden' }}
    />
  )
}
