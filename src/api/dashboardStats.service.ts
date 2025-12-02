import { api } from './api.gateway';

// ==================== Interfaces ====================

export interface ParentescoEstatisticaDTO {
  parentesco: string;
  quantidade: number;
  percentualTotal: number;
}

export interface CidadeEstatisticaDTO {
  cidade: string;
  estado: string;
  totalPacientes: number;
  totalAcompanhantes: number;
  percentualTotal: number;
}

export interface RegistroMensalDTO {
  ano: number;
  mes: number;
  mesNome: string;
  totalRegistros: number;
}

export interface EstatisticasPacienteAcompanhanteDTO {
  // General Pacientes Statistics
  totalPacientes: number;
  pacientesAtivos: number;
  pacientesInativos: number;
  pacientesRegistradosHoje: number;
  pacientesRegistradosSemana: number;
  pacientesRegistradosMes: number;
  pacientesRegistradosAno: number;

  // Pacientes by Status
  pacientesEmTratamento: number;
  pacientesCurados: number;
  pacientesEmObservacao: number;
  pacientesFalecidos: number;

  // General Acompanhantes Statistics
  totalAcompanhantes: number;
  acompanhantesAtivos: number;
  acompanhantesInativos: number;
  acompanhantesRegistradosHoje: number;
  acompanhantesRegistradosSemana: number;
  acompanhantesRegistradosMes: number;
  acompanhantesRegistradosAno: number;

  // Relationship Statistics
  mediaAcompanhantesPorPaciente: number;
  pacientesSemAcompanhante: number;
  pacientesComUmAcompanhante: number;
  pacientesComMultiplosAcompanhantes: number;
  maxAcompanhantesPorPaciente: number;

  // Parentesco Distribution
  acompanhantesPorParentesco: Record<string, number>;
  parentescoMaisComum: ParentescoEstatisticaDTO | null;

  // Clinical Data
  pacientesComDadosClinicos: number;
  pacientesSemDadosClinicos: number;
  pacientesComSonda: number;
  pacientesComCurativo: number;
  pacientesPorTipoSonda: Record<string, number>;

  // Hospital Information
  pacientesComInformacaoHospitalar: number;
  pacientesSemInformacaoHospitalar: number;

  // Kitchen Assistance
  acompanhantesPodemAjudarCozinha: number;
  acompanhantesNaoPodemAjudarCozinha: number;
  percentualAjudamCozinha: number;

  // Emergency Contacts
  pacientesComContatoEmergencia: number;
  pacientesSemContatoEmergencia: number;
  mediaContatosEmergenciaPorPaciente: number;

  // Geographic Distribution
  pacientesPorEstado: Record<string, number>;
  pacientesPorCidade: Record<string, number>;
  acompanhantesPorEstado: Record<string, number>;
  acompanhantesPorCidade: Record<string, number>;

  // Top Cities Rankings
  topCidadesComMaisPacientes: CidadeEstatisticaDTO[];
  topCidadesComMaisAcompanhantes: CidadeEstatisticaDTO[];

  // Rates and Percentages
  taxaPacientesAtivos: number;
  taxaAcompanhantesAtivos: number;
  taxaPacientesComAcompanhante: number;
  taxaPacientesComDadosClinicos: number;

  // Time-based Trends (Last 12 Months)
  registrosPacientesPorMes: RegistroMensalDTO[];
  registrosAcompanhantesPorMes: RegistroMensalDTO[];

  // Metadata
  dataHoraConsulta: string;
  periodoAnalisado: string;
}

// ==================== Service ====================

export const dashboardStatsService = {
  /**
   * Busca estatísticas completas de pacientes e acompanhantes
   * @returns Promise com todas as estatísticas do dashboard
   */
  getDashboardStatistics: async (): Promise<EstatisticasPacienteAcompanhanteDTO> => {
    const response = await api.get<EstatisticasPacienteAcompanhanteDTO>(
      'api/pacientes/estatisticas/dashboard'
    );
    return response.data;
  },
};
