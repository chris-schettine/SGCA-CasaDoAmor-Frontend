import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ConsentDialog } from '../components/ConsentDialog/ConsentDialog';
import { ConsentStore } from '../store/consentStore';
import { ConsentAnalytics } from '../analytics/consentAnalytics';
import { CONSENT_VERSION } from '../config/consentConfig';
import { useAuthStore } from '../../stores/useAuthStore';
import type {
  ConsentContextValue,
  ConsentChoice,
  ConsentState,
} from '../types/consent.types';

/**
 * Context para gerenciamento global de consentimento
 */
export const ConsentContext = createContext<ConsentContextValue | null>(null);

interface ConsentProviderProps {
  children: ReactNode;
  /**
   * Se true, força abertura do dialog na inicialização
   * (útil para testes)
   */
  forceOpen?: boolean;
}

/**
 * Provider de consentimento LGPD
 * 
 * Funcionalidades:
 * - Hydration automática do cache local
 * - Detecção de mudança de versão
 * - Controle de abertura do dialog (primeira visita, manual, versão)
 * - API para verificar consentimento por finalidade
 * 
 * @example
 * ```tsx
 * // Em App.tsx ou main.tsx
 * <ConsentProvider>
 *   <YourApp />
 * </ConsentProvider>
 * ```
 */
