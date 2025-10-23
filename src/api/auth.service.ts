import { api } from './api.gateway'; // Importa a instância 'api'
import type { UserType } from '../contexts/AuthContext'; // Importa o tipo de usuário
import type {
  LoginResponse,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  VerifyEmailRequestDTO,
  ResendActivationDTO,
  RegisterRequestDTO,
  FirstLoginPasswordChangeDTO,
  ChangePasswordRequestDTO,
  ActivateAccountRequestDTO,
  Verify2FADTO,
  Setup2FADTO,
  Enable2FADTO,
  SessaoDTO,
  MessageResponseDTO,
} from './auth.dto';

class AuthService {
  
  async login(cpf: string, senha: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { cpf, senha });
    return response.data;
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  async getActiveSession(): Promise<UserType> {
    const response = await api.get('/auth/me'); 
    
    return response.data;
  }
 
  async forgotPassword(data: ForgotPasswordDTO): Promise<MessageResponseDTO> {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  }
  async resetPassword(data: ResetPasswordDTO): Promise<void> {
    await api.post('/auth/reset-password', data);
  }

  async verifyEmail(data: VerifyEmailRequestDTO): Promise<void> {
    await api.post('/auth/verify-email', data);
  }

  async resendActivation(data: ResendActivationDTO): Promise<void> {
    await api.post('/auth/resend-activation', data);
  }

  async register(data: RegisterRequestDTO): Promise<void> {
    await api.post('/auth/register', data);
  }

  async firstLoginPasswordChange(data: FirstLoginPasswordChangeDTO): Promise<void> {
    await api.post('/auth/first-login-password-change', data);
  }

  async changePassword(data: ChangePasswordRequestDTO): Promise<void> {
    await api.post('/auth/change-password', data);
  }

  async activateAccount(data: ActivateAccountRequestDTO): Promise<void> {
    await api.post('/auth/activate-account', data);
  }

  async setup2FA(): Promise<Setup2FADTO> {
    const response = await api.post('/auth/2fa/setup');
    return response.data;
  }

  async verify2FA(data: Verify2FADTO): Promise<void> {
    await api.post('/auth/2fa/verify', data);
  }

  async resend2FA(): Promise<MessageResponseDTO> {
    const response = await api.post('/auth/2fa/resend');
    return response.data;
  }

  async enable2FA(data: Enable2FADTO): Promise<MessageResponseDTO> {
    const response = await api.post('/auth/2fa/enable', data);
    return response.data;
  }

  async listSessions(): Promise<SessaoDTO[]> {
    const response = await api.get('/auth/sessions');
    return response.data;
  }

  async revokeSession(id: number): Promise<void> {
    await api.delete(`/auth/sessions/${id}`);
  }
}

export const authService = new AuthService();