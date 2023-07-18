import { defineConfig } from 'vite'
import { resolve } from 'path'
import { createHtmlPlugin } from 'vite-plugin-html'
const NODE_ENV = process.env.NODE_ENV
const isProduction = NODE_ENV === 'production'

export default defineConfig({
  build: {
    outDir: 'dist-vite',
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'packages/core/dist/index.js'),
      name: 'iacg-monitor',
      formats: ['es', 'umd'],
      // the proper extensions will be added
      fileName: 'iacg-monitor',
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
            filename: 'iacg-monitor',
            template: 'index.html',
            entry: 'packages/core/src/index.js',
          },
        ],
      }),
  ],
})
