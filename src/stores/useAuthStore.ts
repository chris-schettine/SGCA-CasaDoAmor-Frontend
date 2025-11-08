import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../api/auth.service';

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
      isLoading: true,

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
          await authService.logout();
        } catch (error) {
          console.error('[useAuthStore] Erro ao fazer logout:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            token: null,
          });
        }
      },

      checkAuthStatus: async () => {
        const { token, user } = get();
        
        if (!token || !user) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        try {
          // Valida sessão com backend
          const rawUser: any = await authService.getActiveSession();
          
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

            set({ user: normalizedUser, isAuthenticated: true });
          }
        } catch (error: any) {
          const status = error?.response?.status;
          console.warn('[useAuthStore] Falha ao validar sessão:', status || error);
          
          if (status === 401) {
            // Token inválido/expirado - limpa sessão
            set({ token: null, user: null, isAuthenticated: false });
          } else {
            // Outros erros: mantém sessão local
            console.warn('[useAuthStore] Mantendo sessão local apesar do erro');
            set({ isAuthenticated: true });
          }
        } finally {
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
