import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { fetchCreditScore, fetchCreditHistory, computeAndSaveCreditScore } from '@/lib/services/credit.service'
import type { ApiResponse } from '@/lib/types'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session?.fpo_id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const history = req.nextUrl.searchParams.get('history') === 'true'

    if (history) {
      const scores = await fetchCreditHistory(session.fpo_id)
      return NextResponse.json({ success: true, data: scores })
    }

    const score = await fetchCreditScore(session.fpo_id)
    return NextResponse.json({ success: true, data: score })
  } catch (error) {
    console.error('[GET /api/credit-score]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch credit score' }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session?.fpo_id || session.role !== 'fpo_manager') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const score = await computeAndSaveCreditScore(session.fpo_id)
    return NextResponse.json({ success: true, data: score })
  } catch (error) {
    console.error('[POST /api/credit-score]', error)
    return NextResponse.json({ success: false, error: 'Failed to compute credit score' }, { status: 500 })
  }
}
