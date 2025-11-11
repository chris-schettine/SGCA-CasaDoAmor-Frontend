import { z } from 'zod';

/**
 * Schema de validação para registro de consentimento LGPD
 */
export const consentimentoSchema = z.object({
  versaoTermo: z.string().min(1, 'Versão do termo é obrigatória'),
  escopo: z.string().min(1, 'Escopo é obrigatório'),
  concorda: z.boolean({
    required_error: 'É necessário marcar sua decisão sobre o consentimento',
  }),
}).refine(
  (data) => data.concorda === true,
  {
    message: 'Você deve concordar com os termos para prosseguir',
    path: ['concorda'],
  }
);

export type ConsentimentoFormInputs = z.infer<typeof consentimentoSchema>;
