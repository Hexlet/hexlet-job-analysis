import { defineConfig } from 'drizzle-kit'
import { dbUrl } from './config.js'
export default defineConfig({
  out: './drizzle',
  schema: './lib/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: dbUrl,
  },
})
