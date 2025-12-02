// Re-export shared enums and labels
export {
  TipoAtendimento,
  Prioridade,
  StatusAgendamento,
  TipoAtendimentoLabels,
  PrioridadeLabels,
  StatusAgendamentoLabels,
  StatusAgendamentoColors,
} from './agendamentoPaciente.dto';

// Re-export conflict check types (same for both)
export type {
  ConflictCheckParams,
  ConflictDetails,
  ConflictCheckResponse,
  ProfissionalAgendaParams,
  MessageResponse,
} from './agendamentoPaciente.dto';

// Request DTOs
export interface AgendamentoAcompanhanteRequest {
  acompanhanteId: string | number;
  tipoServicoId: number;
  profissionalUsuarioId: string | number;
  dataHoraInicio: string; // ISO 8601 format
  dataHoraFim: string; // ISO 8601 format
  duracaoMinutos: number;
  pacienteVinculadoId?: string | number;
  tipoAtendimento?: string; // TipoAtendimento
  prioridade?: string; // Prioridade
  status?: string; // StatusAgendamento
  observacoes?: string;
  motivoCancelamento?: string;
  confirmadoAcompanhante?: boolean;
  confirmadoProfissional?: boolean;
}

// Response DTOs
export interface AgendamentoAcompanhanteResponse {
  id: number;
  uuid: string;
  acompanhanteId: number;
  acompanhanteNome: string;
  tipoServicoId: number;
  tipoServicoNome: string;
  profissionalUsuarioId: number;
  profissionalNome: string;
  pacienteVinculadoId: number | null;
  pacienteVinculadoNome: string | null;
  quartoNome: string | null;
  dataHoraInicio: string; // ISO 8601
  dataHoraFim: string; // ISO 8601
  tipoAtendimento: string | null; // TipoAtendimento
  prioridade: string | null; // Prioridade
  status: string; // StatusAgendamento
  observacoes: string | null;
  motivoCancelamento: string | null;
  confirmadoAcompanhante: boolean;
  confirmadoProfissional: boolean;
  compareceu: boolean | null;
  horaChegada: string | null; // ISO 8601
  horaInicioAtendimento: string | null; // ISO 8601
  horaFimAtendimento: string | null; // ISO 8601
  agendamentoRemarcarId: number | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// Eligible DTOs
export interface AcompanhanteElegivelDTO {
  id: number; // Numeric ID from backend
  idNumerico?: number; // Optional: for future dual-ID support
  nome: string;
  cpf: string;
  pacienteId: string;
  pacienteNome: string;
  quartoNome: string;
  hospedagemId: number;
}

export type { ProfissionalElegivelDTO } from './agendamentoPaciente.dto';
