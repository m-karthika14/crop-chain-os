import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      fullName, email, password, phoneNumber,
      state, village,
    } = body

    const db = await getDb()

    const existing = await db.query(
      'SELECT id FROM farmers WHERE email = $1',
      [email]
    )
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      )
    }

    const farmerId = `far-${Date.now()}`

    await db.query(
      `INSERT INTO farmers (id, full_name, email, password_hash, phone_number,
         state, village, trust_score, status, total_earnings, language)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 50, 'Active', 0, 'en')`,
      [farmerId, fullName, email, password, phoneNumber ?? '', state ?? '', village ?? '']
    )

    return NextResponse.json({ success: true, farmerId }, { status: 201 })
  } catch (error) {
    console.error('[/api/auth/register-farmer]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