export function ConsentProvider({ children, forceOpen = false }: ConsentProviderProps) {
  const user = useAuthStore((state) => state.user);
  const userUuid = user?.uuid || '';

  // Estado do consentimento
  const [state, setState] = useState<ConsentState>({ type: 'loading' });
  
  // Controle do dialog
  const [isDialogOpen, setIsDialogOpen] = useState(forceOpen);
  const [isDialogRequired, setIsDialogRequired] = useState(false);

  /**
   * Hydration inicial: carrega do cache ou detecta primeira visita
   */
  useEffect(() => {
    if (import.meta.env.DEV) console.log('[ConsentProvider] useEffect triggered', { user, userUuid });

    // If there's no user object at all, keep loading until auth hydrates
    if (!user) {
      if (import.meta.env.DEV) console.log('[ConsentProvider] no user yet - staying in loading');
      setState({ type: 'loading' });
      return;
    }

    // Use userUuid when available; otherwise fall back to reading cache without UUID
    const snapshot = userUuid ? ConsentStore.load(userUuid) : ConsentStore.load();
    if (import.meta.env.DEV) console.log('[ConsentProvider] loaded snapshot', { userUuid: userUuid || '[none]', snapshot });

    if (!snapshot) {
      // Primeira visita: nenhum consentimento salvo
      if (import.meta.env.DEV) console.log('[ConsentProvider] no snapshot - first_visit');
      setState({
        type: 'first_visit',
        defaultChoices: ConsentStore.getDefaultChoices(),
      });
      setIsDialogOpen(true);
      setIsDialogRequired(true);
      ConsentAnalytics.trackDialogShown('first_visit');
    } else if (ConsentStore.needsUpdate(snapshot)) {
      // Versão do termo mudou: solicitar re-consentimento
      if (import.meta.env.DEV) console.log('[ConsentProvider] snapshot needs update - version_mismatch', { snapshotVersion: snapshot.version, expected: CONSENT_VERSION });
      setState({
        type: 'version_mismatch',
        currentChoices: snapshot.choices,
        oldVersion: snapshot.version,
        newVersion: CONSENT_VERSION,
      });
      setIsDialogOpen(true);
      setIsDialogRequired(true);
      ConsentAnalytics.trackDialogShown('version_change');
    } else {
      // Consentimento válido
      if (import.meta.env.DEV) console.log('[ConsentProvider] snapshot OK - consented', { timestamp: snapshot.timestamp });
      setState({
        type: 'consented',
        choices: snapshot.choices,
        timestamp: snapshot.timestamp,
      });
    }
  }, [user, userUuid]);

  /**
   * Salva consentimento (chamado pelos botões do dialog)
   */
  const saveConsent = useCallback(
    async (choices: ConsentChoice) => {
      if (!userUuid) {
        throw new Error('Cannot save consent without authenticated user');
      }

      setState({ type: 'saving', choices });

      try {
        const snapshot = await ConsentStore.save(userUuid, choices);

        setState({
          type: 'consented',
          choices: snapshot.choices,
          timestamp: snapshot.timestamp,
        });

        setIsDialogOpen(false);
        setIsDialogRequired(false);

        return snapshot;
      } catch (error) {
        console.error('[ConsentProvider] Erro ao salvar:', error);
        
        setState({
          type: 'error',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          previousChoices: choices,
        });

        throw error;
      }
    },
    [userUuid]
  );

  /**
   * Handler: Aceitar todos
   */
  const handleAcceptAll = useCallback(async () => {
    const choices = ConsentStore.getAcceptAllChoices();
    await saveConsent(choices);
    ConsentAnalytics.trackAcceptAll(CONSENT_VERSION);
  }, [saveConsent]);

  /**
   * Handler: Apenas essenciais
   */
  const handleRejectNonEssential = useCallback(async () => {
    const choices = ConsentStore.getEssentialOnlyChoices();
    await saveConsent(choices);
    ConsentAnalytics.trackRejectNonEssential(CONSENT_VERSION);
  }, [saveConsent]);

  /**
   * Handler: Salvar preferências customizadas
   */
  const handleSavePreferences = useCallback(
    async (choices: ConsentChoice) => {
      await saveConsent(choices);
      const purposesAccepted = Object.keys(choices).filter((k) => choices[k]);
      ConsentAnalytics.trackSavePreferences(CONSENT_VERSION, purposesAccepted);
    },
    [saveConsent]
  );

  /**
   * Handler: Fechar dialog sem salvar
   */
  const handleCloseDialog = useCallback(() => {
    if (!isDialogRequired) {
      setIsDialogOpen(false);
    }
  }, [isDialogRequired]);

  /**
   * API: Verificar se tem consentimento para uma finalidade
   */
  const hasConsent = useCallback(
    (purposeId: string): boolean => {
      if (state.type === 'consented') {
        return state.choices[purposeId] === true;
      }
      if (state.type === 'saving') {
        return state.choices[purposeId] === true;
      }
      return false;
    },
    [state]
  );

  /**
   * API: Abrir dialog manualmente (link "Gerenciar Preferências")
   */
  const openDialog = useCallback(() => {
    setIsDialogOpen(true);
    setIsDialogRequired(false);
    ConsentAnalytics.trackDialogShown('manual');
  }, []);

  /**
   * API: Retirar consentimento (reset para essenciais)
   */
  const withdrawConsent = useCallback(async () => {
    const choices = ConsentStore.getEssentialOnlyChoices();
    await saveConsent(choices);
    ConsentAnalytics.trackConsentWithdrawn(CONSENT_VERSION);
  }, [saveConsent]);

  /**
   * Choices atuais (para passar ao dialog)
   */
  const currentChoices = useMemo(() => {
    if (state.type === 'consented' || state.type === 'saving') {
      return state.choices;
    }
    if (state.type === 'version_mismatch') {
      return state.currentChoices;
    }
    if (state.type === 'first_visit') {
      return state.defaultChoices;
    }
    return ConsentStore.getDefaultChoices();
  }, [state]);

  /**
   * Context value (memoizado para performance)
   */
  const contextValue = useMemo<ConsentContextValue>(
    () => ({
      state,
      hasConsent,
      openDialog,
      withdrawConsent,
      isLoading: state.type === 'loading' || state.type === 'saving',
      choices: state.type === 'consented' ? state.choices : {},
      dialogOpen: isDialogOpen,
      dialogRequired: isDialogRequired,
    }),
    [state, hasConsent, openDialog, withdrawConsent, isDialogOpen, isDialogRequired]
  );

  return (
    <ConsentContext.Provider value={contextValue}>
      {children}
      
      {/* Dialog renderizado apenas quando necessário */}
      {isDialogOpen && (
        <ConsentDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          onAcceptAll={handleAcceptAll}
          onRejectNonEssential={handleRejectNonEssential}
          onSavePreferences={handleSavePreferences}
          currentChoices={currentChoices}
          isLoading={state.type === 'saving'}
          required={isDialogRequired}
        />
      )}
    </ConsentContext.Provider>
  );
}
