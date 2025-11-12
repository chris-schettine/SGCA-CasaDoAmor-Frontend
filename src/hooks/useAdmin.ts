import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../api/admin.service';
import type { CreateUserDTO, UpdateUserDTO, AtribuirRolesDTO, Pageable, AuditLoginsQueryParams } from '../api/admin.dto';

// Query Keys para cache
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (pageable: Pageable) => [...userKeys.lists(), pageable] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
};

export const auditKeys = {
  all: ['audit'] as const,
  sessions: () => [...auditKeys.all, 'sessions'] as const,
  logins: (params: AuditLoginsQueryParams) => [...auditKeys.all, 'logins', params] as const,
};

/**
 * Hook para listar usuários com paginação
 * ✅ Substitui useState + useEffect manual
 */
export function useUsers(pageable: Pageable) {
  return useQuery({
    queryKey: userKeys.list(pageable),
    queryFn: () => adminService.listUsers(pageable),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar usuário por ID
 */
export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => adminService.getUserById(id),
    enabled: !!id, // Só executa se ID for válido
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para criar novo usuário
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDTO) => adminService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook para atualizar usuário
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDTO }) => 
      adminService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
  });
}

/**
 * Hook para deletar usuário
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook para atribuir roles
 */
export function useAssignRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AtribuirRolesDTO }) => 
      adminService.assignRoles(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
  });
}

/**
 * Hook para forçar logout
 */
export function useForceLogout() {
  return useMutation({
    mutationFn: (id: number) => adminService.forceLogout(id),
  });
}

/**
 * Hook para alternar status do usuário (ativo/inativo)
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminService.toggleUserStatus(id),
    onSuccess: () => {
      // Invalida todas as listas de usuários para refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook para listar roles
 */
export function useRoles() {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => adminService.listRoles(),
    staleTime: 1000 * 60 * 10, // 10 minutos - roles mudam raramente
  });
}

/**
 * Hook para buscar role por ID
 */
export function useRole(id: number) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => adminService.getRoleById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook para sessões de auditoria
 */
export function useAuditSessions() {
  return useQuery({
    queryKey: auditKeys.sessions(),
    queryFn: () => adminService.getAuditSessions(),
    staleTime: 1000 * 30, // 30 segundos - dados de auditoria devem ser mais atuais
  });
}

/**
 * Hook para logins de auditoria
 */
export function useAuditLogins(params: AuditLoginsQueryParams) {
  return useQuery({
    queryKey: auditKeys.logins(params),
    queryFn: () => adminService.getAuditLogins(params),
    staleTime: 1000 * 30,
  });
}
