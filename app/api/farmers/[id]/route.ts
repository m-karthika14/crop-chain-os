import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { getFarmer, editFarmer, removeFarmer } from '@/lib/services/farmer.service'
import type { ApiResponse } from '@/lib/types'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session?.fpo_id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const farmer = await getFarmer(id, session.fpo_id)
    if (!farmer) {
      return NextResponse.json({ success: false, error: 'Farmer not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: farmer })
  } catch (error) {
    console.error('[GET /api/farmers/[id]]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch farmer' }, { status: 500 })
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
    const farmer = await editFarmer(id, session.fpo_id, body)
    if (!farmer) {
      return NextResponse.json({ success: false, error: 'Farmer not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: farmer })
  } catch (error) {
    console.error('[PATCH /api/farmers/[id]]', error)
    return NextResponse.json({ success: false, error: 'Failed to update farmer' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session?.fpo_id || session.role !== 'fpo_manager') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const deleted = await removeFarmer(id, session.fpo_id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Farmer not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Farmer deleted' })
  } catch (error) {
    console.error('[DELETE /api/farmers/[id]]', error)
    return NextResponse.json({ success: false, error: 'Failed to delete farmer' }, { status: 500 })
  }
}
