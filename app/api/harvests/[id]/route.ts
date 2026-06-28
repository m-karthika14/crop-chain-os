import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { getHarvest, editHarvest, approveHarvest } from '@/lib/services/harvest.service'
import type { ApiResponse } from '@/lib/types'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const harvest = await getHarvest(id)
    if (!harvest) {
      return NextResponse.json({ success: false, error: 'Harvest not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: harvest })
  } catch (error) {
    console.error('[GET /api/harvests/[id]]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch harvest' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session?.fpo_id || session.role !== 'fpo_manager') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    if (body.action === 'approve') {
      const harvest = await approveHarvest(id)
      return NextResponse.json({ success: true, data: harvest })
    }

    const harvest = await editHarvest(id, session.fpo_id, body)
    if (!harvest) {
      return NextResponse.json({ success: false, error: 'Harvest not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: harvest })
  } catch (error) {
    console.error('[PATCH /api/harvests/[id]]', error)
    return NextResponse.json({ success: false, error: 'Failed to update harvest' }, { status: 500 })
  }
}
