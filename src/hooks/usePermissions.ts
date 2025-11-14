/**
 * Hook para gerenciamento de permissões e roles
 * 
 * Centraliza a lógica de verificação de permissões de forma eficiente
 * e reutilizável em toda a aplicação
 */

import { useMemo } from 'react';
import { useAuth } from './useAuth';

export type UserRole = 'ADMINISTRADOR' | 'DENTISTA' | 'ENFERMEIRO' | 'FISIOTERAPEUTA' | 'MEDICO' | 'NUTRICIONISTA' | 'RECEPCIONISTA' | 'AUDITOR';

export interface Permissions {
  isAdmin: boolean;
  isMedicalStaff: boolean;
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
  canViewSessions: boolean;
  canManagePatients: boolean;
  canManageCompanions: boolean;
  role: UserRole | null;
  roles: string[];
}

/**
 * Hook para verificar permissões do usuário atual
 * 
 * @returns Objeto com flags de permissões e informações do usuário
 * 
 * @example
 * ```tsx
 * const { isAdmin, canManageUsers } = usePermissions();
 * 
 * if (isAdmin) {
 *   return <AdminPanel />;
 * }
 * ```
 */
export const usePermissions = (): Permissions => {
  const { user } = useAuth();

  return useMemo(() => {
    const role = (user?.tipoUsuario as UserRole) || null;
    const roles = user?.roles || [];
    
    const isAdmin = role === 'ADMINISTRADOR';
    const isMedicalStaff = [
      'MEDICO',
      'DENTISTA',
      'ENFERMEIRO',
      'FISIOTERAPEUTA',
      'NUTRICIONISTA',
    ].includes(role || '');
    
    // Permissões específicas
    const canManageUsers = isAdmin;
    const canViewAuditLogs = isAdmin;
    const canViewSessions = isAdmin;
    const canManagePatients = true; // Todos os usuários autenticados podem gerenciar pacientes
    const canManageCompanions = true; // Todos os usuários autenticados podem gerenciar acompanhantes

    return {
      isAdmin,
      isMedicalStaff,
      canManageUsers,
      canViewAuditLogs,
      canViewSessions,
      canManagePatients,
      canManageCompanions,
      role,
      roles,
    };
  }, [user]);
};

/**
 * Hook para verificar se usuário tem uma role específica
 * 
 * @param requiredRole - Role ou array de roles necessárias
 * @returns true se usuário tem a role necessária
 * 
 * @example
 * ```tsx
 * const canAccess = useHasRole('ADMINISTRADOR');
 * const canAccessMedical = useHasRole(['MEDICO', 'ENFERMEIRO']);
 * ```
 */
export const useHasRole = (requiredRole: UserRole | UserRole[]): boolean => {
  const { role } = usePermissions();
  
  return useMemo(() => {
    if (!role) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(role);
    }
    
    return role === requiredRole;
  }, [role, requiredRole]);
};

/**
 * Hook para verificar se usuário tem uma das roles necessárias
 * 
 * @param requiredRoles - Array de roles necessárias
 * @returns true se usuário tem pelo menos uma das roles
 */
export const useHasAnyRole = (requiredRoles: UserRole[]): boolean => {
  return useHasRole(requiredRoles);
};

