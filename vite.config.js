import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // Pre-bundle everything up front so the dev server never re-optimizes mid-session
  // (which otherwise aborts in-flight page loads with "outdated optimize dep").
  optimizeDeps: {
    include: [
      'react',
      'react-dom/client',
      'react-router-dom',
      '@supabase/supabase-js',
      'motion/react',
      'lenis',
      'dompurify',
      'marked',
      '@phosphor-icons/react',
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-image',
      '@tiptap/extension-link',
      '@tiptap/extension-placeholder',
      '@tiptap/extension-youtube',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
    ],
  },
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
