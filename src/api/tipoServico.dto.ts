export type CategoriaTipoServico =
  | 'MEDICO'
  | 'ODONTOLOGICO'
  | 'ENFERMAGEM'
  | 'NUTRICAO'
  | 'FISIOTERAPIA'
  | 'PSICOLOGIA'
  | 'ASSISTENCIA_SOCIAL'
  | 'PEDAGOGIA';

export interface TipoServicoDTO {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  categoria: CategoriaTipoServico;
  duracaoMinutos: number;
  requerProfissional: boolean;
  permiteAcompanhante: boolean;
  ativo: boolean;
  observacoes: string | null;
}
