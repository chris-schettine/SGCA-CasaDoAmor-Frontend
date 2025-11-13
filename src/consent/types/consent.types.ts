/**
 * Tipos TypeScript para o Sistema de Consentimento LGPD
 * Strict typing para garantir type-safety em todo o fluxo
 */

/**
 * Base legal do tratamento de dados conforme LGPD Art. 7º
 */
export type LegalBasis =
  | 'consent'              // Consentimento do titular
  | 'legitimate_interest'  // Interesse legítimo do controlador
  | 'legal_obligation'     // Cumprimento de obrigação legal
  | 'contract_execution';  // Execução de contrato

/**
 * Definição de uma finalidade de tratamento de dados
 */
export interface ConsentPurpose {
  /** Identificador único (ex: 'essential_auth') */
  id: string;
  
  /** Rótulo curto exibido na UI */
  label: string;
  
  /** Descrição detalhada (1-2 frases, sem jargões) */
  description: string;
  
  /** Base legal do tratamento */
  legalBasis: LegalBasis;
  
  /** Categoria visual (para agrupamento na UI) */
  category: 'essential' | 'functional' | 'analytics' | 'marketing';
  
  /** Se false, usuário não pode desabilitar (ex: autenticação) */
  userCanDisable: boolean;
  
  /** Valor padrão (true apenas se essencial) */
  defaultEnabled: boolean;
  
  /** URL com mais informações (opcional) */
  moreInfoUrl?: string;
}

/**
 * Escolhas do usuário (mapa purpose.id → boolean)
 */
export interface ConsentChoice {
  [purposeId: string]: boolean;
}

/**
 * Snapshot completo do estado de consentimento
 * Persistido em localStorage e API
 */
export interface ConsentSnapshot {
  /** Versão do termo (ex: '1.0.0') */
  version: string;
  
  /** Escolhas do usuário */
  choices: ConsentChoice;
  
  /** Timestamp ISO 8601 da última atualização */
  timestamp: string;
  
  /** IP de origem (armazenado no backend, não exibido na UI) */
  ipAddress?: string;
  
  /** User-Agent (armazenado no backend) */
  userAgent?: string;
  
  /** Metadata adicional (JSON string) */
  metadata?: string;
}

/**
 * Estado da máquina de estados do consentimento
 */
export type ConsentState =
  | { type: 'loading' }
  | { type: 'first_visit'; defaultChoices: ConsentChoice }
  | { type: 'consented'; choices: ConsentChoice; timestamp: string }
  | { type: 'version_mismatch'; currentChoices: ConsentChoice; oldVersion: string; newVersion: string }
  | { type: 'saving'; choices: ConsentChoice }
  | { type: 'error'; message: string; previousChoices?: ConsentChoice };

/**
 * Valor do Context (API pública do ConsentProvider)
 */
export interface ConsentContextValue {
  /** Estado atual do consentimento */
  state: ConsentState;
  
  /** Verificar se tem consentimento para uma finalidade */
  hasConsent: (purposeId: string) => boolean;
  
  /** Abrir dialog manualmente */
  openDialog: () => void;
  
  /** Retirar consentimento (reset para essenciais) */
  withdrawConsent: () => Promise<void>;
  
  /** Shortcut: está em loading? */
  isLoading: boolean;
  
  /** Shortcut: choices atuais (vazio se não consentido) */
  choices: ConsentChoice;
  /** Se o diálogo está atualmente aberto */
  dialogOpen: boolean;
  /** Se o diálogo está sendo exigido (não pode ser fechado sem ação) */
  dialogRequired: boolean;
}

/**
 * Evento de analytics
 */
export interface ConsentAnalyticsEvent {
  event: 'consent_dialog_shown'
    | 'consent_accept_all'
    | 'consent_reject_non_essential'
    | 'consent_save_preferences'
    | 'consent_withdrawn'
    | 'consent_dialog_closed'
    | 'consent_version_updated'
    | 'consent_error';
  
  consent_version: string;
  timestamp: string;
  
  /** Dados específicos do evento (sem PII) */
  metadata?: Record<string, unknown>;
}

/**
 * Configuração de integração com backend
 */
export interface ConsentApiConfig {
  /** URL base da API */
  baseUrl: string;
  
  /** Endpoint de listagem */
  listEndpoint: (profissionalUuid: string) => string;
  
  /** Endpoint de criação */
  createEndpoint: (profissionalUuid: string) => string;
  
  /** Headers customizados */
  headers?: Record<string, string>;
}

/**
 * Opções de persistência
 */
export interface ConsentStorageOptions {
  /** Chave do localStorage */
  storageKey: string;
  
  /** TTL em ms (null = sem expiração) */
  ttl?: number | null;
  
  /** Sincronizar com API automaticamente */
  syncWithApi: boolean;
}
