import { defineConfig } from 'vite'
import { resolve } from 'path'
import { createHtmlPlugin } from 'vite-plugin-html'
import { getCommandValue } from './utills'
const NODE_ENV = process.env.NODE_ENV
const isProduction = NODE_ENV === 'production'


const projectName = getCommandValue('projectName')
console.log(isProduction, NODE_ENV, projectName)

export default defineConfig({
  build: {
    outDir: 'dist-vite',
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, `packages/${projectName}/src/index.js`),
      name: `iacg-monitor-${projectName}`,
      formats: ['es', 'umd'],
      // the proper extensions will be added
      fileName: `iacg-monitor-${projectName}`,
    },
    // rollupOptions: {
    //   output: {
    //     chunkFileNames: 'js/[name]-[hash].js',
    //     entryFileNames: 'js/[name]-[hash].js',
    //     assetFileNames: '[ext]/name-[hash].[ext]',
    //   },
    // },
  },
  plugins: [
    !isProduction &&
      createHtmlPlugin({
        minify: true,
        pages: [
          {
            filename: `iacg-monitor-${projectName}`,
            template: 'index.html',
            entry: `packages/${projectName}/src/index.js`,
          },
        ],
      }),
  ],
})
