import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { farmerId, fpoCode } = await req.json()

    if (!farmerId || !fpoCode) {
      return NextResponse.json({ success: false, error: 'farmerId and fpoCode are required' }, { status: 400 })
    }

    const db = await getDb()

    const fpoResult = await db.query(
      `SELECT id, organization_name, state, member_count, contact_person, primary_crops
       FROM fpos WHERE fpo_code = $1`,
      [fpoCode]
    )

    if (fpoResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid FPO code' }, { status: 404 })
    }

    const fpo = fpoResult.rows[0]

    const existingResult = await db.query(
      `SELECT id FROM fpo_memberships
       WHERE farmer_id = $1 AND fpo_id = $2 AND status IN ('ACTIVE','PENDING')`,
      [farmerId, fpo.id]
    )

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Already a member or request pending' },
        { status: 409 }
      )
    }

    await db.query(
      `INSERT INTO fpo_memberships (id, fpo_id, farmer_id, status, joined_with_code, requested_at)
       VALUES ($1, $2, $3, 'PENDING', $4, NOW())`,
      [`mem-${Date.now()}`, fpo.id, farmerId, fpoCode]
    )

    return NextResponse.json({
      success: true,
      message: 'Request sent. Waiting for manager approval.',
      fpoName: fpo.organization_name,
      fpoDetails: {
        name: fpo.organization_name,
        state: fpo.state ?? '',
        farmers: fpo.member_count ?? 0,
        manager: fpo.contact_person ?? '',
        crops: fpo.primary_crops ? String(fpo.primary_crops).split(',').map((c: string) => c.trim()) : [],
        code: fpoCode,
      },
    })
  } catch (error) {
    console.error('[POST /api/farmers/join]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
