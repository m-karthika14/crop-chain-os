import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { email, password, userType } = await req.json()

    if (!email || !password || !userType) {
      return NextResponse.json(
        { success: false, error: 'Email, password and userType are required' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const cookieStore = await cookies()

    if (userType === 'fpo') {
      const managerResult = await db.query(
        'SELECT id, name, email, phone, avatar_initials FROM managers WHERE email = $1 AND password_hash = $2',
        [email, password]
      )

      if (managerResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      const manager = managerResult.rows[0]

      const fpoResult = await db.query(
        'SELECT id, organization_name, fpo_code, state, district FROM fpos WHERE manager_id = $1',
        [manager.id]
      )
      const fpo = fpoResult.rows[0] ?? null

      cookieStore.set('role', 'manager', { httpOnly: true, path: '/' })
      cookieStore.set('userId', manager.id, { httpOnly: true, path: '/' })
      cookieStore.set('fpoId', fpo?.id ?? '', { httpOnly: true, path: '/' })

      return NextResponse.json({
        success: true,
        role: 'manager',
        user: { ...manager, fpo },
      })
    } else {
      const farmerResult = await db.query(
        'SELECT id, full_name, email, phone_number, state, village, language, trust_score, status FROM farmers WHERE email = $1 AND password_hash = $2',
        [email, password]
      )

      if (farmerResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      const farmer = farmerResult.rows[0]

      cookieStore.set('role', 'farmer', { httpOnly: true, path: '/' })
      cookieStore.set('userId', farmer.id, { httpOnly: true, path: '/' })

      return NextResponse.json({ success: true, role: 'farmer', user: farmer })
    }
  } catch (error) {
    console.error('[/api/auth/login]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
