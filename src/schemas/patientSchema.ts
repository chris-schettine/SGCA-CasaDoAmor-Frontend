import { z } from 'zod';
import {
  cpfSchema,
  dateSchema,
  rgSchema,
  phoneSchema,
  cepSchema,
  requiredString,
} from './commonValidation';

export const patientSchema = z.object({
  nomeCompletoPaciente: requiredString.max(255, "Nome muito longo."),
  cpfPaciente: cpfSchema,
  dataNascimento: dateSchema,
  idade: z.string().trim(),
  naturalidade: requiredString,
  rg: rgSchema,
  nomeMae: requiredString,
  profissao: requiredString,
  telefone: phoneSchema,
  cep: cepSchema,
  endereco: requiredString,
  bairro: requiredString,
  cidade: requiredString,
  estado: requiredString,
  numero: requiredString,
  complemento: z.string().trim().optional(),
  email: z.string().email("E-mail inválido").min(1, "O e-mail é obrigatório").transform(s => s.trim()),
  estadoCivil: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.enum(["SOLTEIRO", "CASADO", "DIVORCIADO", "VIUVO", "SEPARADO", "UNIAO_ESTAVEL"], {
      errorMap: () => ({ message: "Selecione um estado civil válido." }),
    }).optional(),
  ),
  tratamento: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.enum(["RADIOTERAPIA","QUIMIOTERAPIA","AMBOS","OUTRO"], {
      errorMap: () => ({ message: "Selecione um tipo de tratamento válido." }),
    }).optional(),
  ),
  tratamentoOutroDescricao: z.string().trim().optional(),
  diagnostico: requiredString,
  condicaoChegada: z.enum(["de_ambulancia", "maca", "cadeira_rodas", "nenhum"], {
    errorMap: () => ({ message: "Selecione a condição de chegada." }),
  }),
  usoCurativo: z.enum(["sim", "nao"], {
    errorMap: () => ({ message: "Selecione sobre o uso de curativo." }),
  }),
  usoOxigenoterapia: z.enum(["sim", "nao"], {
    errorMap: () => ({ message: "Selecione sobre o uso de oxigenoterapia." }),
  }),
  usoSonda: z.enum(["sim", "nao"], {
    errorMap: () => ({ message: "Selecione sobre o uso de sonda." }),
  }),
  seForOutra: z.string().trim().optional().transform(e => e === "" ? undefined : e),
  // Campos clínicos adicionais
  tipoSondaNasal: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.enum(["SNG","SNE","OROGASTRICA"], {
      errorMap: () => ({ message: "Selecione um tipo de sonda nasal válido." }),
    }).optional(),
  ),
  tipoSondaCirurgica: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.enum(["G","J","GJ"], {
      errorMap: () => ({ message: "Selecione um tipo de sonda cirúrgica válido." }),
    }).optional(),
  ),
  tipoSondaVesical: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.enum(["NAO","FOLEY","CISTOSTOMIA","OUTRA"], {
      errorMap: () => ({ message: "Selecione um tipo de sonda vesical válido." }),
    }).optional(),
  ),
  tipoSanguineo: z.enum(["A_POSITIVO","A_NEGATIVO","B_POSITIVO","B_NEGATIVO","AB_POSITIVO","AB_NEGATIVO","O_POSITIVO","O_NEGATIVO"], {
    errorMap: () => ({ message: "Selecione o tipo sanguíneo do paciente." }),
  }),
  // Contatos de emergência — array de objetos (opcional), mas quando presentes cada campo é obrigatório
  contatosDeEmergencia: z.array(z.object({
    nome: requiredString,
    email: z.string().email("E-mail inválido").min(1, "O e-mail do contato é obrigatório"),
    telefone: phoneSchema,
  })).optional(),
  // Informação hospitalar
  informacaoHospitalar: z.object({
    nomeHospitalReferencia: z.string().trim().optional(),
    medicoResponsavel: z.string().trim().optional(),
    setorAla: z.string().trim().optional(),
    dataInternacao: dateSchema.optional(),
  }).optional(),
  // Dado social
  dadoSocial: z.object({
    rendaFamiliar: z.number().nonnegative().optional(),
    composicaoFamiliar: z.string().trim().optional(),
    situacaoMoradia: z.string().trim().optional(),
    necessidadesEspeciais: z.string().trim().optional(),
  }).optional(),
}).superRefine((data, ctx) => {

  if (data.usoSonda === 'nao') {
    data.tipoSondaNasal = undefined;
    data.tipoSondaCirurgica = undefined;
    data.tipoSondaVesical = undefined;
  }

  // Validação condicional para tratamento OUTRO
  if (data.tratamento === 'OUTRO' && (!data.tratamentoOutroDescricao || data.tratamentoOutroDescricao.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Descreva o tratamento quando 'OUTRO' for selecionado.",
      path: ['tratamentoOutroDescricao'],
    });
  }

  // Validação condicional para descrição de sonda quando tipo vesical é OUTRA
  if (data.tipoSondaVesical === 'OUTRA' && (!data.seForOutra || data.seForOutra.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Descreva a sonda quando 'OUTRA' for selecionado.",
      path: ['seForOutra'],
    });
  }

  // Se o paciente usa sonda, deve haver pelo menos um tipo de sonda informado
  if (data.usoSonda === 'sim') {
    const hasNasal = !!data.tipoSondaNasal;
    const hasCirurgica = !!data.tipoSondaCirurgica;
    const hasVesical = !!data.tipoSondaVesical && data.tipoSondaVesical !== 'NAO';
    if (!hasNasal && !hasCirurgica && !hasVesical) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe pelo menos um tipo de sonda quando o paciente usa sonda.",
        path: ['tipoSondaNasal'],
      });
    }
  }

  // Se contatosDeEmergencia estiver presente, já garantimos acima min(1) — nada extra aqui

});

// --- Exporta o tipo TypeScript inferido a partir do schema ---
export type PatientFormInputs = z.infer<typeof patientSchema>;