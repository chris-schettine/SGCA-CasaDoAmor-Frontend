import axios, { type AxiosInstance } from 'axios';

class ApiGateway {
  public gateway: AxiosInstance;

  constructor() {
    this.gateway = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      
      
      withCredentials: true 
    });

    // Interceptor para adicionar token em todas as requisições
    this.gateway.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
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

    // Interceptor para tratar erros 401 (não autorizado)
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
          // Token expirado ou inválido - limpar localStorage
          console.warn('[API Gateway] Token inválido/expirado (401) - limpando sessão');
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          // Redirecionar para login se necessário
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        } else if (error.response?.status === 403) {
          console.warn('[API Gateway] Acesso negado (403) - sem permissão');
        }
        return Promise.reject(error);
      }
    );
  }
}

export const api = new ApiGateway().gateway;