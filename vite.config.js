import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {

    allowedHosts: ['m3xccvkyp94a.share.zrok.io', 'wi1rc807p0kw.share.zrok.io', 'y4jd74wa4fwl.share.zrok.io', 'whee9l8m2sox.share.zrok.io'],
    proxy: {
      '/api': {
        target: 'https://7bt3gzgt-8000.uks1.devtunnels.ms',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})