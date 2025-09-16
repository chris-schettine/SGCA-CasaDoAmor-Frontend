import { z } from 'zod';

// --- REGEX Comuns ---
export const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
export const DATE_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;
export const RG_REGEX = /^\d{2}\.\d{3}\.\d{3}-\d{1}$/;
export const PHONE_REGEX = /^\d{2} \d{5}-\d{4}$/;
export const CEP_REGEX = /^\d{5}-\d{3}$/;

// --- Mini-Schemas Zod Reusáveis ---

export const requiredString = z.string()
  .trim()
  .min(1, "Campo obrigatório.");

export const cpfSchema = z.string()
  .trim()
  .min(1, "CPF é obrigatório.")
  .regex(CPF_REGEX, "Formato de CPF inválido (XXX.XXX.XXX-XX).");

export const dateSchema = z.string()
  .trim()
  .min(1, "Data é obrigatória.")
  .regex(DATE_REGEX, "Formato de data inválido (DD/MM/AAAA).");

export const rgSchema = z.string()
  .trim()
  .min(1, "RG é obrigatório.")
  .regex(RG_REGEX, "Formato de RG inválido (XX.XXX.XXX-X).");

export const phoneSchema = z.string()
  .trim()
  .min(1, "Telefone é obrigatório.")
  .regex(PHONE_REGEX, "Formato de telefone inválido (DD XXXXX-XXXX).");

export const cepSchema = z.string()
  .trim()
  .min(1, "CEP é obrigatório.")
  .regex(CEP_REGEX, "CEP inválido (XXXXX-XXX).");



