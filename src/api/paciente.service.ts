
import { api } from './api.gateway';
import type {
  PaginatedResponseDTOPacienteDTO,
  RegistrarPacienteDTO,
  EditarPacienteDTO,
  PacienteDTO,
  DadoClinicoInputDTO,
  DadoClinicoDTO,
} from './paciente.dto';

class PacienteService {
  async listarPacientes(
    limit: number = 10,
    offset: number = 0,
    searchText?: string,
  ): Promise<PaginatedResponseDTOPacienteDTO> {
    const response = await api.get('/pacientes/', {
      params: { limit, offset, searchText },
    });
    return response.data;
  }

  // Nota: não há endpoint GET /pacientes/{id} disponível no backend.

  async registrarPaciente(data: RegistrarPacienteDTO): Promise<PacienteDTO> {
    const response = await api.post('/pacientes/', data);
    return response.data;
  }

  async editarPaciente(id: string, data: EditarPacienteDTO): Promise<PacienteDTO> {
    const response = await api.patch(`/pacientes/${id}`, data);
    return response.data;
  }

  async atualizarDadosClinicos(
    dadoClinicoId: string,
    pacienteId: string,
    data: DadoClinicoInputDTO
  ): Promise<DadoClinicoDTO> {
    const response = await api.post(`/dados-clinicos/${dadoClinicoId}/pacientes/${pacienteId}`, data);
    return response.data;
  }
}

export const pacienteService = new PacienteService();
