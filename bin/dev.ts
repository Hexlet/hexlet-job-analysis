#!/usr/bin/env -S tsx --type=ts --disable-warning=ExperimentalWarning

import { execute } from '@oclif/core'

await execute({ development: true, dir: import.meta.url })
