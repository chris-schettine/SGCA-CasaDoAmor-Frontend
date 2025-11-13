import type { ConsentAnalyticsEvent } from '../types/consent.types';

/**
 * ConsentAnalytics - Tracking de eventos de consentimento
 * 
 * Princípios:
 * - Zero PII: Não envia IP, email, nome
 * - Device ID anônimo: UUID gerado localmente
 * - Payload mínimo: Apenas dados essenciais
 * - Privacy-first: Respeita próprio estado de consentimento
 */
export class ConsentAnalytics {
  private static readonly DEVICE_ID_KEY = 'analytics_device_id';

  /**
   * Rastreia evento de consentimento
   * 
   * @param event - Evento a rastrear
   * 
   * @example
   * ```ts
   * ConsentAnalytics.track({
   *   event_name: 'consent_accept_all',
   *   consent_version: '1.0.0',
   * });
   * ```
   */
  static track(event: ConsentAnalyticsEvent): void {
    // Verificar se analytics está consentido
    const hasConsent = this.hasAnalyticsConsent();
    if (!hasConsent) {
      this.logDev('Analytics bloqueado (sem consentimento)', event);
      return;
    }

    const payload = {
      ...event,
      timestamp: new Date().toISOString(),
      device_id: this.getAnonymousId(),
      app_version: this.getAppVersion(),
    };

    // Enviar para dataLayer (Google Tag Manager)
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(payload);
      this.logDev('Evento enviado para dataLayer', payload);
    }

    // Backup: enviar para console em dev
    if (process.env.NODE_ENV === 'development') {
      console.log('[Consent Analytics]', payload);
    }

    // TODO: Enviar para backend analytics endpoint
    // this.sendToBackend(payload);
  }

  /**
   * Gera ou recupera device ID anônimo (UUID v4)
   */
  private static getAnonymousId(): string {
    try {
      let id = localStorage.getItem(this.DEVICE_ID_KEY);
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(this.DEVICE_ID_KEY, id);
      }
      return id;
    } catch (error) {
      // Fallback se localStorage falhar
      return 'anonymous';
    }
  }

  /**
   * Verifica se usuário consentiu analytics
   */
  private static hasAnalyticsConsent(): boolean {
    try {
      const stored = localStorage.getItem('consent_snapshot');
      if (!stored) return false;

      const snapshot = JSON.parse(stored);
      return snapshot.choices?.analytics_usage === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Retorna versão da aplicação (do package.json)
   */
  private static getAppVersion(): string {
    // TODO: Injetar via env var durante build
    return '1.0.0';
  }

  /**
   * Log apenas em desenvolvimento
   */
  private static logDev(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ConsentAnalytics] ${message}`, data);
    }
  }

  /**
   * Helper: Rastreia evento de dialog mostrado
   */
  static trackDialogShown(trigger: 'first_visit' | 'manual' | 'version_change'): void {
    this.track({
      event: 'consent_dialog_shown',
      consent_version: '1.0.0',
      timestamp: new Date().toISOString(),
      metadata: { trigger_reason: trigger },
    });
  }

  /**
   * Helper: Rastreia aceitação total
   */
  static trackAcceptAll(consentVersion: string): void {
    this.track({
      event: 'consent_accept_all',
      consent_version: consentVersion,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Helper: Rastreia rejeição de não-essenciais
   */
  static trackRejectNonEssential(consentVersion: string): void {
    this.track({
      event: 'consent_reject_non_essential',
      consent_version: consentVersion,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Helper: Rastreia salvamento customizado
   */
  static trackSavePreferences(
    consentVersion: string,
    purposesAccepted: string[]
  ): void {
    this.track({
      event: 'consent_save_preferences',
      consent_version: consentVersion,
      timestamp: new Date().toISOString(),
      metadata: { purposes_accepted: purposesAccepted },
    });
  }

  /**
   * Helper: Rastreia fechamento sem ação
   */
  static trackDialogClosed(method: 'escape' | 'close_button' | 'backdrop'): void {
    this.track({
      event: 'consent_dialog_closed',
      consent_version: '1.0.0',
      timestamp: new Date().toISOString(),
      metadata: { close_method: method },
    });
  }

  /**
   * Helper: Rastreia retirada de consentimento
   */
  static trackConsentWithdrawn(consentVersion: string): void {
    this.track({
      event: 'consent_withdrawn',
      consent_version: consentVersion,
      timestamp: new Date().toISOString(),
    });
  }
}

// Extend window para dataLayer
declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}
