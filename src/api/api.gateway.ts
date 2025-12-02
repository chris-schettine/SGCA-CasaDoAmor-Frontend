import axios, { type AxiosInstance } from 'axios';
import { forceLogout, useAuthStore } from '../stores/useAuthStore';

class ApiGateway {
  public gateway: AxiosInstance;

  constructor() {
    this.gateway = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      
      
      withCredentials: true 
    });

    
    this.gateway.interceptors.request.use(
      (config) => {
        // Primeiro prefira o token atual da store (evita condição de corrida
        // quando a persistência ainda não gravou no localStorage após login)
        let token: string | null = useAuthStore.getState().token ?? null;

        // Fallback: ler auth-storage (compatibilidade com instâncias fora do React)
        if (!token) {
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            try {
              const parsed = JSON.parse(authStorage);
              token = parsed.state?.token ?? null;
            } catch (e) {
              if (import.meta.env.DEV) console.warn('[API Gateway] Erro ao parsear auth-storage:', e);
            }
          }
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          if (import.meta.env.DEV) console.log('[API Gateway] Token enviado:', token.substring(0, 20) + '...');
        }

        // Extra debug for consent endpoints: log payload/params to help diagnose 500s
        if (import.meta.env.DEV && config.url && config.url.includes('/profissionais') && config.url.includes('consentimentos')) {
          try {
            console.log('[API Gateway] Consent endpoint request details:', {
              method: config.method?.toUpperCase(),
              url: config.url,
              params: config.params ?? null,
              data: config.data ?? null,
              headers: config.headers ? { ...config.headers, Authorization: config.headers.Authorization ? '***REDACTED***' : undefined } : null,
            });
          } catch (e) {
            console.warn('[API Gateway] Failed to log consent request details', e);
          }
        }
        
        if (import.meta.env.DEV) {
          console.log('[API Gateway] Requisição:', config.method?.toUpperCase(), config.url);
          
          // Log payload for agendamento endpoints
          if (config.url && config.url.includes('/agendamentos') && config.method?.toLowerCase() === 'post') {
            console.log('[API Gateway] 📦 Payload enviado:', JSON.stringify(config.data, null, 2));
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

   
    this.gateway.interceptors.response.use(
      (response) => {
        if (import.meta.env.DEV) console.log('[API Gateway] Resposta sucesso:', response.status, response.config.url);
        return response;
      },
      (error) => {
        if (import.meta.env.DEV) {
          console.error('[API Gateway] Erro na resposta:', {
            status: error.response?.status,
            url: error.config?.url,
            data: error.response?.data,
            message: error.message
          });
        }
        
        if (error.response?.status === 401) {
          // Don't force logout for auth endpoints that may legitimately return 401
          // during login/2FA flows (the frontend handles those cases explicitly).
          const url: string | undefined = error.config?.url;
          if (url && (url.includes('/auth/login') || url.includes('/auth/2fa') || url.includes('/auth/forgot-password') || url.includes('/auth/reset-password'))) {
            if (import.meta.env.DEV) console.warn('[API Gateway] 401 em endpoint de autenticação - fluxo normal');
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
          // Lista de endpoints protegidos que requerem autenticação válida
          const protectedEndpoints = ['/auth/me', '/pacientes', '/usuarios', '/acompanhantes', '/admins'];
          const isProtectedEndpoint = protectedEndpoints.some(endpoint => url?.includes(endpoint));
          
          if (isProtectedEndpoint) {
            console.warn('[API Gateway] Acesso negado (403) - forçando logout');
            try {
              forceLogout();
            } catch (e) {
              console.error('[API Gateway] Erro ao executar forceLogout após 403', e);
              // fallback: limpa e redireciona
              localStorage.removeItem('auth-storage');
              if (window.location.pathname !== '/login') window.location.href = '/login';
            }
          } else {
            console.warn('[API Gateway] Acesso negado (403) - sem permissão');
          }
        }
        // Additional debug for consent endpoints errors
        try {
          const url = error.config?.url as string | undefined;
          if (import.meta.env.DEV && url && url.includes('/profissionais') && url.includes('consentimentos')) {
            console.error('[API Gateway] Consent endpoint error payload:', {
              status: error.response?.status,
              url,
              requestData: error.config?.data ?? null,
              responseData: error.response?.data ?? null,
            });
          }
        } catch {
          /* ignore logging failures */
        }

        return Promise.reject(error);
      }
    );
  }
}

export const api = new ApiGateway().gateway;