import { z } from 'zod';
import {
  cpfSchema,
  phoneSchema,
  requiredString,
} from './commonValidation';

export const userSchema = z.object({
  tipo: requiredString.max(255, "Nome muito longo."),
  cpfUsuario: cpfSchema,
  email: z.string().email("Email inválido").max(255, "Email muito longo."),
  telefone: phoneSchema,
  nomeUsuario: requiredString,
  sexo: requiredString,
  conselho: requiredString,
  registro: requiredString,
  uf: requiredString,
  cbo: requiredString,
  rqe: requiredString,
  cnes: requiredString,
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres.").max(255, "Senha muito longa."),
  confirmarSenha: z.string().min(6, "A confirmação de senha deve ter pelo menos 6 caracteres.").max(255, "Confirmação de senha muito longa."),
  pergunta1: requiredString,
  pergunta2: requiredString,
});

// --- Exporta o tipo TypeScript inferido a partir do schema ---
export type UserFormInputs = z.infer<typeof userSchema>;