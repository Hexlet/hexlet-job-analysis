import fsp from 'node:fs/promises'
import debug from 'debug'
import path from 'node:path'
import { input } from '@inquirer/prompts'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { Command } from '@oclif/core'
import { appDir, configFilePath, dbFileName } from '../../config.js'

const debugLog = debug('app:cli')

export default class Init extends Command {
  public async run(): Promise<void> {
    const openAIApiKey = await input({ message: 'Enter OpenAI API Key' })

    const defaultConfig = {
      openAIApiKey,
    }

    await fsp.mkdir(appDir, { recursive: true })
    await fsp.writeFile(configFilePath, JSON.stringify(defaultConfig, null, 2), 'utf8')
    debugLog('Config file created:', configFilePath)

    const dbModule = await import('../lib/db.js')

    await migrate(dbModule.default, {
      migrationsFolder: path.join(import.meta.dirname, '../../drizzle'),
    })
    debugLog(`db file "${dbFileName}" has been prepared`)
  }
}
