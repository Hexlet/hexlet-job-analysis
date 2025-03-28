// @ts-check
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/**
 * @typedef {import('./types/index.ts').Config} Config
 */

import path from 'node:path'
import fsp from 'node:fs/promises'
import os from 'node:os'

export const appDir = path.join(os.homedir(), '.config', 'hexlet', 'jobs-analysis')
export const configFilePath = path.join(appDir, 'config.json')
export const dbFileName = path.join(appDir, 'db.sqlite3')
export const dbUrl = `file:${dbFileName}`

/**
 * @returns {Promise<Config>}
 */
export async function getConfig() {
  const configData = await fsp.readFile(configFilePath, 'utf8')
  const config = JSON.parse(configData)
  return config
}
