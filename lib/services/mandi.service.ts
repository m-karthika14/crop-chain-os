import {
  getAllMandis,
  getMandiById,
  getMandiPrices,
  getLatestPricesForCrop,
  getBestMandiForCrop,
} from '../queries/mandis'
import type { Mandi, MandiPrice } from '../types'

export async function listMandis(): Promise<Mandi[]> {
  return getAllMandis()
}

export async function getMandi(id: string): Promise<Mandi | null> {
  return getMandiById(id)
}

export async function getMandiPriceHistory(
  mandi_id: string,
  crop?: string
): Promise<MandiPrice[]> {
  return getMandiPrices(mandi_id, crop)
}

export async function getPricesForCrop(
  crop: string
): Promise<(MandiPrice & { mandi_name: string })[]> {
  return getLatestPricesForCrop(crop)
}

export async function getOptimalMandis(
  crop: string,
  quantity_kg: number
): Promise<(MandiPrice & { mandi_name: string; estimated_revenue: number })[]> {
  return getBestMandiForCrop(crop, quantity_kg)
}
