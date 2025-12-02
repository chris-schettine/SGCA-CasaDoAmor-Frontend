import { api } from './api.gateway';
import type {
  AgendamentoAcompanhanteRequest,
  AgendamentoAcompanhanteResponse,
  ConflictCheckParams,
  ConflictCheckResponse,
  ProfissionalAgendaParams,
  MessageResponse,
  AcompanhanteElegivelDTO,
  ProfissionalElegivelDTO,
} from './agendamentoAcompanhante.dto';

const BASE_PATH = '/api/agendamentos/acompanhantes';

/**
 * Create a new companion appointment
 * @param data - Appointment data
 * @returns Created appointment
 */
export async function criar(
  data: AgendamentoAcompanhanteRequest
): Promise<AgendamentoAcompanhanteResponse> {
  const response = await api.post<AgendamentoAcompanhanteResponse>(BASE_PATH, data);
  return response.data;
}

/**
 * Get companion appointment by UUID
 * @param uuid - Appointment UUID
 * @returns Appointment details
 */
export async function obterPorUuid(
  uuid: string
): Promise<AgendamentoAcompanhanteResponse> {
  const response = await api.get<AgendamentoAcompanhanteResponse>(`${BASE_PATH}/${uuid}`);
  return response.data;
}

/**
 * List all companion appointments with pagination
 * @param page - Page number (default: 0)
 * @param size - Page size (default: 20)
 * @returns List of appointments
 */
export async function listar(page: number = 0, size: number = 20): Promise<AgendamentoAcompanhanteResponse[]> {
  const response = await api.get<AgendamentoAcompanhanteResponse[]>(BASE_PATH, {
    params: { page, size }
  });
  return response.data;
}

/**
 * List all appointments for a specific companion
 * @param acompanhanteId - Companion ID
 * @returns List of appointments
 */
export async function listarPorAcompanhante(
  acompanhanteId: string
): Promise<AgendamentoAcompanhanteResponse[]> {
  const response = await api.get<AgendamentoAcompanhanteResponse[]>(
    `${BASE_PATH}/acompanhante/${acompanhanteId}`
  );
  return response.data;
}

/**
 * List appointments for a professional within a date range
 * @param profissionalId - Professional user ID
 * @param params - Date range parameters
 * @returns List of appointments
 */
export async function listarPorProfissional(
  profissionalId: number,
  params: ProfissionalAgendaParams
): Promise<AgendamentoAcompanhanteResponse[]> {
  const response = await api.get<AgendamentoAcompanhanteResponse[]>(
    `${BASE_PATH}/profissional/${profissionalId}`,
    { params }
  );
  return response.data;
}

/**
 * Check for scheduling conflicts
 * @param params - Conflict check parameters
 * @returns Conflict check result
 */
export async function verificarConflito(
  params: ConflictCheckParams
): Promise<ConflictCheckResponse> {
  const response = await api.post<ConflictCheckResponse>(
    `${BASE_PATH}/verificar-conflito`,
    null,
    { params }
  );
  return response.data;
}

/**
 * Confirm appointment (by companion or professional)
 * @param uuid - Appointment UUID
 * @param confirmadoPeloAcompanhante - True if confirmed by companion, false if by professional
 * @returns Updated appointment
 */
export async function confirmar(
  uuid: string,
  confirmadoPeloAcompanhante: boolean = true
): Promise<AgendamentoAcompanhanteResponse> {
  const response = await api.put<AgendamentoAcompanhanteResponse>(
    `${BASE_PATH}/${uuid}/confirmar`,
    null,
    { params: { confirmadoPeloAcompanhante } }
  );
  return response.data;
}

/**
 * Cancel appointment
 * @param uuid - Appointment UUID
 * @param motivo - Cancellation reason
 * @returns Success message
 */
export async function cancelar(
  uuid: string,
  motivo: string
): Promise<MessageResponse> {
  const response = await api.delete<MessageResponse>(`${BASE_PATH}/${uuid}`, {
    params: { motivo },
  });
  return response.data;
}

/**
 * List eligible companions (companions with active hospedagem)
 * @returns List of eligible companions
 */
export async function listarAcompanhantesElegiveis(): Promise<AcompanhanteElegivelDTO[]> {
  const response = await api.get<AcompanhanteElegivelDTO[]>(
    `${BASE_PATH}/acompanhantes-elegiveis`
  );
  return response.data;
}

/**
 * List eligible professionals (healthcare providers only, excludes admin roles)
 * @returns List of eligible professionals
 */
export async function listarProfissionaisElegiveis(): Promise<ProfissionalElegivelDTO[]> {
  const response = await api.get<ProfissionalElegivelDTO[]>(
    `${BASE_PATH}/profissionais-elegiveis`
  );
  return response.data;
}

// Export all functions as a service object (optional pattern)
const agendamentoAcompanhanteService = {
  criar,
  obterPorUuid,
  listar,
  listarPorAcompanhante,
  listarPorProfissional,
  verificarConflito,
  confirmar,
  cancelar,
  listarAcompanhantesElegiveis,
  listarProfissionaisElegiveis,
};

export default agendamentoAcompanhanteService;
