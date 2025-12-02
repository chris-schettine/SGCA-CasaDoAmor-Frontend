import { api } from './api.gateway';
import type {
  QuartoDTO,
  QuartoCreateDTO,
  QuartoUpdateDTO,
  QuartoListResponse,
  QuartoPageParams,
  QuartoStatsDTO,
  QuartoTipoOption,
  QuartoAlaOption,
} from './quarto.dto';

/**
 * Service class for managing Quartos (Rooms)
 * 
 * Role-based access:
 * - GET endpoints: ADMINISTRADOR, RECEPCIONISTA, AUDITOR
 * - POST/PUT/DELETE/PATCH: ADMINISTRADOR only
 * 
 * Endpoints:
 * - GET /api/quartos - List all rooms (paginated)
 * - GET /api/quartos/{uuid} - Get room by UUID
 * - GET /api/quartos/ativos - List active rooms
 * - GET /api/quartos/disponiveis - List available (not occupied) rooms
 * - GET /api/quartos/ala/{ala} - List rooms by wing/ala
 * - GET /api/quartos/paginated - Paginated list with filters
 * - GET /api/quartos/estatisticas - Room statistics
 * - POST /api/quartos - Create new room (Admin only)
 * - PUT /api/quartos/{uuid} - Update room (Admin only)
 * - PATCH /api/quartos/{uuid}/inativar - Inactivate room (Admin only)
 * - PATCH /api/quartos/{uuid}/ativar - Reactivate room (Admin only)
 * - PATCH /api/quartos/{uuid}/manutencao/ativar - Set room in maintenance (Admin only)
 * - PATCH /api/quartos/{uuid}/manutencao/desativar - Remove room from maintenance (Admin only)
 * - DELETE /api/quartos/{uuid} - Delete room (Admin only)
 */
class QuartoService {
  private readonly basePath = '/api/quartos';

  /**
   * List all rooms with pagination, sorting, and filtering
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA, AUDITOR
   */
  async listar(params?: QuartoPageParams): Promise<QuartoListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, String(v)));
        } else {
          queryParams.append(key, String(value));
        }
      });
    }

    const url = queryParams.toString()
      ? `${this.basePath}?${queryParams.toString()}`
      : this.basePath;

    const response = await api.get<QuartoListResponse>(url);
    return response.data;
  }

  /**
   * Get a single room by UUID
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA, AUDITOR
   */
  async buscarPorUuid(uuid: string): Promise<QuartoDTO> {
    const response = await api.get<QuartoDTO>(`${this.basePath}/${uuid}`);
    return response.data;
  }

  /**
   * List all active rooms
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA, AUDITOR
   */
  async listarAtivos(): Promise<QuartoDTO[]> {
    const response = await api.get<QuartoDTO[]>(`${this.basePath}/ativos`);
    return response.data;
  }

  /**
   * List all available (not occupied) rooms
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA, AUDITOR
   */
  async listarDisponiveis(): Promise<QuartoDTO[]> {
    const response = await api.get<QuartoDTO[]>(`${this.basePath}/disponiveis`);
    return response.data;
  }

  /**
   * List rooms by wing/ala
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA, AUDITOR
   */
  async listarPorAla(ala: string): Promise<QuartoDTO[]> {
    const response = await api.get<QuartoDTO[]>(`${this.basePath}/ala/${ala}`);
    return response.data;
  }

  /**
   * Get room statistics
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA, AUDITOR
   */
  async obterEstatisticas(): Promise<QuartoStatsDTO> {
    const response = await api.get<QuartoStatsDTO>(`${this.basePath}/estatisticas`);
    return response.data;
  }

  /**
   * Create a new room
   * Restricted to: ADMINISTRADOR only
   */
  async criar(data: QuartoCreateDTO): Promise<QuartoDTO> {
    const response = await api.post<QuartoDTO>(this.basePath, data);
    return response.data;
  }

  /**
   * Update an existing room
   * Restricted to: ADMINISTRADOR only
   */
  async atualizar(uuid: string, data: QuartoUpdateDTO): Promise<QuartoDTO> {
    const response = await api.put<QuartoDTO>(`${this.basePath}/${uuid}`, data);
    return response.data;
  }

  /**
   * Inactivate a room (soft delete)
   * Restricted to: ADMINISTRADOR only
   * Preferred method for removing rooms while preserving data
   */
  async inativar(uuid: string): Promise<QuartoDTO> {
    // Try PATCH first (REST standard for state change)
    try {
      const response = await api.patch<QuartoDTO>(`${this.basePath}/${uuid}/inativar`);
      return response.data;
    } catch (patchErr: any) {
      // Fallback to POST if backend doesn't support PATCH yet
      if (import.meta.env.DEV) {
        console.warn('[quartoService.inativar] PATCH failed, trying POST fallback');
      }
      const response = await api.post<QuartoDTO>(`${this.basePath}/${uuid}/inativar`);
      return response.data;
    }
  }

  /**
   * Reactivate an inactive room
   * Restricted to: ADMINISTRADOR only
   */
  async ativar(uuid: string): Promise<QuartoDTO> {
    try {
      const response = await api.patch<QuartoDTO>(`${this.basePath}/${uuid}/ativar`);
      return response.data;
    } catch (patchErr: any) {
      if (import.meta.env.DEV) {
        console.warn('[quartoService.ativar] PATCH failed, trying POST fallback');
      }
      const response = await api.post<QuartoDTO>(`${this.basePath}/${uuid}/ativar`);
      return response.data;
    }
  }

  /**
   * Toggle maintenance status of a room
   * Restricted to: ADMINISTRADOR only
   */
  async toggleManutencao(uuid: string, emManutencao: boolean): Promise<QuartoDTO> {
    try {
      const endpoint = emManutencao ? 'manutencao/ativar' : 'manutencao/desativar';
      const response = await api.patch<QuartoDTO>(`${this.basePath}/${uuid}/${endpoint}`);
      return response.data;
    } catch (patchErr: any) {
      if (import.meta.env.DEV) {
        console.warn('[quartoService.toggleManutencao] PATCH failed, trying POST fallback');
      }
      const endpoint = emManutencao ? 'manutencao/ativar' : 'manutencao/desativar';
      const response = await api.post<QuartoDTO>(`${this.basePath}/${uuid}/${endpoint}`);
      return response.data;
    }
  }

  /**
   * Delete a room (hard delete)
   * Restricted to: ADMINISTRADOR only
   * Use with caution - consider using inativar() for soft delete
   */
  async deletar(uuid: string): Promise<void> {
    await api.delete(`${this.basePath}/${uuid}`);
  }

  /**
   * Get available room types from backend
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA, AUDITOR
   */
  async listarTipos(): Promise<QuartoTipoOption[]> {
    const response = await api.get<QuartoTipoOption[]>(`${this.basePath}/tipos`);
    return response.data;
  }

  /**
   * Get available room wings/alas from backend
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA, AUDITOR
   */
  async listarAlas(): Promise<QuartoAlaOption[]> {
    const response = await api.get<QuartoAlaOption[]>(`${this.basePath}/alas`);
    return response.data;
  }
}

// Export singleton instance
export const quartoService = new QuartoService();
