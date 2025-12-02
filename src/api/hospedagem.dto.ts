/**
 * DTOs for Hospedagem (Patient Stays) API
 * Endpoints: /api/hospedagens
 * 
 * Role access:
 * - GET endpoints: ADMINISTRADOR, RECEPCIONISTA
 * - POST/PUT/DELETE: ADMINISTRADOR only
 */

export type StatusHospedagem = 'ATIVA' | 'ENCERRADA' | 'TRANSFERIDA';

export interface HospedagemDTO {
  uuid: string;
  pacienteId: string;
  pacienteNome: string;
  pacienteCpf: string;
  quartoUuid: string;
  quartoNome: string;
  quartoCodigo: string;
  dataEntrada: string;                // ISO date
  horaEntrada: string | null;         // ISO time
  dataSaidaPrevista: string | null;
  dataSaida: string | null;
  horaSaida: string | null;
  status: StatusHospedagem;
  motivoSaida: string | null;
  observacoesEntrada: string | null;
  observacoesSaida: string | null;
  observacoesGerais: string | null;
  createdAt: string;
  createdByNome: string;
  updatedAt: string;
  updatedByNome: string;
}

export interface HospedagemCreateDTO {
  pacienteId: string;                 // Required (Patient UUID)
  quartoUuid?: string;                // Optional (if null, auto-assigned)
  dataEntrada: string;                // Required, ISO date (YYYY-MM-DD)
  horaEntrada?: string;               // Optional, ISO time (HH:mm:ss)
  dataSaidaPrevista?: string;         // Optional, ISO date
  observacoesEntrada?: string;        // Optional, max 1000 chars
  observacoesGerais?: string;         // Optional, max 1000 chars
}

export interface HospedagemSaidaDTO {
  dataSaida: string;                  // Required, ISO date
  horaSaida?: string;                 // Optional, ISO time
  motivoSaida: string;                // Required, max 255 chars
  observacoesSaida?: string;          // Optional, max 1000 chars
}

export interface ActiveStayCheck {
  possuiHospedagemAtiva: boolean;
  quartoAtual?: string;
  hospedagem?: HospedagemDTO;
}

export interface HospedagemPageParams {
  page?: number;
  size?: number;
  sort?: string;
  pacienteNome?: string;
  quartoNome?: string;
  ala?: string;
  status?: StatusHospedagem;
  dataInicio?: string;
  dataFim?: string;
}

export interface HospedagemListResponse {
  content: HospedagemDTO[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

export interface HospedagemSimpleDTO {
  uuid: string;
  nomePaciente: string;
  nomeQuarto: string;
  dataEntrada: string;
  dataSaida: string | null;
  status: string;
}

export interface QuartoOcupacaoDTO {
  uuid: string;
  nome: string;
  ala: string;
  capacidadeTotal: number;
  capacidadeOcupada: number;
  taxaOcupacao: number;
}

export interface OcupacaoPorAla {
  ala: string;
  totalLeitos: number;
  leitosOcupados: number;
  leitosVagos: number;
  taxaOcupacao: number;
}

export interface HospedagemPorMes {
  mes: number;
  ano: number;
  nomeMes: string;
  total: number;
  totalEntradas: number;
  totalSaidas: number;
}

export interface HospedagemStatsDTO {
  totalHospedagensAtivas: number;
  totalHospedagensMesAtual: number;
  totalHospedagensMesAnterior: number;
  totalHospedagensEncerradasUltimos30Dias: number;
  totalHospedagensPreviaoVencida: number;
  mediaDiasPermanencia: number;
  tempoMedioPermanencia: string;

  totalQuartos: number;
  totalQuartosAtivos: number;
  totalQuartosEmManutencao: number;
  totalLeitosDisponiveis: number;
  totalLeitosOcupados: number;
  totalLeitosVagos: number;
  taxaOcupacaoGlobal: number;
  ocupacaoPorAla: Record<string, OcupacaoPorAla>;

  totalPacientes: number;
  totalPacientesAtivos: number;
  totalPacientesHospedados: number;
  totalNovosPacientesMesAtual: number;

  totalAgendamentosHoje: number;
  totalAgendamentosSemana: number;
  totalAgendamentosPendentes: number;

  previsaoSaidasHoje: number;
  previsaoSaidasProximos7Dias: number;
  previsaoSaidasProximos30Dias: number;

  ultimasEntradas: HospedagemSimpleDTO[];
  ultimasSaidas: HospedagemSimpleDTO[];
  quartosComMaiorOcupacao: QuartoOcupacaoDTO[];

  crescimentoMesAtual: number;
  hospedagensPorMes: HospedagemPorMes[];
}
