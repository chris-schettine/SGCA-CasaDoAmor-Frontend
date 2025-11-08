import { useAuthStore } from '../stores/useAuthStore';

/**
 * Hook simplificado para acessar o auth store
 * 🚀 Zustand - substitui useContext(AuthContext)
 * ✅ Sem provider necessário
 * ✅ Persist automático no localStorage
 * ✅ Performance otimizada (só re-renderiza quando os dados usados mudarem)
 */
export const useAuth = () => {
  return useAuthStore();
};

// Exporta seletores otimizados para evitar re-renders desnecessários
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthToken = () => useAuthStore((state) => state.token);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);