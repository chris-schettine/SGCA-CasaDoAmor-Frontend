import { z } from 'zod';
import {
  cpfSchema,
  phoneSchema,
  cepSchema,
  requiredString,
} from '../../schemas/commonValidation';

/**
 * Schema Zod para validação de formulários de Profissionais (novo modelo)
 */

// Schema para disponibilidade de horários
const timeRangeSchema = z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/, 'Formato inválido. Use HH:MM-HH:MM');

const disponibilidadeSchema = z.object({
  segunda: z.array(timeRangeSchema).optional(),
  terca: z.array(timeRangeSchema).optional(),
  quarta: z.array(timeRangeSchema).optional(),
  quinta: z.array(timeRangeSchema).optional(),
  sexta: z.array(timeRangeSchema).optional(),
  sabado: z.array(timeRangeSchema).optional(),
  domingo: z.array(timeRangeSchema).optional(),
}).optional();

export const profissionalSchemaNew = z.object({
  // Dados pessoais
  nome_completo: requiredString.max(255, 'O nome não pode ter mais de 255 caracteres'),
  cpf: cpfSchema,
  telefone: phoneSchema,
  email: z.string()
    .min(1, 'O e-mail é obrigatório')
    .email('Digite um e-mail válido')
    .max(255, 'O e-mail não pode ter mais de 255 caracteres'),

  // Dados profissionais
  // categoria_id: backend may return UUIDs or numeric ids (as string).
  // Accept either a non-empty string (UUID or numeric id) and provide a clear message.
  categoria_id: requiredString.refine(val => typeof val === 'string' && val.trim().length > 0, {
    message: 'Selecione uma categoria válida',
  }),
  area_atuacao: requiredString.max(100, 'A área de atuação não pode ter mais de 100 caracteres'),
  especialidade: requiredString.max(100, 'A especialidade não pode ter mais de 100 caracteres'),
  numero_registro: requiredString.max(50, 'O número de registro não pode ter mais de 50 caracteres'),
  uf_registro: z.string()
    .trim()
    .min(2, 'O estado é obrigatório')
    .max(2, 'Use a sigla do estado')
    .regex(/^[A-Z]{2}$/, 'Use a sigla do estado em maiúsculas'),

  data_admissao: z.string().min(1, 'A data de admissão é obrigatória').regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato YYYY-MM-DD'),
  // carga_horaria can come from a number input (string). Preprocess to number first.
  carga_horaria: z.preprocess((val) => {
    if (typeof val === 'string') {
      const n = Number(val);
      return Number.isNaN(n) ? val : n;
    }
    return val;
  }, z.number()
    .min(1, 'A carga horária deve ser pelo menos 1 hora')
    .max(44, 'A carga horária não pode exceder 44 horas')),
  cargo_funcao: requiredString.max(100, 'O cargo/função não pode ter mais de 100 caracteres'),
  departamento: requiredString.max(100, 'O departamento não pode ter mais de 100 caracteres'),
  
  // tipo_vinculo_id: accept either UUID or numeric ids as string
  tipo_vinculo_id: requiredString.refine(val => typeof val === 'string' && val.trim().length > 0, {
    message: 'Selecione um tipo de vínculo válido',
  }),
  
  // Endereço
  cep: cepSchema,
  logradouro: requiredString.max(255, 'O logradouro não pode ter mais de 255 caracteres'),
  numero: requiredString.max(20, 'O número é obrigatório'),
  complemento: z.string().trim().max(150, 'O complemento não pode ter mais de 150 caracteres').optional(),
  bairro: requiredString.max(100, 'O bairro não pode ter mais de 100 caracteres'),
  cidade: requiredString.max(100, 'A cidade não pode ter mais de 100 caracteres'),
  estado: z.string()
    .trim()
    .min(2, 'O estado é obrigatório')
    .max(2, 'Use a sigla do estado')
    .regex(/^[A-Z]{2}$/, 'Use a sigla do estado em maiúsculas'),

  // Disponibilidade
  disponibilidade: disponibilidadeSchema,

  // Observações
  observacoes: z.string().trim().max(500, 'As observações não podem ter mais de 500 caracteres').optional(),

  // LGPD Consent
  lgpd_consent: z.boolean(),
});

export const profissionalSchemaNewWithConsent = profissionalSchemaNew.superRefine((data, ctx) => {
  // Consentimento LGPD é obrigatório no cadastro
  if (data.lgpd_consent !== true) {
    ctx.addIssue({
      path: ['lgpd_consent'],
      code: z.ZodIssueCode.custom,
      message: 'É necessário concordar com os termos de consentimento LGPD',
    });
  }
});

export type ProfissionalFormInputsNew = z.infer<typeof profissionalSchemaNew>;
export type ProfissionalFormInputsNewWithConsent = z.infer<typeof profissionalSchemaNewWithConsent>;

export default profissionalSchemaNewWithConsent;
