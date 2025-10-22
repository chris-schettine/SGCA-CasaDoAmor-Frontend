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
  
  
  perfisIds: z.array(z.number()).min(1, "Selecione pelo menos um perfil de acesso"),

 
  pergunta1: requiredString,
  pergunta2: requiredString,
});


export type UserFormInputs = z.infer<typeof userSchema>;