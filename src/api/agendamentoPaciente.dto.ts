// Type definitions (using string literals instead of enums for erasableSyntaxOnly)
export type TipoAtendimento = 'PRIMEIRA_VEZ' | 'RETORNO' | 'EMERGENCIAL' | 'ROTINA' | 'TRIAGEM';
export type Prioridade = 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE';
export type StatusAgendamento = 'AGENDADO' | 'CONFIRMADO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'CANCELADO' | 'REMARCADO' | 'FALTOSO' | 'PACIENTE_NAO_COMPARECEU';

// Enum-like objects for code completion and validation
export const TipoAtendimento = {
  PRIMEIRA_VEZ: 'PRIMEIRA_VEZ' as const,
  RETORNO: 'RETORNO' as const,
  EMERGENCIAL: 'EMERGENCIAL' as const,
  ROTINA: 'ROTINA' as const,
  TRIAGEM: 'TRIAGEM' as const,
};

export const Prioridade = {
  BAIXA: 'BAIXA' as const,
  NORMAL: 'NORMAL' as const,
  ALTA: 'ALTA' as const,
  URGENTE: 'URGENTE' as const,
};

export const StatusAgendamento = {
  AGENDADO: 'AGENDADO' as const,
  CONFIRMADO: 'CONFIRMADO' as const,
  EM_ATENDIMENTO: 'EM_ATENDIMENTO' as const,
  CONCLUIDO: 'CONCLUIDO' as const,
  CANCELADO: 'CANCELADO' as const,
  REMARCADO: 'REMARCADO' as const,
  FALTOSO: 'FALTOSO' as const,
  PACIENTE_NAO_COMPARECEU: 'PACIENTE_NAO_COMPARECEU' as const,
};

// Request DTOs
export interface AgendamentoPacienteRequest {
  pacienteId: string | number;
  tipoServicoId: number;
  profissionalUsuarioId: string | number;
  dataHoraInicio: string; // ISO 8601 format
  dataHoraFim: string; // ISO 8601 format
  duracaoMinutos: number;
  hospedagemId?: number;
  tipoAtendimento?: TipoAtendimento;
  prioridade?: Prioridade;
  status?: StatusAgendamento;
  observacoes?: string;
  motivoCancelamento?: string;
  confirmadoPaciente?: boolean;
  confirmadoProfissional?: boolean;
}

// Response DTOs
export interface AgendamentoPacienteResponse {
  id: number;
  uuid: string;
  pacienteId: number;
  pacienteNome: string;
  tipoServicoId: number;
  tipoServicoNome: string;
  profissionalUsuarioId: number;
  profissionalNome: string;
  hospedagemId: number | null;
  quartoNome: string | null;
  dataHoraInicio: string; // ISO 8601
  dataHoraFim: string; // ISO 8601
  tipoAtendimento: TipoAtendimento | null;
  prioridade: Prioridade | null;
  status: StatusAgendamento;
  observacoes: string | null;
  motivoCancelamento: string | null;
  confirmadoPaciente: boolean;
  confirmadoProfissional: boolean;
  compareceu: boolean | null;
  horaChegada: string | null; // ISO 8601
  horaInicioAtendimento: string | null; // ISO 8601
  horaFimAtendimento: string | null; // ISO 8601
  agendamentoRemarcarId: number | null;
  geradoAutomaticamente: boolean;
  motivoGeracaoAutomatica: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// Conflict Check DTOs
export interface ConflictCheckParams {
  profissionalId: string | number;
  inicio: string; // ISO 8601
  fim: string; // ISO 8601
}

export interface ConflictDetails {
  tipo: 'AGENDAMENTO' | 'BLOQUEIO' | 'FORA_HORARIO';
  descricao: string;
  conflitanteInicio: string; // ISO 8601
  conflitanteFim: string; // ISO 8601
  profissionalNome: string;
}

export interface ConflictCheckResponse {
  temConflito: boolean;
  mensagem: string;
  details?: ConflictDetails;
}

// Eligible DTOs
export interface PacienteElegivelDTO {
  id: string | number; // Backend returns UUID string for patients, but numeric for others
  idNumerico?: number; // When backend provides numeric ID separately
  nome: string;
  cpf: string;
  quartoNome: string;
  hospedagemId: number;
}

export interface ProfissionalElegivelDTO {
  id: string | number; // Backend returns numeric for professionals, but may return UUID for others
  idNumerico?: number; // When backend provides numeric ID separately
  nome: string;
  email: string;
  tipo: 'MEDICO' | 'ENFERMEIRO' | 'DENTISTA' | 'NUTRICIONISTA' | 'FISIOTERAPEUTA';
}

// Professional Schedule Query Params
export interface ProfissionalAgendaParams {
  inicio: string; // ISO 8601
  fim: string; // ISO 8601
}

// Generic Message Response
export interface MessageResponse {
  success: boolean;
  message: string;
}

// Display Labels (for UI)
export const TipoAtendimentoLabels: Record<TipoAtendimento, string> = {
  PRIMEIRA_VEZ: 'Primeira Vez',
  RETORNO: 'Retorno',
  EMERGENCIAL: 'Emergencial',
  ROTINA: 'Rotina',
  TRIAGEM: 'Triagem',
};

export const PrioridadeLabels: Record<Prioridade, string> = {
  BAIXA: 'Baixa',
  NORMAL: 'Normal',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
};

export const StatusAgendamentoLabels: Record<StatusAgendamento, string> = {
  AGENDADO: 'Agendado',
  CONFIRMADO: 'Confirmado',
  EM_ATENDIMENTO: 'Em Atendimento',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
  REMARCADO: 'Remarcado',
  FALTOSO: 'Faltoso',
  PACIENTE_NAO_COMPARECEU: 'Paciente Não Compareceu',
};

// Color coding for status (for UI badges)
export const StatusAgendamentoColors: Record<StatusAgendamento, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  AGENDADO: 'info',
  CONFIRMADO: 'primary',
  EM_ATENDIMENTO: 'warning',
  CONCLUIDO: 'success',
  CANCELADO: 'error',
  REMARCADO: 'secondary',
  FALTOSO: 'error',
  PACIENTE_NAO_COMPARECEU: 'error',
};
