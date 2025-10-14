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
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'sefl' data:; front-src 'self';"
    }
  }
})
