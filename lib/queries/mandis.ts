import { query, queryOne } from '../db'
import type { Mandi, MandiPrice } from '../types'

export async function getAllMandis(): Promise<Mandi[]> {
  return query<Mandi>(`SELECT * FROM mandis ORDER BY name`)
}

export async function getMandiById(id: string): Promise<Mandi | null> {
  return queryOne<Mandi>(`SELECT * FROM mandis WHERE id = $1`, [id])
}

export async function getMandiPrices(mandi_id: string, crop?: string): Promise<MandiPrice[]> {
  if (crop) {
    return query<MandiPrice>(
      `SELECT * FROM mandi_prices WHERE mandi_id = $1 AND crop = $2 ORDER BY date DESC LIMIT 30`,
      [mandi_id, crop]
    )
  }
  return query<MandiPrice>(
    `SELECT * FROM mandi_prices WHERE mandi_id = $1 ORDER BY date DESC LIMIT 30`,
    [mandi_id]
  )
}

export async function getLatestPricesForCrop(crop: string): Promise<(MandiPrice & { mandi_name: string })[]> {
  return query<MandiPrice & { mandi_name: string }>(
    `SELECT mp.*, m.name AS mandi_name, m.district, m.state
     FROM mandi_prices mp
     JOIN mandis m ON m.id = mp.mandi_id
     WHERE mp.crop = $1
       AND mp.date = (SELECT MAX(date) FROM mandi_prices WHERE crop = $1)
     ORDER BY mp.modal_price DESC`,
    [crop]
  )
}

export async function getBestMandiForCrop(
  crop: string,
  quantity_kg: number
): Promise<(MandiPrice & { mandi_name: string; estimated_revenue: number })[]> {
  return query(
    `SELECT mp.*, m.name AS mandi_name, m.district, m.state,
            (mp.modal_price * $2)::numeric AS estimated_revenue
     FROM mandi_prices mp
     JOIN mandis m ON m.id = mp.mandi_id
     WHERE mp.crop = $1
       AND mp.date >= now() - interval '3 days'
     ORDER BY mp.modal_price DESC
     LIMIT 10`,
    [crop, quantity_kg / 100]
  )
}
