import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE } from '@/lib/constants'
import type { ApiResponse } from '@/lib/types'

export async function POST(): Promise<NextResponse<ApiResponse>> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  return NextResponse.json({ success: true, message: 'Logged out' })
}
