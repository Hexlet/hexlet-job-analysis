import debug from 'debug'
import { Args, Command } from '@oclif/core'
import analyze from '../analysis.js'

const log = debug('app:cli')

export default class Analize extends Command {
  static override args = {
    term: Args.string({ required: true, description: 'Search Term' }),
  }

  public async run(): Promise<void> {
    const { args } = await this.parse(Analize)
    this.log(`Term: ${args.term}`)
    const result = await analyze(args.term, this.log.bind(this))
    console.table(result)
  }
}
