import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   server: {
    headers:{
      //Tem a prevenção para o site não ser renderizado dentro de um <inframe>
      'X-Frame-Options': 'DENY',
      //Impedi o navegador de executar um arquivo de texto que pode conter um script
      'X-Content-Type-Options': 'nosniff',
      //Politica de Segurança de Conteúdo para previni sobre ataques de XSS (Cross-Site Scripting)
      // Relaxed for local development so Vite's HMR and injected inline scripts/images work.
      // In production you should set a stricter CSP (and avoid 'unsafe-inline').
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173; style-src 'self' 'unsafe-inline'; img-src 'self' data: http://localhost:5173; font-src 'self'; connect-src 'self' ws://localhost:5173 http://144.22.182.60:8888;"
    }
  }
})
