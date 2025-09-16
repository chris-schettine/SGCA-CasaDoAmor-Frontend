import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingBackdrop from '../LoadingBackdrop';

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  const location = useLocation();

  if (isLoading) {
    return <LoadingBackdrop />;
  }

  // se o usuário NÃO está autenticado
  if (!isAuthenticated) {
    // passando o caminho atual, para que após o login, o usuário possa ser redirecionado de volta.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;