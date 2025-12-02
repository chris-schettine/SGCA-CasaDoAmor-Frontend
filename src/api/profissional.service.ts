import { api } from './api.gateway';
import type {
  ProfissionalDTO,
  ProfissionalCreateDTO,
  ProfissionalUpdateDTO,
  ProfissionalListResponse,
  ProfissionalPageParams,
  CategoriaDTO,
  TipoVinculoDTO,
} from './profissional.dto';

/**
 * Service class for managing Profissionais (Healthcare Professionals)
 * Endpoints:
 * - GET /api/profissionais - List all professionals (paginated)
 * - GET /api/profissionais/{uuid} - Get professional by UUID
 * - POST /api/profissionais - Create new professional (Admin only)
 * - PUT /api/profissionais/{uuid} - Update professional (Admin only)
 * - DELETE /api/profissionais/{uuid} - Delete professional (Admin only)
 * - POST /api/profissionais/{uuid}/inativar - Deactivate professional (Admin only)
 */
class ProfissionalService {
  private readonly basePath = '/api/profissionais';

  private normalizeProfissional(item: any): ProfissionalDTO {
    return {
      uuid: item.uuid,
      nome: item.nome ?? item.nome_completo ?? '',
      cpf: item.cpf ?? '',
      telefone: item.telefone ?? '',
      email: item.email ?? '',
      area_atuacao: item.areaAtuacao ?? item.area_atuacao ?? '',
      especialidade: item.especialidade ?? '',
      cargo_funcao: item.cargo ?? item.cargo_funcao ?? '',
      departamento: item.departamento ?? '',
      // Support both camelCase and snake_case variants returned by backend
      numero_registro: item.numeroRegistro ?? item.registro ?? item.numero_registro ?? '',
      numeroRegistro: item.numeroRegistro ?? item.registro ?? item.numero_registro ?? '',
      uf_registro: item.ufRegistro ?? item.uf_registro ?? '',
      ufRegistro: item.ufRegistro ?? item.uf_registro ?? '',
      data_admissao: item.dataAdmissao ?? item.data_admissao ?? '',
      carga_horaria: item.carga_horaria ?? item.cargaHoraria ?? 0,
      disponibilidade: item.disponibilidade ?? item.disponibilidade_json ?? item.disponibilidadeRaw ?? undefined,
      endereco_id: item.enderecoId ?? item.endereco_id ?? undefined,
      endereco: item.endereco ?? undefined,
      ativo: typeof item.ativo === 'boolean' ? item.ativo : (item.active ?? true),
      observacoes: item.observacoes ?? item.observacao ?? null,
      created_at: item.createdAt ?? item.created_at ?? undefined,
      created_by: item.createdBy ?? item.created_by ?? undefined,
      // Map tipo vinculo object as well as id variants
      tipoVinculo: item.tipoVinculo ?? item.tipo_vinculo ?? undefined,
      tipo_vinculo: item.tipoVinculo ?? item.tipo_vinculo ?? undefined,
      tipo_vinculo_id: item.tipoVinculoId ?? item.tipo_vinculo_id ?? (item.tipoVinculo?.id ? String(item.tipoVinculo.id) : '') ?? '',
      // Preserve categoria object
      categoria: item.categoria ?? undefined,
      categoria_id: item.categoria_id ?? (item.categoria?.id ?? item.categoria?.valor) ?? '',
    } as ProfissionalDTO;
  }

