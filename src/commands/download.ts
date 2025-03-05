import debug from 'debug'
import { Args, Command } from '@oclif/core'
import download from '../downloading.ts'

const log = debug('app:cli')

export default class Download extends Command {
  static override args = {
    term: Args.string({ required: true, description: 'Search Term' }),
  }

  public async run(): Promise<void> {
    const { args } = await this.parse(Download)
    const result = await download(args.term, this.log.bind(this))
    this.log(`Vacancies Downloaded: ${result.vacancies.length}`)
  }
}
