import { z } from 'zod';
import type { TipoAtendimento, Prioridade, StatusAgendamento } from '../api/agendamentoPaciente.dto';

// Schema for patient appointment creation/edit
export const agendamentoPacienteSchema = z.object({
  pacienteId: z.union([z.string(), z.number()]),
  tipoServicoId: z.number({ required_error: 'Tipo de serviço é obrigatório' }),
  profissionalUsuarioId: z.union([z.string(), z.number()]),
  dataHoraInicio: z.string({ required_error: 'Data e hora de início são obrigatórias' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Data e hora de início inválidas',
    }),
  dataHoraFim: z.string({ required_error: 'Data e hora de fim são obrigatórias' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Data e hora de fim inválidas',
    }),
  hospedagemId: z.number().optional(),
  tipoAtendimento: z.enum(['PRIMEIRA_VEZ', 'RETORNO', 'EMERGENCIAL', 'ROTINA', 'TRIAGEM'] as const).optional() as z.ZodOptional<z.ZodType<TipoAtendimento>>,
  prioridade: z.enum(['BAIXA', 'NORMAL', 'ALTA', 'URGENTE'] as const).optional() as z.ZodOptional<z.ZodType<Prioridade>>,
  status: z.enum(['AGENDADO', 'CONFIRMADO', 'EM_ATENDIMENTO', 'CONCLUIDO', 'CANCELADO', 'REMARCADO', 'FALTOSO', 'PACIENTE_NAO_COMPARECEU'] as const).optional() as z.ZodOptional<z.ZodType<StatusAgendamento>>,
  observacoes: z.string().max(1000, 'Observações devem ter no máximo 1000 caracteres').optional(),
  motivoCancelamento: z.string().optional(),
  confirmadoPaciente: z.boolean().optional(),
  confirmadoProfissional: z.boolean().optional(),
}).refine(
  (data) => {
    // Validate that end time is after start time
    const inicio = new Date(data.dataHoraInicio);
    const fim = new Date(data.dataHoraFim);
    return fim > inicio;
  },
  {
    message: 'Data e hora de fim devem ser posteriores à data e hora de início',
    path: ['dataHoraFim'],
  }
);

// Schema for companion appointment creation/edit
export const agendamentoAcompanhanteSchema = z.object({
  acompanhanteId: z.union([z.string(), z.number()]),
  tipoServicoId: z.number({ required_error: 'Tipo de serviço é obrigatório' }),
  profissionalUsuarioId: z.union([z.string(), z.number()]),
  dataHoraInicio: z.string({ required_error: 'Data e hora de início são obrigatórias' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Data e hora de início inválidas',
    }),
  dataHoraFim: z.string({ required_error: 'Data e hora de fim são obrigatórias' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Data e hora de fim inválidas',
    }),
  pacienteVinculadoId: z.union([z.string(), z.number()]).optional(),
  tipoAtendimento: z.enum(['PRIMEIRA_VEZ', 'RETORNO', 'EMERGENCIAL', 'ROTINA', 'TRIAGEM'] as const).optional() as z.ZodOptional<z.ZodType<TipoAtendimento>>,
  prioridade: z.enum(['BAIXA', 'NORMAL', 'ALTA', 'URGENTE'] as const).optional() as z.ZodOptional<z.ZodType<Prioridade>>,
  status: z.enum(['AGENDADO', 'CONFIRMADO', 'EM_ATENDIMENTO', 'CONCLUIDO', 'CANCELADO', 'REMARCADO', 'FALTOSO', 'PACIENTE_NAO_COMPARECEU'] as const).optional() as z.ZodOptional<z.ZodType<StatusAgendamento>>,
  observacoes: z.string().max(1000, 'Observações devem ter no máximo 1000 caracteres').optional(),
  motivoCancelamento: z.string().optional(),
  confirmadoAcompanhante: z.boolean().optional(),
  confirmadoProfissional: z.boolean().optional(),
}).refine(
  (data) => {
    // Validate that end time is after start time
    const inicio = new Date(data.dataHoraInicio);
    const fim = new Date(data.dataHoraFim);
    return fim > inicio;
  },
  {
    message: 'Data e hora de fim devem ser posteriores à data e hora de início',
    path: ['dataHoraFim'],
  }
);

// Schema for cancellation
export const cancelamentoSchema = z.object({
  motivo: z.string({ required_error: 'Motivo do cancelamento é obrigatório' })
    .min(10, 'Motivo deve ter no mínimo 10 caracteres')
    .max(500, 'Motivo deve ter no máximo 500 caracteres'),
});

// Type exports
export type AgendamentoPacienteFormData = z.infer<typeof agendamentoPacienteSchema>;
export type AgendamentoAcompanhanteFormData = z.infer<typeof agendamentoAcompanhanteSchema>;
export type CancelamentoFormData = z.infer<typeof cancelamentoSchema>;
