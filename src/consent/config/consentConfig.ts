/**
 * Configuração de Finalidades de Consentimento LGPD
 * Define todas as finalidades de tratamento de dados do sistema
 */

import type { ConsentPurpose } from '../types/consent.types';

/**
 * Versão atual do termo de consentimento
 * Incrementar quando houver mudanças substanciais no termo
 */
export const CONSENT_VERSION = '1.0.0';

/**
 * Chave do localStorage para persistência local
 */
export const CONSENT_STORAGE_KEY = 'casa-amor-lgpd-consent';

/**
 * Chave do sessionStorage para flag de verificação
 */
export const CONSENT_SESSION_FLAG = 'consent-check-done';

/**
 * TTL do cache local (7 dias em ms)
 */
export const CONSENT_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

/**
 * Definição de todas as finalidades de tratamento
 * Ordem de exibição na UI
 */
export const CONSENT_PURPOSES: ConsentPurpose[] = [
  // ESSENCIAIS (não podem ser desabilitadas)
  {
    id: 'essential_auth',
    label: 'Autenticação e Segurança',
    description: 'Necessário para realizar login, gerenciar sua sessão e proteger sua conta contra acessos não autorizados.',
    legalBasis: 'legitimate_interest',
    category: 'essential',
    userCanDisable: false,
    defaultEnabled: true,
    moreInfoUrl: '/politica-privacidade#autenticacao',
  },
  {
    id: 'essential_clinical',
    label: 'Gestão de Dados Clínicos',
    description: 'Armazenamento e processamento de prontuários, consultas e dados médicos conforme legislação sanitária vigente.',
    legalBasis: 'legal_obligation',
    category: 'essential',
    userCanDisable: false,
    defaultEnabled: true,
    moreInfoUrl: '/politica-privacidade#dados-clinicos',
  },
  
  // FUNCIONAIS (opt-in, desabilitado por padrão)
  {
    id: 'functional_preferences',
    label: 'Preferências de Interface',
    description: 'Salvar suas escolhas de tema, idioma e configurações de acessibilidade para personalizar sua experiência.',
    legalBasis: 'consent',
    category: 'functional',
    userCanDisable: true,
    defaultEnabled: false,
  },
  {
    id: 'functional_notifications',
    label: 'Notificações do Sistema',
    description: 'Enviar lembretes de consultas, atualizações de prontuários e alertas relevantes para sua atividade profissional.',
    legalBasis: 'consent',
    category: 'functional',
    userCanDisable: true,
    defaultEnabled: false,
  },
  
  // ANALYTICS (opt-in, desabilitado por padrão)
  {
    id: 'analytics_usage',
    label: 'Análise de Uso',
    description: 'Coletar métricas anônimas sobre como você utiliza o sistema para identificar melhorias e otimizar funcionalidades.',
    legalBasis: 'consent',
    category: 'analytics',
    userCanDisable: true,
    defaultEnabled: false,
    moreInfoUrl: '/politica-privacidade#analytics',
  },
  
  // MARKETING (opt-in, desabilitado por padrão)
  {
    id: 'marketing_emails',
    label: 'Comunicações por E-mail',
    description: 'Receber newsletters, atualizações de funcionalidades e materiais educativos sobre o sistema e boas práticas clínicas.',
    legalBasis: 'consent',
    category: 'marketing',
    userCanDisable: true,
    defaultEnabled: false,
  },
];

/**
 * Categorias para agrupamento visual
 */
export const CONSENT_CATEGORIES = {
  essential: {
    label: 'Essenciais',
    description: 'Necessárias para o funcionamento básico do sistema',
    icon: 'shield',
  },
  functional: {
    label: 'Funcionais',
    description: 'Melhoram sua experiência de uso',
    icon: 'settings',
  },
  analytics: {
    label: 'Análise',
    description: 'Ajudam a entender e melhorar o sistema',
    icon: 'chart',
  },
  marketing: {
    label: 'Marketing',
    description: 'Mantém você informado sobre novidades',
    icon: 'mail',
  },
} as const;

/**
 * URLs de documentação
 */
export const CONSENT_URLS = {
  privacyPolicy: '/politica-privacidade',
  termsOfService: '/termos-de-uso',
  cookiePolicy: '/politica-cookies',
  contactDpo: 'mailto:dpo@casadoamor.com.br',
} as const;

// Aliases para compatibilidade
export const CONSENT_PRIVACY_POLICY_URL = CONSENT_URLS.privacyPolicy;
export const CONSENT_TERMS_OF_SERVICE_URL = CONSENT_URLS.termsOfService;

/**
 * Textos do termo resumido (exibido no dialog)
 */
export const CONSENT_TERMS_SUMMARY = `
A Casa do Amor coleta e processa seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

Tratamos seus dados para finalidades específicas, utilizando bases legais adequadas. Você tem direito a acessar, corrigir, excluir e portar seus dados, bem como revogar consentimentos a qualquer momento.

Para mais detalhes, consulte nossa [Política de Privacidade](${CONSENT_URLS.privacyPolicy}).
`.trim();

/**
 * Microcopy de botões e labels
 */
export const CONSENT_LABELS = {
  dialogTitle: 'Consentimento para Tratamento de Dados',
  dialogDescription: 'Escolha como seus dados serão utilizados no sistema',
  acceptAllButton: 'Aceitar Todos',
  rejectNonEssentialButton: 'Apenas Essenciais',
  savePreferencesButton: 'Salvar Preferências',
  closeButton: 'Fechar',
  managePreferencesLink: 'Gerenciar Preferências de Privacidade',
  
  // Estados
  loadingMessage: 'Carregando suas preferências...',
  savingMessage: 'Salvando...',
  savedMessage: 'Preferências salvas com sucesso!',
  errorMessage: 'Erro ao salvar. Tente novamente.',
  offlineMessage: 'Você está offline. Alterações serão salvas quando reconectar.',
  
  // Avisos
  essentialNotice: 'Finalidades essenciais não podem ser desabilitadas pois são necessárias para o funcionamento do sistema.',
  closeWarning: 'Ao fechar sem salvar, suas preferências anteriores serão mantidas.',
  withdrawWarning: 'Desabilitar todas as finalidades não essenciais pode limitar funcionalidades do sistema.',
} as const;
