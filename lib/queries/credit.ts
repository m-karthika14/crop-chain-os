import { query, queryOne } from '../db'
import type { CreditScore } from '../types'

export async function getCreditScore(fpo_id: string): Promise<CreditScore | null> {
  return queryOne<CreditScore>(
    `SELECT * FROM credit_scores WHERE fpo_id = $1 ORDER BY computed_at DESC LIMIT 1`,
    [fpo_id]
  )
}

export async function getCreditScoreHistory(fpo_id: string, limit = 12): Promise<CreditScore[]> {
  return query<CreditScore>(
    `SELECT * FROM credit_scores WHERE fpo_id = $1 ORDER BY computed_at DESC LIMIT $2`,
    [fpo_id, limit]
  )
}

export async function upsertCreditScore(
  data: Omit<CreditScore, 'id' | 'computed_at'>
): Promise<CreditScore> {
  const row = await queryOne<CreditScore>(
    `INSERT INTO credit_scores (fpo_id, score, payment_history_score, trade_volume_score, farmer_retention_score, dispute_score)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [
      data.fpo_id, data.score, data.payment_history_score,
      data.trade_volume_score, data.farmer_retention_score, data.dispute_score,
    ]
  )
  return row!
}
