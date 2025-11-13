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

  // ⏳ Aguarda finalizar verificação de autenticação
  if (isLoading) {
    return <LoadingBackdrop />;
  }

  // 🔒 Redireciona para login se NÃO autenticado
  if (!isAuthenticated) {
    // passando o caminho atual, para que após o login, o usuário possa ser redirecionado de volta.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar estado de consentimento global (se o provider estiver ativo)
  const consentCtx = useContext(ConsentContext as unknown as any);

  // Se o provider ainda estiver carregando ou for primeira visita/version_mismatch,
  // bloqueamos o acesso centralizado aqui para evitar que o usuário navegue pelo sistema
  if (consentCtx) {
    const stateType = (consentCtx as any).state?.type;
    if (stateType === 'loading' || stateType === 'first_visit' || stateType === 'version_mismatch') {
      return <LoadingBackdrop />;
    }
  }

  return children;
};

export default PrivateRoute;