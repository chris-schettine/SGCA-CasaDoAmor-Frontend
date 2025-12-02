/**
 * @fileoverview Type definitions for Agendamentos Statistics API
 * @module api/agendamentoEstatisticas.dto
 * 
 * Provides TypeScript types for the comprehensive statistics endpoint that aggregates
 * appointment data from both patient and companion appointments.
 */

/**
 * Professional statistics within appointments context
 */
export interface ProfissionalEstatistica {
  /** Professional's user ID */
  profissionalId: number;
  
  /** Professional's full name */
  profissionalNome: string;
  
  /** Specialty/Type (MEDICO, ENFERMEIRO, NUTRICIONISTA, DENTISTA, etc.) */
  especialidade: string;
  
  /** Total appointments assigned to this professional */
  totalAgendamentos: number;
  
  /** Successfully completed appointments */
  agendamentosConcluidos: number;
  
  /** Completion rate as percentage (0-100) */
  taxaConclusao: number;
}

/**
 * Service statistics showing most requested services
 */
export interface ServicoEstatistica {
  /** Service type ID */
  servicoId: number;
  
  /** Service name */
  servicoNome: string;
  
  /** Service category */
  categoria: string;
  
  /** Total times this service was requested */
  totalAgendamentos: number;
  
  /** Percentage of total appointments */
  percentualTotal: number;
}

/**
 * Distribution of appointments by day of week
 */
export interface AgendamentosPorDiaSemana {
  'segunda-feira': number;
  'terça-feira': number;
  'quarta-feira': number;
  'quinta-feira': number;
  'sexta-feira': number;
  'sábado': number;
  'domingo': number;
}

/**
 * Distribution of appointments by hour of day (0-23)
 */
export type AgendamentosPorHora = {
  [hour: string]: number; // Hour as string key (0-23)
};

/**
 * Complete statistics response from /api/agendamentos/estatisticas endpoint
 * 
 * Aggregates data from both patient (`agendamentos_pacientes`) and 
 * companion (`agendamentos_acompanhantes`) appointments to provide
 * comprehensive scheduling analytics.
 */
export interface EstatisticasAgendamentoDTO {
  // ===== GENERAL STATISTICS =====
  /** Total active appointments (not soft-deleted) */
  totalAgendamentosAtivos: number;
  
  /** Appointments scheduled for today */
  totalAgendamentosHoje: number;
  
  /** Appointments this week (Monday-Sunday) */
  totalAgendamentosSemana: number;
  
  /** Appointments this month */
  totalAgendamentosMes: number;
  
  /** Appointments this year */
  totalAgendamentosAno: number;
  
  // ===== STATISTICS BY STATUS =====
  /** Status: AGENDADO - Created, awaiting confirmation */
  agendamentosAgendados: number;
  
  /** Status: CONFIRMADO - Confirmed by at least one party */
  agendamentosConfirmados: number;
  
  /** Status: EM_ATENDIMENTO - Currently in progress */
  agendamentosEmAtendimento: number;
  
  /** Status: CONCLUIDO - Successfully completed */
  agendamentosConcluidos: number;
  
  /** Status: CANCELADO - Cancelled with reason */
  agendamentosCancelados: number;
  
  /** Status: PACIENTE_NAO_COMPARECEU - No-show */
  agendamentosNaoCompareceram: number;
  
  // ===== STATISTICS BY TYPE =====
  /** Patient appointments count */
  agendamentosPacientes: number;
  
  /** Companion appointments count */
  agendamentosAcompanhantes: number;
  
  /** Auto-generated appointments (e.g., triagem on admission) */
  agendamentosAutomaticos: number;
  
  // ===== STATISTICS BY PRIORITY =====
  /** Priority: URGENTE */
  agendamentosUrgentes: number;
  
  /** Priority: ALTA */
  agendamentosAltaPrioridade: number;
  
  /** Priority: NORMAL */
  agendamentosNormalPrioridade: number;
  
  /** Priority: BAIXA */
  agendamentosBaixaPrioridade: number;
  
  // ===== STATISTICS BY APPOINTMENT TYPE =====
  /** Type: PRIMEIRA_VEZ - First-time appointment */
  agendamentosPrimeiraVez: number;
  
  /** Type: RETORNO - Follow-up appointment */
  agendamentosRetorno: number;
  
  /** Type: EMERGENCIAL - Emergency care */
  agendamentosEmergenciais: number;
  
  /** Type: ROTINA - Routine care */
  agendamentosRotina: number;
  
  /** Type: TRIAGEM - Screening/triage */
  agendamentosTriagem: number;
  
  // ===== CONFIRMATIONS =====
  /** Not confirmed by either party */
  agendamentosPendentesConfirmacao: number;
  
