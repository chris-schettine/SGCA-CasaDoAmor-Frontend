import { z } from 'zod';
import {
  cpfSchema,
  phoneSchema,
  cepSchema,
  requiredString,
} from './commonValidation';

export const userSchema = z.object({
  tipo: z.enum(["ADMINISTRADOR","DENTISTA","ENFERMEIRO","FISIOTERAPEUTA","MEDICO","NUTRICIONISTA","RECEPCIONISTA","AUDITOR"], {
    errorMap: () => ({ message: "Selecione um tipo de usuário válido" })
  }),
  cpfUsuario: cpfSchema,
  email: z.string()
    .min(1, "O e-mail é obrigatório")
    .email("Digite um e-mail válido (ex: nome@exemplo.com)")
    .max(255, "O e-mail não pode ter mais de 255 caracteres"),
  telefone: phoneSchema,
  nomeUsuario: requiredString,
  sexo: requiredString,
  // personal data fields (used when editing/providing detailed info)
  dataNascimento: z.string().trim().optional(), // expect ISO or DD/MM/YYYY depending on flow
  naturalidade: z.string().trim().optional(),
  estadoCivil: z.string().trim().optional(),
  nomeMae: z.string().trim().optional(),
  nomePai: z.string().trim().optional(),
  profissao: z.string().trim().optional(),
  // professional-specific fields: optional by default, validated conditionally below
  registro: z.string().trim().optional(),
  estado: z.string().trim().min(1, 'O estado é obrigatório'),
  rqe: z.string().trim().optional(),
  cep: cepSchema,
  endereco: requiredString,
  bairro: requiredString,
  cidade: requiredString,
  numero: requiredString,
  complemento: z.string().trim().optional(),
  perfisIds: z.array(z.number()).min(1, "Selecione um perfil de acesso para o usuário").max(1, "Selecione apenas um perfil de acesso"),
});

// Conditional validation: require professional fields only for certain tipos
export const userSchemaConditional = userSchema.superRefine((data, ctx) => {
  const tipo = data.tipo;

  // registro is required for several professional tipos
  const needRegistro = ["DENTISTA", "MEDICO", "ENFERMEIRO", "FISIOTERAPEUTA", "NUTRICIONISTA"].includes(tipo);
  if (needRegistro) {
    if (!data.registro || data.registro.trim().length === 0) {
      ctx.addIssue({ path: ['registro'], code: z.ZodIssueCode.custom, message: 'Registro é obrigatório para este tipo de profissional.' });
    }
  }

  // RQE is optional for all tipos
});


export type UserFormInputs = z.infer<typeof userSchemaConditional>;

// keep default export alias for code that expects `userSchema` name
export default userSchemaConditional;