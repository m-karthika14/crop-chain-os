'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Bell, Home, Wheat, Banknote, AlertTriangle, TrendingUp, TrendingDown, X, LogOut } from 'lucide-react'

// ─── Translations ────────────────────────────────────────────────────────────
type LangKey = 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'ml'

const T: Record<LangKey, {
  welcome: string
  member: string
  myCrops: string
  saleStatus: string
  myPayment: string
  earningsHistory: string
  notifications: string
  home: string
  crops: string
  payments: string
  alerts: string
  thisMonthEarnings: string
  lastPayment: string
  submitted: string
  dispatched: string
  sold: string
  paid: string
  expected: string
  received: string
  quintalsSubmitted: string
  upiRef: string
  time: string
  cropSoldAlert: string
  cropSoldSub: string
  creditedMsg: string
  hoursAgo: string
}> = {
  en: {
    welcome: 'Welcome',
    member: 'Member',
    myCrops: 'My Crops',
    saleStatus: 'Sale Status',
    myPayment: 'My Payment',
    earningsHistory: 'Earnings History',
    notifications: 'Notifications',
    home: 'Home',
    crops: 'Crops',
    payments: 'Payments',
    alerts: 'Alerts',
    thisMonthEarnings: "This Month's Earnings",
    lastPayment: 'Last payment',
    submitted: 'Submitted',
    dispatched: 'Dispatched',
    sold: 'Sold',
    paid: 'Paid',
    expected: 'Expected',
    received: 'Received',
    quintalsSubmitted: 'Quintals submitted',
    upiRef: 'UPI Ref',
    time: 'Time',
    cropSoldAlert: 'Your crop has been sold',
    cropSoldSub: 'Wheat sold at Karnal Mandi',
    creditedMsg: '₹16,500 credited to your UPI',
    hoursAgo: '2 hours ago',
  },
  hi: {
    welcome: 'नमस्ते',
    member: 'सदस्य',
    myCrops: 'मेरी फसल',
    saleStatus: 'बिक्री की स्थिति',
    myPayment: 'मेरा भुगतान',
    earningsHistory: 'कमाई का इतिहास',
    notifications: 'सूचनाएं',
    home: 'होम',
    crops: 'फसल',
    payments: 'भुगतान',
    alerts: 'अलर्ट',
    thisMonthEarnings: 'इस महीने की कमाई',
    lastPayment: 'अंतिम भुगतान',
    submitted: 'जमा किया',
    dispatched: 'भेजा गया',
    sold: 'बिका',
    paid: 'भुगतान हुआ',
    expected: 'अनुमानित',
    received: 'प्राप्त',
    quintalsSubmitted: 'क्विंटल जमा किए',
    upiRef: 'UPI रेफ',
    time: 'समय',
    cropSoldAlert: 'आपकी फसल बिक गई',
    cropSoldSub: 'करनाल मंडी में गेहूं बिका',
    creditedMsg: '₹16,500 आपके UPI में क्रेडिट',
    hoursAgo: '2 घंटे पहले',
  },
  kn: {
    welcome: 'ಸ್ವಾಗತ',
    member: 'ಸದಸ್ಯ',
    myCrops: 'ನನ್ನ ಬೆಳೆ',
    saleStatus: 'ಮಾರಾಟ ಸ್ಥಿತಿ',
    myPayment: 'ನನ್ನ ಪಾವತಿ',
    earningsHistory: 'ಗಳಿಕೆ ಇತಿಹಾಸ',
    notifications: 'ಅಧಿಸೂಚನೆಗಳು',
    home: 'ಮನೆ',
    crops: 'ಬೆಳೆ',
    payments: 'ಪಾವತಿ',
    alerts: 'ಎಚ್ಚರಿಕೆ',
    thisMonthEarnings: 'ಈ ತಿಂಗಳ ಗಳಿಕೆ',
    lastPayment: 'ಕೊನೆಯ ಪಾವತಿ',
    submitted: 'ಸಲ್ಲಿಸಲಾಗಿದೆ',
    dispatched: 'ರವಾನಿಸಲಾಗಿದೆ',
    sold: 'ಮಾರಾಟವಾಯಿತು',
    paid: 'ಪಾವತಿಯಾಯಿತು',
    expected: 'ನಿರೀಕ್ಷಿತ',
    received: 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
    quintalsSubmitted: 'ಕ್ವಿಂಟಾಲ್ ಸಲ್ಲಿಸಲಾಗಿದೆ',
    upiRef: 'UPI ರೆಫ್',
    time: 'ಸಮಯ',
    cropSoldAlert: 'ನಿಮ್ಮ ಬೆಳೆ ಮಾರಾಟವಾಗಿದೆ',
    cropSoldSub: 'ಕರ್ನಾಲ್ ಮಂಡಿಯಲ್ಲಿ ಗೋಧಿ ಮಾರಾಟ',
    creditedMsg: '₹16,500 ನಿಮ್ಮ UPI ಗೆ ಕ್ರೆಡಿಟ್',
    hoursAgo: '2 ಗಂಟೆ ಹಿಂದೆ',
  },
  ta: {
    welcome: 'வரவேற்பு',
    member: 'உறுப்பினர்',
    myCrops: 'என் பயிர்',
    saleStatus: 'விற்பனை நிலை',
    myPayment: 'என் கட்டணம்',
    earningsHistory: 'வருவாய் வரலாறு',
    notifications: 'அறிவிப்புகள்',
    home: 'முகப்பு',
    crops: 'பயிர்',
    payments: 'கட்டணம்',
    alerts: 'எச்சரிக்கை',
    thisMonthEarnings: 'இந்த மாத வருவாய்',
    lastPayment: 'கடைசி கட்டணம்',
    submitted: 'சமர்ப்பிக்கப்பட்டது',
    dispatched: 'அனுப்பப்பட்டது',
    sold: 'விற்கப்பட்டது',
    paid: 'கட்டணம் செலுத்தப்பட்டது',
    expected: 'எதிர்பார்க்கப்பட்டது',
    received: 'பெறப்பட்டது',
    quintalsSubmitted: 'குவிண்டால் சமர்ப்பிக்கப்பட்டது',
    upiRef: 'UPI குறிப்பு',
    time: 'நேரம்',
    cropSoldAlert: 'உங்கள் பயிர் விற்கப்பட்டது',
    cropSoldSub: 'கர்னால் மண்டியில் கோதுமை விற்கப்பட்டது',
    creditedMsg: '₹16,500 உங்கள் UPI-ல் வரவு',
    hoursAgo: '2 மணி நேரம் முன்பு',
  },
  te: {
    welcome: 'స్వాగతం',
    member: 'సభ్యుడు',
    myCrops: 'నా పంట',
    saleStatus: 'అమ్మకం స్థితి',
    myPayment: 'నా చెల్లింపు',
    earningsHistory: 'ఆదాయ చరిత్ర',
    notifications: 'నోటిఫికేషన్లు',
    home: 'హోమ్',
    crops: 'పంట',
    payments: 'చెల్లింపులు',
    alerts: 'హెచ్చరికలు',
    thisMonthEarnings: 'ఈ నెల ఆదాయం',
    lastPayment: 'చివరి చెల్లింపు',
    submitted: 'సమర్పించబడింది',
    dispatched: 'పంపబడింది',
    sold: 'అమ్మబడింది',
    paid: 'చెల్లించబడింది',
    expected: 'అంచనా',
    received: 'స్వీకరించబడింది',
    quintalsSubmitted: 'క్వింటాళ్ళు సమర్పించబడ్డాయి',
    upiRef: 'UPI రెఫ్',
    time: 'సమయం',
    cropSoldAlert: 'మీ పంట అమ్మబడింది',
    cropSoldSub: 'కర్నాల్ మండిలో గోధుమ అమ్మబడింది',
    creditedMsg: '₹16,500 మీ UPI కి జమ అయింది',
    hoursAgo: '2 గంటల ముందు',
  },
  ml: {
    welcome: 'സ്വാഗതം',
    member: 'അംഗം',
    myCrops: 'എന്റെ വിള',
    saleStatus: 'വിൽപ്പന നില',
    myPayment: 'എന്റെ പേയ്‌മെന്റ്',
    earningsHistory: 'വരുമാന ചരിത്രം',
    notifications: 'അറിയിപ്പുകൾ',
    home: 'ഹോം',
    crops: 'വിള',
    payments: 'പേയ്‌മെന്റ്',
    alerts: 'അലേർട്ട്',
    thisMonthEarnings: 'ഈ മാസത്തെ വരുമാനം',
    lastPayment: 'അവസാന പേയ്‌മെന്റ്',
    submitted: 'സമർപ്പിച്ചു',
    dispatched: 'അയച്ചു',
    sold: 'വിറ്റു',
    paid: 'പേയ്‌മെന്റ് ചെയ്തു',
    expected: 'പ്രതീക്ഷിക്കുന്നത്',
    received: 'ലഭിച്ചു',
    quintalsSubmitted: 'ക്വിന്റൽ സമർപ്പിച്ചു',
    upiRef: 'UPI റെഫ്',
    time: 'സമയം',
    cropSoldAlert: 'നിങ്ങളുടെ വിള വിൽക്കപ്പെട്ടു',
    cropSoldSub: 'കർണാൽ മണ്ടിയിൽ ഗോതമ്പ് വിറ്റു',
    creditedMsg: '₹16,500 നിങ്ങളുടെ UPI-ൽ ക്രെഡിറ്റ്',
    hoursAgo: '2 മണിക്കൂർ മുമ്പ്',
  },
}

