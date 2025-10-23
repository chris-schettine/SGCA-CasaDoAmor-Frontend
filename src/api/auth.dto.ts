
import type { UserType } from '../contexts/AuthContext';

export interface LoginResponse {
  token: string;
  user: UserType;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  novaSenha: string;
}

export interface VerifyEmailRequestDTO {
  token: string;
}

export interface ResendActivationDTO {
  email: string;
}

export interface RegisterRequestDTO {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  telefone?: string;
  tipo?: string;
}

export interface FirstLoginPasswordChangeDTO {
  senhaTemporaria: string;
  novaSenha: string;
  confirmarSenha: string;
}

export interface ChangePasswordRequestDTO {
  senhaAtual: string;
  novaSenha: string;
}

export interface ActivateAccountRequestDTO {
  token: string;
  email: string;
  senhaTemporaria: string;
  novaSenha: string;
  confirmarSenha: string;
}

export interface Verify2FADTO {
  cpf: string;
  codigo: string;
}

export interface Setup2FADTO {
  mensagem: string;
  habilitado: boolean;
  email: string;
}

export interface Enable2FADTO {
  codigo: string;
  habilitar: boolean;
}

export interface SessaoDTO {
  id: number;
  ipOrigem: string;
  userAgent: string;
  criadoEm: string;
  expiraEm: string;
  ativo: boolean;
  atual: boolean;
}

export interface MessageResponseDTO {
  message: string;
  success: boolean;
}
