import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

function computeScore(
  farmerCount: number,
  completedDispatches: number,
  totalRevenue: number,
  paidCount: number,
  gradeAPct: number,
) {
  const base = 400

  // Farmer network (0–150): 0.5 pts per farmer, cap 150
  const farmerScore = Math.min(150, farmerCount * 0.5)

  // Sales completions (0–100): 20 pts per dispatch, cap 100
  const dispatchScore = Math.min(100, completedDispatches * 20)

  // Trade volume (0–150): tiered by total revenue in lakhs
  const lakhs = totalRevenue / 100000
  const revenueScore =
    lakhs < 1   ? 0   :
    lakhs < 5   ? 30  :
    lakhs < 10  ? 60  :
    lakhs < 50  ? 90  :
    lakhs < 100 ? 120 : 150

  // Payout performance (0–75): 2 pts per paid payout, cap 75
  const payoutScore = Math.min(75, paidCount * 2)

  // Harvest quality (0–25): proportional grade-A percentage
  const qualityScore = (gradeAPct / 100) * 25

  const total = base + farmerScore + dispatchScore + revenueScore + payoutScore + qualityScore
  return {
    score: Math.min(900, Math.max(300, Math.round(total))),
    components: {
      base,
      farmer:   Math.round(farmerScore),
      dispatch: Math.round(dispatchScore),
      revenue:  Math.round(revenueScore),
      payout:   Math.round(payoutScore),
      quality:  Math.round(qualityScore),
    },
  }
}

export async function GET(req: NextRequest) {
  try {
    const fpoId = req.nextUrl.searchParams.get('fpoId')
    if (!fpoId) {
      return NextResponse.json({ success: false, error: 'fpoId required' }, { status: 400 })
    }

    const db = await getDb()

    const [farmers, dispatches, revenue, payouts, quality] = await Promise.all([
      db.query(
        `SELECT COUNT(DISTINCT farmer_id) as farmer_count FROM harvests WHERE fpo_id = $1`,
        [fpoId]
      ),
      db.query(
        `SELECT COUNT(*) as completed FROM dispatches WHERE fpo_id = $1 AND current_stage = 5`,
        [fpoId]
      ),
      db.query(
        `SELECT COALESCE(SUM(actual_revenue), 0) as total_revenue
         FROM dispatches WHERE fpo_id = $1 AND current_stage = 5`,
        [fpoId]
      ),
      db.query(
        `SELECT COUNT(*) as paid_count
         FROM payouts p JOIN dispatches d ON d.id = p.dispatch_id
         WHERE d.fpo_id = $1 AND p.payment_status = 'PAID'`,
        [fpoId]
      ),
      db.query(
        `SELECT
           COUNT(*) FILTER (WHERE grade_verified = 'A') * 100.0 / NULLIF(COUNT(*), 0) AS grade_a_pct
         FROM harvests WHERE fpo_id = $1`,
        [fpoId]
      ),
    ])

    const farmerCount         = parseInt(farmers.rows[0]?.farmer_count   ?? '0')
    const completedDispatches = parseInt(dispatches.rows[0]?.completed    ?? '0')
    const totalRevenue        = parseFloat(revenue.rows[0]?.total_revenue ?? '0')
    const paidCount           = parseInt(payouts.rows[0]?.paid_count      ?? '0')
    const gradeAPct           = parseFloat(quality.rows[0]?.grade_a_pct  ?? '0')

    const { score, components } = computeScore(
      farmerCount, completedDispatches, totalRevenue, paidCount, gradeAPct,
    )

    const label =
      score >= 800 ? 'Excellent' :
      score >= 700 ? 'Very Good' :
      score >= 600 ? 'Good'      :
      score >= 500 ? 'Fair'      : 'Poor'

    const loan =
      score >= 850 ? { amount: '₹1,00,00,000', working_capital: '₹50,00,000', rate: '7.0%' } :
      score >= 800 ? { amount: '₹50,00,000',   working_capital: '₹25,00,000', rate: '7.5%' } :
      score >= 700 ? { amount: '₹25,00,000',   working_capital: '₹10,00,000', rate: '9.0%' } :
      score >= 600 ? { amount: '₹15,00,000',   working_capital: '₹5,00,000',  rate: '10.0%'} :
      score >= 500 ? { amount: '₹5,00,000',    working_capital: '₹2,00,000',  rate: '12.0%'} :
      null

    const revenueLakhs = totalRevenue / 100000

    const breakdown = [
      {
        label: 'Farmer Network',
        score: components.farmer,
        max: 150,
        detail: `${farmerCount} active farmers in FPO`,
        impact: `+${components.farmer}`,
      },
      {
        label: 'Sales Completions',
        score: components.dispatch,
        max: 100,
        detail: `${completedDispatches} dispatches sold`,
        impact: `+${components.dispatch}`,
      },
      {
        label: 'Trade Volume',
        score: components.revenue,
        max: 150,
        detail: `₹${revenueLakhs.toFixed(1)}L total revenue`,
        impact: `+${components.revenue}`,
      },
      {
        label: 'Payout Performance',
        score: components.payout,
        max: 75,
        detail: `${paidCount} on-time farmer payments`,
        impact: `+${components.payout}`,
      },
      {
        label: 'Harvest Quality',
        score: components.quality,
        max: 25,
        detail: `${gradeAPct.toFixed(0)}% Grade-A harvests`,
        impact: `+${components.quality}`,
      },
    ]

    return NextResponse.json({
      success: true,
      score,
      max: 900,
      label,
      components,
      breakdown,
      loan,
      farmer_count:          farmerCount,
      completed_dispatches:  completedDispatches,
      total_revenue:         totalRevenue,
      paid_count:            paidCount,
      grade_a_pct:           gradeAPct,
    })
  } catch (error) {
    console.error('[GET /api/credit-score]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
