import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = await getDb()
    const result = await db.query(
      `SELECT f.id, f.organization_name, f.fpo_code, f.state, f.member_count, m.name as manager_name
       FROM fpos f
       JOIN managers m ON m.id = f.manager_id
       ORDER BY f.organization_name ASC`
    )
    return NextResponse.json({ success: true, fpos: result.rows })
  } catch (error) {
    console.error('[GET /api/fpos]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
