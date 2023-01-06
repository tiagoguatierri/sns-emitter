import esbuild from 'esbuild'
import glob from 'glob'
import rimraf from 'rimraf'

import { nodeExternalsPlugin } from 'esbuild-node-externals'
import { join } from 'path'
import { promisify } from 'util'

const ENTRY_FOLDER = join(process.cwd(), 'src')
const OUT_FOLDER = join(process.cwd(), 'dist')

const dropFolder = promisify(rimraf)
const listMatch = promisify(glob)

const entryPoints = await listMatch(`${ENTRY_FOLDER}/**/*.js`)
await dropFolder(OUT_FOLDER)

// esm output bundles with code splitting
await esbuild
  .build({
    stdin: { contents: '' },
    inject: entryPoints,
    outfile: `${OUT_FOLDER}/bundle.js`,
    platform: 'node',
    bundle: true,
    minify: true,
    format: 'esm',
    target: ['esnext'],
    plugins: [nodeExternalsPlugin()]
  })
  .catch(() => process.exit(1))
