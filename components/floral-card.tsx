'use client'

import React from 'react'

// Marigold Flower SVG Component
export function MariGoldFlower({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {/* Petals - outer layer */}
      <ellipse cx="28" cy="10" rx="6" ry="8" fill="#F97316" transform="rotate(0 28 28)" opacity="0.9" />
      <ellipse cx="28" cy="10" rx="6" ry="8" fill="#F97316" transform="rotate(45 28 28)" opacity="0.9" />
      <ellipse cx="28" cy="10" rx="6" ry="8" fill="#F97316" transform="rotate(90 28 28)" opacity="0.9" />
      <ellipse cx="28" cy="10" rx="6" ry="8" fill="#F97316" transform="rotate(135 28 28)" opacity="0.9" />
      <ellipse cx="28" cy="10" rx="6" ry="8" fill="#F97316" transform="rotate(180 28 28)" opacity="0.9" />
      <ellipse cx="28" cy="10" rx="6" ry="8" fill="#F97316" transform="rotate(225 28 28)" opacity="0.9" />
      <ellipse cx="28" cy="10" rx="6" ry="8" fill="#F97316" transform="rotate(270 28 28)" opacity="0.9" />
      <ellipse cx="28" cy="10" rx="6" ry="8" fill="#F97316" transform="rotate(315 28 28)" opacity="0.9" />

      {/* Petals - inner layer (yellow) */}
      <ellipse cx="28" cy="14" rx="5" ry="7" fill="#FCD34D" transform="rotate(22.5 28 28)" opacity="0.95" />
      <ellipse cx="28" cy="14" rx="5" ry="7" fill="#FCD34D" transform="rotate(67.5 28 28)" opacity="0.95" />
      <ellipse cx="28" cy="14" rx="5" ry="7" fill="#FCD34D" transform="rotate(112.5 28 28)" opacity="0.95" />
      <ellipse cx="28" cy="14" rx="5" ry="7" fill="#FCD34D" transform="rotate(157.5 28 28)" opacity="0.95" />
      <ellipse cx="28" cy="14" rx="5" ry="7" fill="#FCD34D" transform="rotate(202.5 28 28)" opacity="0.95" />
      <ellipse cx="28" cy="14" rx="5" ry="7" fill="#FCD34D" transform="rotate(247.5 28 28)" opacity="0.95" />
      <ellipse cx="28" cy="14" rx="5" ry="7" fill="#FCD34D" transform="rotate(292.5 28 28)" opacity="0.95" />
      <ellipse cx="28" cy="14" rx="5" ry="7" fill="#FCD34D" transform="rotate(337.5 28 28)" opacity="0.95" />

      {/* Center circle */}
      <circle cx="28" cy="28" r="7" fill="#F59E0B" />
      <circle cx="28" cy="28" r="5" fill="#FBBF24" opacity="0.8" />

      {/* Sepal */}
      <path d="M 22 35 L 28 38 L 34 35" fill="#16A34A" opacity="0.8" />

      {/* Stem */}
      <line x1="28" y1="38" x2="28" y2="50" stroke="#16A34A" strokeWidth="1.5" opacity="0.6" />
    </svg>
  )
}

// Small Leaf Component
export function LeafDecoration({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Leaf teardrop */}
      <ellipse cx="12" cy="12" rx="8" ry="11" fill="#16A34A" opacity="0.7" />
      {/* Center vein */}
      <line x1="12" y1="2" x2="12" y2="22" stroke="white" strokeWidth="0.5" opacity="0.6" />
      {/* Vein details */}
      <line x1="8" y1="6" x2="12" y2="12" stroke="white" strokeWidth="0.3" opacity="0.4" />
      <line x1="16" y1="6" x2="12" y2="12" stroke="white" strokeWidth="0.3" opacity="0.4" />
    </svg>
  )
}

// Vine decoration with leaves
export function VineDecoration() {
  return (
    <svg width="96" height="60" viewBox="0 0 96 60" fill="none" className="absolute top-0 right-0 z-0">
      {/* Main vine path */}
      <path
        d="M96,0 Q75,8 55,6 Q35,4 15,18"
        stroke="#16A34A"
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
      />

      {/* Small leaves sprouting from vine */}
      <g opacity="0.6">
        <ellipse cx="75" cy="4" rx="4" ry="6" fill="#16A34A" transform="rotate(-30 75 4)" />
        <ellipse cx="55" cy="2" rx="4" ry="6" fill="#16A34A" transform="rotate(20 55 2)" />
        <ellipse cx="35" cy="8" rx="4" ry="6" fill="#16A34A" transform="rotate(-25 35 8)" />
        <ellipse cx="25" cy="14" rx="4" ry="6" fill="#16A34A" transform="rotate(15 25 14)" />
      </g>
    </svg>
  )
}

// Main FloralCard Component
interface FloralCardProps {
  children: React.ReactNode
  className?: string
  showBottomFlower?: boolean
}

export function FloralCard({ children, className = '', showBottomFlower = false }: FloralCardProps) {
  return (
    <div className={`relative rounded-2xl p-5 overflow-visible border border-emerald-500/10 ${className}`} style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
      {/* Top-right marigold flower */}
      <div className="absolute -top-3 -right-3 z-10 pointer-events-none">
        <MariGoldFlower size={56} />
      </div>

      {/* Top-right vine creeping inward */}
      <VineDecoration />

      {/* Bottom-left small flower (optional) */}
      {showBottomFlower && (
        <div className="absolute -bottom-2 -left-2 z-10 pointer-events-none">
          <MariGoldFlower size={40} />
        </div>
      )}

      {/* Content */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  )
}
