import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../db/schema.ts'
import { dbUrl } from '../../config.ts'

const db = drizzle(dbUrl, { schema, casing: 'snake_case' })
export default db
