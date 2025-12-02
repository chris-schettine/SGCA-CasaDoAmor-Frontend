/**
 * DTOs para Profissionais
 */

export interface CategoriaDTO {
  id: string;
  nome: string;
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TipoVinculoDTO {
  id: string;
  nome: string;
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardCategoriaStats {
  categoria: string;
  label: string;
  count: number;
}

export interface DashboardTipoVinculoStats {
  codigo: string;
  nome: string;
  count: number;
}

export interface ProfissionalDashboardStats {
  totalProfissionaisAtivos: number;
  totalProfissionaisInativos: number;
  porCategoria: DashboardCategoriaStats[];
  porTipoVinculo: DashboardTipoVinculoStats[];
  admitidosUltimos30Dias: number;
  comEnderecoCadastrado: number;
  semEnderecoCadastrado: number;
  topAreasAtuacao: Record<string, number>;
}

export interface EnderecoDTO {
  id?: string;
  logradouro: string;
  bairro: string;
  numero?: number;
  cidade: string;
  estado: string;
  cep?: string;
  complemento?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProfissionalDTO {
  id?: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  categoria_id: string;
  categoria?: { valor?: string; descricao?: string; id?: string };
  area_atuacao: string;
  especialidade: string;
  numero_registro: string;
  uf_registro: string;
  data_admissao: string;
  carga_horaria: number;
  cargo_funcao: string;
  departamento: string;
  disponibilidade?: Record<string, string[]>;
  endereco_id?: string;
  endereco?: EnderecoDTO;
  ativo: boolean;
  observacoes?: string;
  created_at?: string;
  created_by?: string;
  tipo_vinculo_id: string;
  uuid?: string;

  // CamelCase aliases returned by some backend endpoints — optional
  areaAtuacao?: string;
  cargo?: string;
  cargaHoraria?: number;
  numeroRegistro?: string;
  ufRegistro?: string;
  dataAdmissao?: string;
  tipoVinculo?: {
    id?: string | number;
    valor?: string;
    descricao?: string;
  } | undefined;
  tipoVinculoId?: string | number;
  // Some backend endpoints return address fields at the root level
  cep?: string;
  uf?: string;
}

export interface ProfissionalCreateDTO {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  categoria_id: string;
  area_atuacao: string;
  especialidade: string;
  numero_registro: string;
  uf_registro: string;
  data_admissao: string;
  carga_horaria: number;
  cargo_funcao: string;
  departamento: string;
  disponibilidade?: Record<string, string[]>;
  endereco: EnderecoDTO;
  ativo?: boolean;
  observacoes?: string;
  tipo_vinculo_id: string;
}

export interface ProfissionalUpdateDTO {
  nome?: string;
  telefone?: string;
  email?: string;
  categoria_id?: string;
  area_atuacao?: string;
  especialidade?: string;
  numero_registro?: string;
  uf_registro?: string;
  data_admissao?: string;
  carga_horaria?: number;
  cargo_funcao?: string;
  departamento?: string;
  disponibilidade?: Record<string, string[]>;
  endereco_id?: string;
  ativo?: boolean;
  observacoes?: string;
  tipo_vinculo_id?: string;
}

export interface ProfissionalListResponse {
  content: ProfissionalDTO[];
  pageable: PageableObject;
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: SortObject[];
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface PageableObject {
  offset: number;
  sort: SortObject[];
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
}

export interface SortObject {
  direction: string;
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
}

export interface ProfissionalPageParams {
  page?: number;
  size?: number;
  sort?: string[];
  nome?: string;
  cpf?: string;
  categoria?: string;
  especialidade?: string;
  ativo?: boolean;
}
