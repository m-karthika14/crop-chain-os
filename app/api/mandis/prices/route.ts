import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const mandiId = req.nextUrl.searchParams.get('mandiId')
    const crop = req.nextUrl.searchParams.get('crop')

    if (!mandiId || !crop) {
      return NextResponse.json({ success: false, error: 'mandiId and crop are required' }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.query(
      `SELECT modal_price, min_price, max_price, recorded_date
       FROM mandi_prices
       WHERE mandi_id = $1 AND crop = $2
       ORDER BY recorded_date DESC
       LIMIT 1`,
      [mandiId, crop]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'No price found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, price: result.rows[0] })
  } catch (error) {
    console.error('[GET /api/mandis/prices]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mandiId, crop, modalPrice, minPrice, maxPrice } = body

    if (!mandiId || !crop || !modalPrice) {
      return NextResponse.json({ success: false, error: 'mandiId, crop, modalPrice are required' }, { status: 400 })
    }

    const db = await getDb()
    await db.query(
      `INSERT INTO mandi_prices (id, mandi_id, crop, min_price, max_price, modal_price, recorded_date)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
       ON CONFLICT DO NOTHING`,
      [`mp-${Date.now()}`, mandiId, crop, minPrice || modalPrice, maxPrice || modalPrice, modalPrice]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/mandis/prices]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
