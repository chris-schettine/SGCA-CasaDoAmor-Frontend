import { api } from './api.gateway';
import type { UserFormInputs } from '../schemas/userSchema'; 


interface CreateUserDTO {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  tipo: string;
  perfisIds: number[];
}

class AdminService {
  
  async createUser(data: UserFormInputs) {
    
    
    const userDTO: CreateUserDTO = {
      nome: data.nomeUsuario,      
      email: data.email,
      cpf: data.cpfUsuario,        
      telefone: data.telefone,
      tipo: data.tipo,
      
      
      perfisIds: data.perfisIds, 
    };
    
    const response = await api.post('/admin/users', userDTO);
    return response.data;
  }
}

export const adminService = new AdminService();