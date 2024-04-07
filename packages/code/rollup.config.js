import { defineConfig } from 'rollup'
import alias from '@rollup/plugin-alias'
import typescript from '@rollup/plugin-typescript'
import esbuild from 'rollup-plugin-esbuild'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { exec } from 'node:child_process'
import { globSync } from 'glob'

const outputDir = 'dist'
const outputPath = fileURLToPath(new URL(outputDir, import.meta.url))

const vscodeSrcPath = fileURLToPath(new URL('vscode/src', import.meta.url))
const vsPath = path.resolve(vscodeSrcPath, 'vs')

const tscAlias = () => {
  return {
    name: 'tsAlias',
    buildStart: () => {
      return new Promise((resolve, reject) => {
        exec('tsc-alias', function callback(error, stdout, stderr) {
          if (stderr || error) {
            reject(stderr || error)
          } else {
            resolve(stdout)
          }
        })
      })
    },
  }
}

const css = () => {
  const idToStyles = new Map()

  return {
    name: 'css',
    resolveId(source, importer) {
      if (/^vs\/css!/.test(source)) {
        return path.resolve(
          path.dirname(importer),
          source.slice('vs/css!'.length) + '.css'
        )
      }
      return null
    },
    transform(code, id) {
      if (/.css/.test(id)) {
        idToStyles.set(id, code)

        return {
          code: 'export default null',
        }
      }

      return null
    },
    generateBundle() {
      for (const [id, styles] of idToStyles.entries()) {
        this.emitFile({
          type: 'asset',
          name: path.relative(vsPath, id),
          source: styles,
        })
      }
    },
  }
}

const isJs = entry => ['vs/base/browser/dompurify/dompurify'].includes(entry)

const extname = entry => (isJs(entry) ? 'js' : 'ts')

const entries = [
  'vs/nls',
  'vs/base/browser/dom',
  'vs/base/browser/window',
  'vs/base/browser/event',
  'vs/base/browser/touch',
  'vs/base/browser/browser',
  'vs/base/browser/canIUse',
  'vs/base/browser/keyboardEvent',
  'vs/base/browser/mouseEvent',
  'vs/base/browser/iframe',
  'vs/base/browser/fastDomNode',
  'vs/base/browser/dompurify/dompurify',
  'vs/base/browser/globalPointerMoveMonitor',
  'vs/base/browser/ui/grid/grid',
  'vs/base/browser/ui/grid/gridview',
  'vs/base/browser/ui/sash/sash',
  'vs/base/browser/ui/splitview/splitview',
  'vs/base/browser/ui/scrollbar/scrollableElement',
  'vs/base/browser/ui/scrollbar/horizontalScrollbar',
  'vs/base/browser/ui/scrollbar/verticalScrollbar',
  'vs/base/browser/ui/scrollbar/abstractScrollbar',
  'vs/base/browser/ui/scrollbar/scrollbarArrow',
  'vs/base/browser/ui/scrollbar/scrollbarState',
  'vs/base/browser/ui/scrollbar/scrollbarVisibilityController',
  'vs/base/browser/ui/widget',
  'vs/base/common/async',
  'vs/base/common/cancellation',
  'vs/base/common/errors',
  'vs/base/common/event',
  'vs/base/common/lifecycle',
  'vs/base/common/resources',
  'vs/base/common/platform',
  'vs/base/common/lazy',
  'vs/base/common/arrays',
  'vs/base/common/collections',
  'vs/base/common/functional',
  'vs/base/common/iterator',
  'vs/base/common/charCode',
  'vs/base/common/extpath',
  'vs/base/common/network',
  'vs/base/common/path',
  'vs/base/common/strings',
  'vs/base/common/uri',
  'vs/base/common/linkedList',
  'vs/base/common/stopwatch',
  'vs/base/common/types',
  'vs/base/common/marshallingIds',
  'vs/base/common/process',
  'vs/base/common/cache',
  'vs/base/common/uint',
  'vs/base/common/color',
  'vs/base/common/numbers',
  'vs/base/common/decorators',
  'vs/base/common/hash',
  'vs/base/common/scrollable',
  'vs/base/common/keyCodes',
  'vs/base/common/keybindings',
  'vs/base/common/codicons',
  'vs/base/common/themables',
  'vs/base/common/codiconsUtil',
  'vs/base/common/codiconsLibrary',
]

const input = Object.fromEntries(
  globSync(entries.map(entry => `./vscode/src/${entry}.${extname(entry)}`)).map(
    file => [
      path.relative(
        'vscode/src/vs',
        file.slice(0, file.length - path.extname(file).length)
      ),
      fileURLToPath(new URL(file, import.meta.url)),
    ]
  )
)

export default defineConfig([
  {
    input,
    output: {
      dir: outputDir,
      format: 'esm',
      assetFileNames: '[name][extname]',
      hoistTransitiveImports: false,
    },
    plugins: [
      alias({
        entries: entries.map(entry => ({
          find: entry,
          replacement: path.resolve(
            vscodeSrcPath,
            `${entry}.${extname(entry)}`
          ),
        })),
      }),
      css(),
      esbuild(),
      typescript({
        noForceEmit: true,
      }),
    ],
  },
])
