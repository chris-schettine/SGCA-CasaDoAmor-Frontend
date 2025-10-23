
export interface UpdateUserDTO {
  nome?: string;
  telefone?: string;
  email?: string;
  ativo?: boolean;
  tipo?: string;
  cpf?: string | null;
  dadosPessoais?: DadosPessoaisDTO | null;
  endereco?: EnderecoDTO | null;
}

export interface DadosPessoaisDTO {
  id?: number | null;
  dataNascimento?: string | null; // ISO date
  sexo?: string | null;
  genero?: string | null;
  rg?: string | null;
  orgaoEmissor?: string | null;
  naturalidade?: string | null;
  estadoCivil?: string | null;
  nomeMae?: string | null;
  nomePai?: string | null;
  profissao?: string | null;
}

export interface EnderecoDTO {
  id?: number | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
}

export interface CreatePerfilDTO {
  nome: string;
  descricao?: string;
  permissoesIds?: number[];
}

export interface CreatePermissaoDTO {
  nome: string;
  descricao?: string;
}

export interface CreateUserDTO {
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  tipo: string;
  perfisIds?: number[];
}

export interface AtribuirRolesDTO {
  perfisIds: number[];
}

export interface Pageable {
  page?: number;
  size?: number;
  sort?: string[];
  searchText?: string;
}

export interface PageUserResponseDTO {
  totalElements: number;
  totalPages: number;
  size: number;
  content: UserResponseDTO[];
  number: number;
  sort: SortObject[];
  pageable: PageableObject;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface UserResponseDTO {
  id: number;
  uuid: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  tipo: string;
  ativo: boolean;
  emailVerificado: boolean;
  ultimoLoginEm: string;
  criadoEm: string;
  atualizadoEm: string;
  // Optional professional/address fields (may be absent depending on backend)
  conselho?: string;
  registro?: string;
  uf?: string;
  cbo?: string;
  rqe?: string;
  cnes?: string;
  cep?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  numero?: string;
  complemento?: string;
  perfis: PerfilDTO[];
}

export interface SortObject {
  direction: string;
  nullHandling: string;
  ascending: boolean;
  property: string;
  ignoreCase: boolean;
}

export interface PageableObject {
  offset: number;
  sort: SortObject[];
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
}

export interface PerfilDTO {
  id: number;
  nome: string;
  descricao: string;
  permissoes: PermissaoDTO[];
  totalPermissoes: number;
}

export interface PermissaoDTO {
  id: number;
  nome: string;
  descricao: string;
}
