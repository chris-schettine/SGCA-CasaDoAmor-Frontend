import { api } from './api.gateway';
import type { TipoServicoDTO } from './tipoServico.dto';

class TipoServicoService {
  private readonly basePath = '/api/tipos-servico';

  /**
   * Lista todos os tipos de serviço ativos
   */
  async listar(): Promise<TipoServicoDTO[]> {
    const response = await api.get<TipoServicoDTO[]>(this.basePath);
    return response.data;
  }

  /**
   * Busca um tipo de serviço por ID
   */
  async obterPorId(id: number): Promise<TipoServicoDTO> {
    const response = await api.get<TipoServicoDTO>(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Lista tipos de serviço filtrados por profissional
   * (retorna apenas serviços compatíveis com a especialidade do profissional)
   */
  async listarPorProfissional(profissionalId: string | number): Promise<TipoServicoDTO[]> {
    const response = await api.get<TipoServicoDTO[]>(
      `${this.basePath}/por-profissional/${profissionalId}`
    );
    return response.data;
  }
}

export const tipoServicoService = new TipoServicoService();
