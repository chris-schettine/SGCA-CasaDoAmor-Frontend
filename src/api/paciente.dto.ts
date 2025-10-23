
export interface DadoPessoalInputDTO {
  nome: string;
  dataNascimento: string;
  cpf: string;
  rg: string;
  naturalidade: string;
  nomeMae?: string;
  profissao?: string;
  telefone: string;
}

export interface EnderecoInputDTO {
  logradouro: string;
  numero: number;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface RegistrarPacienteDTO {
  dadoPessoal: DadoPessoalInputDTO;
  endereco: EnderecoInputDTO;
}

export interface PacienteDTO {
  id: string;
  nome: string;
  cpf?: string;
  dataNascimento: string;
  naturalidade: string;
  nomeMae?: string;
  profissao?: string;
  telefone: string;
  email?: string;
  rg?: string;
  logradouro: string;
  numero: number;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface EditarDadoPessoalInputDTO {
  nome?: string;
  dataNascimento?: string;
  cpf?: string;
  rg?: string;
  naturalidade?: string;
  nomeMae?: string;
  profissao?: string;
  telefone?: string;
}

export interface EditarEnderecoInputDTO {
  logradouro?: string;
  numero?: number;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface EditarPacienteDTO {
  dadoPessoal?: EditarDadoPessoalInputDTO;
  endereco?: EditarEnderecoInputDTO;
}

export interface PaginatedResponseDTOPacienteDTO {
  nodes: PacienteDTO[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
}
