import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { queryOne } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth'
import { SESSION_COOKIE, SESSION_DURATION_SECONDS } from '@/lib/constants'
import type { ApiResponse, User, UserRole } from '@/lib/types'

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { email, password, role, fpo_id, farmer_id } = await req.json()

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Email, password and role are required' },
        { status: 400 }
      )
    }

    const validRoles: UserRole[] = ['fpo_manager', 'farmer']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 })
    }

    const existing = await queryOne(
      `SELECT id FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    )
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    const password_hash = await hashPassword(password)

    const user = await queryOne<User>(
      `INSERT INTO users (email, password_hash, role, fpo_id, farmer_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, email, role, fpo_id, farmer_id, created_at`,
      [email.toLowerCase().trim(), password_hash, role, fpo_id ?? null, farmer_id ?? null]
    )

    const token = await signToken({
      user_id: user!.id,
      role: user!.role,
      fpo_id: user!.fpo_id,
      farmer_id: user!.farmer_id,
    })

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_SECONDS,
      path: '/',
    })

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error) {
    console.error('[/api/auth/register]', error)
    return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 500 })
  }
}
