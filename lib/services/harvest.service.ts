import {
  getHarvestsByFPO,
  getHarvestsByFarmer,
  getHarvestById,
  createHarvest,
  updateHarvest,
  updateHarvestStatus,
} from '../queries/harvests'
import type { Harvest, PaginatedResponse } from '../types'
import { PAGINATION_DEFAULTS } from '../constants'

export async function listHarvests(
  fpo_id: string,
  page = PAGINATION_DEFAULTS.PAGE,
  limit = PAGINATION_DEFAULTS.LIMIT
): Promise<PaginatedResponse<Harvest>> {
  const offset = (page - 1) * limit
  const { rows, total } = await getHarvestsByFPO(fpo_id, limit, offset)
  return { data: rows, total, page, limit, total_pages: Math.ceil(total / limit) }
}

export async function listFarmerHarvests(farmer_id: string): Promise<Harvest[]> {
  return getHarvestsByFarmer(farmer_id)
}

export async function getHarvest(id: string): Promise<Harvest | null> {
  return getHarvestById(id)
}

export async function addHarvest(
  fpo_id: string,
  data: Omit<Harvest, 'id' | 'fpo_id' | 'created_at'>
): Promise<Harvest> {
  return createHarvest({ ...data, fpo_id })
}

export async function editHarvest(
  id: string,
  fpo_id: string,
  data: Partial<Omit<Harvest, 'id' | 'fpo_id' | 'created_at'>>
): Promise<Harvest | null> {
  return updateHarvest(id, fpo_id, data)
}

export async function approveHarvest(id: string): Promise<Harvest | null> {
  return updateHarvestStatus(id, 'approved')
}

export async function rejectHarvest(id: string): Promise<Harvest | null> {
  return updateHarvestStatus(id, 'pending')
}
