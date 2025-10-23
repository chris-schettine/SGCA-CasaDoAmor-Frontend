import { api } from './api.gateway';
import type { PessoaFisicaDTO } from './api.gateway.dto';

class PessoaFisicaService {
  public createPessoaFisica(pessoa: PessoaFisicaDTO) {
    return api.post('/pacientes/', pessoa);
  }

  public getPessoaFisicaById(id: number) {
    return api.get(`/pacientes/${id}`);
  }

  public getPessoaFisicaByNome(nome: string) {
    return api.get(`/pacientes/${nome}/nome`);
  }

  public getPessoaFisicaByCpf(cpf: string) {
    return api.get(`/pacientes/${cpf}/cpf`);
  }

  public getAllPessoaFisica() {
    return api.get('/pacientes/');
  }

  public updatePessoaFisica(id: number, pessoa: PessoaFisicaDTO) {
    return api.patch(`/pacientes/${id}`, pessoa);
  }

  public deletePessoaFisica(id: number) {
    return api.delete(`/pacientes/${id}`);
  }
}

export const pessoaFisicaService = new PessoaFisicaService();
