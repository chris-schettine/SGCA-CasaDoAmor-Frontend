import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import LoadingBackdrop from '../LoadingBackdrop';

interface AdminRouteProps {
  children: React.ReactElement;
}

/**
 * Componente de rota protegida para administradores
 * 
 * Verifica se o usuário está autenticado e tem role de ADMINISTRADOR.
 * Redireciona para /patients se não autorizado (evita cascata de redirecionamentos).
 * 
 * @example
 * ```tsx
 * <Route path="/users" element={
 *   <AdminRoute>
 *     <Users />
 *   </AdminRoute>
 * } />
 * ```
 */
const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isLoading, isAuthenticated } = useAuth();
  const { isAdmin } = usePermissions();

  // ⏳ Aguarda verificação de autenticação
  if (isLoading) {
    return <LoadingBackdrop />;
  }

  // 🔒 Redireciona para login se não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Redireciona para dashboard se não for administrador
  if (!isAdmin) {
    return <Navigate to="/patients" replace />;
  }

  return children;
};

export default AdminRoute;
