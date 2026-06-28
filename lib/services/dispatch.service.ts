import {
  getDispatchesByFPO,
  getDispatchById,
  createDispatch,
  updateDispatchStatus,
} from '../queries/dispatches'
import { updateHarvestStatus } from '../queries/harvests'
import type { Dispatch, PaginatedResponse } from '../types'
import { PAGINATION_DEFAULTS } from '../constants'

export async function listDispatches(
  fpo_id: string,
  page = PAGINATION_DEFAULTS.PAGE,
  limit = PAGINATION_DEFAULTS.LIMIT
): Promise<PaginatedResponse<Dispatch>> {
  const offset = (page - 1) * limit
  const { rows, total } = await getDispatchesByFPO(fpo_id, limit, offset)
  return { data: rows, total, page, limit, total_pages: Math.ceil(total / limit) }
}

export async function getDispatch(id: string): Promise<Dispatch | null> {
  return getDispatchById(id)
}

export async function scheduleDispatch(
  fpo_id: string,
  data: Omit<Dispatch, 'id' | 'fpo_id' | 'created_at'>
): Promise<Dispatch> {
  const dispatch = await createDispatch({ ...data, fpo_id })
  await updateHarvestStatus(dispatch.harvest_id, 'dispatched')
  return dispatch
}

export async function advanceDispatchStatus(
  id: string,
  fpo_id: string,
  status: Dispatch['status']
): Promise<Dispatch | null> {
  return updateDispatchStatus(id, status, fpo_id)
}
