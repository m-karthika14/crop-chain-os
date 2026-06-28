import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = await getDb()
    const result = await db.query('SELECT COUNT(*) as count FROM farmers')
    return Response.json({
      success: true,
      farmers: result.rows[0].count,
      message: 'Aurora DSQL connected!'
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: String(error)
    }, { status: 500 })
  }
}