  /** Confirmed by patient or companion only */
  agendamentosConfirmadosPaciente: number;
  
  /** Confirmed by professional only */
  agendamentosConfirmadosProfissional: number;
  
  /** Confirmed by both parties (ideal state) */
  agendamentosConfirmadosAmbos: number;
  
  // ===== TOP PROFESSIONALS =====
  /** Top 10 professionals by total appointments */
  topProfissionaisPorAgendamentos: ProfissionalEstatistica[];
  
  /** Top 10 professionals by completed appointments */
  topProfissionaisPorConcluidos: ProfissionalEstatistica[];
  
  // ===== TOP SERVICES =====
  /** Top 10 most requested services */
  topServicosMaisSolicitados: ServicoEstatistica[];
  
  // ===== DISTRIBUTION BY DAY OF WEEK =====
  /** Appointments grouped by day of week (Portuguese) */
  agendamentosPorDiaSemana: AgendamentosPorDiaSemana;
  
  // ===== DISTRIBUTION BY HOUR =====
  /** Appointments grouped by hour (0-23) */
  agendamentosPorHora: AgendamentosPorHora;
  
  // ===== ATTENDANCE RATES =====
  /** Attendance rate percentage (0-100) */
  taxaComparecimento: number;
  
  /** No-show rate percentage (0-100) */
  taxaNaoComparecimento: number;
  
  /** Cancellation rate percentage (0-100) */
  taxaCancelamento: number;
  
  // ===== AVERAGE TIME =====
  /** Average appointment duration in minutes */
  duracaoMediaMinutos: number;
  
  /** Average waiting time in minutes (reserved for future use) */
  tempoMedioEsperaMinutos: number;
  
  // ===== METADATA =====
  /** Timestamp when statistics were calculated (ISO 8601) */
  dataHoraConsulta: string;
  
  /** Analysis period description (e.g., "Geral") */
  periodoAnalisado: string;
}

/**
 * Human-readable labels for displaying statistics
 */
export const EstatisticasLabels = {
  // General
  totalAgendamentosAtivos: 'Total de Agendamentos Ativos',
  totalAgendamentosHoje: 'Agendamentos Hoje',
  totalAgendamentosSemana: 'Agendamentos na Semana',
  totalAgendamentosMes: 'Agendamentos no Mês',
  totalAgendamentosAno: 'Agendamentos no Ano',
  
  // Status
  agendamentosAgendados: 'Agendados',
  agendamentosConfirmados: 'Confirmados',
  agendamentosEmAtendimento: 'Em Atendimento',
  agendamentosConcluidos: 'Concluídos',
  agendamentosCancelados: 'Cancelados',
  agendamentosNaoCompareceram: 'Não Compareceram',
  
  // Type
  agendamentosPacientes: 'Pacientes',
  agendamentosAcompanhantes: 'Acompanhantes',
  agendamentosAutomaticos: 'Automáticos',
  
  // Priority
  agendamentosUrgentes: 'Urgentes',
  agendamentosAltaPrioridade: 'Alta Prioridade',
  agendamentosNormalPrioridade: 'Normal',
  agendamentosBaixaPrioridade: 'Baixa Prioridade',
  
  // Appointment Type
  agendamentosPrimeiraVez: 'Primeira Vez',
  agendamentosRetorno: 'Retorno',
  agendamentosEmergenciais: 'Emergenciais',
  agendamentosRotina: 'Rotina',
  agendamentosTriagem: 'Triagem',
  
  // Confirmations
  agendamentosPendentesConfirmacao: 'Pendentes de Confirmação',
  agendamentosConfirmadosPaciente: 'Confirmados pelo Paciente',
  agendamentosConfirmadosProfissional: 'Confirmados pelo Profissional',
  agendamentosConfirmadosAmbos: 'Confirmados por Ambos',
  
  // Rates
  taxaComparecimento: 'Taxa de Comparecimento',
  taxaNaoComparecimento: 'Taxa de Não Comparecimento',
  taxaCancelamento: 'Taxa de Cancelamento',
  
  // Averages
  duracaoMediaMinutos: 'Duração Média',
  tempoMedioEsperaMinutos: 'Tempo Médio de Espera',
} as const;

/**
 * Day of week labels in Portuguese
 */
export const DiaSemanaLabels: Record<keyof AgendamentosPorDiaSemana, string> = {
  'segunda-feira': 'Segunda',
  'terça-feira': 'Terça',
  'quarta-feira': 'Quarta',
  'quinta-feira': 'Quinta',
  'sexta-feira': 'Sexta',
  'sábado': 'Sábado',
  'domingo': 'Domingo',
};
