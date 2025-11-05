import { z } from 'zod';

// --- REGEX Comuns ---
export const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
export const DATE_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;
export const RG_REGEX = /^\d{2}\.\d{3}\.\d{3}-\d{1}$/;
// Allow formatted phone like '00 00000-0000' or digits-only '00000000000' or 10-digit '0000000000'
export const PHONE_REGEX = /^(\d{2} \d{5}-\d{4}|\d{10,11})$/;
export const CEP_REGEX = /^\d{5}-\d{3}$/;

// --- Mini-Schemas Zod Reusáveis ---

export const requiredString = z.string()
  .trim()
  .min(1, "Este campo é obrigatório");

export const cpfSchema = z.string()
  .trim()
  .min(1, "O CPF é obrigatório")
  .regex(CPF_REGEX, "CPF inválido. Use o formato XXX.XXX.XXX-XX");

export const dateSchema = z.string()
  .trim()
  .min(1, "A data é obrigatória")
  .regex(DATE_REGEX, "Data inválida. Use o formato DD/MM/AAAA");

export const rgSchema = z.string()
  .trim()
  .min(1, "O RG é obrigatório")
  .regex(RG_REGEX, "RG inválido. Use o formato XX.XXX.XXX-X");

export const phoneSchema = z.string()
  .trim()
  .min(1, "O telefone é obrigatório")
  .regex(PHONE_REGEX, "Telefone inválido. Use o formato (DD) XXXXX-XXXX");

export const cepSchema = z.string()
  .trim()
  .min(1, "O CEP é obrigatório")
  .regex(CEP_REGEX, "CEP inválido. Use o formato XXXXX-XXX");



