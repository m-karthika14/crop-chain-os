import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { listFarmers, addFarmer } from '@/lib/services/farmer.service'
import { PAGINATION_DEFAULTS } from '@/lib/constants'
import type { ApiResponse } from '@/lib/types'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session?.fpo_id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? String(PAGINATION_DEFAULTS.LIMIT))

    const result = await listFarmers(session.fpo_id, page, limit)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[GET /api/farmers]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch farmers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session?.fpo_id || session.role !== 'fpo_manager') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const farmer = await addFarmer(session.fpo_id, body)
    return NextResponse.json({ success: true, data: farmer }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/farmers]', error)
    return NextResponse.json({ success: false, error: 'Failed to create farmer' }, { status: 500 })
  }
}