const LANG_LABELS: { key: LangKey; label: string }[] = [
  { key: 'en', label: 'EN' },
  { key: 'hi', label: 'हिं' },
  { key: 'kn', label: 'ಕನ್ನ' },
  { key: 'ta', label: 'தமி' },
  { key: 'te', label: 'తెలు' },
  { key: 'ml', label: 'മലയ' },
]

// ─── Animated counter ────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0)
  const raf = useRef<number | null>(null)
  const start = useRef<number | null>(null)

  useEffect(() => {
    start.current = null
    const step = (ts: number) => {
      if (!start.current) start.current = ts
      const progress = Math.min((ts - start.current) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(ease * target))
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration])

  return count
}

// ─── Bar chart bar ───────────────────────────────────────────────────────────
const historyData = [
  { month: 'March', amount: 22000, up: true },
  { month: 'April', amount: 17000, up: false },
  { month: 'May',   amount: 31000, up: true },
]
const maxAmount = Math.max(...historyData.map(d => d.amount))

// ─── Main page ───────────────────────────────────────────────────────────────
export default function FarmerPortalPage() {
  const [lang, setLang] = useState<LangKey>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('farmer_lang') as LangKey) || 'en'
    }
    return 'en'
  })
  const [activeTab, setActiveTab] = useState<'home' | 'crops' | 'payments' | 'alerts'>('home')
  const [showFPOModal, setShowFPOModal] = useState(false)
  const [selectedDispatch, setSelectedDispatch] = useState('KA-01-AB-1234')
  const [fpoFormData, setFpoFormData] = useState({
    farmerName: 'Ramesh Kumar',
    village: 'Karnal',
    state: 'Haryana',
    fpoName: 'GreenHarvest FPO',
  })
  const earnings = useCountUp(31200)
  
  const dispatches = [
    { id: 'KA-01-AB-1234', crop: 'Wheat', status: 'Dispatched' },
    { id: 'KA-02-CD-5678', crop: 'Rice', status: 'Transit' },
    { id: 'KA-03-EF-9012', crop: 'Tomato', status: 'Sold' },
  ]
  
  const handleLeaveFPO = () => {
    setShowFPOModal(true)
  }
  
  const handleUpdateFPO = () => {
    setShowFPOModal(false)
  }

  const t = T[lang]

  function switchLang(l: LangKey) {
    setLang(l)
    localStorage.setItem('farmer_lang', l)
  }

  const pipelineSteps = [
    { key: 'submitted', icon: '📋' },
    { key: 'dispatched', icon: '🚛' },
    { key: 'sold',       icon: '🏪' },
    { key: 'paid',       icon: '💸' },
  ] as const

  return (
    // Phone wrapper — centered in full viewport
    <div
      className="relative w-full max-w-[400px] min-h-screen flex flex-col rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/10"
      style={{ backgroundColor: '#0A0F0A' }}
    >
      {/* ── Animated page content (full-page fade on lang change) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={lang}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex flex-col flex-1 pb-24"
          style={{ fontFamily: "'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Kannada', 'Noto Sans Malayalam', system-ui, sans-serif" }}
        >
          {/* ── TOP HEADER ─────────────────────────────────────────── */}
          <div className="px-5 pt-6 pb-4">
            {/* Language switcher */}
            <div className="flex gap-1.5 justify-end mb-5 flex-wrap">
              {LANG_LABELS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => switchLang(key)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                    lang === key
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                      : 'bg-white/[0.06] text-gray-400 border border-white/10 hover:border-emerald-500/30 hover:text-emerald-400'
                  }`}
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Greeting row */}
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center shrink-0">
                <span className="text-emerald-400 font-bold text-lg">RK</span>
              </div>
              <div className="flex-1">
                <p className="text-base text-gray-400">{t.welcome},</p>
                <p className="text-2xl font-bold text-white leading-tight">Ramesh Kumar 🙏</p>
                <p className="text-sm text-emerald-500/80 mt-0.5">
                  GreenHarvest FPO &nbsp;·&nbsp;
                  <span className="text-emerald-400 font-medium">{t.member}</span>
                </p>
              </div>
            </div>
          </div>

          {/* ── FPO MEMBERSHIP CARD ─────────────────────────────────── */}
          <div className="mx-4 mb-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4 bg-blue-500/10 border border-blue-500/30"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">FPO Membership</p>
                  <p className="text-base font-bold text-white mt-1">GreenHarvest FPO</p>
                </div>
                <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full">Active</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">You are a member of GreenHarvest FPO since 2023</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLeaveFPO}
                className="w-full flex items-center justify-center gap-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-semibold py-2 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Leave FPO
              </motion.button>
            </motion.div>
          </div>

          {/* ── HERO EARNINGS CARD ──────────────────────────────────── */}
          <div className="mx-4 mb-4">
            <div
              className="relative rounded-2xl p-5 overflow-hidden glow-pulse"
              style={{
                background: 'linear-gradient(135deg, #0D1F18 0%, #0A1A12 100%)',
                border: '1.5px solid rgba(16,185,129,0.45)',
              }}
            >
              {/* Soft radial glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.12) 0%, transparent 70%)' }}
              />
              <p className="text-sm text-emerald-400/80 font-medium mb-1 relative z-10">
                {t.thisMonthEarnings}
              </p>
              <p className="text-5xl font-black text-white relative z-10">
                ₹{earnings.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center gap-2 mt-3 relative z-10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-gray-400">
                  {t.lastPayment}:&nbsp;
                  <span className="text-white font-medium">Today 2:21 PM</span>
                </span>
              </div>
            </div>
          </div>

          {/* ── MY CROPS ────────────────────────────────────────────── */}
          <div className="mx-4 mb-4">
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-base font-bold text-white">{t.myCrops}</p>
                <select
                  value={selectedDispatch}
                  onChange={(e) => setSelectedDispatch(e.target.value)}
                  className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold px-2.5 py-1 rounded-lg focus:outline-none focus:border-emerald-500/60 transition-colors"
                >
                  {dispatches.map(d => (
                    <option key={d.id} value={d.id} className="bg-gray-900 text-white">
                      {d.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="h-px bg-white/[0.06] mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌾</span>
                  <div>
                    <p className="text-base font-semibold text-white">
                      {dispatches.find(d => d.id === selectedDispatch)?.crop || 'Wheat'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {dispatches.find(d => d.id === selectedDispatch)?.status || 'Sold'} • 8 {t.quintalsSubmitted}
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-bold px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t.sold}
                </span>
              </div>
            </div>
          </div>

          {/* ── SALE STATUS PIPELINE ─────────────────────────────────── */}
          <div className="mx-4 mb-4">
            <div className="glass rounded-2xl p-4">
              <p className="text-base font-bold text-white mb-4">{t.saleStatus}</p>
              <div className="relative flex items-start justify-between">
                {/* Connecting line behind */}
                <div
                  className="absolute top-6 left-6 right-6 h-0.5"
                  style={{ background: 'linear-gradient(90deg, #10B981, #10B981, #10B981, #10B981)' }}
                />
                {/* Animated fill overlay */}
                <motion.div
                  className="absolute top-6 left-6 h-0.5 bg-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: 'calc(100% - 3rem)' }}
                  transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                />
                {pipelineSteps.map((step, i) => (
                  <motion.div
                    key={step.key}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                    className="relative z-10 flex flex-col items-center gap-2 w-1/4"
                  >
                    <span className="text-xl">{step.icon}</span>
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                    </div>
                    <p className="text-[10px] text-emerald-400 font-semibold text-center leading-tight">
                      {t[step.key]}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* ── MY PAYMENT ──────────────────────────────────────────── */}
          <div className="mx-4 mb-4">
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-base font-bold text-white">{t.myPayment}</p>
                <span className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  {t.paid}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{t.expected}</span>
                  <span className="text-sm font-semibold text-gray-300">₹16,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{t.received}</span>
                  <span className="text-base font-bold text-emerald-400">₹16,500 ✅</span>
                </div>
                <div className="h-px bg-white/[0.06]" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{t.upiRef}</span>
                  <span className="text-sm font-mono text-gray-300">UTR2847392847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{t.time}</span>
                  <span className="text-sm text-gray-300">14:21:33 today</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── EARNINGS HISTORY ─────────────────────────────────────── */}
          <div className="mx-4 mb-4">
            <div className="glass rounded-2xl p-4">
              <p className="text-base font-bold text-white mb-4">{t.earningsHistory}</p>
              <div className="space-y-3">
                {historyData.map((row, i) => (
                  <motion.div
                    key={row.month}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 * i, duration: 0.35 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-sm text-gray-400 w-12 shrink-0">{row.month}</span>
                    <div className="flex-1 h-5 rounded-full bg-white/[0.04] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: '#10B981' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(row.amount / maxAmount) * 100}%` }}
                        transition={{ delay: 0.3 + i * 0.15, duration: 0.7, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white w-20 text-right shrink-0">
                      ₹{row.amount.toLocaleString('en-IN')}
                    </span>
                    {row.up
                      ? <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                      : <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />
                    }
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* ── NOTIFICATION CARD ────────────────────────────────────── */}
          <div className="mx-4 mb-4">
            <p className="text-base font-bold text-white mb-3">{t.notifications}</p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl p-4 flex gap-3"
              style={{
                background: 'rgba(251,191,36,0.05)',
                border: '1px solid rgba(251,191,36,0.15)',
                borderLeft: '4px solid #F59E0B',
              }}
            >
              <Bell className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-white">{t.cropSoldAlert}</p>
                <p className="text-sm text-gray-400 mt-0.5">{t.cropSoldSub}</p>
                <p className="text-sm text-emerald-400 font-medium mt-0.5">{t.creditedMsg}</p>
                <p className="text-xs text-gray-600 mt-1.5">{t.hoursAgo}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── FPO REGISTRATION MODAL ────────────────────────────────── */}
      <AnimatePresence>
        {showFPOModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Change FPO</h2>
                <button
                  onClick={() => setShowFPOModal(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-2">Farmer Name</label>
                  <input
                    type="text"
                    value={fpoFormData.farmerName}
                    onChange={(e) => setFpoFormData({ ...fpoFormData, farmerName: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-2">Village</label>
                  <input
                    type="text"
                    value={fpoFormData.village}
                    onChange={(e) => setFpoFormData({ ...fpoFormData, village: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-2">State</label>
                  <input
                    type="text"
                    value={fpoFormData.state}
                    onChange={(e) => setFpoFormData({ ...fpoFormData, state: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-400 block mb-2">New FPO Name</label>
                  <input
                    type="text"
                    value={fpoFormData.fpoName}
                    onChange={(e) => setFpoFormData({ ...fpoFormData, fpoName: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowFPOModal(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdateFPO}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold py-2 rounded-lg transition-all duration-200"
                  >
                    Update FPO
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BOTTOM NAV (outside AnimatePresence — always visible) ──── */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] border-t border-white/[0.06] z-50"
        style={{ backgroundColor: 'rgba(10,15,10,0.95)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center justify-around py-2 px-2">
          {(
            [
              { key: 'home',     icon: Home,     label: t.home },
              { key: 'crops',    icon: Wheat,    label: t.crops },
              { key: 'payments', icon: Banknote, label: t.payments },
              { key: 'alerts',   icon: Bell,     label: t.alerts },
            ] as const
          ).map(({ key, icon: Icon, label }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="flex flex-col items-center gap-1 px-4 py-1 relative"
              >
                <Icon
                  className={`w-6 h-6 transition-colors duration-200 ${
                    isActive ? 'text-emerald-400' : 'text-gray-600'
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-colors duration-200 ${
                    isActive ? 'text-emerald-400' : 'text-gray-600'
                  }`}
                >
                  {label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-emerald-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
