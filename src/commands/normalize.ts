import { Args, Command } from '@oclif/core'
import normalize from '../normalizing.ts'

export default class Normalize extends Command {
  static override args = {
    term: Args.string({ required: false, description: 'Search Term' }),
  }

  // static override description = 'describe the command here'
  // static override examples = [
  //   '<%= config.bin %> <%= command.id %>',
  // ]
  //
  // static override flags = {
  //   // flag with no value (-f, --force)
  //   force: Flags.boolean({ char: 'f' }),
  //   // flag with a value (-n, --name=VALUE)
  //   name: Flags.string({ char: 'n', description: 'name to print' }),
  // }

  public async run(): Promise<void> {
    const { args } = await this.parse(Normalize)

    const result = await normalize(args.term, this.log.bind(this))
    // const name = flags.name ?? 'world'
    // this.log(`hello ${name} from /Users/mokevnin/projects/hexlet-job-analysis/src/commands/normalize.ts`)
    // if (args.file && flags.force) {
    //   this.log(`you input --force and --file: ${args.file}`)
    // }
  }
}
