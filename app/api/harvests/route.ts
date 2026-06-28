import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { listHarvests, listFarmerHarvests, addHarvest } from '@/lib/services/harvest.service'
import { PAGINATION_DEFAULTS } from '@/lib/constants'
import type { ApiResponse } from '@/lib/types'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role === 'farmer' && session.farmer_id) {
      const harvests = await listFarmerHarvests(session.farmer_id)
      return NextResponse.json({ success: true, data: harvests })
    }

    if (!session.fpo_id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? String(PAGINATION_DEFAULTS.LIMIT))
    const result = await listHarvests(session.fpo_id, page, limit)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[GET /api/harvests]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch harvests' }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session?.fpo_id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const harvest = await addHarvest(session.fpo_id, body)
    return NextResponse.json({ success: true, data: harvest }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/harvests]', error)
    return NextResponse.json({ success: false, error: 'Failed to create harvest' }, { status: 500 })
  }
}
