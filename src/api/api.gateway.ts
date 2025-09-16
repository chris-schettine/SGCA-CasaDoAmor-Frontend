import axios, { type AxiosInstance } from 'axios';
import type { PessoaFisicaDTO } from './api.gateway.dto';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8090";

class ApiGateway {
  public gateway: AxiosInstance;

  constructor() {
    this.gateway = axios.create({
      baseURL: "http://localhost:8090",
    });
  }

  public createPessoaFisica(token: string, pessoa: PessoaFisicaDTO) {
    return this.gateway.post('/api/1.0/pessoa-fisica', pessoa, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  public getPessoaFisicaById(id: number) {
    return this.gateway.get(`/api/1.0/pessoa-fisica/${id}`);
  }

  public getPessoaFisicaByNome(nome: string) {
    return this.gateway.get(`/api/1.0/pessoa-fisica/${nome}/nome`);
  }

  public getPessoaFisicaByCpf(cpf: string) {
    return this.gateway.get(`/api/1.0/pessoa-fisica/${cpf}/cpf`);
  }

  public getAllPessoaFisica() {
    return this.gateway.get('/api/1.0/pessoa-fisica');
  }

  public updatePessoaFisica(id: number, pessoa: PessoaFisicaDTO) {
    return this.gateway.patch(`/api/1.0/pessoa-fisica/${id}`, pessoa);
  }

  public deletePessoaFisica(id: number) {
    return this.gateway.delete(`/api/1.0/pessoa-fisica/${id}`);
  }

}


export const apiGateway = new ApiGateway();



