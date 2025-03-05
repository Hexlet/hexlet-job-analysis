import path from 'node:path'
import os from 'node:os'

export const dbFileName = path.join(os.homedir(), 'hexlet-job-analysis.sqlite3')
export const dbUrl = `file:${dbFileName}`
