import { z } from 'zod';
import { cpfSchema } from './commonValidation';

/**
 * Schema for patient admission form
 */
export const hospedagemCreateSchema = z.object({
  pacienteId: cpfSchema,
  
  quartoUuid: z
    .string()
    .uuid('UUID do quarto inválido')
    .optional(),
  
  dataEntrada: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .refine((date) => {
      const inputDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate <= today;
    }, 'Data de entrada não pode ser futura'),
  
  horaEntrada: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora deve estar no formato HH:mm ou HH:mm:ss')
    .optional(),
  
  dataSaidaPrevista: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .optional()
    .refine((date) => {
      if (!date) return true;
      const inputDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate > today;
    }, 'Data de saída prevista deve ser futura'),
  
  observacoesEntrada: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional(),
  
  observacoesGerais: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional(),
}).refine((data) => {
  if (data.dataSaidaPrevista && data.dataEntrada) {
    return new Date(data.dataSaidaPrevista) > new Date(data.dataEntrada);
  }
  return true;
}, {
  message: 'Data de saída prevista deve ser posterior à data de entrada',
  path: ['dataSaidaPrevista'],
});

export type HospedagemCreateFormData = z.infer<typeof hospedagemCreateSchema>;

/**
 * Schema for patient exit form
 */
export const hospedagemSaidaSchema = z.object({
  dataSaida: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .refine((date) => {
      const inputDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate <= today;
    }, 'Data de saída não pode ser futura'),
  
  horaSaida: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Hora deve estar no formato HH:mm ou HH:mm:ss')
    .optional(),
  
  motivoSaida: z
    .string()
    .min(1, 'Motivo da saída é obrigatório')
    .max(255, 'Motivo deve ter no máximo 255 caracteres'),
  
  observacoesSaida: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional(),
});

export type HospedagemSaidaFormData = z.infer<typeof hospedagemSaidaSchema>;
