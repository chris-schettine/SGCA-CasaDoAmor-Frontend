
import type { UserType } from '../contexts/AuthContext';

export interface LoginResponse {
  token: string;
  user: UserType;
  nome?: string;
  email?: string;
  cpf?: string;
  roles?: string[];
  tipoUsuario?: string;
  tipo?: string;
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

export interface SessaoUsuarioDTO {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  tipo: string;
}

// Extende SessaoDTO para incluir o usuário quando retornado pelo endpoint de auditoria
export interface SessaoAuditDTO extends SessaoDTO {
  usuario?: SessaoUsuarioDTO;
}

export interface MessageResponseDTO {
  message: string;
  success: boolean;
}

export interface AuthSessionResponse {
  nome?: string;
  email?: string;
  cpf?: string;
  uuid?: string;
  roles?: string[];
  perfis?: Array<{ nome?: string | null } | null>;
  tipo?: string;
  tipoUsuario?: string;
  user?: AuthSessionResponse;
}
