import { api } from './api.gateway';
import type {
  ConsentimentoLGPDRequest,
  ConsentimentoLGPDResponse,
  PageConsentimentoResponseDTO,
  Pageable,
} from './consentimento.dto';

class ConsentimentoService {
  /**
   * Registra um novo consentimento ou revogação LGPD para um profissional
   */
  async registrarConsentimento(
    profissionalUuid: string,
    data: ConsentimentoLGPDRequest
  ): Promise<ConsentimentoLGPDResponse> {
    const response = await api.post(
      `/profissionais/${profissionalUuid}/consentimentos`,
      data
    );
    return response.data;
  }

  /**
   * Lista todos os consentimentos de um profissional
   */
  async listarConsentimentos(
    profissionalUuid: string,
    pageable?: Pageable
  ): Promise<PageConsentimentoResponseDTO> {
    const response = await api.get(
      `/profissionais/${profissionalUuid}/consentimentos`,
      { params: pageable }
    );
    return response.data;
  }

  /**
   * Busca um consentimento específico
   */
  async buscarConsentimento(
    profissionalUuid: string,
    consentimentoUuid: string
  ): Promise<ConsentimentoLGPDResponse> {
    const response = await api.get(
      `/profissionais/${profissionalUuid}/consentimentos/${consentimentoUuid}`
    );
    return response.data;
  }

  /**
   * Obtém o IP público do cliente usando API externa
   */
  async obterIpPublico(): Promise<string> {
    try {
      // Tenta primeiro com ipify
      const response = await fetch('https://api.ipify.org?format=json', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.ip || '';
    } catch (error) {
      console.error('Erro ao obter IP público com ipify:', error);
      
      // Fallback: tenta outra API
      try {
        const fallbackResponse = await fetch('https://api64.ipify.org?format=json', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          return fallbackData.ip || '';
        }
      } catch (fallbackError) {
        console.error('Erro ao obter IP público com fallback:', fallbackError);
      }
      
      return ''; // Retorna vazio se ambas falharem
    }
  }

  /**
   * Obtém o User Agent do navegador
   */
  obterUserAgent(): string {
    return navigator.userAgent;
  }
}

export const consentimentoService = new ConsentimentoService();
