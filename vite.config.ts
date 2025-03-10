/* eslint-disable @typescript-eslint/no-unsafe-call */

import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'

const plugins = [
  viteReact(),
]

export default defineConfig({
  base: '/',
  plugins: plugins,
})
