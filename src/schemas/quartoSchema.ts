import { z } from 'zod';

export const quartoSchema = z.object({
  nome: z.string()
    .min(1, 'Nome do quarto é obrigatório')
    .max(100, 'Nome do quarto deve ter no máximo 100 caracteres'),
  
  tipo: z.string()
    .min(1, 'Tipo é obrigatório'),
  
  ala: z.string()
    .min(1, 'Ala é obrigatória'),
  
  andar: z.string()
    .min(1, 'Andar é obrigatório')
    .max(50, 'Andar deve ter no máximo 50 caracteres'),
  
  capacidadeTotal: z.number()
    .int('Capacidade deve ser um número inteiro')
    .positive('Capacidade deve ser maior que zero')
    .max(20, 'Capacidade máxima é 20'),
  
  ativo: z.boolean(),
  
  emManutencao: z.boolean(),
  
  permiteSexoOposto: z.boolean(),
  
  observacoes: z.string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional(),
});

export type QuartoFormData = z.infer<typeof quartoSchema>;
