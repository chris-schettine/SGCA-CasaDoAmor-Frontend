import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingBackdrop from '../LoadingBackdrop';
import { ConsentContext } from '../../consent/provider/ConsentProvider';

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  // Access consent context unconditionally (hooks must be called in same order)
  const consentCtx = useContext(ConsentContext);
  // Debug: log auth state
  if (import.meta.env.DEV) console.log('[PrivateRoute] render', { isAuthenticated, isLoading, pathname: location.pathname });

  // ⏳ Aguarda finalizar verificação de autenticação
  if (isLoading) {
    if (import.meta.env.DEV) console.log('[PrivateRoute] Rendering LoadingBackdrop because isLoading === true');
    return <LoadingBackdrop />;
  }

  // 🔒 Redireciona para login se NÃO autenticado
  if (!isAuthenticated) {
    if (import.meta.env.DEV) console.log('[PrivateRoute] Not authenticated - redirecting to /login', { pathname: location.pathname });
    // passando o caminho atual, para que após o login, o usuário possa ser redirecionado de volta.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se o provider ainda estiver carregando, mantemos o bloqueio.
  // Não bloqueamos as rotas para `first_visit` ou `version_mismatch` aqui
  // porque o próprio `ConsentProvider` renderiza o `ConsentDialog` e
  // deve controlar o fluxo (o dialog aparece em cima da aplicação).
  if (consentCtx) {
    const stateType = consentCtx.state?.type;
    if (import.meta.env.DEV) console.log('[PrivateRoute] consent stateType:', stateType);
    if (stateType === 'loading') {
      if (import.meta.env.DEV) console.log('[PrivateRoute] Rendering LoadingBackdrop because consent.state.type === loading');
      return <LoadingBackdrop />;
    }
  }

  return children;
};

export default PrivateRoute;