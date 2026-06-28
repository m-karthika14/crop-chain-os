import { query, queryOne } from '../db'
import type { Payout } from '../types'

export async function getPayoutsByFPO(
  fpo_id: string,
  limit = 20,
  offset = 0
): Promise<{ rows: Payout[]; total: number }> {
  const rows = await query<Payout>(
    `SELECT p.*, f.name AS farmer_name, f.phone AS farmer_phone
     FROM payouts p
     JOIN farmers f ON f.id = p.farmer_id
     WHERE p.fpo_id = $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [fpo_id, limit, offset]
  )
  const countRow = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM payouts WHERE fpo_id = $1`,
    [fpo_id]
  )
  return { rows, total: parseInt(countRow?.count ?? '0') }
}

export async function getPayoutsByFarmer(farmer_id: string): Promise<Payout[]> {
  return query<Payout>(
    `SELECT * FROM payouts WHERE farmer_id = $1 ORDER BY created_at DESC`,
    [farmer_id]
  )
}

export async function getPayoutById(id: string): Promise<Payout | null> {
  return queryOne<Payout>(`SELECT * FROM payouts WHERE id = $1`, [id])
}

export async function createPayout(data: Omit<Payout, 'id' | 'created_at'>): Promise<Payout> {
  const row = await queryOne<Payout>(
    `INSERT INTO payouts (farmer_id, sale_id, fpo_id, gross_amount, deductions, net_amount, payout_method, status, reference_id, paid_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      data.farmer_id, data.sale_id, data.fpo_id, data.gross_amount,
      data.deductions, data.net_amount, data.payout_method, data.status,
      data.reference_id, data.paid_at,
    ]
  )
  return row!
}

export async function updatePayoutStatus(
  id: string,
  fpo_id: string,
  status: Payout['status'],
  reference_id?: string
): Promise<Payout | null> {
  return queryOne<Payout>(
    `UPDATE payouts
     SET status = $3,
         reference_id = COALESCE($4, reference_id),
         paid_at = CASE WHEN $3 = 'completed' THEN now() ELSE paid_at END
     WHERE id = $1 AND fpo_id = $2
     RETURNING *`,
    [id, fpo_id, status, reference_id ?? null]
  )
}

export async function getPendingPayoutsTotal(fpo_id: string): Promise<number> {
  const row = await queryOne<{ total: string }>(
    `SELECT COALESCE(SUM(net_amount), 0)::text AS total FROM payouts WHERE fpo_id = $1 AND status = 'pending'`,
    [fpo_id]
  )
  return parseFloat(row?.total ?? '0')
}
