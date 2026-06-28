'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Must be client-only — Leaflet accesses window/document at import time
const MandiMapClient = dynamic(() => import('./mandi-map-client'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-[#0A0A0A]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-emerald-500/40 animate-ping [animation-delay:0.2s]" />
        <div className="absolute inset-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
        </div>
      </div>
      <p className="text-sm text-gray-500 animate-pulse">Loading 1,473 mandis across India...</p>
    </div>
  ),
})

export default function MandiMapPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <MandiMapClient />
    </div>
  )
}
