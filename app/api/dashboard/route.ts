import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { fetchDashboardStats, fetchRevenueChart } from '@/lib/services/dashboard.service'
import type { ApiResponse } from '@/lib/types'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session?.fpo_id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const months = parseInt(req.nextUrl.searchParams.get('months') ?? '6')

    const [stats, chart] = await Promise.all([
      fetchDashboardStats(session.fpo_id),
      fetchRevenueChart(session.fpo_id, months),
    ])

    return NextResponse.json({ success: true, data: { stats, chart } })
  } catch (error) {
    console.error('[/api/dashboard]', error)
    return NextResponse.json({ success: false, error: 'Failed to load dashboard' }, { status: 500 })
  }
}
