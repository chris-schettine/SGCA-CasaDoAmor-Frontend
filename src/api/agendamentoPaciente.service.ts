import { api } from './api.gateway';
import type {
  AgendamentoPacienteRequest,
  AgendamentoPacienteResponse,
  ConflictCheckParams,
  ConflictCheckResponse,
  ProfissionalAgendaParams,
  MessageResponse,
  PacienteElegivelDTO,
} from './agendamentoPaciente.dto';

const BASE_PATH = '/api/agendamentos/pacientes';

/**
 * Create a new patient appointment
 * @param data - Appointment data
 * @returns Created appointment
 */
export async function criar(
  data: AgendamentoPacienteRequest
): Promise<AgendamentoPacienteResponse> {
  console.log('🔍 Service criar - dados recebidos:', data);
  console.log('🔍 Service criar - duracaoMinutos:', data.duracaoMinutos, '| Type:', typeof data.duracaoMinutos);
  const response = await api.post<AgendamentoPacienteResponse>(BASE_PATH, data);
  return response.data;
}

/**
 * Get patient appointment by UUID
 * @param uuid - Appointment UUID
 * @returns Appointment details
 */
export async function obterPorUuid(
  uuid: string
): Promise<AgendamentoPacienteResponse> {
  const response = await api.get<AgendamentoPacienteResponse>(`${BASE_PATH}/${uuid}`);
  return response.data;
}

/**
 * List all appointments for a specific patient
 * @param pacienteId - Patient ID
 * @returns List of appointments
 */
export async function listarPorPaciente(
  pacienteId: string
): Promise<AgendamentoPacienteResponse[]> {
  const response = await api.get<AgendamentoPacienteResponse[]>(
    `${BASE_PATH}/paciente/${pacienteId}`
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
): Promise<AgendamentoPacienteResponse[]> {
  const response = await api.get<AgendamentoPacienteResponse[]>(
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
 * Confirm appointment (by patient or professional)
 * @param uuid - Appointment UUID
 * @param confirmadoPeloPaciente - True if confirmed by patient, false if by professional
 * @returns Updated appointment
 */
export async function confirmar(
  uuid: string,
  confirmadoPeloPaciente: boolean = true
): Promise<AgendamentoPacienteResponse> {
  const response = await api.put<AgendamentoPacienteResponse>(
    `${BASE_PATH}/${uuid}/confirmar`,
    null,
    { params: { confirmadoPeloPaciente } }
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
 * List all patient appointments with pagination
 * @param page - Page number (default: 0)
 * @param size - Page size (default: 20)
 * @returns List of appointments
 */
export async function listar(page: number = 0, size: number = 20): Promise<AgendamentoPacienteResponse[]> {
  const response = await api.get<AgendamentoPacienteResponse[]>(BASE_PATH, {
    params: { page, size }
  });
  return response.data;
}

/**
 * List eligible patients (patients with active hospedagem)
 * @returns List of eligible patients
 */
export async function listarPacientesElegiveis(): Promise<PacienteElegivelDTO[]> {
  const response = await api.get<PacienteElegivelDTO[]>(
    `${BASE_PATH}/pacientes-elegiveis`
  );
  return response.data;
}

/**
 * List eligible professionals (healthcare providers only, excludes admin roles)
 * @returns List of eligible professionals
 */
export async function listarProfissionaisElegiveis(): Promise<import('./agendamentoAcompanhante.dto').ProfissionalElegivelDTO[]> {
  const response = await api.get<import('./agendamentoAcompanhante.dto').ProfissionalElegivelDTO[]>(
    `${BASE_PATH}/profissionais-elegiveis`
  );
  return response.data;
}

// Export all functions as a service object (optional pattern)
const agendamentoPacienteService = {
  criar,
  obterPorUuid,
  listar,
  listarPorPaciente,
  listarPorProfissional,
  verificarConflito,
  confirmar,
  cancelar,
  listarPacientesElegiveis,
  listarProfissionaisElegiveis,
};

export default agendamentoPacienteService;
