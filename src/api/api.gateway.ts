import axios, { type AxiosInstance } from 'axios';
import { forceLogout } from '../stores/useAuthStore';

class ApiGateway {
  public gateway: AxiosInstance;

  constructor() {
    this.gateway = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      
      
      withCredentials: true 
    });

    
    this.gateway.interceptors.request.use(
      (config) => {
        // 🚀 Zustand persist salva em 'auth-storage'
        const authStorage = localStorage.getItem('auth-storage');
        let token = null;
        
        if (authStorage) {
          try {
            const parsed = JSON.parse(authStorage);
            token = parsed.state?.token;
          } catch (e) {
            console.warn('[API Gateway] Erro ao parsear auth-storage:', e);
          }
        }
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('[API Gateway] Token enviado:', token.substring(0, 20) + '...');
        } else {
          console.log('[API Gateway] Nenhum token encontrado no localStorage');
        }
        console.log('[API Gateway] Requisição:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

   
    this.gateway.interceptors.response.use(
      (response) => {
        console.log('[API Gateway] Resposta sucesso:', response.status, response.config.url);
        return response;
      },
      (error) => {
        console.error('[API Gateway] Erro na resposta:', {
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data,
          message: error.message
        });
        
        if (error.response?.status === 401) {
          // Don't force logout for auth endpoints that may legitimately return 401
          // during login/2FA flows (the frontend handles those cases explicitly).
          const url: string | undefined = error.config?.url;
          if (url && (url.includes('/auth/login') || url.includes('/auth/2fa') || url.includes('/auth/forgot-password') || url.includes('/auth/reset-password'))) {
            console.warn('[API Gateway] 401 recebido em endpoint de autenticação; não forçando logout (fluxo de login/2FA).', url);
          } else {
            console.warn('[API Gateway] Token inválido/expirado (401) - forçando logout');
            try {
              forceLogout();
            } catch (e) {
              console.error('[API Gateway] Erro ao executar forceLogout', e);
              // fallback: limpa e redireciona
              localStorage.removeItem('auth-storage');
              if (window.location.pathname !== '/login') window.location.href = '/login';
            }
          }
        } else if (error.response?.status === 403) {
          const url: string | undefined = error.config?.url;
          // If /auth/me returned 403, it's safer to force logout (session invalid or permission removed)
          if (url && url.includes('/auth/me')) {
            console.warn('[API Gateway] /auth/me retornou 403 - forçando logout');
            try {
              forceLogout();
            } catch (e) {
              console.error('[API Gateway] Erro ao executar forceLogout após 403 /auth/me', e);
              localStorage.removeItem('auth-storage');
              if (window.location.pathname !== '/login') window.location.href = '/login';
            }
          } else {
            console.warn('[API Gateway] Acesso negado (403) - sem permissão', url);
          }
        }
        return Promise.reject(error);
      }
    );
  }
}

export const api = new ApiGateway().gateway;