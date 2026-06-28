import { query, queryOne } from '../db'
import type { Sale } from '../types'

export async function getSalesByFPO(
  fpo_id: string,
  limit = 20,
  offset = 0
): Promise<{ rows: Sale[]; total: number }> {
  const rows = await query<Sale>(
    `SELECT s.*, m.name AS mandi_name
     FROM sales s
     JOIN mandis m ON m.id = s.mandi_id
     WHERE s.fpo_id = $1
     ORDER BY s.sale_date DESC
     LIMIT $2 OFFSET $3`,
    [fpo_id, limit, offset]
  )
  const countRow = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM sales WHERE fpo_id = $1`,
    [fpo_id]
  )
  return { rows, total: parseInt(countRow?.count ?? '0') }
}

export async function getSaleById(id: string): Promise<Sale | null> {
  return queryOne<Sale>(`SELECT * FROM sales WHERE id = $1`, [id])
}

export async function createSale(data: Omit<Sale, 'id' | 'created_at'>): Promise<Sale> {
  const row = await queryOne<Sale>(
    `INSERT INTO sales (dispatch_id, fpo_id, mandi_id, crop, quantity_kg, price_per_kg, total_amount, buyer_name, buyer_phone, payment_status, sale_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      data.dispatch_id, data.fpo_id, data.mandi_id, data.crop,
      data.quantity_kg, data.price_per_kg, data.total_amount,
      data.buyer_name, data.buyer_phone, data.payment_status, data.sale_date,
    ]
  )
  return row!
}

export async function updateSalePaymentStatus(
  id: string,
  fpo_id: string,
  payment_status: Sale['payment_status']
): Promise<Sale | null> {
  return queryOne<Sale>(
    `UPDATE sales SET payment_status = $3 WHERE id = $1 AND fpo_id = $2 RETURNING *`,
    [id, fpo_id, payment_status]
  )
}

export async function getSalesByFarmer(farmer_id: string): Promise<Sale[]> {
  return query<Sale>(
    `SELECT s.* FROM sales s
     JOIN dispatches d ON d.id = s.dispatch_id
     JOIN harvests h ON h.id = d.harvest_id
     WHERE h.farmer_id = $1
     ORDER BY s.sale_date DESC`,
    [farmer_id]
  )
}
