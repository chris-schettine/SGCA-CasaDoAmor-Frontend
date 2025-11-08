
export interface UpdateUserDTO {
  nome?: string;
  telefone?: string;
  email?: string;
  ativo?: boolean;
  tipo?: string;
  cpf?: string | null;
  dadosPessoais?: DadosPessoaisDTO | null;
  endereco?: EnderecoDTO | null;
  registroProfissional?: RegistroProfissionalDTO | null;
}

export interface DadosPessoaisDTO {
  id?: number | null;
  dataNascimento?: string | null; // ISO date
  sexo?: string | null;
  genero?: string | null;
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
  dadosPessoais?: DadosPessoaisDTO | null;
  endereco?: EnderecoDTO | null;
  registroProfissional?: RegistroProfissionalDTO | null;
}

export interface RegistroProfissionalDTO {
  tipoProfissional?: string | null;
  numeroRegistro?: string | null;
  rqe?: string | null;
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
  registro?: string;
  uf?: string;
  rqe?: string;
  registroProfissional?: RegistroProfissionalDTO;
  // CNES removed from the client model
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

// --- Auditoria DTOs ---
export interface PerfilAuditDTO {
  id: number;
  nome: string;
  descricao?: string | null;
  criadoPor?: string | null;
  criadoEm?: string | null;
  atualizadoPor?: string | null;
  atualizadoEm?: string | null;
  permissoes?: PermissaoDTO[] | null;
  totalUsuarios?: number;
  usuarios?: any[] | null;
}

export interface UsuarioSimplesDTO {
  id: number;
  nome: string;
  email?: string;
  tipo?: string;
  ativo?: boolean;
  bloqueado?: boolean;
}

export interface TentativaLoginDTO {
  id: number;
  cpf?: string;
  ipOrigem?: string;
  userAgent?: string;
  dataTentativa?: string; // ISO
  sucesso: boolean;
  motivoFalha?: string | null;
  bloqueado?: boolean;
  usuario?: UsuarioSimplesDTO | null;
}

export interface RelatorioLoginsDTO {
  total: number;
  sucessos: number;
  falhas: number;
  tentativas: TentativaLoginDTO[];
}

export interface AuditPerfisResponseDTO {
  perfis: PerfilAuditDTO[];
  relatorioLogins: RelatorioLoginsDTO;
}
