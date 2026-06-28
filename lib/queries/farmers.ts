import { query, queryOne } from '../db'
import type { Farmer } from '../types'

export async function getFarmersByFPO(
  fpo_id: string,
  limit = 20,
  offset = 0
): Promise<{ rows: Farmer[]; total: number }> {
  const rows = await query<Farmer>(
    `SELECT * FROM farmers WHERE fpo_id = $1 ORDER BY name LIMIT $2 OFFSET $3`,
    [fpo_id, limit, offset]
  )
  const countRow = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM farmers WHERE fpo_id = $1`,
    [fpo_id]
  )
  return { rows, total: parseInt(countRow?.count ?? '0') }
}

export async function getFarmerById(id: string): Promise<Farmer | null> {
  return queryOne<Farmer>(`SELECT * FROM farmers WHERE id = $1`, [id])
}

export async function getFarmerByFPOAndId(id: string, fpo_id: string): Promise<Farmer | null> {
  return queryOne<Farmer>(`SELECT * FROM farmers WHERE id = $1 AND fpo_id = $2`, [id, fpo_id])
}

export async function createFarmer(
  data: Omit<Farmer, 'id' | 'created_at'>
): Promise<Farmer> {
  const row = await queryOne<Farmer>(
    `INSERT INTO farmers (fpo_id, name, phone, village, district, state, land_acres, crops, bank_account, ifsc_code, upi_id, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      data.fpo_id, data.name, data.phone, data.village, data.district,
      data.state, data.land_acres, data.crops, data.bank_account,
      data.ifsc_code, data.upi_id, data.status,
    ]
  )
  return row!
}

export async function updateFarmer(
  id: string,
  fpo_id: string,
  data: Partial<Omit<Farmer, 'id' | 'fpo_id' | 'created_at'>>
): Promise<Farmer | null> {
  const fields = Object.keys(data)
  if (fields.length === 0) return getFarmerByFPOAndId(id, fpo_id)

  const setClauses = fields.map((f, i) => `${f} = $${i + 3}`).join(', ')
  const values = fields.map((f) => (data as Record<string, unknown>)[f])

  return queryOne<Farmer>(
    `UPDATE farmers SET ${setClauses} WHERE id = $1 AND fpo_id = $2 RETURNING *`,
    [id, fpo_id, ...values]
  )
}

export async function deleteFarmer(id: string, fpo_id: string): Promise<boolean> {
  const rows = await query(
    `DELETE FROM farmers WHERE id = $1 AND fpo_id = $2 RETURNING id`,
    [id, fpo_id]
  )
  return rows.length > 0
}
