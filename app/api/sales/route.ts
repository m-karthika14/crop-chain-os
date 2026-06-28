import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { listSales, recordSale, listFarmerSales } from '@/lib/services/sales.service'
import { PAGINATION_DEFAULTS } from '@/lib/constants'
import type { ApiResponse } from '@/lib/types'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role === 'farmer' && session.farmer_id) {
      const sales = await listFarmerSales(session.farmer_id)
      return NextResponse.json({ success: true, data: sales })
    }

    if (!session.fpo_id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? String(PAGINATION_DEFAULTS.LIMIT))
    const result = await listSales(session.fpo_id, page, limit)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[GET /api/sales]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch sales' }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session?.fpo_id || session.role !== 'fpo_manager') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const sale = await recordSale(session.fpo_id, body)
    return NextResponse.json({ success: true, data: sale }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/sales]', error)
    return NextResponse.json({ success: false, error: 'Failed to record sale' }, { status: 500 })
  }
}