  async ativar(uuid: string): Promise<ProfissionalDTO> {
    // Backend doesn't support POST /ativar or PATCH.
    // Workaround: fetch current data and send back ALL fields with ativo=true
    // This prevents nullifying fields because we're explicitly sending everything back.
    try {
      const current = await this.buscarPorUuid(uuid);
      
      // Build complete payload with all current values
      const payload: any = {
        nome: current.nome || '',
        cpf: current.cpf || '',
        email: current.email || '',
        telefone: current.telefone || '',
        area_atuacao: current.area_atuacao || '',
        cargo_funcao: current.cargo_funcao || '',
        numero_registro: current.numero_registro || '',
        uf_registro: current.uf_registro || '',
        ativo: true,
      };

      // Add optional fields only if they exist
      if (current.especialidade) payload.especialidade = current.especialidade;
      if (current.departamento) payload.departamento = current.departamento;
      if (current.data_admissao) payload.data_admissao = current.data_admissao;
      if (current.carga_horaria !== undefined && current.carga_horaria !== null) {
        payload.carga_horaria = current.carga_horaria;
      }
      if (current.observacoes) payload.observacoes = current.observacoes;
      if (current.endereco_id) payload.endereco_id = current.endereco_id;
      
      // Handle disponibilidade
      if (current.disponibilidade) {
        if (typeof current.disponibilidade === 'string') {
          payload.disponibilidade = current.disponibilidade;
        } else {
          try {
            payload.disponibilidade = JSON.stringify(current.disponibilidade);
          } catch (e) {
            // skip
          }
        }
      }

      // Handle tipo_vinculo_id
      if (current.tipo_vinculo_id) {
        payload.tipo_vinculo_id = current.tipo_vinculo_id;
      } else if (current.tipoVinculo?.id) {
        payload.tipo_vinculo_id = String(current.tipoVinculo.id);
      }

      // Handle categoria
      if (current.categoria) {
        if (typeof current.categoria === 'object' && current.categoria !== null) {
          const cat: any = current.categoria;
          payload.categoria = cat.valor || cat.id || cat.descricao;
        } else {
          payload.categoria = current.categoria;
        }
      } else if (current.categoria_id) {
        if (typeof current.categoria_id === 'object' && current.categoria_id !== null) {
          const cid: any = current.categoria_id;
          payload.categoria = cid.valor || cid.id || cid.descricao;
        } else {
          payload.categoria = current.categoria_id;
        }
      }

      if (import.meta.env.DEV) {
        console.log('[profissionalService.ativar] Sending full payload with ativo=true:', payload);
      }

      const response = await api.put<ProfissionalDTO>(`${this.basePath}/${uuid}`, payload);
      return response.data;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('[profissionalService.ativar] Failed:', error?.response?.data || error);
      }
      throw error;
    }
  }

  /**
   * List all professionals with pagination, sorting, and filtering
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA, AUDITOR
   */
  async listar(params?: ProfissionalPageParams): Promise<ProfissionalListResponse> {
    // Build query params generically so the backend can support searches by
    // different fields (nome_completo, cpf, categoria, etc.). This keeps the
    // client tolerant to backend param names and allows passing the same
    // `searchText` to multiple possible filter keys.
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

    if (import.meta.env.DEV) {
      // Log the outgoing request URL for debugging
      console.log('[profissionalService.listar] GET', url, 'params:', params);
    }

    const response = await api.get(url);
    const data: any = response.data;

    if (import.meta.env.DEV) {
      const itemCount = Array.isArray(data) ? data.length : (data?.content?.length ?? 0);
      console.log('[profissionalService.listar] response received:', itemCount, 'items');
      if (data?.content) {
        console.log('[profissionalService.listar] full response:', data);
        console.log('[profissionalService.listar] content items:', data.content);
      }
    }

    // Support two possible backend shapes:
    // 1) Paginated response with `content`, `totalElements`, etc.
    // 2) Plain array of professionals (legacy or simplified endpoint).
    if (Array.isArray(data)) {
      // Backend returned a plain array. Normalize each item to ProfissionalDTO
      const content: ProfissionalDTO[] = (data as any[]).map((item: any) => ({
        uuid: item.uuid,
        // API may return `nome` while frontend expects `nome_completo`
        nome: item.nome ?? item.nome_completo ?? '',
        // API might not provide CPF or registro; set empty defaults
        cpf: item.cpf ?? '',
        telefone: item.telefone ?? '',
        email: item.email ?? '',
        // Map camelCase areaAtuacao to snake_case area_atuacao
        area_atuacao: item.areaAtuacao ?? item.area_atuacao ?? '',
        especialidade: item.especialidade ?? '',
        // Map cargo -> cargo_funcao
        cargo_funcao: item.cargo ?? item.cargo_funcao ?? '',
        departamento: item.departamento ?? '',
        numero_registro: item.registro ?? item.numero_registro ?? '',
        uf_registro: item.uf_registro ?? '',
        data_admissao: item.dataAdmissao ?? item.data_admissao ?? '',
        carga_horaria: item.carga_horaria ?? 0,
        disponibilidade: item.disponibilidade ?? undefined,
        endereco_id: item.enderecoId ?? item.endereco_id ?? undefined,
        endereco: item.endereco ?? undefined,
        ativo: typeof item.ativo === 'boolean' ? item.ativo : (item.active ?? true),
        observacoes: item.observacoes ?? item.observacao ?? null,
        created_at: item.createdAt ?? item.created_at ?? undefined,
        created_by: item.createdBy ?? item.created_by ?? undefined,
        tipo_vinculo_id: item.tipoVinculoId ?? item.tipo_vinculo_id ?? '',
        categoria_id: item.categoria ?? item.categoria_id ?? '',
      } as ProfissionalDTO));
      const mapped = content;
      if (import.meta.env.DEV) console.log('[profissionalService.listar] normalized content:', mapped);
      return {
        content: mapped,
        pageable: { offset: 0, sort: [], pageNumber: params?.page ?? 0, pageSize: params?.size ?? content.length, paged: true, unpaged: false },
        totalPages: 1,
        totalElements: content.length,
        last: true,
        size: params?.size ?? content.length,
        number: params?.page ?? 0,
        sort: [],
        numberOfElements: content.length,
        first: true,
        empty: content.length === 0,
      } as ProfissionalListResponse;
    }

    // Assume paginated shape
    return data as ProfissionalListResponse;
  }

  /**
   * Get a single professional by UUID
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA, AUDITOR
   */
  async buscarPorUuid(uuid: string): Promise<ProfissionalDTO> {
    const response = await api.get<any>(`${this.basePath}/${uuid}`);
    if (import.meta.env.DEV) console.log('[profissionalService.buscarPorUuid] response:', response.data);
    const normalized = this.normalizeProfissional(response.data);
    return normalized;
  }

  /**
   * Create a new professional
   * Restricted to: ADMINISTRADOR only
   * LGPD consent must be registered separately using consentimentoService
   */
  async criar(data: ProfissionalCreateDTO): Promise<ProfissionalDTO> {
    const response = await api.post<ProfissionalDTO>(this.basePath, data);
    return response.data;
  }

  /**
   * Update an existing professional
   * Restricted to: ADMINISTRADOR only
   */
  async atualizar(uuid: string, data: ProfissionalUpdateDTO): Promise<ProfissionalDTO> {
    const response = await api.put<ProfissionalDTO>(`${this.basePath}/${uuid}`, data);
    return response.data;
  }

  /**
   * Delete a professional (hard delete)
   * Restricted to: ADMINISTRADOR only
   * Use with caution - consider using inativar() for soft delete
   */
  async deletar(uuid: string): Promise<void> {
    await api.delete(`${this.basePath}/${uuid}`);
  }

  /**
   * Deactivate a professional (soft delete)
   * Restricted to: ADMINISTRADOR only
   * Preferred method for removing professionals while preserving data
   */
  async inativar(uuid: string): Promise<ProfissionalDTO> {
    const response = await api.post<ProfissionalDTO>(`${this.basePath}/${uuid}/inativar`);
    return response.data;
  }

  /**
   * Activate a professional (undo soft-delete)
   * Restricted to: ADMINISTRADOR only
   */
  

  /**
   * List all professional categories
   */
  async listarCategorias(): Promise<CategoriaDTO[]> {
    const response = await api.get(`${this.basePath}/categorias`);
    const payload: any = response.data;
    // Support multiple backend shapes: plain array, { content: [...] } or { data: [...] }
    if (Array.isArray(payload)) return payload as CategoriaDTO[];
    if (payload && Array.isArray(payload.content)) return payload.content as CategoriaDTO[];
    if (payload && Array.isArray(payload.data)) return payload.data as CategoriaDTO[];
    // fallback: return empty list
    return [] as CategoriaDTO[];
  }

  /**
   * List all tipos de vínculo
   */
  async listarTiposVinculo(): Promise<TipoVinculoDTO[]> {
    const response = await api.get(`${this.basePath}/tipos-vinculo`);
    const payload: any = response.data;
    if (Array.isArray(payload)) return payload as TipoVinculoDTO[];
    if (payload && Array.isArray(payload.content)) return payload.content as TipoVinculoDTO[];
    if (payload && Array.isArray(payload.data)) return payload.data as TipoVinculoDTO[];
    return [] as TipoVinculoDTO[];
  }

  /**
   * Fetch dashboard statistics for professionals.
   * Endpoint: GET /api/profissionais/dashboard/stats
   * Accessible by: ADMINISTRADOR, RECEPCIONISTA
   */
  async obterEstatisticasDashboard(): Promise<import('./profissional.dto').ProfissionalDashboardStats> {
    const response = await api.get(`${this.basePath}/dashboard/stats`);
    return response.data;
  }
}

// Export singleton instance
export const profissionalService = new ProfissionalService();
