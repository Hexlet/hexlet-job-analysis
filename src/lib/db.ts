import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../db/schema.js'
import { dbUrl } from '../../config.js'

const db = drizzle(dbUrl, { schema, casing: 'snake_case' })
export default db
