import { api } from './api.gateway';
import type {
  CreateUserDTO,
  UpdateUserDTO,
  AtribuirRolesDTO,
  CreatePerfilDTO,
  CreatePermissaoDTO,
  PageUserResponseDTO,
  UserResponseDTO,
  PerfilDTO,
  PermissaoDTO,
  Pageable,
} from './admin.dto';

class AdminService {
  async listUsers(pageable: Pageable): Promise<PageUserResponseDTO> {
    const response = await api.get('/admin/users', { params: pageable });
    return response.data;
  }

  async createUser(data: CreateUserDTO): Promise<UserResponseDTO> {
    const response = await api.post('/admin/users', data);
    return response.data;
  }

  async getUserById(id: number): Promise<UserResponseDTO> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  }

  async updateUser(id: number, data: UpdateUserDTO): Promise<UserResponseDTO> {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  }

  async assignRoles(id: number, data: AtribuirRolesDTO): Promise<void> {
    await api.post(`/admin/users/${id}/roles`, data);
  }

  async forceLogout(id: number): Promise<void> {
    await api.post(`/admin/users/${id}/force-logout`);
  }

  async listRoles(): Promise<PerfilDTO[]> {
    const response = await api.get('/admin/roles');
    return response.data;
  }

  async createRole(data: CreatePerfilDTO): Promise<PerfilDTO> {
    const response = await api.post('/admin/roles', data);
    return response.data;
  }

  async getRoleById(id: number): Promise<PerfilDTO> {
    const response = await api.get(`/admin/roles/${id}`);
    return response.data;
  }

  async updateRole(id: number, data: CreatePerfilDTO): Promise<PerfilDTO> {
    const response = await api.put(`/admin/roles/${id}`, data);
    return response.data;
  }

  async deleteRole(id: number): Promise<void> {
    await api.delete(`/admin/roles/${id}`);
  }

  async listPermissions(): Promise<PermissaoDTO[]> {
    const response = await api.get('/admin/permissions');
    return response.data;
  }

  async createPermission(data: CreatePermissaoDTO): Promise<PermissaoDTO> {
    const response = await api.post('/admin/permissions', data);
    return response.data;
  }

  async getPermissionById(id: number): Promise<PermissaoDTO> {
    const response = await api.get(`/admin/permissions/${id}`);
    return response.data;
  }

  async updatePermission(id: number, data: CreatePermissaoDTO): Promise<PermissaoDTO> {
    const response = await api.put(`/admin/permissions/${id}`, data);
    return response.data;
  }

  async getAuditSessions(): Promise<any> {
    const response = await api.get('/admin/audit/sessions');
    return response.data;
  }

  async getAuditLogins(params: any): Promise<any> {
    const response = await api.get('/admin/audit/logins', { params });
    return response.data;
  }

  async getPhotoUrl(id: number): Promise<any> {
    const response = await api.get(`/admin/${id}/foto`);
    return response.data;
  }

  async uploadPhoto(id: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/admin/${id}/foto`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deletePhoto(id: number): Promise<void> {
    await api.delete(`/admin/${id}/foto`);
  }
}

export const adminService = new AdminService();