import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { listDispatches, scheduleDispatch, advanceDispatchStatus } from '@/lib/services/dispatch.service'
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
    const result = await listDispatches(session.fpo_id, page, limit)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[GET /api/dispatches]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch dispatches' }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session?.fpo_id || session.role !== 'fpo_manager') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    if (body.action === 'update_status' && body.id && body.status) {
      const dispatch = await advanceDispatchStatus(body.id, session.fpo_id, body.status)
      return NextResponse.json({ success: true, data: dispatch })
    }

    const dispatch = await scheduleDispatch(session.fpo_id, body)
    return NextResponse.json({ success: true, data: dispatch }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/dispatches]', error)
    return NextResponse.json({ success: false, error: 'Failed to create dispatch' }, { status: 500 })
  }
}
