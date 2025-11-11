import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../api/auth.service';

// Importa queryClient para limpar cache no logout
let queryClientInstance: any = null;

export const setQueryClient = (client: any) => {
  queryClientInstance = client;
};

export interface UserType {
  nome: string;
  email: string;
  cpf: string;
  roles: string[];
  tipoUsuario?: string;
}

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: UserType | null;
  token: string | null;
  isLoading: boolean;
  
  // Actions
  login: (token: string, user: UserType) => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false, // ✅ Inicia como false - persist já restaurou do localStorage

      // Actions
      login: (newToken: string, userData: UserType) => {
        set({
          token: newToken,
          user: userData,
          isAuthenticated: true,
        });
      },

      logout: async () => {
        try {
          // 🔐 Chama API de logout (POST /auth/logout)
          await authService.logout();
          console.log('[useAuthStore] Logout na API realizado com sucesso');
        } catch (error: any) {
          const status = error?.response?.status;
          
          if (status === 401) {
            console.warn('[useAuthStore] Logout: sessão já expirada (401)');
          } else if (status === 404) {
            console.warn('[useAuthStore] Logout: sessão não encontrada (404)');
          } else {
            console.error('[useAuthStore] Erro ao fazer logout na API:', error);
          }
          
          // Continua limpando mesmo com erro (sessão local)
        } finally {
          // Limpa o estado
          set({
            user: null,
            isAuthenticated: false,
            token: null,
          });
          
          // 🔒 Limpa localStorage
          localStorage.removeItem('auth-storage');
          
          // 🗑️ Limpa cache do TanStack Query
          if (queryClientInstance) {
            queryClientInstance.clear();
            console.log('[useAuthStore] Cache do QueryClient limpo');
          }
          
          console.log('[useAuthStore] Logout completo - tudo limpo');
        }
      },

      checkAuthStatus: async () => {
        if (import.meta.env.DEV) console.log('[useAuthStore.checkAuthStatus] INICIADO');
        const state = get();
        const { token, user, isLoading } = state;
        if (import.meta.env.DEV) console.log('[useAuthStore.checkAuthStatus] Token:', !!token, 'User:', !!user, 'isLoading:', isLoading);
        
        // ⚠️ Previne múltiplas chamadas simultâneas
        if (isLoading) {
          if (import.meta.env.DEV) console.warn('[useAuthStore.checkAuthStatus] JÁ ESTÁ VERIFICANDO - ignorando chamada duplicada');
          return;
        }
        
        // Se não tem token/user no localStorage, não precisa verificar
        if (!token || !user) {
          if (import.meta.env.DEV) console.log('[useAuthStore.checkAuthStatus] Sem token/user - finalizando');
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        // ⏳ Inicia verificação
        if (import.meta.env.DEV) console.log('[useAuthStore.checkAuthStatus] Iniciando verificação com backend');
        set({ isLoading: true });

        try {
          if (import.meta.env.DEV) console.log('[useAuthStore.checkAuthStatus] Chamando authService.getActiveSession()');
          
          // ⏱️ Adiciona timeout de 5 segundos
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 5000);
          });
          
          const sessionPromise = authService.getActiveSession();
          
          const rawUser: any = await Promise.race([sessionPromise, timeoutPromise]);
          if (import.meta.env.DEV) console.log('[useAuthStore.checkAuthStatus] Resposta recebida:', !!rawUser);
          
          if (rawUser) {
            // Normaliza dados do backend
            const normalizedUser: UserType = {
              nome: rawUser.nome || rawUser.user?.nome || '',
              email: rawUser.email || rawUser.user?.email || '',
              cpf: rawUser.cpf || rawUser.user?.cpf || '',
              roles: (rawUser.perfis && Array.isArray(rawUser.perfis))
                ? rawUser.perfis.map((p: any) => p.nome)
                : (rawUser.roles || rawUser.user?.roles || []),
              tipoUsuario: rawUser.tipo || rawUser.tipoUsuario || rawUser.user?.tipoUsuario,
            };

            if (import.meta.env.DEV) console.log('[useAuthStore.checkAuthStatus] Atualizando usuário normalizado');
            set({ user: normalizedUser, isAuthenticated: true });
          }
        } catch (error: any) {
          const status = error?.response?.status;
          
          if (status === 401) {
            // Token inválido/expirado - limpa sessão
            console.warn('[useAuthStore] Token inválido (401) - limpando sessão');
            set({ token: null, user: null, isAuthenticated: false });
          } else if (error.message?.includes('Timeout')) {
            // Timeout - mantém sessão local mas loga aviso
            console.warn('[useAuthStore] Falha ao verificar sessão (timeout) - mantendo sessão local');
            set({ isAuthenticated: true });
          } else {
            // Outros erros: mantém sessão local
            console.warn('[useAuthStore] Falha ao validar sessão - mantendo sessão local:', error.message || error);
            set({ isAuthenticated: true });
          }
        } finally {
          if (import.meta.env.DEV) console.log('[useAuthStore.checkAuthStatus] FINALIZANDO - setando isLoading = false');
          set({ isLoading: false });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage', // Nome da chave no localStorage
      storage: createJSONStorage(() => localStorage),
      // Persiste apenas token e user (não isLoading)
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Utility para forçar logout fora do React (API interceptor)
export const forceLogout = () => {
  try {
    useAuthStore.getState().logout();
  } catch (e) {
    console.warn('[forceLogout] erro ao limpar store', e);
  }
  
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};
