import * as fs from 'fs'
import * as path from 'path'

// Load .env.local so AWS credentials are available outside Next.js
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (key && !(key in process.env)) process.env[key] = value
  }
}

import { query } from '../lib/db'

async function main() {
  const sqlFilePath = path.resolve(process.cwd(), 'mandipilot-full-insert.sql')
  const raw = fs.readFileSync(sqlFilePath, 'utf-8')

  const statements = raw
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  const total = statements.length
  let succeeded = 0
  let failed = 0

  for (let i = 0; i < statements.length; i++) {
    const sql = statements[i]
    console.log(`Running statement ${i + 1} / ${total}`)

    try {
      await query(sql)
      succeeded++
    } catch (err) {
      failed++
      console.error(`  ✗ Statement ${i + 1} failed:`)
      console.error(`    SQL: ${sql.slice(0, 120)}${sql.length > 120 ? '...' : ''}`)
      console.error(`    Error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log('\n====================================')
  console.log('SQL Import Completed')
  console.log(`Executed:  ${total}`)
  console.log(`Succeeded: ${succeeded}`)
  console.log(`Failed:    ${failed}`)
  console.log('====================================')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
