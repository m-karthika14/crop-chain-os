import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// Approximate centre-of-state coordinates for Indian states
const STATE_COORDS: Record<string, [number, number]> = {
  'andhra pradesh':     [15.9129, 79.7400],
  'arunachal pradesh':  [28.2180, 94.7278],
  'assam':              [26.2006, 92.9376],
  'bihar':              [25.0961, 85.3131],
  'chhattisgarh':       [21.2787, 81.8661],
  'goa':                [15.2993, 74.1240],
  'gujarat':            [22.2587, 71.1924],
  'haryana':            [29.0588, 76.0856],
  'himachal pradesh':   [31.1048, 77.1734],
  'jharkhand':          [23.6102, 85.2799],
  'karnataka':          [15.3173, 75.7139],
  'kerala':             [10.8505, 76.2711],
  'madhya pradesh':     [22.9734, 78.6569],
  'maharashtra':        [19.7515, 75.7139],
  'manipur':            [24.6637, 93.9063],
  'meghalaya':          [25.4670, 91.3662],
  'mizoram':            [23.1645, 92.9376],
  'nagaland':           [26.1584, 94.5624],
  'odisha':             [20.9517, 85.0985],
  'punjab':             [31.1471, 75.3412],
  'rajasthan':          [27.0238, 74.2179],
  'sikkim':             [27.5330, 88.5122],
  'tamil nadu':         [11.1271, 78.6569],
  'telangana':          [18.1124, 79.0193],
  'tripura':            [23.9408, 91.9882],
  'uttar pradesh':      [26.8467, 80.9462],
  'uttarakhand':        [30.0668, 79.0193],
  'west bengal':        [22.9868, 87.8550],
  'delhi':              [28.7041, 77.1025],
  'chandigarh':         [30.7333, 76.7794],
}

function coordsForState(state: string): [number, number] {
  return STATE_COORDS[(state || '').toLowerCase()] ?? [22.9734, 78.6569] // MP centre as final default
}

export async function GET(req: NextRequest) {
  try {
    const fpoId = req.nextUrl.searchParams.get('fpoId')
    if (!fpoId) {
      return NextResponse.json({ success: false, error: 'fpoId required' }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.query(
      `SELECT id, organization_name, district, state FROM fpos WHERE id = $1`,
      [fpoId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'FPO not found' }, { status: 404 })
    }

    const fpo = result.rows[0]
    const location = fpo.district && fpo.state
      ? `${fpo.district}, ${fpo.state}`
      : fpo.state || 'Unknown'

    const [lat, lng] = coordsForState(fpo.state)

    return NextResponse.json({
      success: true,
      location,
      lat,
      lng,
      organizationName: fpo.organization_name,
    })
  } catch (error) {
    console.error('[GET /api/fpos/location]', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
