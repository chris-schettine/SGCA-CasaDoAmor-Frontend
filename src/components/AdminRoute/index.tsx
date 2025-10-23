import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingBackdrop from '../LoadingBackdrop';

interface AdminRouteProps {
  children: React.ReactElement;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) return <LoadingBackdrop />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!user || user.tipoUsuario !== 'ADMINISTRADOR') {
    // Not authorized - redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
