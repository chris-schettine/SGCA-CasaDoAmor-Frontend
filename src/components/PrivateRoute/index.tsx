import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingBackdrop from '../LoadingBackdrop';

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, isLoading, token } = useAuth();

  const location = useLocation();

  // 🐛 Debug
  console.log('[PrivateRoute]', {
    path: location.pathname,
    isAuthenticated,
    isLoading,
    hasToken: !!token,
  });

  // ⏳ Aguarda finalizar verificação de autenticação
  if (isLoading) {
    console.log('[PrivateRoute] Aguardando verificação...');
    return <LoadingBackdrop />;
  }

  // 🔒 Redireciona para login se NÃO autenticado
  if (!isAuthenticated) {
    console.log('[PrivateRoute] NÃO autenticado - redirecionando para /login');
    // passando o caminho atual, para que após o login, o usuário possa ser redirecionado de volta.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Autenticado - renderiza conteúdo protegido
  console.log('[PrivateRoute] Autenticado - renderizando conteúdo');
  return children;
};

export default PrivateRoute;