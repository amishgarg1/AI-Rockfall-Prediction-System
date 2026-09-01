import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  // Served from the domain root. This was previously pinned to the GitHub
  // Pages subdirectory, which would have made every asset 404 once the site
  // moved to a root-served host.
  base: '/',
  plugins: [react()],
})
