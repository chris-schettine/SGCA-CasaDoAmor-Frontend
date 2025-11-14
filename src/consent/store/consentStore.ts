import type { ConsentSnapshot, ConsentChoice } from '../types/consent.types';
import {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  CONSENT_PURPOSES,
  CONSENT_CACHE_TTL,
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
    choices: ConsentChoice,
    options?: { requireApi?: boolean }
  ): Promise<ConsentSnapshot> {
    const snapshot: ConsentSnapshot = {
      version: CONSENT_VERSION,
      choices,
      timestamp: new Date().toISOString(),
      ttlMs: CONSENT_CACHE_TTL,
    };
    if (import.meta.env.DEV) console.debug('[ConsentStore.save] snapshot prepared (to persist locally)', { userUuid, snapshotPreview: { version: snapshot.version, timestamp: snapshot.timestamp, choicesPreview: Object.keys(choices).slice(0,5) } });
    const requireApi = options?.requireApi === true;

    // If requireApi is set, call API first and only persist locally after success.
    if (requireApi) {
      try {
        const payload = {
          versaoTermo: snapshot.version,
          escopo: 'GERAL',
          concorda: this.hasAcceptedAll(choices),
          metadata: JSON.stringify(choices),
        };
        if (import.meta.env.DEV) console.log('[ConsentStore] (requireApi) Enviando payload para registrarConsentimento:', { identifier: userUuid, payload });
        // If identifier looks like a CPF (11 digits), use the public CPF endpoint
        const cpfMatch = typeof userUuid === 'string' && /^[0-9]{11}$/.test(userUuid);
        const res = cpfMatch
          ? await consentimentoService.registrarConsentimentoPorCpf(userUuid, payload)
          : await consentimentoService.registrarConsentimento(userUuid, payload);
        if (import.meta.env.DEV) console.log('[ConsentStore] (requireApi) Resposta registrarConsentimento:', res);

        // Persist locally only after successful API call
        try {
          const storageKey = `${CONSENT_STORAGE_KEY}:${userUuid || 'global'}`;
          localStorage.setItem(storageKey, JSON.stringify(snapshot));
          if (import.meta.env.DEV) console.debug('[ConsentStore.save] persisted snapshot to localStorage (post-API)', { storageKey, snapshotVersion: snapshot.version });
          
          // Disparar evento storage para sincronizar outras tabs
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new StorageEvent('storage', {
              key: storageKey,
              newValue: JSON.stringify(snapshot),
              storageArea: localStorage,
            }));
          }
        } catch (err) {
          console.error('[ConsentStore] Falha ao salvar no localStorage (post-API):', err);
        }

        return snapshot;
      } catch (error) {
        if (import.meta.env.DEV) console.error('[ConsentStore] (requireApi) Falha ao sincronizar com API:', error);
        // Rethrow to let caller handle failure (so UI can remain open)
        throw error;
      }
    }

    // Default flow: save locally first, then attempt API in best-effort (do not block caller)
    try {
      const storageKey = `${CONSENT_STORAGE_KEY}:${userUuid || 'global'}`;
      localStorage.setItem(storageKey, JSON.stringify(snapshot));
      if (import.meta.env.DEV) console.debug('[ConsentStore.save] persisted snapshot to localStorage (optimistic)', { storageKey, snapshotVersion: snapshot.version });
      
      // Disparar evento storage para sincronizar outras tabs
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', {
          key: storageKey,
          newValue: JSON.stringify(snapshot),
          storageArea: localStorage,
        }));
      }
    } catch (error) {
      console.error('[ConsentStore] Falha ao salvar no localStorage:', error);
      // Continuar mesmo com erro (pode ser quota exceeded)
    }

    try {
      const payload = {
        versaoTermo: snapshot.version,
        escopo: 'GERAL',
        concorda: this.hasAcceptedAll(choices),
        metadata: JSON.stringify(choices), // Salvar escolhas granulares
      };
      if (import.meta.env.DEV) console.log('[ConsentStore] Enviando payload para registrarConsentimento:', { identifier: userUuid, payload });
      const cpfMatch = typeof userUuid === 'string' && /^[0-9]{11}$/.test(userUuid);
      const res = cpfMatch
        ? await consentimentoService.registrarConsentimentoPorCpf(userUuid, payload)
        : await consentimentoService.registrarConsentimento(userUuid, payload);
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
      const storageKey = `${CONSENT_STORAGE_KEY}:${_userUuid || 'global'}`;
      const cached = localStorage.getItem(storageKey);
      if (!cached) {
        if (import.meta.env.DEV) console.log('[ConsentStore.load] no cached snapshot found', { storageKey });
        return null;
      }

      if (import.meta.env.DEV) console.log('[ConsentStore.load] raw cached value present', { storageKey });

      const snapshot = JSON.parse(cached) as ConsentSnapshot;

      // Validar estrutura básica
      if (!snapshot.version || !snapshot.choices || !snapshot.timestamp) {
        console.warn('[ConsentStore] Snapshot inválido, limpando cache', { storageKey });
        this.clear(_userUuid);
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
    // If version differs, update required
    if (snapshot.version !== CONSENT_VERSION) return true;

    // If snapshot has ttlMs use it, otherwise use config default
    try {
      const ttl = (snapshot.ttlMs && typeof snapshot.ttlMs === 'number') ? snapshot.ttlMs : CONSENT_CACHE_TTL;
      const ts = new Date(snapshot.timestamp).getTime();
      if (Number.isFinite(ts) && Date.now() - ts > (ttl || 0)) {
        if (import.meta.env.DEV) console.log('[ConsentStore.needsUpdate] snapshot expired by TTL', { timestamp: snapshot.timestamp, ttl });
        return true;
      }
    } catch (err) {
      // If parsing fails, consider it needing an update
      if (import.meta.env.DEV) console.warn('[ConsentStore.needsUpdate] failed to evaluate TTL, forcing update', err);
      return true;
    }

    return false;
  }

  /**
   * Limpa cache local
   */
  static clear(userUuid?: string): void {
    try {
      const storageKey = `${CONSENT_STORAGE_KEY}:${userUuid || 'global'}`;
      localStorage.removeItem(storageKey);
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
