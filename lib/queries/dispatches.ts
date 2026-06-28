import { query, queryOne } from '../db'
import type { Dispatch } from '../types'

export async function getDispatchesByFPO(
  fpo_id: string,
  limit = 20,
  offset = 0
): Promise<{ rows: Dispatch[]; total: number }> {
  const rows = await query<Dispatch>(
    `SELECT d.*, m.name AS mandi_name, h.crop, h.quantity_kg AS harvest_qty
     FROM dispatches d
     JOIN mandis m ON m.id = d.mandi_id
     JOIN harvests h ON h.id = d.harvest_id
     WHERE d.fpo_id = $1
     ORDER BY d.created_at DESC
     LIMIT $2 OFFSET $3`,
    [fpo_id, limit, offset]
  )
  const countRow = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM dispatches WHERE fpo_id = $1`,
    [fpo_id]
  )
  return { rows, total: parseInt(countRow?.count ?? '0') }
}

export async function getDispatchById(id: string): Promise<Dispatch | null> {
  return queryOne<Dispatch>(`SELECT * FROM dispatches WHERE id = $1`, [id])
}

export async function createDispatch(
  data: Omit<Dispatch, 'id' | 'created_at'>
): Promise<Dispatch> {
  const row = await queryOne<Dispatch>(
    `INSERT INTO dispatches (harvest_id, fpo_id, mandi_id, vehicle_number, driver_name, driver_phone, quantity_kg, scheduled_date, status, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      data.harvest_id, data.fpo_id, data.mandi_id, data.vehicle_number,
      data.driver_name, data.driver_phone, data.quantity_kg,
      data.scheduled_date, data.status, data.notes,
    ]
  )
  return row!
}

export async function updateDispatchStatus(
  id: string,
  status: Dispatch['status'],
  fpo_id: string
): Promise<Dispatch | null> {
  return queryOne<Dispatch>(
    `UPDATE dispatches SET status = $2,
       actual_departure = CASE WHEN $2 = 'in_transit' THEN now() ELSE actual_departure END,
       actual_arrival   = CASE WHEN $2 = 'arrived'    THEN now() ELSE actual_arrival   END
     WHERE id = $1 AND fpo_id = $3
     RETURNING *`,
    [id, status, fpo_id]
  )
}
