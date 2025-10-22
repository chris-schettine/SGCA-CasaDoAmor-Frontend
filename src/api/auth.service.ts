import { api } from './api.gateway'; // Importa a instância 'api'
import type { UserType } from '../contexts/AuthContext'; // Importa o tipo de usuário


interface LoginResponse {
  token: string; 
  user: UserType;
}


interface ForgotPasswordDTO {
  email: string;
}

interface ResetPasswordDTO {
  token: string;
  novaSenha: string;
}

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
 
  async forgotPassword(data: ForgotPasswordDTO): Promise<void> {
    await api.post('/auth/forgot-password', data);
  }
  async resetPassword(data: ResetPasswordDTO): Promise<void> {
    await api.post('/auth/reset-password', data);
  }
}

export const authService = new AuthService();