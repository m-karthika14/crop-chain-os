import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const fpoId = req.nextUrl.searchParams.get('fpoId')
    if (!fpoId) {
      return NextResponse.json({ success: false, error: 'fpoId is required' }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.query(
      `SELECT
         f.id, f.full_name, f.phone_number, f.village,
         f.status, f.trust_score, f.total_earnings,
         f.total_sales, m.status as membership_status,
         m.requested_at, m.approved_at
       FROM farmers f
       JOIN fpo_memberships m ON m.farmer_id = f.id
       WHERE m.fpo_id = $1 AND m.status = 'ACTIVE'
       ORDER BY m.approved_at DESC`,
      [fpoId]
    )

    return NextResponse.json({ success: true, farmers: result.rows })
  } catch (error) {
    console.error('[GET /api/farmers]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fpoId, managerId, full_name, village, phone_number } = body

    if (!fpoId || !full_name) {
      return NextResponse.json({ success: false, error: 'fpoId and full_name are required' }, { status: 400 })
    }

    const db = await getDb()
    const farmerId = `far-${Date.now()}`
    const email = `${phone_number ?? farmerId}@mandipilot.com`

    const farmerResult = await db.query(
      `INSERT INTO farmers
         (id, full_name, phone_number, email, password_hash, village, trust_score, status, total_earnings, language)
       VALUES ($1, $2, $3, $4, 'set_by_manager', $5, 85, 'Active', 0, 'en')
       RETURNING id, full_name, phone_number, village, status, trust_score, total_earnings, total_sales`,
      [farmerId, full_name, phone_number ?? '', email, village ?? '']
    )

    const farmer = farmerResult.rows[0]

    await db.query(
      `INSERT INTO fpo_memberships (id, fpo_id, farmer_id, status, approved_at, approved_by)
       VALUES ($1, $2, $3, 'ACTIVE', NOW(), $4)`,
      [`mem-${Date.now()}`, fpoId, farmerId, managerId ?? '']
    )

    await db.query(
      `UPDATE fpos SET member_count = member_count + 1 WHERE id = $1`,
      [fpoId]
    )

    return NextResponse.json({ success: true, farmer }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/farmers]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
