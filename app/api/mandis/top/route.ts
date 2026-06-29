import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const crop = req.nextUrl.searchParams.get('crop') || 'Wheat'
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '3')

    const db = await getDb()
    const result = await db.query(
      `SELECT
         m.id, m.name, m.state,
         mp.modal_price, mp.crop,
         ts.score as trust_score, ts.payment_speed
       FROM mandis m
       LEFT JOIN mandi_prices mp ON mp.mandi_id = m.id
         AND mp.crop = $1
         AND mp.recorded_date = CURRENT_DATE
       LEFT JOIN trust_scores ts ON ts.mandi_id = m.id
       ORDER BY ts.score DESC NULLS LAST
       LIMIT $2`,
      [crop, limit]
    )

    return NextResponse.json({ success: true, mandis: result.rows })
  } catch (error) {
    console.error('[GET /api/mandis/top]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
