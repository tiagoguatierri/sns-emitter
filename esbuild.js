import esbuild from 'esbuild'
import glob from 'glob'
import rimraf from 'rimraf'

import { nodeExternalsPlugin } from 'esbuild-node-externals'
import { dirname, join } from 'path'
import { promisify } from 'util'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const entry = join(__dirname, 'src')
const dist = join(__dirname, 'dist')

const dropFolder = promisify(rimraf)
const listMatch = promisify(glob)

const entryPoints = await listMatch(`${entry}/**/*.js`)
await dropFolder(dist)

// esm output bundles with code splitting
await esbuild
  .build({
    stdin: { contents: '' },
    inject: entryPoints,
    outfile: `${dist}/bundle.js`,
    platform: 'node',
    bundle: true,
    minify: true,
    format: 'esm',
    target: ['esnext'],
    plugins: [nodeExternalsPlugin()]
  })
  .catch(() => process.exit(1))
