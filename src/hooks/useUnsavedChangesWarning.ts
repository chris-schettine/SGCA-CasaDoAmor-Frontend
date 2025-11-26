import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook para alertar o usuário sobre mudanças não salvas
 * @param isDirty - Indica se há mudanças não salvas no formulário (do react-hook-form)
 * @param message - Mensagem customizada (opcional)
 */
interface UnsavedChangesOptions {
  includeRouteGuard?: boolean;
}

export const useUnsavedChangesWarning = (
  isDirty: boolean,
  message: string = 'Você tem alterações não salvas. Tem certeza que deseja sair?',
  options: UnsavedChangesOptions = {}
) => {
  useEffect(() => {
    // Alerta quando o usuário tenta fechar a aba/navegador
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = message; // Necessário para alguns navegadores
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, message]);

  useEffect(() => {
    if (!options.includeRouteGuard) return;
    const handlePopState = (event: PopStateEvent) => {
      if (!isDirty) return;
      const confirmLeave = window.confirm(message);
      if (!confirmLeave) {
        event.preventDefault?.();
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty, message, options.includeRouteGuard]);
};

/**
 * Hook combinado para alertar sobre mudanças não salvas tanto no navegador quanto na navegação SPA
 * @param isDirty - Indica se há mudanças não salvas no formulário
 * @param message - Mensagem customizada (opcional)
 */
export const useBlocker = (
  isDirty: boolean,
  message: string = 'Você tem alterações não salvas. Tem certeza que deseja sair?'
) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Bloqueia navegação do navegador
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, message]);

  // Para bloquear navegação SPA (usando react-router), você pode usar um approach diferente
  // Como mostrar um dialog de confirmação customizado antes de navegar
  useEffect(() => {
    // Esta é uma implementação básica
    // Em uma aplicação real, você pode usar bibliotecas como react-router-dom v6 com unstable_useBlocker
    // ou implementar uma solução customizada com Context API
  }, [isDirty, navigate, location]);
};
