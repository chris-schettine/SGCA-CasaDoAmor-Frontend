import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// NOTE: global `requestIdleCallback` types are declared in `src/types/globals.d.ts`

/**
 * Hook para prefetch inteligente de rotas baseado em hover/intersection
 * Melhora a percepção de performance ao pré-carregar rotas quando o usuário
 * demonstra intenção de navegar (hover em links, etc)
 * 
 * @param routePath - Caminho da rota para prefetch
 * @param enabled - Se o prefetch está habilitado (default: true)
 */
export const useRoutePrefetch = (routePath: string, enabled = true) => {
  const prefetchedRef = useRef(false);
  const location = useLocation();

  useEffect(() => {
    if (!enabled || prefetchedRef.current) return;

    // Não prefetch se já estiver na rota
    if (location.pathname === routePath) {
      prefetchedRef.current = true;
      return;
    }

    // Prefetch quando o usuário demonstra intenção (hover, focus)
    const handlePrefetch = () => {
      if (prefetchedRef.current) return;
      
      // Usa requestIdleCallback para não bloquear o thread principal
      const schedulePrefetch = (loader: () => Promise<unknown>) => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            loader().catch(() => {
              // Silently fail - prefetch é otimização
            });
          }, { timeout: 1000 });
        } else {
          setTimeout(() => {
            loader().catch(() => {
              // Silently fail
            });
          }, 100);
        }
      };

      // Mapeia rotas para seus loaders
      const routeMap: Record<string, () => Promise<unknown>> = {
        '/patients': () => import('../pages/Patients'),
        '/companions': () => import('../pages/Companions'),
        '/users': () => import('../pages/Users'),
        '/profile': () => import('../pages/MyProfile'),
        '/login': () => import('../pages/Login'),
        '/about': () => import('../pages/About'),
      };

      const loader = routeMap[routePath];
      if (loader) {
        schedulePrefetch(loader);
        prefetchedRef.current = true;
      }
    };

    // Prefetch em links relacionados quando hover/focus
    const links = document.querySelectorAll(`a[href="${routePath}"]`);
    links.forEach(link => {
      link.addEventListener('mouseenter', handlePrefetch, { once: true, passive: true });
      link.addEventListener('focus', handlePrefetch, { once: true, passive: true });
    });

    return () => {
      links.forEach(link => {
        link.removeEventListener('mouseenter', handlePrefetch);
        link.removeEventListener('focus', handlePrefetch);
      });
    };
  }, [routePath, enabled, location.pathname]);
};

/**
 * Hook para prefetch automático de rotas baseado na rota atual
 * Prefetch rotas relacionadas que provavelmente serão acessadas
 */
export const useSmartRoutePrefetch = () => {
  const location = useLocation();

  useEffect(() => {
    // Mapeia rotas atuais para rotas relacionadas que devem ser prefetchadas
    const relatedRoutes: Record<string, string[]> = {
      '/patients': ['/patient/register', '/companions'],
      '/companions': ['/patients', '/patient/companion/register'],
      '/users': ['/user/register'],
      '/profile': ['/consentimentos-lgpd'],
    };

    const routesToPrefetch = relatedRoutes[location.pathname] || [];
    
    if (routesToPrefetch.length === 0) return;

    // Prefetch após um pequeno delay para não competir com recursos críticos
    const timer = setTimeout(() => {
      const routeMap: Record<string, () => Promise<unknown>> = {
        '/patient/register': () => import('../pages/PatientRegister'),
        '/companions': () => import('../pages/Companions'),
        '/patients': () => import('../pages/Patients'),
        '/patient/companion/register': () => import('../pages/CompanionRegister'),
        '/user/register': () => import('../pages/UserRegister'),
        '/consentimentos-lgpd': () => import('../pages/ConsentimentoLGPD'),
      };

      routesToPrefetch.forEach(route => {
        const loader = routeMap[route];
        if (loader && 'requestIdleCallback' in window) {
          requestIdleCallback(() => {
            loader().catch(() => {
              // Silently fail
            });
          }, { timeout: 2000 });
        }
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.pathname]);
};

