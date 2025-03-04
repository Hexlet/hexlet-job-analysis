#!/usr/bin/env node

import { execute } from '@oclif/core'

await execute({ development: true, dir: import.meta.url })

// console.log(half(Number(process.argv[process.argv.length - 1])))

// import scrape from '../scrape.ts'
// console.log(scrape())

// import analyze from '../src/analyze.ts'
// import download from '../src/download.ts'
// import normalize from '../src/normalize.ts'
//
// const command = process.argv[process.argv.length - 1]
// console.log(command)
//
// switch (command) {
//   case 'download':
//     void download()
//     break
//
//   case 'analyze':
//     void analyze()
//     break
//
//   case 'normalize':
//     void normalize()
//     break
//
//   default:
//     throw new Error('rerun with command: download or analyze')
// }
