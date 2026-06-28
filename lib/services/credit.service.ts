import { getCreditScore, getCreditScoreHistory, upsertCreditScore } from '../queries/credit'
import { getPayoutsByFPO } from '../queries/payouts'
import { getSalesByFPO } from '../queries/sales'
import { getFarmersByFPO } from '../queries/farmers'
import type { CreditScore } from '../types'

export async function fetchCreditScore(fpo_id: string): Promise<CreditScore | null> {
  return getCreditScore(fpo_id)
}

export async function fetchCreditHistory(fpo_id: string): Promise<CreditScore[]> {
  return getCreditScoreHistory(fpo_id)
}

export async function computeAndSaveCreditScore(fpo_id: string): Promise<CreditScore> {
  const [{ rows: payouts }, { rows: sales }, { rows: farmers }] = await Promise.all([
    getPayoutsByFPO(fpo_id, 100, 0),
    getSalesByFPO(fpo_id, 100, 0),
    getFarmersByFPO(fpo_id, 1000, 0),
  ])

  const completedPayouts = payouts.filter((p) => p.status === 'completed').length
  const payment_history_score = payouts.length
    ? Math.min(100, Math.round((completedPayouts / payouts.length) * 100))
    : 50

  const totalRevenue = sales.reduce((s, sale) => s + Number(sale.total_amount), 0)
  const trade_volume_score = Math.min(100, Math.round(totalRevenue / 10_00_000))

  const activeFarmers = farmers.filter((f) => f.status === 'active').length
  const farmer_retention_score = farmers.length
    ? Math.min(100, Math.round((activeFarmers / farmers.length) * 100))
    : 50

  const dispute_score = 90

  const score = Math.round(
    payment_history_score * 0.35 +
    trade_volume_score * 0.30 +
    farmer_retention_score * 0.20 +
    dispute_score * 0.15
  )

  return upsertCreditScore({
    fpo_id,
    score,
    payment_history_score,
    trade_volume_score,
    farmer_retention_score,
    dispute_score,
  })
}
