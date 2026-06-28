import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { listPayouts, listFarmerPayouts, createFarmerPayout, processPayout } from '@/lib/services/payout.service'
import { PAGINATION_DEFAULTS } from '@/lib/constants'
import type { ApiResponse } from '@/lib/types'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role === 'farmer' && session.farmer_id) {
      const payouts = await listFarmerPayouts(session.farmer_id)
      return NextResponse.json({ success: true, data: payouts })
    }

    if (!session.fpo_id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? String(PAGINATION_DEFAULTS.LIMIT))
    const result = await listPayouts(session.fpo_id, page, limit)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[GET /api/payouts]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch payouts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session?.fpo_id || session.role !== 'fpo_manager') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    if (body.action === 'process' && body.id) {
      const payout = await processPayout(body.id, session.fpo_id, body.reference_id)
      return NextResponse.json({ success: true, data: payout })
    }

    const payout = await createFarmerPayout(session.fpo_id, body)
    return NextResponse.json({ success: true, data: payout }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/payouts]', error)
    return NextResponse.json({ success: false, error: 'Failed to create payout' }, { status: 500 })
  }
}
