import {
  getSalesByFPO,
  getSaleById,
  createSale,
  updateSalePaymentStatus,
  getSalesByFarmer,
} from '../queries/sales'
import { updateHarvestStatus } from '../queries/harvests'
import { createLedgerEntry, getFPOBalance } from '../queries/ledger'
import type { Sale, PaginatedResponse } from '../types'
import { PAGINATION_DEFAULTS } from '../constants'

export async function listSales(
  fpo_id: string,
  page: number = PAGINATION_DEFAULTS.PAGE,
  limit: number = PAGINATION_DEFAULTS.LIMIT
): Promise<PaginatedResponse<Sale>> {
  const offset = (page - 1) * limit
  const { rows, total } = await getSalesByFPO(fpo_id, limit, offset)
  return { data: rows, total, page, limit, total_pages: Math.ceil(total / limit) }
}

export async function getSale(id: string): Promise<Sale | null> {
  return getSaleById(id)
}

export async function recordSale(
  fpo_id: string,
  data: Omit<Sale, 'id' | 'fpo_id' | 'created_at'>
): Promise<Sale> {
  const sale = await createSale({ ...data, fpo_id })

  const balance = await getFPOBalance(fpo_id)
  await createLedgerEntry({
    fpo_id,
    type: 'sale_income',
    amount: sale.total_amount,
    description: `Sale of ${sale.quantity_kg}kg ${sale.crop} to ${sale.buyer_name}`,
    reference_id: sale.id,
    reference_type: 'sale',
    balance_after: balance + sale.total_amount,
  })

  const dispatch = await import('../queries/dispatches').then((m) =>
    m.getDispatchById(sale.dispatch_id)
  )
  if (dispatch) {
    await updateHarvestStatus(dispatch.harvest_id, 'sold')
  }

  return sale
}

export async function markSalePaid(
  id: string,
  fpo_id: string
): Promise<Sale | null> {
  return updateSalePaymentStatus(id, fpo_id, 'completed')
}

export async function listFarmerSales(farmer_id: string): Promise<Sale[]> {
  return getSalesByFarmer(farmer_id)
}
