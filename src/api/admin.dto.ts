
export interface UpdateUserDTO {
  nome?: string;
  telefone?: string;
  email?: string;
  ativo?: boolean;
  tipo?: string;
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
