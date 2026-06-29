import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const crop = req.nextUrl.searchParams.get('crop') || 'Wheat'
    const limitParam = req.nextUrl.searchParams.get('limit')

    const db = await getDb()

    let sql = `
      SELECT
        m.id, m.name, m.state, m.district, m.lat, m.lng,
        mp.modal_price, mp.min_price, mp.max_price, mp.crop,
        COALESCE(ts.score,
          CASE
            WHEN mp.max_price > 0 AND mp.min_price > 0
              AND (mp.max_price - mp.min_price)::float / NULLIF(mp.modal_price, 0) < 0.05 THEN 85
            WHEN mp.max_price > 0 AND mp.min_price > 0
              AND (mp.max_price - mp.min_price)::float / NULLIF(mp.modal_price, 0) < 0.15 THEN 72
            WHEN mp.max_price > 0 AND mp.min_price > 0
              AND (mp.max_price - mp.min_price)::float / NULLIF(mp.modal_price, 0) < 0.30 THEN 58
            ELSE 45
          END
        )                                      AS trust_score,
        COALESCE(ts.payment_speed, '2-3 Days') AS payment_speed,
        COALESCE(ts.commission_pct, 1.5)       AS commission_pct,
        COALESCE(ts.avg_payment_delay_days, 3) AS avg_payment_delay_days
      FROM mandis m
      JOIN mandi_prices mp ON mp.mandi_id = m.id
        AND mp.crop = $1
        AND mp.recorded_date = CURRENT_DATE
      LEFT JOIN trust_scores ts ON ts.mandi_id = m.id
      ORDER BY ts.score DESC NULLS LAST`

    const params: unknown[] = [crop]

    if (limitParam) {
      params.push(parseInt(limitParam))
      sql += ` LIMIT $2`
    }

    const result = await db.query(sql, params)
    return NextResponse.json({ success: true, mandis: result.rows })
  } catch (error) {
    console.error('[GET /api/mandis]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
