import { defineConfig } from 'drizzle-kit'
import { dbUrl } from './config.ts'
export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: dbUrl,
  },
})
