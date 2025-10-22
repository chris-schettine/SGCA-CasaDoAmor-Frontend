import axios, { type AxiosInstance } from 'axios';

class ApiGateway {
  public gateway: AxiosInstance;

  constructor() {
    this.gateway = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      
      
      withCredentials: true 
    });

    // FUTURAMENTE: Adicionaremos interceptors (tratamento de erro 401) aqui
  }
}

export const api = new ApiGateway().gateway;