import { api } from './api.gateway';
import type {
  HospedagemDTO,
  HospedagemCreateDTO,
  HospedagemSaidaDTO,
  ActiveStayCheck,
  HospedagemPageParams,
  HospedagemListResponse,
  HospedagemStatsDTO,
} from './hospedagem.dto';

/**
 * Service class for managing Hospedagens (Patient Stays)
 * 
 * Role-based access:
 * - GET endpoints: ADMINISTRADOR, RECEPCIONISTA
 * - POST/PUT/DELETE: ADMINISTRADOR only
 * 
 * Endpoints:
 * - GET /api/hospedagens/paginated - Paginated list of stays
 * - GET /api/hospedagens/{uuid} - Get stay by UUID
 * - GET /api/hospedagens/ativas - List all active stays
 * - GET /api/hospedagens/paciente/{id} - Get patient stay history
 * - GET /api/hospedagens/paciente/{id}/ativa - Check if patient has active stay
 * - GET /api/hospedagens/quarto/{uuid} - Get room stay history
 * - GET /api/hospedagens/periodo - Filter stays by date range
 * - GET /api/hospedagens/previsao-vencida - List overdue stays
 * - POST /api/hospedagens - Register patient admission (Admin only)
 * - PUT /api/hospedagens/{uuid}/saida - Register patient exit (Admin only)
 * - PUT /api/hospedagens/{uuid}/transferir - Transfer patient to another room (Admin only)
 * - DELETE /api/hospedagens/{uuid} - Delete stay (Admin only)
 */
class HospedagemService {
  private readonly basePath = '/api/hospedagens';

  /**
   * List stays with pagination
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA
   */
  async listar(params?: HospedagemPageParams): Promise<HospedagemListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, String(v)));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const url = `${this.basePath}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<HospedagemListResponse>(url);
    return response.data;
  }

  /**
   * Get a single stay by UUID
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA
   */
  async buscarPorUuid(uuid: string): Promise<HospedagemDTO> {
    const response = await api.get<HospedagemDTO>(`${this.basePath}/${uuid}`);
    return response.data;
  }

  /**
   * List all active stays
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA
   */
  async listarAtivas(): Promise<HospedagemDTO[]> {
    const response = await api.get<HospedagemDTO[]>(`${this.basePath}/ativas`);
    return response.data;
  }

  /**
   * Get patient stay history
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA
   */
  async buscarHistoricoPaciente(cpf: string): Promise<HospedagemDTO[]> {
    const response = await api.get<HospedagemDTO[]>(`${this.basePath}/paciente/${cpf}`);
    return response.data;
  }

  /**
   * Check if patient has active stay
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA
   */
  async verificarHospedagemAtiva(cpf: string): Promise<ActiveStayCheck> {
    const response = await api.get<ActiveStayCheck>(`${this.basePath}/paciente/${cpf}/ativa`);
    return response.data;
  }

  /**
   * Get room stay history
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA
   */
  async buscarHistoricoQuarto(uuid: string): Promise<HospedagemDTO[]> {
    const response = await api.get<HospedagemDTO[]>(`${this.basePath}/quarto/${uuid}`);
    return response.data;
  }

  /**
   * Filter stays by date range
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA
   */
  async filtrarPorPeriodo(dataInicio: string, dataFim: string): Promise<HospedagemDTO[]> {
    const response = await api.get<HospedagemDTO[]>(`${this.basePath}/periodo`, {
      params: { dataInicio, dataFim },
    });
    return response.data;
  }

  /**
   * List stays with overdue exit dates
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA
   */
  async listarVencidas(): Promise<HospedagemDTO[]> {
    const response = await api.get<HospedagemDTO[]>(`${this.basePath}/previsao-vencida`);
    return response.data;
  }

  /**
   * Get aggregated hospedagens statistics for dashboard
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA
   */
  async obterEstatisticas(): Promise<HospedagemStatsDTO> {
    const response = await api.get<HospedagemStatsDTO>(`${this.basePath}/stats`);
    return response.data;
  }

  /**
   * Register patient admission
   * Restricted to: ADMINISTRADOR only
   */
  async criar(data: HospedagemCreateDTO): Promise<HospedagemDTO> {
    const response = await api.post<HospedagemDTO>(this.basePath, data);
    return response.data;
  }

  /**
   * Register patient exit
   * Restricted to: ADMINISTRADOR only
   */
  async registrarSaida(uuid: string, data: HospedagemSaidaDTO): Promise<HospedagemDTO> {
    const response = await api.put<HospedagemDTO>(`${this.basePath}/${uuid}/saida`, data);
    return response.data;
  }

  /**
   * Transfer patient to another room
   * Restricted to: ADMINISTRADOR only
   */
  async transferir(uuid: string, novoQuartoUuid: string): Promise<HospedagemDTO> {
    const response = await api.put<HospedagemDTO>(
      `${this.basePath}/${uuid}/transferir`,
      null,
      { params: { novoQuartoUuid } }
    );
    return response.data;
  }

  /**
   * Delete a stay (soft delete)
   * Restricted to: ADMINISTRADOR only
   */
  async deletar(uuid: string): Promise<void> {
    await api.delete(`${this.basePath}/${uuid}`);
  }
}

// Export singleton instance
export const hospedagemService = new HospedagemService();
