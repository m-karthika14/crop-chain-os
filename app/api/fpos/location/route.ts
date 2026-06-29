import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const fpoId = req.nextUrl.searchParams.get('fpoId')
    if (!fpoId) {
      return NextResponse.json({ success: false, error: 'fpoId required' }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.query(
      `SELECT id, organization_name, district, state, lat, lng FROM fpos WHERE id = $1`,
      [fpoId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'FPO not found' }, { status: 404 })
    }

    const fpo = result.rows[0]
    const location = fpo.district && fpo.state
      ? `${fpo.district}, ${fpo.state}`
      : fpo.state || 'Unknown'

    return NextResponse.json({
      success: true,
      location,
      lat: fpo.lat ? parseFloat(fpo.lat) : null,
      lng: fpo.lng ? parseFloat(fpo.lng) : null,
      organizationName: fpo.organization_name,
    })
  } catch (error) {
    console.error('[GET /api/fpos/location]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
