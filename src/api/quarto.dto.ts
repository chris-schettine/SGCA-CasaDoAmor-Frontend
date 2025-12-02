/**
 * DTOs for Quarto (Room) API
 * Endpoints: /api/quartos
 * 
 * Role access:
 * - GET endpoints: ADMINISTRADOR, RECEPCIONISTA, AUDITOR
 * - POST/PUT/DELETE/PATCH: ADMINISTRADOR only
 */

export interface QuartoTipoOption {
  valor: string;
  descricao: string;
}

export interface QuartoAlaOption {
  valor: string;
  descricao: string;
}

export interface QuartoDTO {
  uuid: string;
  nome: string;
  codigo: string;
  tipo: QuartoTipoOption;
  ala: QuartoAlaOption;
  andar: string;
  capacidadeTotal: number;
  capacidadeOcupada: number;
  vagasDisponiveis: number;
  ativo: boolean;
  emManutencao: boolean;
  permiteSexoOposto: boolean;
  observacoes?: string;
  createdAt?: string;
  createdByNome?: string;
  updatedAt?: string;
  updatedByNome?: string;
  // Manter compatibilidade com formato antigo
  created_at?: string;
  updated_at?: string;
}

export interface QuartoCreateDTO {
  nome: string;
  tipo: string;
  ala: string;
  andar: string;
  capacidadeTotal: number;
  ativo?: boolean;
  emManutencao?: boolean;
  permiteSexoOposto?: boolean;
  observacoes?: string;
}

export interface QuartoUpdateDTO {
  nome?: string;
  tipo?: string;
  ala?: string;
  andar?: string;
  capacidadeTotal?: number;
  ativo?: boolean;
  emManutencao?: boolean;
  permiteSexoOposto?: boolean;
  observacoes?: string;
}

export interface SortInfo {
  direction: string;
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
}

export interface PageInfo {
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  offset: number;
  sort: SortInfo[];
  unpaged: boolean;
}

export interface QuartoListResponse {
  totalPages: number;
  totalElements: number;
  pageable: PageInfo;
  first: boolean;
  last: boolean;
  size: number;
  content: QuartoDTO[];
  number: number;
  sort: SortInfo[];
  numberOfElements: number;
  empty: boolean;
}

export interface QuartoPageParams {
  page?: number;
  size?: number;
  sort?: string[];
  nome?: string;
  ala?: string;
  tipo?: string;
  ativo?: boolean;
}



export interface AlaStats {
  capacidadeTotal: number;
  ocupacaoTotal: number;
  vagasDisponiveis: number;
  percentualOcupacao: number;
  totalQuartos: number;
  quartosAtivos: number;
  quartosInativos: number;
  quartosEmManutencao: number;
  quartosDisponiveisAdmissao: number;
  quartosLotados: number;
  quartosVazios: number;
  quartosParcialmenteOcupados: number;
}

export interface QuartoStatsDTO {
  capacidadeTotal: number;
  ocupacaoTotal: number;
  vagasDisponiveis: number;
  percentualOcupacao: number;
  totalQuartos: number;
  quartosAtivos: number;
  quartosInativos: number;
  quartosEmManutencao: number;
  quartosDisponiveisAdmissao: number;
  quartosIndividuais: number;
  quartosCompartilhados: number;
  quartosIsolamento: number;
  quartosLotados: number;
  quartosVazios: number;
  quartosParcialmenteOcupados: number;
  quartosPermitemSexoOposto: number;
  alaFeminina: AlaStats;
  alaMasculina: AlaStats;
  alaMista: AlaStats;
}
