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
  numero: requiredString,
  complemento: z.string().trim().optional(),
  tratamento: z.string().trim().optional(),
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
  usoSonda: z.enum(["nao", "sonda_foley", "cislostomia", "outra"], {
    errorMap: () => ({ message: "Selecione sobre o uso de sonda." }),
  }),
  seForOutra: z.string().trim().optional().transform(e => e === "" ? undefined : e),
}).superRefine((data, ctx) => {

  // Lógica de validação condicional para 'seForOutra'
  if (data.usoSonda === 'outra' && (!data.seForOutra || data.seForOutra.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Campo obrigatório se 'Outra' for selecionado.",
      path: ['seForOutra'],
    });
  }

});

// --- Exporta o tipo TypeScript inferido a partir do schema ---
export type PatientFormInputs = z.infer<typeof patientSchema>;