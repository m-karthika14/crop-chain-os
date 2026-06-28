import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { listLedgerEntries, getBalance, getSummary } from '@/lib/services/ledger.service'
import { PAGINATION_DEFAULTS } from '@/lib/constants'
import type { ApiResponse } from '@/lib/types'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session?.fpo_id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const mode = req.nextUrl.searchParams.get('mode')

    if (mode === 'balance') {
      const balance = await getBalance(session.fpo_id)
      return NextResponse.json({ success: true, data: { balance } })
    }

    if (mode === 'summary') {
      const from = req.nextUrl.searchParams.get('from') ?? new Date(Date.now() - 30 * 864e5).toISOString()
      const to = req.nextUrl.searchParams.get('to') ?? new Date().toISOString()
      const summary = await getSummary(session.fpo_id, from, to)
      return NextResponse.json({ success: true, data: summary })
    }

    const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? String(PAGINATION_DEFAULTS.LIMIT))
    const result = await listLedgerEntries(session.fpo_id, page, limit)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[GET /api/ledger]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch ledger' }, { status: 500 })
  }
}
