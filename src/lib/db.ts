import path from 'node:path'
import os from 'node:os'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../db/schema.ts'

export const dbFileName = path.join(os.homedir(), 'hexlet-job-analysis.sqlite3')
const url = `file:${dbFileName}`

const db = drizzle(url, { schema, casing: 'snake_case' })
export default db
