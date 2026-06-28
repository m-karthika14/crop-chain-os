import {
  getPayoutsByFPO,
  getPayoutsByFarmer,
  getPayoutById,
  createPayout,
  updatePayoutStatus,
  getPendingPayoutsTotal,
} from '../queries/payouts'
import { createLedgerEntry, getFPOBalance } from '../queries/ledger'
import type { Payout, PaginatedResponse } from '../types'
import { PAGINATION_DEFAULTS } from '../constants'

export async function listPayouts(
  fpo_id: string,
  page = PAGINATION_DEFAULTS.PAGE,
  limit = PAGINATION_DEFAULTS.LIMIT
): Promise<PaginatedResponse<Payout>> {
  const offset = (page - 1) * limit
  const { rows, total } = await getPayoutsByFPO(fpo_id, limit, offset)
  return { data: rows, total, page, limit, total_pages: Math.ceil(total / limit) }
}

export async function listFarmerPayouts(farmer_id: string): Promise<Payout[]> {
  return getPayoutsByFarmer(farmer_id)
}

export async function createFarmerPayout(
  fpo_id: string,
  data: Omit<Payout, 'id' | 'fpo_id' | 'created_at'>
): Promise<Payout> {
  const payout = await createPayout({ ...data, fpo_id })

  const balance = await getFPOBalance(fpo_id)
  await createLedgerEntry({
    fpo_id,
    type: 'farmer_payout',
    amount: payout.net_amount,
    description: `Payout to farmer via ${payout.payout_method}`,
    reference_id: payout.id,
    reference_type: 'payout',
    balance_after: balance - payout.net_amount,
  })

  return payout
}

export async function processPayout(
  id: string,
  fpo_id: string,
  reference_id?: string
): Promise<Payout | null> {
  return updatePayoutStatus(id, fpo_id, 'completed', reference_id)
}

export async function getPendingTotal(fpo_id: string): Promise<number> {
  return getPendingPayoutsTotal(fpo_id)
}
