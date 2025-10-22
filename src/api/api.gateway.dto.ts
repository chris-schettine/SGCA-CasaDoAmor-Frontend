export interface PessoaFisicaDTO {
  id?: number;
  nome: string;
  dataNascimento: string;
  cpf: string;
  rg: string;
  naturalidade: string;
  profissao: string;
  telefone: string;
  endereco: EnderecoDTO;
}

export interface EnderecoDTO {
  rua: string;
  numero: string;
  bairro: string;
  cep: string;
}
