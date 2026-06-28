import {
  getFarmersByFPO,
  getFarmerById,
  getFarmerByFPOAndId,
  createFarmer,
  updateFarmer,
  deleteFarmer,
} from '../queries/farmers'
import type { Farmer, PaginatedResponse } from '../types'
import { PAGINATION_DEFAULTS } from '../constants'

export async function listFarmers(
  fpo_id: string,
  page = PAGINATION_DEFAULTS.PAGE,
  limit = PAGINATION_DEFAULTS.LIMIT
): Promise<PaginatedResponse<Farmer>> {
  const offset = (page - 1) * limit
  const { rows, total } = await getFarmersByFPO(fpo_id, limit, offset)
  return {
    data: rows,
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  }
}

export async function getFarmer(id: string, fpo_id: string): Promise<Farmer | null> {
  return getFarmerByFPOAndId(id, fpo_id)
}

export async function addFarmer(
  fpo_id: string,
  data: Omit<Farmer, 'id' | 'fpo_id' | 'created_at'>
): Promise<Farmer> {
  return createFarmer({ ...data, fpo_id })
}

export async function editFarmer(
  id: string,
  fpo_id: string,
  data: Partial<Omit<Farmer, 'id' | 'fpo_id' | 'created_at'>>
): Promise<Farmer | null> {
  return updateFarmer(id, fpo_id, data)
}

export async function removeFarmer(id: string, fpo_id: string): Promise<boolean> {
  return deleteFarmer(id, fpo_id)
}
