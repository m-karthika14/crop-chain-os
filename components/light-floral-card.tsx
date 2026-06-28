'use client'

import { ReactNode } from 'react'

interface LightFloralCardProps {
  children: ReactNode
  className?: string
  showTopFlower?: boolean
  showBottomFlower?: boolean
  showVine?: boolean
  index?: number
}

const flowerStyles = [
  { petals: '#EF4444', center: '#FCD34D' }, // red
  { petals: '#8B5CF6', center: '#FCD34D' }, // purple
  { petals: '#FBBF24', center: '#991B1B' }, // yellow
  { petals: '#EC4899', center: '#FCD34D' }, // pink
  { petals: '#F97316', center: '#FCD34D' }, // orange
  { petals: '#DC2626', center: '#FFD700' }, // bright red
]

function SimpleFlower({ style, size = 'medium' }: { style: typeof flowerStyles[0]; size?: 'small' | 'medium' | 'large' }) {
  const sizeMap = {
    small: { viewBox: '0 0 60 60', petalR: 6, centerR: 5 },
    medium: { viewBox: '0 0 80 80', petalR: 8, centerR: 6 },
    large: { viewBox: '0 0 100 100', petalR: 10, centerR: 7 },
  }

  const config = sizeMap[size]
  const [minMax, dimStr] = config.viewBox.split(' ').slice(2)
  const center = parseInt(minMax) / 2

  return (
    <svg viewBox={config.viewBox} className="w-full h-full drop-shadow-sm">
      {/* 6 petals arranged in circle */}
      <circle cx={center} cy={center - config.petalR * 1.8} r={config.petalR} fill={style.petals} />
      <circle cx={center + config.petalR * 1.56} cy={center - config.petalR * 0.9} r={config.petalR} fill={style.petals} />
      <circle cx={center + config.petalR * 1.56} cy={center + config.petalR * 0.9} r={config.petalR} fill={style.petals} />
      <circle cx={center} cy={center + config.petalR * 1.8} r={config.petalR} fill={style.petals} />
      <circle cx={center - config.petalR * 1.56} cy={center + config.petalR * 0.9} r={config.petalR} fill={style.petals} />
      <circle cx={center - config.petalR * 1.56} cy={center - config.petalR * 0.9} r={config.petalR} fill={style.petals} />
      
      {/* Center circle */}
      <circle cx={center} cy={center} r={config.centerR} fill={style.center} />
    </svg>
  )
}

export function LightFloralCard({
  children,
  className = '',
  showTopFlower = true,
  showBottomFlower = false,
  showVine = true,
  index = 0,
}: LightFloralCardProps) {
  const topFlowerStyle = flowerStyles[index % flowerStyles.length]
  const bottomFlowerStyle = flowerStyles[(index + 1) % flowerStyles.length]

  return (
    <div className={`relative overflow-visible ${className}`}>
      {/* Top-right flower */}
      {showTopFlower && (
        <div className="absolute -top-8 -right-6 w-24 h-24 pointer-events-none">
          <SimpleFlower style={topFlowerStyle} size="large" />
        </div>
      )}

      {/* Top vine with leaves (optional) */}
      {showVine && (
        <div className="absolute -top-2 right-8 w-40 h-16 pointer-events-none">
          <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
            {/* Curvy vine */}
            <path 
              d="M 200 10 Q 150 5 100 15 Q 50 25 0 20" 
              stroke="#10B981" 
              strokeWidth="2.5" 
              fill="none" 
              strokeLinecap="round" 
            />
            {/* Leaves along vine */}
            <ellipse cx="170" cy="12" rx="5" ry="9" fill="#10B981" transform="rotate(-35 170 12)" />
            <ellipse cx="130" cy="10" rx="5" ry="9" fill="#059669" transform="rotate(40 130 10)" />
            <ellipse cx="90" cy="18" rx="5" ry="9" fill="#10B981" transform="rotate(-25 90 18)" />
            <ellipse cx="50" cy="24" rx="5" ry="9" fill="#059669" transform="rotate(35 50 24)" />
          </svg>
        </div>
      )}

      {/* Bottom-left small flower (optional) */}
      {showBottomFlower && (
        <div className="absolute -bottom-6 -left-4 w-20 h-20 pointer-events-none">
          <SimpleFlower style={bottomFlowerStyle} size="medium" />
        </div>
      )}

      {/* Card content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
