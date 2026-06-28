import { query, queryOne } from '../db'
import type { LedgerEntry } from '../types'

export async function getLedgerEntries(
  fpo_id: string,
  limit = 20,
  offset = 0
): Promise<{ rows: LedgerEntry[]; total: number }> {
  const rows = await query<LedgerEntry>(
    `SELECT * FROM ledger_entries WHERE fpo_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [fpo_id, limit, offset]
  )
  const countRow = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM ledger_entries WHERE fpo_id = $1`,
    [fpo_id]
  )
  return { rows, total: parseInt(countRow?.count ?? '0') }
}

export async function createLedgerEntry(
  data: Omit<LedgerEntry, 'id' | 'created_at'>
): Promise<LedgerEntry> {
  const row = await queryOne<LedgerEntry>(
    `INSERT INTO ledger_entries (fpo_id, type, amount, description, reference_id, reference_type, balance_after)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      data.fpo_id, data.type, data.amount, data.description,
      data.reference_id, data.reference_type, data.balance_after,
    ]
  )
  return row!
}

export async function getFPOBalance(fpo_id: string): Promise<number> {
  const row = await queryOne<{ balance: string }>(
    `SELECT COALESCE(balance_after, 0)::text AS balance
     FROM ledger_entries WHERE fpo_id = $1
     ORDER BY created_at DESC LIMIT 1`,
    [fpo_id]
  )
  return parseFloat(row?.balance ?? '0')
}

export async function getLedgerSummary(
  fpo_id: string,
  from: string,
  to: string
): Promise<{ income: number; expenses: number; net: number }> {
  const row = await queryOne<{ income: string; expenses: string }>(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'sale_income' THEN amount ELSE 0 END), 0)::text AS income,
       COALESCE(SUM(CASE WHEN type IN ('farmer_payout','expense') THEN amount ELSE 0 END), 0)::text AS expenses
     FROM ledger_entries
     WHERE fpo_id = $1 AND created_at BETWEEN $2 AND $3`,
    [fpo_id, from, to]
  )
  const income = parseFloat(row?.income ?? '0')
  const expenses = parseFloat(row?.expenses ?? '0')
  return { income, expenses, net: income - expenses }
}
