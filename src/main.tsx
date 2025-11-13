import { StrictMode, useEffect } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useAuthStore, setQueryClient } from './stores/useAuthStore'
import { ConsentProvider } from './consent/provider/ConsentProvider'

// Configuração do QueryClient com defaults otimizados
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos - dados considerados "frescos"
      gcTime: 1000 * 60 * 10, // 10 minutos - tempo de cache (antigo cacheTime)
      retry: 1, // Apenas 1 retry em caso de erro
      refetchOnWindowFocus: false, // Não refetch ao focar janela
      refetchOnReconnect: true, // Refetch ao reconectar
    },
    mutations: {
      retry: 0, // Não retry em mutations
    },
  },
})

// ✅ Passa queryClient para o auth store (para limpar cache no logout)
setQueryClient(queryClient);

// Componente para inicializar auth
export const AuthInitializer = ({ children }: { children: ReactNode }) => {
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  useEffect(() => {
    let mounted = true;

    const waitForRehydrateAndCheck = async () => {
      try {
        // If there's persisted auth data, wait briefly for zustand persist to restore it
        const hasPersisted = !!localStorage.getItem('auth-storage');
        if (hasPersisted) {
          // poll up to ~500ms for the store to be rehydrated (token/user available)
          const start = Date.now();
          while (mounted && Date.now() - start < 500) {
            const token = (await import('./stores/useAuthStore')).useAuthStore.getState().token;
            const user = (await import('./stores/useAuthStore')).useAuthStore.getState().user;
            if (token && user) break;
            // small delay
            // eslint-disable-next-line no-await-in-loop
            await new Promise((res) => setTimeout(res, 50));
          }
        }

        if (mounted) checkAuthStatus();
      } catch (err) {
        // fallback: call checkAuthStatus regardless
        if (mounted) checkAuthStatus();
      }
    };

    waitForRehydrateAndCheck();

    return () => { mounted = false; };
  }, [checkAuthStatus]);

  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        {/* ✨ ConsentProvider: Gerencia estado global de consentimento LGPD */}
        <ConsentProvider>
          <App />
        </ConsentProvider>
      </AuthInitializer>
      {/* DevTools apenas em desenvolvimento */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
)
