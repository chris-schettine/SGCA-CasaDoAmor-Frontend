import { z } from 'zod';
import {
  cpfSchema,
  phoneSchema,
  cepSchema,
  requiredString,
} from './commonValidation';

export const userSchema = z.object({
  tipo: z.enum(["ADMINISTRADOR","DENTISTA","ENFERMEIRO","FISIOTERAPEUTA","MEDICO","NUTRICIONISTA","RECEPCIONISTA","AUDITOR"]),
  cpfUsuario: cpfSchema,
  email: z.string().email("Email inválido").max(255, "Email muito longo."),
  telefone: phoneSchema,
  nomeUsuario: requiredString,
  sexo: requiredString,
  // personal data fields (used when editing/providing detailed info)
  dataNascimento: z.string().trim().optional(), // expect ISO or DD/MM/YYYY depending on flow
  rg: z.string().trim().optional(),
  orgaoEmissor: z.string().trim().optional(),
  naturalidade: z.string().trim().optional(),
  estadoCivil: z.string().trim().optional(),
  nomeMae: z.string().trim().optional(),
  nomePai: z.string().trim().optional(),
  profissao: z.string().trim().optional(),
  // professional-specific fields: optional by default, validated conditionally below
  conselho: z.string().trim().optional(),
  registro: z.string().trim().optional(),
  uf: z.string().trim().optional(),
  cbo: z.string().trim().optional(),
  rqe: z.string().trim().optional(),
  cnes: z.string().trim().optional(),
  cep: cepSchema,
  endereco: requiredString,
  bairro: requiredString,
  cidade: requiredString,
  numero: requiredString,
  complemento: z.string().trim().optional(),
  perfisIds: z.array(z.number()).min(1, "Selecione pelo menos um perfil de acesso"),
});

// Conditional validation: require professional fields only for certain tipos
export const userSchemaConditional = userSchema.superRefine((data, ctx) => {
  const tipo = data.tipo;

  const needConselho = ["DENTISTA", "MEDICO", "ENFERMEIRO"].includes(tipo);
  const needCbo = ["ENFERMEIRO", "FISIOTERAPEUTA", "MEDICO", "NUTRICIONISTA"].includes(tipo);
  const needRqe = ["DENTISTA"].includes(tipo);
  const needCnes = ["MEDICO", "ENFERMEIRO", "FISIOTERAPEUTA"].includes(tipo);

  if (needConselho) {
    if (!data.conselho || data.conselho.trim().length === 0) {
      ctx.addIssue({ path: ['conselho'], code: z.ZodIssueCode.custom, message: 'Conselho é obrigatório para este tipo de profissional.' });
    }
    if (!data.registro || data.registro.trim().length === 0) {
      ctx.addIssue({ path: ['registro'], code: z.ZodIssueCode.custom, message: 'Registro é obrigatório para este tipo de profissional.' });
    }
  }

  if (needCbo) {
    if (!data.cbo || data.cbo.trim().length === 0) {
      ctx.addIssue({ path: ['cbo'], code: z.ZodIssueCode.custom, message: 'CBO é obrigatório para este tipo de profissional.' });
    }
  }

  if (needRqe) {
    if (!data.rqe || data.rqe.trim().length === 0) {
      ctx.addIssue({ path: ['rqe'], code: z.ZodIssueCode.custom, message: 'RQE é obrigatório para este tipo de profissional.' });
    }
  }

  if (needCnes) {
    if (!data.cnes || data.cnes.trim().length === 0) {
      ctx.addIssue({ path: ['cnes'], code: z.ZodIssueCode.custom, message: 'CNES é obrigatório para este tipo de profissional.' });
    }
  }
});


export type UserFormInputs = z.infer<typeof userSchemaConditional>;

// keep default export alias for code that expects `userSchema` name
export default userSchemaConditional;