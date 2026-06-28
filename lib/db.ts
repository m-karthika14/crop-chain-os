import { DsqlSigner } from '@aws-sdk/dsql-signer'
import { Pool } from 'pg'

let pool: Pool | null = null
let poolExpiresAt = 0

const TOKEN_REFRESH_BUFFER_MS = 60_000
const DSQL_TOKEN_TTL_MS = 15 * 60 * 1000

function isExpired(): boolean {
  return !pool || Date.now() >= poolExpiresAt
}

async function createPool(): Promise<Pool> {
  const signer = new DsqlSigner({
    hostname: process.env.AURORA_DSQL_ENDPOINT!,
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  const token = await signer.getDbConnectAdminAuthToken()
  poolExpiresAt = Date.now() + DSQL_TOKEN_TTL_MS - TOKEN_REFRESH_BUFFER_MS

  return new Pool({
    host: process.env.AURORA_DSQL_ENDPOINT!,
    user: 'admin',
    password: token,
    database: 'postgres',
    port: 5432,
    ssl: { rejectUnauthorized: false },
    max: 10,
  })
}

export async function getDb(): Promise<Pool> {
  if (!isExpired()) return pool!

  if (pool) {
    await pool.end().catch(() => {})
  }

  pool = await createPool()

  return pool
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const db = await getDb()

  try {
    const result = await db.query(sql, params)
    return result.rows as T[]
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code ?? '') : ''

    if (code === '08006' || message.toLowerCase().includes('signature expired')) {
      poolExpiresAt = 0
      if (pool) {
        await pool.end().catch(() => {})
        pool = null
      }

      const freshDb = await getDb()
      const retry = await freshDb.query(sql, params)
      return retry.rows as T[]
    }

    throw error
  }
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}
