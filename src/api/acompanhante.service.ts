import type { 
  AcompanhanteDTO, 
  ListaAcompanhantesDTO, 
  RegistrarAcompanhanteDTO,
  EditarAcompanhanteDTO
} from './acompanhante.dto';
import { api } from './api.gateway';

/**
 * Serviço para gerenciar acompanhantes
 */
export const acompanhanteService = {
  /**
   * Lista acompanhantes com paginação e filtro opcional
   * @param limit - Limite de registros por página (padrão: 10)
   * @param offset - Deslocamento para paginação (padrão: 0)
   * @param searchText - Texto para filtrar acompanhantes (opcional)
   * @returns Lista paginada de acompanhantes
   */
  listarAcompanhantes: async (
    limit: number = 10,
    offset: number = 0,
    searchText?: string
  ): Promise<ListaAcompanhantesDTO> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (searchText) {
      params.append('searchText', searchText);
    }

    const response = await api.get<ListaAcompanhantesDTO>(
      `/acompanhantes/?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Registra um novo acompanhante
   * @param dto - Dados do acompanhante a ser registrado
   * @returns Acompanhante criado
   */
  registrarAcompanhante: async (
    dto: RegistrarAcompanhanteDTO
  ): Promise<AcompanhanteDTO> => {
    const response = await api.post<AcompanhanteDTO>(
      '/acompanhantes/',
      dto
    );
    return response.data;
  },

  /**
   * Edita um acompanhante existente
   * @param id - ID do acompanhante
   * @param dto - Dados atualizados do acompanhante
   * @returns Acompanhante atualizado
   */
  editarAcompanhante: async (
    id: string,
    dto: EditarAcompanhanteDTO
  ): Promise<AcompanhanteDTO> => {
    const response = await api.patch<AcompanhanteDTO>(
      `/acompanhantes/${id}`,
      dto
    );
    return response.data;
  },

  /**
   * Busca acompanhantes de um paciente específico
   * @param pacienteId - ID do paciente
   * @returns Lista de acompanhantes do paciente
   */
  buscarAcompanhantesPorPaciente: async (
    pacienteId: string
  ): Promise<AcompanhanteDTO[]> => {
    console.log('[acompanhanteService] Buscando acompanhantes para pacienteId:', pacienteId);
    const response = await api.get<ListaAcompanhantesDTO>(
      `/acompanhantes/?pacienteId=${pacienteId}&limit=100`
    );
    console.log('[acompanhanteService] Acompanhantes encontrados:', response.data.nodes.length);
    return response.data.nodes;
  },
};
