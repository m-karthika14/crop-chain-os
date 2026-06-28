'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, ShieldCheck, CheckCircle2 } from 'lucide-react'

type BadgeColor = 'emerald' | 'blue' | 'amber' | 'purple' | 'teal'

interface LedgerEntry {
  time: string
  type: string
  badge: BadgeColor
  lines: string[]
  eventId: string
}

const ENTRIES: LedgerEntry[] = [
  {
    time: '14:21:33',
    type: 'FARMER_PAID',
    badge: 'emerald',
    lines: ['825 UPI transfers executed', 'Total: ₹18,72,550'],
    eventId: 'evt_a7f2c891',
  },
  {
    time: '14:21:32',
    type: 'PAYOUT_GENERATED',
    badge: 'emerald',
    lines: ['Payout calculation complete', '825 farmers | avg ₹22,697'],
    eventId: 'evt_a7f2c890',
  },
  {
    time: '14:20:15',
    type: 'SALE_COMPLETED',
    badge: 'blue',
    lines: ['Wheat sold at Karnal Mandi', '850q @ ₹2,387 = ₹18,72,550'],
    eventId: 'evt_a7f2c889',
  },
  {
    time: '11:42:00',
    type: 'TRUCK_DISPATCHED',
    badge: 'amber',
    lines: ['KA-01-AB-1234 departed', 'ETA: Karnal Mandi 2:00 PM'],
    eventId: 'evt_a7f2c888',
  },
  {
    time: '08:37:00',
    type: 'SALE_APPROVED',
    badge: 'blue',
    lines: ['Manager: Karthika Reddy', 'Mandi: Karnal | Trust: 94'],
    eventId: 'evt_a7f2c887',
  },
  {
    time: '08:35:00',
    type: 'OPTIMIZATION_RUN',
    badge: 'purple',
    lines: ['1,473 mandis analyzed', 'Winner: Karnal ₹2,387'],
    eventId: 'evt_a7f2c886',
  },
  {
    time: '08:12:00',
    type: 'HARVEST_CREATED',
    badge: 'teal',
    lines: ['850 quintals wheat', '825 farmers contributing'],
    eventId: 'evt_a7f2c885',
  },
]

const BADGE_STYLES: Record<BadgeColor, { dot: string; text: string; border: string; bg: string }> = {
  emerald: { dot: 'bg-emerald-400', text: 'text-emerald-400', border: 'border-emerald-500/25', bg: 'bg-emerald-500/10' },
  blue:    { dot: 'bg-blue-400',    text: 'text-blue-400',    border: 'border-blue-500/25',    bg: 'bg-blue-500/10'    },
  amber:   { dot: 'bg-amber-400',   text: 'text-amber-400',   border: 'border-amber-500/25',   bg: 'bg-amber-500/10'   },
  purple:  { dot: 'bg-purple-400',  text: 'text-purple-400',  border: 'border-purple-500/25',  bg: 'bg-purple-500/10'  },
  teal:    { dot: 'bg-teal-400',    text: 'text-teal-400',    border: 'border-teal-500/25',    bg: 'bg-teal-500/10'    },
}

const LEDGER_ROWS = [
  { from: 'FPO_WALLET', to: 'FARMER_001', amount: '₹17,601' },
  { from: 'FPO_WALLET', to: 'FARMER_002', amount: '₹26,402' },
  { from: 'FPO_WALLET', to: 'FARMER_003', amount: '₹32,950' },
  { from: 'FPO_WALLET', to: 'FARMER_004', amount: '₹22,001' },
  { from: 'FPO_WALLET', to: 'FARMER_005', amount: '₹39,601' },
  { from: 'MANDI_ESCROW', to: 'FPO_WALLET', amount: '₹18,72,550' },
]

function HashBadge({ id }: { id: string }) {
  return (
    <span className="font-mono text-[10px] text-gray-600 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-md tracking-tight">
      {id}
    </span>
  )
}

export default function LedgerPage() {
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    let i = 0
    const t = setInterval(() => {
      i++
      setVisible(i)
      if (i >= ENTRIES.length) clearInterval(t)
    }, 180)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="p-6 space-y-8 min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Immutable Financial Ledger</h2>
            <p className="text-xs text-gray-500 mt-0.5">Every action is permanently recorded. Nothing can be changed.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">Cryptographically Sealed</span>
        </div>
      </div>

      {/* Timeline feed */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[22px] top-2 bottom-2 w-px bg-gradient-to-b from-emerald-500/30 via-white/[0.06] to-transparent" />

        <div className="space-y-3">
          {ENTRIES.map((entry, i) => {
            const style = BADGE_STYLES[entry.badge]
            return (
              <motion.div
                key={entry.eventId}
                initial={{ opacity: 0, x: -16 }}
                animate={i < visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex gap-4 items-start"
              >
                {/* Dot */}
                <div className="relative shrink-0 mt-3.5">
                  <div className={`w-3 h-3 rounded-full border-2 border-[#0A0A0A] ${style.dot} z-10 relative`} />
                  {i === 0 && (
                    <div className={`absolute inset-0 rounded-full ${style.dot} opacity-40 animate-ping`} />
                  )}
                </div>

                {/* Card */}
                <div className="flex-1 glass rounded-xl border border-white/[0.06] hover:border-white/[0.12] p-4 transition-colors duration-200 group">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg border ${style.text} ${style.bg} ${style.border}`}>
                        {entry.type}
                      </span>
                      <HashBadge id={entry.eventId} />
                    </div>
                    <span className="font-mono text-xs text-gray-600 shrink-0">{entry.time}</span>
                  </div>
                  <div className="space-y-0.5">
                    {entry.lines.map((line, j) => (
                      <p key={j} className="text-sm text-gray-400">{line}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Double-entry ledger table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={visible >= ENTRIES.length ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl border border-emerald-500/10 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Double-Entry Accounting Ledger</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Debit Account', 'Credit Account', 'Amount', 'Balance Check'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs text-gray-600 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LEDGER_ROWS.map((row, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={visible >= ENTRIES.length ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors duration-150"
                >
                  <td className="px-5 py-3 text-red-400/80 text-xs">{row.from}</td>
                  <td className="px-5 py-3 text-emerald-400/80 text-xs">{row.to}</td>
                  <td className="px-5 py-3 text-white font-bold text-xs">{row.amount}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Balanced
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sum row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={visible >= ENTRIES.length ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="px-5 py-4 border-t border-emerald-500/15 bg-emerald-500/[0.04] flex items-center gap-3"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="font-mono text-xs text-emerald-400">
            SUM(debits) = SUM(credits) = ₹18,72,550
          </p>
          <span className="ml-auto text-xs text-emerald-500/60 font-mono">VERIFIED</span>
        </motion.div>
      </motion.div>
    </div>
  )
}
