import { z } from "zod";
import { cepSchema, cpfSchema, phoneSchema, requiredString } from "./commonValidation";

export const companionSchema = z.object({
  acompanhanteNome: requiredString,
  cpfAcompanhante: cpfSchema,
  telefoneAcompanhante: phoneSchema,
  cepAcompanhante: z.union([cepSchema.optional(), z.literal("")]).transform(e => e === "" ? undefined : e) as z.ZodType<string | undefined>,
  enderecoAcompanhante: z.string().trim().optional(),
  bairroAcompanhante: z.string().trim().optional(),
  numeroAcompanhante: z.string().trim().optional(),
  complementoAcompanhante: z.string().trim().optional(),
  vinculoPaciente: requiredString,
  podeAjudarCozinha: z.enum(["sim", "nao"], {
    errorMap: () => ({ message: "Selecione se pode ajudar na cozinha." }),
  }),
  acompanhanteResponsavel: z.enum(["sim", "nao"], {
    errorMap: () => ({ message: "Selecione se o acompanhante é responsável." }),
  }),
});

// --- Exporta o tipo TypeScript inferido a partir do schema ---
export type CompanionFormInputs = z.infer<typeof companionSchema>;