'use client'

import { useState, useReducer } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2, Wheat, AlertCircle, ClipboardList } from 'lucide-react'
import Link from 'next/link'

type FormState = {
  step: 1 | 2 | 3
  cropType: string
  variety: string
  grade: 'A' | 'B' | 'C' | null
  quantity: number
  photo: string | null
  moisture: number
  submitted: boolean
}

type FormAction = 
  | { type: 'SET_CROP'; payload: string }
  | { type: 'SET_VARIETY'; payload: string }
  | { type: 'SET_GRADE'; payload: 'A' | 'B' | 'C' }
  | { type: 'SET_QUANTITY'; payload: number }
  | { type: 'SET_PHOTO'; payload: string }
  | { type: 'SET_MOISTURE'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SUBMIT' }

const cropOptions = [
  { id: 'wheat', name: 'Wheat', Icon: Wheat },
  { id: 'rice', name: 'Rice', Icon: Wheat },
  { id: 'corn', name: 'Corn', Icon: Wheat },
  { id: 'tomato', name: 'Tomato', Icon: Wheat },
  { id: 'onion', name: 'Onion', Icon: Wheat },
  { id: 'soybean', name: 'Soybean', Icon: Wheat },
]

const gradeLabels = {
  A: 'Premium',
  B: 'Standard',
  C: 'Basic',
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_CROP':
      return { ...state, cropType: action.payload }
    case 'SET_VARIETY':
      return { ...state, variety: action.payload }
    case 'SET_GRADE':
      return { ...state, grade: action.payload }
    case 'SET_QUANTITY':
      return { ...state, quantity: action.payload }
    case 'SET_PHOTO':
      return { ...state, photo: action.payload }
    case 'SET_MOISTURE':
      return { ...state, moisture: action.payload }
    case 'NEXT_STEP':
      if (state.step < 3) return { ...state, step: (state.step + 1) as 1 | 2 | 3 }
      return state
    case 'PREV_STEP':
      if (state.step > 1) return { ...state, step: (state.step - 1) as 1 | 2 | 3 }
      return state
    case 'SUBMIT':
      return { ...state, submitted: true }
    default:
      return state
  }
}

export function HarvestWizard() {
  const [state, dispatch] = useReducer(formReducer, {
    step: 1,
    cropType: '',
    variety: '',
    grade: null,
    quantity: 5,
    photo: null,
    moisture: 12,
    submitted: false,
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const farmerId = localStorage.getItem('userId') || ''
      const fpoId = localStorage.getItem('fpoId') || 'fpo-001'

      const res = await fetch('/api/harvests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId,
          fpoId,
          cropType: state.cropType,
          variety: state.variety,
          grade: state.grade,
          quantityEstimated: state.quantity,
          moisture: state.moisture,
          notes: '',
        }),
      })
      const data = await res.json()
      if (data.success) {
        dispatch({ type: 'SUBMIT' })
      } else {
        alert(data.error || 'Failed to submit. Try again.')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canProceedStep1 = state.cropType && state.grade !== null
  const canProceedStep2 = state.quantity > 0
  const canSubmit = canProceedStep1 && canProceedStep2

  if (state.submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-[#0A0F0A] flex items-center justify-center p-6"
      >
        <div className="text-center space-y-6 max-w-md">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto" />
          </motion.div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white">Request Submitted!</h2>
            <p className="text-gray-400">Gopal Hegde will review shortly.</p>
            <p className="text-sm text-gray-500">You'll get notified when approved.</p>
          </div>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30"
          >
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-blue-400 text-sm font-medium">SUBMITTED</span>
          </motion.div>
          <Link
            href="/farmer-dashboard"
            className="inline-block w-full py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors text-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0F0A] p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/farmer-dashboard"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">
              Step {state.step} of 3 · {state.step === 1 ? 'Crop Details' : state.step === 2 ? 'Quantity' : 'Confirm'}
            </h1>
            <span className="text-sm text-gray-400">{state.step === 1 ? '33%' : state.step === 2 ? '66%' : '100%'}</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${state.step * 33.33}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-emerald-500"
            />
          </div>
        </div>

        <div className="bg-white/[0.03] border border-emerald-500/10 rounded-2xl p-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Crop Details */}
            {state.step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">What crop?</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {cropOptions.map(crop => (
                      <motion.button
                        key={crop.id}
                        onClick={() => dispatch({ type: 'SET_CROP', payload: crop.id })}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-4 rounded-lg border-2 transition-all relative ${
                          state.cropType === crop.id
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                        }`}
                      >
                        <crop.Icon className="w-8 h-8 mb-2 text-emerald-400" />
                        <div className="text-sm font-medium text-white">{crop.name}</div>
                        {state.cropType === crop.id && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 absolute top-2 right-2" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Variety (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. HD-2967, Basmati, Sharbati"
                    value={state.variety}
                    onChange={(e) => dispatch({ type: 'SET_VARIETY', payload: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">Quality Grade</label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['A', 'B', 'C'] as const).map(grade => (
                      <motion.button
                        key={grade}
                        onClick={() => dispatch({ type: 'SET_GRADE', payload: grade })}
                        whileTap={{ scale: 0.95 }}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          state.grade === grade
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold text-lg">{grade}</div>
                        <div className="text-xs text-gray-400">{gradeLabels[grade]}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Quantity */}
            {state.step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-200 text-sm">
                    This is your ESTIMATED quantity. The actual weight will be verified at the godown before finalizing.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => dispatch({ type: 'SET_QUANTITY', payload: Math.max(0.5, state.quantity - 0.5) })}
                      className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-2xl transition-colors"
                    >
                      −
                    </button>
                    <div className="text-center">
                      <input
                        type="number"
                        value={state.quantity}
                        onChange={(e) => dispatch({ type: 'SET_QUANTITY', payload: parseFloat(e.target.value) || 0 })}
                        className="text-6xl font-bold text-white text-center w-32 bg-transparent focus:outline-none"
                      />
                      <div className="text-gray-400 text-lg">Quintals</div>
                    </div>
                    <button
                      onClick={() => dispatch({ type: 'SET_QUANTITY', payload: state.quantity + 0.5 })}
                      className="w-14 h-14 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 flex items-center justify-center text-2xl transition-colors text-emerald-400"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">Moisture Content</label>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="5"
                      max="20"
                      value={state.moisture}
                      onChange={(e) => dispatch({ type: 'SET_MOISTURE', payload: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Dry</span>
                      <span className="text-emerald-400">~{state.moisture}% moisture</span>
                      <span>Wet</span>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {state.step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="bg-white/[0.03] border border-emerald-500/30 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-white text-lg">Your Crop Request</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Crop:</span>
                      <span className="text-white font-medium">{state.cropType} {state.variety ? `(${state.variety})` : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Grade:</span>
                      <span className="text-white font-medium">{state.grade} — {state.grade ? gradeLabels[state.grade] : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Est. Qty:</span>
                      <span className="text-white font-medium">{state.quantity} Quintals</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">FPO:</span>
                      <span className="text-white font-medium">GreenHarvest FPO</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Farmer:</span>
                      <span className="text-white font-medium">Ramesh Kumar</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-400 text-center">
                  Your request goes to manager for approval. Once approved, you will receive godown address and your token number.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-8 border-t border-white/10">
            {state.step > 1 && (
              <button
                onClick={() => dispatch({ type: 'PREV_STEP' })}
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}
            {state.step < 3 ? (
              <button
                onClick={() => dispatch({ type: 'NEXT_STEP' })}
                disabled={!canProceedStep1 && state.step === 1}
                className="ml-auto flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                className="ml-auto flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
