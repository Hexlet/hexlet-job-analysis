import debug from 'debug'
import { Command } from '@oclif/core'
import list from '../list.js'

const debugLog = debug('app:cli')

export default class List extends Command {
  public async run(): Promise<void> {
    await list(this.log.bind(this))
  }
}
