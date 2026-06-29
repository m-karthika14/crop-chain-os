'use client'

const MAX = 900
const CX = 120, CY = 108, R = 88
const START_DEG = 210

function polarToXY(deg: number, r: number, cx: number, cy: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(startDeg: number, endDeg: number, r: number, cx: number, cy: number) {
  const s = polarToXY(startDeg, r, cx, cy)
  const e = polarToXY(endDeg, r, cx, cy)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`
}

const ZONES = [
  { from: 300, to: 500, color: '#EF4444' },
  { from: 500, to: 650, color: '#F59E0B' },
  { from: 650, to: 750, color: '#10B981' },
  { from: 750, to: 900, color: '#F59E0B' },
]

function scoreToAngle(score: number) {
  return START_DEG + ((score - 300) / (MAX - 300)) * 300
}

interface Props {
  displayScore: number
}

export default function GaugeChart({ displayScore }: Props) {
  const needleDeg = scoreToAngle(displayScore)
  const needleXY  = polarToXY(needleDeg, R - 12, CX, CY)

  return (
    <svg width={CX * 2} height={CY + R + 24} className="overflow-visible mb-2">
      {/* Track */}
      <path
        d={describeArc(START_DEG, START_DEG + 300, R, CX, CY)}
        fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={14} strokeLinecap="round"
      />
      {/* Color zones */}
      {ZONES.map(z => (
        <path
          key={z.from}
          d={describeArc(scoreToAngle(z.from), scoreToAngle(z.to), R, CX, CY)}
          fill="none" stroke={z.color} strokeOpacity={0.18} strokeWidth={14} strokeLinecap="butt"
        />
      ))}
      {/* Progress arc */}
      <path
        d={describeArc(START_DEG, scoreToAngle(displayScore), R, CX, CY)}
        fill="none" stroke="url(#gaugeGrad)" strokeWidth={14} strokeLinecap="round"
      />
      <defs>
        <linearGradient id="gaugeGrad" gradientUnits="userSpaceOnUse"
          x1={polarToXY(START_DEG, R, CX, CY).x} y1={polarToXY(START_DEG, R, CX, CY).y}
          x2={polarToXY(START_DEG + 300, R, CX, CY).x} y2={polarToXY(START_DEG + 300, R, CX, CY).y}
        >
          <stop offset="0%"   stopColor="#F59E0B" />
          <stop offset="60%"  stopColor="#10B981" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      {/* Needle */}
      <circle cx={needleXY.x} cy={needleXY.y} r={5} fill="#F59E0B" />
      <circle cx={needleXY.x} cy={needleXY.y} r={8} fill="none" stroke="#F59E0B" strokeOpacity={0.3} strokeWidth={2} />
      {/* Zone labels */}
      {[
        { score: 400, label: 'Poor' },
        { score: 575, label: 'Fair' },
        { score: 700, label: 'Good' },
        { score: 825, label: 'Excellent' },
      ].map(({ score, label }) => {
        const p = polarToXY(scoreToAngle(score), R + 22, CX, CY)
        return (
          <text key={label} x={p.x} y={p.y} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.25)">
            {label}
          </text>
        )
      })}
      {/* Centre text */}
      <text x={CX} y={CY - 6}  textAnchor="middle" fontSize={38} fontWeight={800} fill="white">{displayScore}</text>
      <text x={CX} y={CY + 14} textAnchor="middle" fontSize={10} fill="rgba(255,255,255,0.4)">out of {MAX}</text>
    </svg>
  )
}
