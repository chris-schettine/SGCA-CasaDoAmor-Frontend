import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - bibliotecas grandes
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-core': ['@mui/material', '@mui/system', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          
          // Chunks de páginas por funcionalidade
          'patient-pages': [
            './src/pages/Patients/index.tsx',
            './src/pages/PatientRegister/index.tsx',
            './src/pages/PatientEdit/index.tsx',
            './src/pages/PatientInformation/index.tsx',
            './src/pages/CompanionRegister/index.tsx'
          ],
          'user-pages': [
            './src/pages/Users/index.tsx',
            './src/pages/UserRegister/index.tsx',
            './src/pages/UserEdit/index.tsx',
            './src/pages/MyProfile/index.tsx'
          ],
          'auth-pages': [
            './src/pages/Login/index.tsx',
            './src/pages/ForgotPassword/index.tsx',
            './src/pages/ResetPassword/index.tsx',
            './src/pages/VerifyEmail/index.tsx',
            './src/pages/ActivateAccount/index.tsx',
            './src/pages/LoginVerify2FA/index.tsx'
          ],
          'medical-pages': [
            './src/pages/MedicalRecord/index.tsx',
            './src/pages/Sessions/index.tsx',
            './src/pages/AuditLogPage/index.tsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false,
    minify: 'esbuild'
  },
  server: {
    headers:{
      //Tem a prevenção para o site não ser renderizado dentro de um <inframe>
      'X-Frame-Options': 'DENY',
      //Impedi o navegador de executar um arquivo de texto que pode conter um script
      'X-Content-Type-Options': 'nosniff',
      //Politica de Segurança de Conteúdo para previni sobre ataques de XSS (Cross-Site Scripting)
      // Relaxed for local development so Vite's HMR and injected inline scripts/images work.
      // In production you should set a stricter CSP (and avoid 'unsafe-inline').
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173 http://localhost:5174; style-src 'self' 'unsafe-inline'; img-src 'self' data: http://localhost:5173 http://localhost:5174; font-src 'self'; connect-src 'self' ws://localhost:5173 ws://localhost:5174 http://144.22.182.60:8888 https://viacep.com.br;"
    }
  }
})
