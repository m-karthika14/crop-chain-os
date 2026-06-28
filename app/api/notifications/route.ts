import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/queries/notifications'
import type { ApiResponse } from '@/lib/types'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const page = parseInt(req.nextUrl.searchParams.get('page') ?? '1')
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '20')
    const offset = (page - 1) * limit

    const result = await getNotifications(session.user_id, limit, offset)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[GET /api/notifications]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    if (body.action === 'mark_all_read') {
      await markAllNotificationsRead(session.user_id)
      return NextResponse.json({ success: true, message: 'All notifications marked as read' })
    }

    if (body.id) {
      await markNotificationRead(body.id, session.user_id)
      return NextResponse.json({ success: true, message: 'Notification marked as read' })
    }

    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('[PATCH /api/notifications]', error)
    return NextResponse.json({ success: false, error: 'Failed to update notification' }, { status: 500 })
  }
}
