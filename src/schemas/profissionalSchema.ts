import { z } from 'zod';
import {
  cpfSchema,
  phoneSchema,
  cepSchema,
  requiredString,
} from './commonValidation';

/**
 * Schema Zod para validação de formulários de Profissionais
 * Inclui validações para campos obrigatórios, formatos e consentimento LGPD
 */
export const profissionalSchema = z.object({
  // Dados pessoais
  nome: requiredString.max(255, 'O nome não pode ter mais de 255 caracteres'),
  cpf: cpfSchema,
  sexo: z.enum(['MASCULINO', 'FEMININO', 'OUTRO'], {
    errorMap: () => ({ message: 'Selecione um sexo válido' }),
  }).optional(),

  // Dados profissionais
  registro: requiredString
    .max(50, 'O registro não pode ter mais de 50 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'Registro inválido. Use apenas letras maiúsculas, números e hífen (ex: CRM-12345)'),
  rqe: z.string().trim().max(50, 'O RQE não pode ter mais de 50 caracteres').optional(),
  especialidade: requiredString.max(100, 'A especialidade não pode ter mais de 100 caracteres'),

  // Contato
  telefone: phoneSchema,
  email: z.string()
    .min(1, 'O e-mail é obrigatório')
    .email('Digite um e-mail válido (ex: nome@exemplo.com)')
    .max(255, 'O e-mail não pode ter mais de 255 caracteres'),

  // Endereço
  cep: cepSchema,
  logradouro: requiredString.max(255, 'O logradouro não pode ter mais de 255 caracteres'),
  numero: requiredString.max(10, 'O número não pode ter mais de 10 caracteres'),
  complemento: z.string().trim().max(100, 'O complemento não pode ter mais de 100 caracteres').optional(),
  bairro: requiredString.max(100, 'O bairro não pode ter mais de 100 caracteres'),
  cidade: requiredString.max(100, 'A cidade não pode ter mais de 100 caracteres'),
  estado: z.string()
    .trim()
    .min(2, 'O estado é obrigatório')
    .max(2, 'Use a sigla do estado (ex: SP)')
    .regex(/^[A-Z]{2}$/, 'Use a sigla do estado em maiúsculas (ex: SP)'),

  // Consentimento LGPD (obrigatório apenas no cadastro)
  consentimentoLGPD: z.boolean().optional(),
});

/**
 * Schema com validação condicional para consentimento LGPD
 * Usado no formulário de cadastro (ProfissionalRegister)
 */
export const profissionalSchemaWithConsent = profissionalSchema.superRefine((data, ctx) => {
  // Consentimento LGPD é obrigatório no cadastro
  if (data.consentimentoLGPD !== true) {
    ctx.addIssue({
      path: ['consentimentoLGPD'],
      code: z.ZodIssueCode.custom,
      message: 'É necessário concordar com os termos de consentimento LGPD',
    });
  }
});

/**
 * Schema sem validação de consentimento LGPD
 * Usado no formulário de edição (ProfissionalEdit)
 */
export const profissionalSchemaForEdit = profissionalSchema.omit({ consentimentoLGPD: true });

// Type inference
export type ProfissionalFormInputs = z.infer<typeof profissionalSchema>;
export type ProfissionalFormInputsWithConsent = z.infer<typeof profissionalSchemaWithConsent>;
export type ProfissionalFormInputsForEdit = z.infer<typeof profissionalSchemaForEdit>;

// Export schema with consent as default for registration flow
export default profissionalSchemaWithConsent;
