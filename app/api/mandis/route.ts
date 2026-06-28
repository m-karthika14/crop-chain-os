import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { listMandis, getPricesForCrop, getOptimalMandis } from '@/lib/services/mandi.service'
import type { ApiResponse } from '@/lib/types'

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getSessionFromRequest(req)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const crop = req.nextUrl.searchParams.get('crop')
    const quantity = req.nextUrl.searchParams.get('quantity')
    const mode = req.nextUrl.searchParams.get('mode')

    if (mode === 'optimize' && crop && quantity) {
      const results = await getOptimalMandis(crop, parseFloat(quantity))
      return NextResponse.json({ success: true, data: results })
    }

    if (crop) {
      const prices = await getPricesForCrop(crop)
      return NextResponse.json({ success: true, data: prices })
    }

    const mandis = await listMandis()
    return NextResponse.json({ success: true, data: mandis })
  } catch (error) {
    console.error('[GET /api/mandis]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch mandis' }, { status: 500 })
  }
}
