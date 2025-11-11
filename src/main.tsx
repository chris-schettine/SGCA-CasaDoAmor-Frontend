import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useAuthStore, setQueryClient } from './stores/useAuthStore'

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
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Executa apenas uma vez no mount

  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <App />
      </AuthInitializer>
      {/* DevTools apenas em desenvolvimento */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
)
