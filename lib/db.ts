import { DsqlSigner } from '@aws-sdk/dsql-signer'
import { Pool } from 'pg'

let pool: Pool | null = null

export async function getDb(): Promise<Pool> {
  if (pool) return pool

  const signer = new DsqlSigner({
    hostname: process.env.AURORA_DSQL_ENDPOINT!,
    region: process.env.AWS_REGION!,
  })

  const token = await signer.getDbConnectAdminAuthToken()

  pool = new Pool({
    host: process.env.AURORA_DSQL_ENDPOINT!,
    user: 'admin',
    password: token,
    database: 'postgres',
    port: 5432,
    ssl: { rejectUnauthorized: false },
    max: 10,
  })

  return pool
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const db = await getDb()
  const result = await db.query(sql, params)
  return result.rows as T[]
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}
