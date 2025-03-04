import dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../db/schema.ts'

const envs = dotenv.config().parsed ?? {}

const db = drizzle(envs.DB_FILE_NAME, { schema, casing: 'snake_case' })
export default db
