'use client'

import { useEffect, useRef } from 'react'

const ROUTE: Array<{ pos: [number, number]; label: string; stage: number }> = [
  { pos: [12.97, 77.59], label: 'Karnataka — FPO Origin', stage: 0 },
  { pos: [14.46, 78.82], label: 'Andhra Pradesh', stage: 1 },
  { pos: [17.38, 78.48], label: 'Telangana', stage: 2 },
  { pos: [21.14, 79.09], label: 'Maharashtra', stage: 2 },
  { pos: [23.25, 77.41], label: 'Madhya Pradesh', stage: 2 },
  { pos: [26.91, 75.78], label: 'Rajasthan', stage: 2 },
  { pos: [29.68, 76.98], label: 'Karnal, Haryana — Mandi', stage: 3 },
]

interface Props {
  truckIndex: number
  height?: number
}

export default function DispatchMap({ truckIndex: rawTruckIndex, height = 350 }: Props) {
  const truckIndex = Math.max(0, Math.min(rawTruckIndex, ROUTE.length - 1))
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const truckMarkerRef = useRef<import('leaflet').Marker | null>(null)
  const completedLineRef = useRef<import('leaflet').Polyline | null>(null)
  const remainingLineRef = useRef<import('leaflet').Polyline | null>(null)

  // initialise map once
  useEffect(() => {
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

      // fit india route bounds
      map.fitBounds(
        [[12.5, 76.5], [30.5, 80.0]],
        { padding: [40, 40] }
      )

      // start marker
      const startIcon = L.divIcon({
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        html: '<div style="background:linear-gradient(135deg, #10B981, #059669);border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 0 20px rgba(16,185,129,0.6), inset 0 0 10px rgba(255,255,255,0.2);border:2px solid rgba(255,255,255,0.3)">🌾</div>',
      })
      L.marker(ROUTE[0].pos, { icon: startIcon })
        .addTo(map)
        .bindPopup('GreenHarvest FPO | Karnataka | 850q Wheat dispatched')

      // end marker
      const endIcon = L.divIcon({
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        html: '<div style="background:linear-gradient(135deg, #F59E0B, #D97706);border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 0 20px rgba(245,158,11,0.6), inset 0 0 10px rgba(255,255,255,0.2);border:2px solid rgba(255,255,255,0.3)">🏪</div>',
      })
      L.marker(ROUTE[ROUTE.length - 1].pos, { icon: endIcon })
        .addTo(map)
        .bindPopup('Karnal Mandi | ₹2,387/quintal | Trust Score: 94')

      // completed route polyline
      const completedLine = L.polyline(
        ROUTE.slice(0, truckIndex + 1).map((r) => r.pos),
        { color: '#10B981', weight: 4, opacity: 1 }
      ).addTo(map)
      completedLineRef.current = completedLine

      // remaining route polyline
      const remainingLine = L.polyline(
        ROUTE.slice(truckIndex).map((r) => r.pos),
        { color: '#374151', weight: 3, dashArray: '10,8', opacity: 0.8 }
      ).addTo(map)
      remainingLineRef.current = remainingLine

      // truck marker
      const truckIcon = L.divIcon({
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        html: '<div style="font-size:28px;filter:drop-shadow(0 0 12px #F59E0B);animation:truckBounce 1s infinite;transform-origin:center center">🚛</div>',
      })
      const truckMarker = L.marker(ROUTE[truckIndex].pos, { icon: truckIcon })
        .addTo(map)
        .bindPopup(ROUTE[truckIndex].label)
      truckMarkerRef.current = truckMarker

      mapRef.current = map
    })

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // update truck position when truckIndex changes
  useEffect(() => {
    if (!mapRef.current) return

    import('leaflet').then((L) => {
      const map = mapRef.current
      if (!map) return

      // move truck
      if (truckMarkerRef.current) {
        truckMarkerRef.current.setLatLng(ROUTE[truckIndex].pos)
        truckMarkerRef.current.bindPopup(ROUTE[truckIndex].label)
      }

      // update completed line (from start to current position + 1)
      if (completedLineRef.current) {
        const completedRoute = ROUTE.slice(0, truckIndex + 1).map((r) => r.pos)
        completedLineRef.current.setLatLngs(completedRoute)
      }

      // update remaining line (from current position to end)
      if (remainingLineRef.current) {
        const remainingRoute = ROUTE.slice(truckIndex).map((r) => r.pos)
        if (remainingRoute.length >= 2) {
          remainingLineRef.current.setLatLngs(remainingRoute)
        } else if (remainingRoute.length === 1) {
          // if only one point remains, create a tiny line to show final destination
          remainingLineRef.current.setLatLngs([remainingRoute[0], remainingRoute[0]])
        }
      }

      // pan to truck smoothly
      map.panTo(ROUTE[truckIndex].pos, { animate: true, duration: 1 })
    })
  }, [truckIndex])

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%', borderRadius: '0.75rem', overflow: 'hidden' }}
    />
  )
}
