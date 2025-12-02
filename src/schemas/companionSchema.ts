import { z } from "zod";
import { 
  cepSchema, 
  cpfSchema, 
  phoneSchema, 
  requiredString,
  rgSchema
} from "./commonValidation";

// Schema para dados pessoais do acompanhante
const dadoPessoalSchema = z.object({
  nome: requiredString,
  nomeMae: z.string().trim().optional(),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  sexo: z.enum(["MASCULINO", "FEMININO", "NAO_INFORMADO"], {
    errorMap: () => ({ message: "Selecione o sexo." }),
  }),
  cpf: cpfSchema,
  rg: rgSchema.optional(),
  naturalidade: z.string().trim().optional(),
  profissao: z.string().trim().optional(),
  telefone: phoneSchema,
  estadoCivil: z.enum(["SOLTEIRO", "CASADO", "DIVORCIADO", "VIUVO", "UNIAO_ESTAVEL", "SEPARADO"], {
    errorMap: () => ({ message: "Selecione o estado civil." }),
  }).optional(),
});

// Schema para endereço do acompanhante
const enderecoSchema = z.object({
  logradouro: z.string().trim().optional(),
  numero: z.number().min(0).optional(),
  complemento: z.string().trim().optional(),
  bairro: z.string().trim().optional(),
  cidade: z.string().trim().optional(),
  estado: z.enum(
    ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"],
    { errorMap: () => ({ message: "Selecione um estado válido." }) }
  ).optional(),
  cep: cepSchema.optional(),
});

export const companionSchema = z.object({
  dadoPessoal: dadoPessoalSchema,
  endereco: enderecoSchema,
  parentesco: z.enum(
    ["PAI", "MAE", "IRMAO", "IRMA", "FILHO", "FILHA", "CONJUGE", "AMIGO", "OUTRO"],
    {
      errorMap: () => ({ message: "Selecione o parentesco." }),
    }
  ),
  pacienteId: z.string().min(1, "Paciente é obrigatório"),
  podeAjudarNaCozinha: z.boolean(),
});

// Schema para edição (sem pacienteId, com ativo)
export const editCompanionSchema = z.object({
  podeAjudarNaCozinha: z.boolean(),
  dadoPessoal: dadoPessoalSchema,
  endereco: enderecoSchema,
  parentesco: z.enum(
    ["PAI", "MAE", "IRMAO", "IRMA", "FILHO", "FILHA", "CONJUGE", "AMIGO", "OUTRO"],
    {
      errorMap: () => ({ message: "Selecione o parentesco." }),
    }
  ),
  ativo: z.boolean(),
});

// --- Exporta o tipo TypeScript inferido a partir do schema ---
export type CompanionFormInputs = z.infer<typeof companionSchema>;
export type EditCompanionFormInputs = z.infer<typeof editCompanionSchema>;