import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// [PERUBAHAN] Versi baru berjalan di port 5174 (versi asli tetap di 5173),
// sehingga keduanya bisa dibuka bersamaan di browser untuk dibandingkan.
// strictPort: true -> jika 5174 sedang dipakai, Vite berhenti dengan pesan error
// alih-alih diam-diam pindah ke port lain.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
  },
})
