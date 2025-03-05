import debug from 'debug'
import path from 'node:path'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { Command } from '@oclif/core'
import { dbFileName } from '../../config.js'
import db from '../lib/db.js'

const log = debug('app:cli')

export default class Init extends Command {
  public async run(): Promise<void> {
    await migrate(db, {
      migrationsFolder: path.join(import.meta.dirname, '../../drizzle'),
    })
    this.log(`db file "${dbFileName}" has been prepared`)
  }
}
