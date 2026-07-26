import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { progressPlugin } from './vite-plugin-progress'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), progressPlugin()],
})
