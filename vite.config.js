import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@tiptap') || id.includes('prosemirror')) return 'editor'
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('motion') || id.includes('framer')) return 'motion'
          if (id.includes('react') || id.includes('scheduler')) return 'vendor'
        },
      },
    },
  },
})
