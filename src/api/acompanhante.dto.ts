// DTOs compartilhados
import type { DadoPessoalDTO, EnderecoDTO } from './paciente.dto';

// Enums
export type ParentescoEnum = 
  | 'PAI'
  | 'MAE'
  | 'IRMAO'
  | 'IRMA'
  | 'FILHO'
  | 'FILHA'
  | 'CONJUGE'
  | 'AMIGO'
  | 'OUTRO';

// DTO para cadastro de acompanhante
export interface RegistrarAcompanhanteDTO {
  dadoPessoal: Omit<DadoPessoalDTO, 'id' | 'email' | 'imageUrl'>;
  endereco: Omit<EnderecoDTO, 'id'>;
  parentesco: ParentescoEnum;
  pacienteId: string;
  podeAjudarNaCozinha: boolean;
}

// DTO para edição de acompanhante
export interface EditarAcompanhanteDTO {
  podeAjudarNaCozinha: boolean;
  dadoPessoal: Omit<DadoPessoalDTO, 'id' | 'email' | 'imageUrl'>;
  endereco: Omit<EnderecoDTO, 'id'>;
  parentesco: ParentescoEnum;
  ativo: boolean;
}

// DTO de resposta de acompanhante
export interface AcompanhanteDTO {
  id: string;
  podeAjudarNaCozinha: boolean;
  dadoPessoal: DadoPessoalDTO;
  endereco: EnderecoDTO;
  parentesco: ParentescoEnum;
  ativo: boolean;
  pacienteNome: string;
}

// DTO de resposta paginada
export interface ListaAcompanhantesDTO {
  nodes: AcompanhanteDTO[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
}
