
export interface DadoPessoalInputDTO {
  nome: string;
  dataNascimento: string;
  cpf: string;
  rg: string;
  naturalidade: string;
  nomeMae?: string;
  profissao?: string;
  telefone: string;
  estadoCivil?: 'SOLTEIRO' | 'CASADO' | 'DIVORCIADO' | 'VIUVO' | 'SEPARADO' | 'UNIAO_ESTAVEL';
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

export type TratamentoType = 'RADIOTERAPIA' | 'QUIMIOTERAPIA' | 'AMBOS' | 'OUTRO';

export interface DadoClinicoInputDTO {
  diagnostico?: string;
  tratamento?: TratamentoType;
  tratamentoOutroDescricao?: string | null;
  condicaoChegada?: 'AMBULANCIA' | 'MACA' | 'CADEIRA_RODAS' | 'NENHUMA';
  usaSonda: boolean;
  tipoSondaNasal?: 'SNG' | 'SNE' | 'OROGASTRICA' | null;
  tipoSondaCirurgica?: 'G' | 'J' | 'GJ' | null;
  tipoSondaVesical?: 'NAO' | 'FOLEY' | 'CISTOSTOMIA' | 'OUTRA' | null;
  sondaOutraDescricao?: string | null;
  usaCurativo: boolean;
  usaOxigenoterapia: boolean;
  tipoSanguineo: 'A_POSITIVO' | 'A_NEGATIVO' | 'B_POSITIVO' | 'B_NEGATIVO' | 'AB_POSITIVO' | 'AB_NEGATIVO' | 'O_POSITIVO' | 'O_NEGATIVO';
}

export interface ContatoEmergenciaDTO {
  nome: string;
  email: string;
  telefone: string;
}

export interface InformacaoHospitalarDTO {
  nomeHospitalReferencia?: string | null;
  medicoResponsavel?: string | null;
  setorAla?: string | null;
  dataInternacao?: string | null;
}

export interface DadoSocialInputDTO {
  rendaFamiliar?: number | null;
  composicaoFamiliar?: string | null;
  situacaoMoradia?: string | null;
  necessidadesEspeciais?: string | null;
}

export interface RegistrarPacienteDTO {
  dadoPessoal: DadoPessoalInputDTO;
  // backend espera um array de dados clínicos
  dadoClinico: DadoClinicoInputDTO; // backend espera um único dado clínico no create
  endereco: EnderecoInputDTO;
  email: string; // backend exige email no create
  contatosDeEmergencia?: ContatoEmergenciaDTO[];
  informacaoHospitalar?: InformacaoHospitalarDTO;
  dadoSocial?: DadoSocialInputDTO;
}

export interface DadoPessoalDTO {
  id?: string;
  nome: string;
  nomeMae?: string | null;
  dataNascimento: string; // ISO date
  cpf?: string | null;
  rg?: string | null;
  naturalidade?: string | null;
  profissao?: string | null;
  telefone?: string | null;
  estadoCivil?: 'SOLTEIRO' | 'CASADO' | 'DIVORCIADO' | 'VIUVO' | 'SEPARADO' | 'UNIAO_ESTAVEL' | null;
}

export interface EnderecoDTO {
  id?: string;
  logradouro: string;
  numero: number;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface DadoClinicoDTO {
  id?: string;
  diagnostico?: string | null;
  tratamento?: TratamentoType | null;
  tratamentoOutroDescricao?: string | null;
  condicaoChegada?: 'AMBULANCIA' | 'MACA' | 'CADEIRA_RODAS' | 'NENHUMA' | null;
  usaSonda: boolean;
  tipoSondaNasal?: 'SNG' | 'SNE' | 'OROGASTRICA' | null;
  tipoSondaCirurgica?: 'G' | 'J' | 'GJ' | null;
  tipoSondaVesical?: 'NAO' | 'FOLEY' | 'CISTOSTOMIA' | 'OUTRA' | null;
  sondaOutraDescricao?: string | null;
  usaCurativo: boolean;
  usaOxigenoterapia: boolean;
  tipoSanguineo: 'A_POSITIVO' | 'A_NEGATIVO' | 'B_POSITIVO' | 'B_NEGATIVO' | 'AB_POSITIVO' | 'AB_NEGATIVO' | 'O_POSITIVO' | 'O_NEGATIVO';
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface DadoSocialDTO {
  rendaFamiliar?: number | null;
  composicaoFamiliar?: string | null;
  situacaoMoradia?: string | null;
  necessidadesEspeciais?: string | null;
}

export interface PacienteDTO {
  id: string;
  dadoPessoal: DadoPessoalDTO;
  endereco: EnderecoDTO;
  email?: string | null;
  imageUrl?: string | null;
  createdAt?: string | null;
  contatosDeEmergencia?: ContatoEmergenciaDTO[];
  dadosClinicos?: DadoClinicoDTO[];
  dadoSocial?: DadoSocialDTO | null;
  informacaoHospitalar?: InformacaoHospitalarDTO | null;
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
  estadoCivil?: 'SOLTEIRO' | 'CASADO' | 'DIVORCIADO' | 'VIUVO' | 'SEPARADO' | 'UNIAO_ESTAVEL';
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
  dadoSocial?: DadoSocialInputDTO;
  informacaoHospitalar?: InformacaoHospitalarDTO;
  email?: string | null;
}

// Nota: edições de contatos e dados clínicos usam endpoints específicos no backend.

export interface PaginatedResponseDTOPacienteDTO {
  nodes: PacienteDTO[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
}
