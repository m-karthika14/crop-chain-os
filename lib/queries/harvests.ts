import { query, queryOne } from '../db'
import type { Harvest } from '../types'

export async function getHarvestsByFPO(
  fpo_id: string,
  limit = 20,
  offset = 0
): Promise<{ rows: Harvest[]; total: number }> {
  const rows = await query<Harvest>(
    `SELECT h.*, f.name AS farmer_name
     FROM harvests h
     JOIN farmers f ON f.id = h.farmer_id
     WHERE h.fpo_id = $1
     ORDER BY h.created_at DESC
     LIMIT $2 OFFSET $3`,
    [fpo_id, limit, offset]
  )
  const countRow = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM harvests WHERE fpo_id = $1`,
    [fpo_id]
  )
  return { rows, total: parseInt(countRow?.count ?? '0') }
}

export async function getHarvestsByFarmer(farmer_id: string): Promise<Harvest[]> {
  return query<Harvest>(
    `SELECT * FROM harvests WHERE farmer_id = $1 ORDER BY created_at DESC`,
    [farmer_id]
  )
}

export async function getHarvestById(id: string): Promise<Harvest | null> {
  return queryOne<Harvest>(`SELECT * FROM harvests WHERE id = $1`, [id])
}

export async function createHarvest(
  data: Omit<Harvest, 'id' | 'created_at'>
): Promise<Harvest> {
  const row = await queryOne<Harvest>(
    `INSERT INTO harvests (farmer_id, fpo_id, crop, variety, quantity_kg, quality_grade, moisture_content, harvest_date, status, godown_id, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      data.farmer_id, data.fpo_id, data.crop, data.variety,
      data.quantity_kg, data.quality_grade, data.moisture_content,
      data.harvest_date, data.status, data.godown_id, data.notes,
    ]
  )
  return row!
}

export async function updateHarvestStatus(
  id: string,
  status: Harvest['status']
): Promise<Harvest | null> {
  return queryOne<Harvest>(
    `UPDATE harvests SET status = $2 WHERE id = $1 RETURNING *`,
    [id, status]
  )
}

export async function updateHarvest(
  id: string,
  fpo_id: string,
  data: Partial<Omit<Harvest, 'id' | 'fpo_id' | 'created_at'>>
): Promise<Harvest | null> {
  const fields = Object.keys(data)
  if (fields.length === 0) return getHarvestById(id)
  const setClauses = fields.map((f, i) => `${f} = $${i + 3}`).join(', ')
  const values = fields.map((f) => (data as Record<string, unknown>)[f])
  return queryOne<Harvest>(
    `UPDATE harvests SET ${setClauses} WHERE id = $1 AND fpo_id = $2 RETURNING *`,
    [id, fpo_id, ...values]
  )
}
