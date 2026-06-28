import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import {
  getTopCropsByRevenue,
  getTopMandis,
  getFarmerPayoutSummary,
  getMonthlyDispatchTrend,
} from '@/lib/queries/analytics'
import type { ApiResponse } from '@/lib/types'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session?.fpo_id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const months = parseInt(req.nextUrl.searchParams.get('months') ?? '6')

    const [topCrops, topMandis, payoutSummary, dispatchTrend] = await Promise.all([
      getTopCropsByRevenue(session.fpo_id),
      getTopMandis(session.fpo_id),
      getFarmerPayoutSummary(session.fpo_id),
      getMonthlyDispatchTrend(session.fpo_id, months),
    ])

    return NextResponse.json({
      success: true,
      data: { topCrops, topMandis, payoutSummary, dispatchTrend },
    })
  } catch (error) {
    console.error('[GET /api/analytics]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
