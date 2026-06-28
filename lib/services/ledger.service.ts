import {
  getLedgerEntries,
  getFPOBalance,
  getLedgerSummary,
} from '../queries/ledger'
import type { LedgerEntry, PaginatedResponse } from '../types'
import { PAGINATION_DEFAULTS } from '../constants'

export async function listLedgerEntries(
  fpo_id: string,
  page = PAGINATION_DEFAULTS.PAGE,
  limit = PAGINATION_DEFAULTS.LIMIT
): Promise<PaginatedResponse<LedgerEntry>> {
  const offset = (page - 1) * limit
  const { rows, total } = await getLedgerEntries(fpo_id, limit, offset)
  return { data: rows, total, page, limit, total_pages: Math.ceil(total / limit) }
}

export async function getBalance(fpo_id: string): Promise<number> {
  return getFPOBalance(fpo_id)
}

export async function getSummary(
  fpo_id: string,
  from: string,
  to: string
): Promise<{ income: number; expenses: number; net: number }> {
  return getLedgerSummary(fpo_id, from, to)
}
