import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

function generateFPOCode(orgName: string, state: string): string {
  const prefix = orgName.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'FPO'
  const stateCode = state.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase()
  const random = Math.floor(Math.random() * 900) + 100
  return `${prefix}-${new Date().getFullYear()}-${stateCode}-${random}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      organizationName, email, password, contactPerson,
      contactPhone, state, district, village, godownAddress,
      godownCapacity, season, primaryCrops,
    } = body

    const db = await getDb()

    const existing = await db.query(
      'SELECT id FROM managers WHERE email = $1',
      [email]
    )
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      )
    }

    const managerId = `mgr-${Date.now()}`
    const fpoId = `fpo-${Date.now()}`
    const fpoCode = generateFPOCode(organizationName, state ?? '')
    const avatarInitials = (contactPerson ?? '').substring(0, 2).toUpperCase()
    const cropsString = Array.isArray(primaryCrops) ? primaryCrops.join(',') : (primaryCrops ?? '')

    await db.query(
      `INSERT INTO managers (id, name, email, password_hash, phone, avatar_initials)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [managerId, contactPerson, email, password, contactPhone ?? '', avatarInitials]
    )

    await db.query(
      `INSERT INTO fpos (id, manager_id, organization_name, fpo_code, email,
         contact_person, contact_phone, state, district, village,
         godown_address, godown_capacity, primary_crops, season,
         member_count, active_harvest_q, revenue_this_month, pending_payouts, active_mandis)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,0,0,0,0,1473)`,
      [
        fpoId, managerId, organizationName, fpoCode, email,
        contactPerson, contactPhone ?? '', state ?? '', district ?? '', village ?? '',
        godownAddress ?? '', godownCapacity ?? '', cropsString, season ?? '',
      ]
    )

    await db.query(
      `INSERT INTO fpo_credit_scores (fpo_id, score, category) VALUES ($1, 500, 'New')`,
      [fpoId]
    )

    return NextResponse.json({ success: true, fpoCode, fpoId, managerId }, { status: 201 })
  } catch (error) {
    console.error('[/api/auth/register-fpo]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
