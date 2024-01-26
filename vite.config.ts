import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import hotReloadExtension from 'hot-reload-extension-vite'

export default defineConfig({
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
    hotReloadExtension({
      log: true,
      backgroundPath: 'background.js'
    }),
  ],
  server: {
    port: 3333
  },
})
