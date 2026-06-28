import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const farmerId = req.nextUrl.searchParams.get('farmerId')
    if (!farmerId) {
      return NextResponse.json({ success: false, error: 'farmerId is required' }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.query(
      `SELECT
         f.total_earnings, f.total_sales, f.trust_score,
         COUNT(h.id) as harvest_count,
         COALESCE(SUM(CASE WHEN h.status = 'PAID' THEN h.quantity_final ELSE 0 END), 0) as sold_qty,
         COALESCE(SUM(CASE WHEN h.status NOT IN ('PAID','REJECTED') THEN h.quantity_final ELSE 0 END), 0) as pending_qty
       FROM farmers f
       LEFT JOIN harvests h ON h.farmer_id = f.id
       WHERE f.id = $1
       GROUP BY f.id, f.total_earnings, f.total_sales, f.trust_score`,
      [farmerId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: true,
        total_earnings: 0,
        total_sales: 0,
        trust_score: 50,
        harvest_count: 0,
        sold_qty: 0,
        pending_qty: 0,
      })
    }

    return NextResponse.json({ success: true, ...result.rows[0] })
  } catch (error) {
    console.error('[GET /api/farmers/my-stats]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
