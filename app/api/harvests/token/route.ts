import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')
    if (!token) {
      return NextResponse.json({ success: false, error: 'token is required' }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.query(
      `SELECT
         h.*,
         f.full_name as farmer_name,
         f.village as farmer_village,
         f.phone_number as farmer_phone,
         f.upi_id
       FROM harvests h
       JOIN farmers f ON f.id = h.farmer_id
       WHERE h.token_number = $1`,
      [token]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 404 })
    }

    const harvest = result.rows[0]
    if (harvest.status !== 'APPROVED') {
      return NextResponse.json({ success: false, error: 'Token already used or invalid status' }, { status: 400 })
    }

    return NextResponse.json({ success: true, harvest })
  } catch (error) {
    console.error('[GET /api/harvests/token]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
