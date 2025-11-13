import type { ConsentSnapshot, ConsentChoice } from '../types/consent.types';
import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  CONSENT_PURPOSES,
} from '../config/consentConfig';
import { consentimentoService } from '../../api/consentimento.service';

/**
 * ConsentStore - Gerencia persistência de consentimentos
 * 
 * Estratégia de persistência dual:
 * 1. localStorage (síncrono, offline-first)
 * 2. API backend (assíncrono, sincronização)
 * 
 * Flow:
 * - save(): localStorage + API call (non-blocking)
 * - load(): Tenta localStorage primeiro, fallback para estado inicial
 * - sync(): Force sync com API (útil após reconexão)
 */
export class ConsentStore {
  /**
   * Salva snapshot de consentimento (dual-write)
   * 
   * @param userUuid - UUID do usuário
   * @param choices - Mapa de escolhas por finalidade
   * @returns Promise com snapshot salvo
   * 
   * @example
   * ```ts
   * await ConsentStore.save('user-123', {
   *   essential_auth: true,
   *   analytics_usage: false,
   * });
   * ```
   */
  static async save(
    userUuid: string,
    choices: ConsentChoice
  ): Promise<ConsentSnapshot> {
    const snapshot: ConsentSnapshot = {
      version: CONSENT_VERSION,
      choices,
      timestamp: new Date().toISOString(),
    };

    // 1. Salvar localmente (síncrono, garantido)
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(snapshot));
    } catch (error) {
      console.error('[ConsentStore] Falha ao salvar no localStorage:', error);
      // Continuar mesmo com erro (pode ser quota exceeded)
    }

    // 2. Sincronizar com API (assíncrono, melhor esforço)
    try {
      const payload = {
        versaoTermo: snapshot.version,
        escopo: 'GERAL',
        concorda: this.hasAcceptedAll(choices),
        metadata: JSON.stringify(choices), // Salvar escolhas granulares
        // IP, userAgent, deviceId são capturados pelo backend
      };
      if (import.meta.env.DEV) console.log('[ConsentStore] Enviando payload para registrarConsentimento:', { profissionalUuid: userUuid, payload });
      const res = await consentimentoService.registrarConsentimento(userUuid, payload);
      if (import.meta.env.DEV) console.log('[ConsentStore] Resposta registrarConsentimento:', res);
    } catch (error) {
      console.error('[ConsentStore] Falha ao sincronizar com API:', error);
      // Não rejeitar promise - cache local é suficiente
    }

    return snapshot;
  }

  /**
   * Carrega snapshot mais recente do cache local
   * 
   * @param _userUuid - UUID do usuário (para futuro uso multi-tenant)
   * @returns Snapshot ou null se não existir
   */
  static load(_userUuid?: string): ConsentSnapshot | null {
    try {
      const cached = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!cached) {
        if (import.meta.env.DEV) console.log('[ConsentStore.load] no cached snapshot found');
        return null;
      }

      if (import.meta.env.DEV) console.log('[ConsentStore.load] raw cached value present');

      const snapshot = JSON.parse(cached) as ConsentSnapshot;

      // Validar estrutura básica
      if (!snapshot.version || !snapshot.choices || !snapshot.timestamp) {
        console.warn('[ConsentStore] Snapshot inválido, limpando cache');
        this.clear();
        return null;
      }

      if (import.meta.env.DEV) console.log('[ConsentStore.load] parsed snapshot', { version: snapshot.version, timestamp: snapshot.timestamp, choicesPreview: Object.keys(snapshot.choices).slice(0,5) });
      return snapshot;
    } catch (error) {
      console.error('[ConsentStore] Erro ao ler localStorage:', error);
      return null;
    }
  }

  /**
   * Retorna choices padrão (essenciais = true, opcionais = default)
   */
  static getDefaultChoices(): ConsentChoice {
    return CONSENT_PURPOSES.reduce((acc, purpose) => {
      acc[purpose.id] = purpose.defaultEnabled;
      return acc;
    }, {} as ConsentChoice);
  }

  /**
   * Retorna choices para "Aceitar Todos"
   */
  static getAcceptAllChoices(): ConsentChoice {
    return CONSENT_PURPOSES.reduce((acc, purpose) => {
      acc[purpose.id] = true;
      return acc;
    }, {} as ConsentChoice);
  }

  /**
   * Retorna choices para "Apenas Essenciais"
   */
  static getEssentialOnlyChoices(): ConsentChoice {
    return CONSENT_PURPOSES.reduce((acc, purpose) => {
      acc[purpose.id] = purpose.category === 'essential';
      return acc;
    }, {} as ConsentChoice);
  }

  /**
   * Verifica se snapshot precisa de atualização (versão mudou)
   * 
   * @param snapshot - Snapshot a verificar
   * @returns true se versão difere da atual
   */
  static needsUpdate(snapshot: ConsentSnapshot | null): boolean {
    if (!snapshot) return true;
    return snapshot.version !== CONSENT_VERSION;
  }

  /**
   * Limpa cache local
   */
  static clear(): void {
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch (error) {
      console.error('[ConsentStore] Erro ao limpar localStorage:', error);
    }
  }

  /**
   * Verifica se todas as finalidades estão aceitas
   */
  private static hasAcceptedAll(choices: ConsentChoice): boolean {
    return CONSENT_PURPOSES.every((purpose) => choices[purpose.id] === true);
  }

  /**
   * Força sincronização com API (útil após reconexão)
   * 
   * @param userUuid - UUID do usuário
   */
  static async sync(userUuid: string): Promise<void> {
    const snapshot = this.load(userUuid);
    if (!snapshot) return;

    try {
      const payload = {
        versaoTermo: snapshot.version,
        escopo: 'GERAL',
        concorda: this.hasAcceptedAll(snapshot.choices),
        metadata: JSON.stringify(snapshot.choices),
      };
      if (import.meta.env.DEV) console.log('[ConsentStore.sync] Sincronizando snapshot para', userUuid, payload);
      const res = await consentimentoService.registrarConsentimento(userUuid, payload);
      if (import.meta.env.DEV) console.log('[ConsentStore.sync] Resposta sync:', res);
    } catch (error) {
      console.error('[ConsentStore] Falha ao sincronizar:', error);
      throw error;
    }
  }
}
