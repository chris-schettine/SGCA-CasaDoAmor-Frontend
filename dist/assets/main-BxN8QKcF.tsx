import { StrictMode, useEffect } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useAuthStore, setQueryClient } from './stores/useAuthStore'
import { bootstrapConsent } from './consent/bootstrap/consentBootstrap';
import { ConsentProvider } from './consent/provider/ConsentProvider'
import TransitionProvider from './motion/TransitionProvider';

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
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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
            await new Promise((res) => setTimeout(res, 50));
          }
        }

        if (mounted) checkAuthStatus();
      } catch {
        // fallback: call checkAuthStatus regardless
        if (mounted) checkAuthStatus();
      }
    };

    waitForRehydrateAndCheck();

    return () => { mounted = false; };
  }, [checkAuthStatus]);

  // Bootstrap consent once when user becomes available after auth rehydrate
  useEffect(() => {
    let mounted = true;

    const runBootstrap = async () => {
      try {
        if (!mounted) return;
        if (!isAuthenticated || !user) return;
        // Prefer CPF for backend listing calls. NEVER call listar by UUID.
        const identifier = user?.cpf ? String(user.cpf).replace(/\D/g, '') : (user?.uuid || '');
        if (!identifier) return;

        if (import.meta.env.DEV) console.debug('[AuthInitializer] Running consent bootstrap for identifier', identifier);
        await bootstrapConsent(identifier);
      } catch (err) {
        console.error('[AuthInitializer] consent bootstrap failed', err);
      }
    };

    void runBootstrap();

    return () => { mounted = false; };
  }, [isAuthenticated, user]);

  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        {/* TransitionProvider moved up so any top-level components (eg. ConsentProvider/Dialog) can use motion tokens */}
        <TransitionProvider>
          {/* ✨ ConsentProvider: Gerencia estado global de consentimento LGPD */}
          <ConsentProvider>
            <App />
          </ConsentProvider>
        </TransitionProvider>
      </AuthInitializer>
      {/* DevTools apenas em desenvolvimento */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
)
