import { api } from './api.gateway';
import type { PessoaFisicaDTO } from './api.gateway.dto';

class PessoaFisicaService {
  public createPessoaFisica(token: string, pessoa: PessoaFisicaDTO) {
    return api.post('/api/1.0/pessoa-fisica', pessoa, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  public getPessoaFisicaById(id: number) {
    return api.get(`/api/1.0/pessoa-fisica/${id}`);
  }

  public getPessoaFisicaByNome(nome: string) {
    return api.get(`/api/1.0/pessoa-fisica/${nome}/nome`);
  }

  public getPessoaFisicaByCpf(cpf: string) {
    return api.get(`/api/1.0/pessoa-fisica/${cpf}/cpf`);
  }

  public getAllPessoaFisica() {
    return api.get('/api/1.0/pessoa-fisica');
  }

  public updatePessoaFisica(id: number, pessoa: PessoaFisicaDTO) {
    return api.patch(`/api/1.0/pessoa-fisica/${id}`, pessoa);
  }

  public deletePessoaFisica(id: number) {
    return api.delete(`/api/1.0/pessoa-fisica/${id}`);
  }
}

export const pessoaFisicaService = new PessoaFisicaService();
