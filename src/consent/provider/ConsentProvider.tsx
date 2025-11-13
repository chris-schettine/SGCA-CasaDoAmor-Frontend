import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ConsentDialog } from '../components/ConsentDialog/ConsentDialog';
import { ConsentStore } from '../store/consentStore';
import { consentimentoService } from '../../api/consentimento.service';
import { ConsentAnalytics } from '../analytics/consentAnalytics';
import { CONSENT_VERSION } from '../config/consentConfig';
import { useAuthStore, forceLogout } from '../../stores/useAuthStore';
import { toastError } from '../../utils/toast';
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // Prefer uuid when available; otherwise use CPF as identifier for public endpoint
  const identifier = user?.uuid || user?.cpf || '';

  // Estado do consentimento
  const [state, setState] = useState<ConsentState>({ type: 'loading' });
  
  // Controle do dialog
  const [isDialogOpen, setIsDialogOpen] = useState(forceOpen);
  const [isDialogRequired, setIsDialogRequired] = useState(false);

  /**
   * Hydration inicial: carrega do cache ou detecta primeira visita
   */
  useEffect(() => {
    let cancelled = false;
    if (import.meta.env.DEV) console.log('[ConsentProvider] useEffect triggered', { user, identifier, isAuthenticated });

    const run = async () => {
      const pendingFlag = typeof window !== 'undefined' && sessionStorage.getItem('consentimento-pending') === 'true';

      // Only proceed when we have an authenticated user and an identifier (uuid or cpf).
      // This prevents the consent dialog from showing during unauthenticated flows
      // such as the login page where persisted-but-invalid user data can exist.
      if (!user || !isAuthenticated) {
        if (import.meta.env.DEV) console.log('[ConsentProvider] user not authenticated or missing - staying in loading', { user, isAuthenticated });
        if (!cancelled) setState({ type: 'loading' });
        if (!cancelled) setIsDialogOpen(false);
        return;
      }

      // If there's a pending consent attempt that previously failed, try to verify
      // whether the backend actually received the consent since the last attempt.
      // If the backend already has a consent record for this identifier, clear
      // the pending flag and mark the user as consented. Otherwise keep forcing
      // the dialog open to allow the user to retry (blocking behavior).
      if (pendingFlag) {
        if (import.meta.env.DEV) console.log('[ConsentProvider] pending consent flag present - verifying backend before forcing dialog open');

        // If we have an identifier, attempt to query the backend to confirm saved consent.
        if (identifier) {
          try {
            const cpfMatch = /^[0-9]{11}$/.test(identifier);
            if (import.meta.env.DEV) console.debug('[ConsentProvider] pendingFlag check - identifier type', { identifier, cpfMatch });

            let backendArray: any[] = [];

            if (cpfMatch) {
              const resp = await consentimentoService.listarConsentimentosPorCpf(identifier);
              backendArray = Array.isArray(resp) ? resp : (resp && (resp as any).data && Array.isArray((resp as any).data) ? (resp as any).data : []);
            } else {
              // If identifier is a UUID, try both the profissional endpoint and
              // the public CPF endpoint (if we have a CPF on the user object).
              const respProf = await consentimentoService.listarConsentimentos(identifier).catch((e) => {
                if (import.meta.env.DEV) console.debug('[ConsentProvider] listarConsentimentos failed', e);
                return null;
              });
              const profArray = Array.isArray(respProf) ? respProf : (respProf && (respProf as any).content && Array.isArray((respProf as any).content) ? (respProf as any).content : []);

              let cpfArray: any[] = [];
              const cpfCandidate = user?.cpf;
              if (cpfCandidate && /^[0-9]{11}$/.test(cpfCandidate)) {
                const respCpf = await consentimentoService.listarConsentimentosPorCpf(cpfCandidate).catch((e) => {
                  if (import.meta.env.DEV) console.debug('[ConsentProvider] listarConsentimentosPorCpf (fallback) failed', e);
                  return null;
                });
                cpfArray = Array.isArray(respCpf) ? respCpf : (respCpf && (respCpf as any).data && Array.isArray((respCpf as any).data) ? (respCpf as any).data : []);
              }

              // Combine results from both endpoints (unique by uuid)
              const combined = [...profArray, ...cpfArray];
              const uniqueByUuid = combined.filter((v, i, a) => v && v.uuid && a.findIndex((x) => x.uuid === v.uuid) === i);
              backendArray = uniqueByUuid;
            }

            if (import.meta.env.DEV) console.debug('[ConsentProvider] pendingFlag backend check result', { identifier, backendCount: backendArray.length, preview: backendArray.slice(0,3) });

            if (backendArray.length > 0) {
              // Backend has a consent record -> clear pending and mark consented
              try {
                sessionStorage.removeItem('consentimento-pending');
                sessionStorage.setItem('consentimento-lgpd-checked', 'true');
              } catch {
                /* ignore */
              }

              const snapshot = ConsentStore.load(identifier);
              if (!cancelled) {
                if (snapshot && !ConsentStore.needsUpdate(snapshot)) {
                  setState({ type: 'consented', choices: snapshot.choices, timestamp: snapshot.timestamp });
                } else {
                  // If local snapshot is missing, create a minimal consented state from backend
                  setState({ type: 'consented', choices: ConsentStore.getDefaultChoices(), timestamp: new Date().toISOString() });
                }

                setIsDialogOpen(false);
                setIsDialogRequired(false);
              }

              return;
            }
          } catch (err) {
            console.error('[ConsentProvider] Error while verifying pending consent against backend:', err);
            // Fallthrough to force dialog open below
          }
        }

        if (import.meta.env.DEV) console.log('[ConsentProvider] pending consent flag present - forcing dialog open (no backend confirmation)');
        if (!cancelled) {
          setState({
            type: 'first_visit',
            defaultChoices: ConsentStore.getDefaultChoices(),
          });
          setIsDialogOpen(true);
          setIsDialogRequired(true);
        }
        return;
      }

      if (!identifier) {
        if (import.meta.env.DEV) console.log('[ConsentProvider] authenticated user has no identifier (uuid/cpf) - skipping consent check');
        if (!cancelled) setState({ type: 'loading' });
        if (!cancelled) setIsDialogOpen(false);
        return;
      }

      // Load snapshot namespaced by identifier (uuid or cpf)
      const snapshot = ConsentStore.load(identifier);
      if (import.meta.env.DEV) console.log('[ConsentProvider] loaded snapshot', { identifier: identifier || '[none]', snapshot });

      if (!snapshot) {
        // Primeira visita: nenhum consentimento salvo
        if (import.meta.env.DEV) console.log('[ConsentProvider] no snapshot - first_visit');
        if (!cancelled) {
          setState({
            type: 'first_visit',
            defaultChoices: ConsentStore.getDefaultChoices(),
          });
          setIsDialogOpen(true);
          setIsDialogRequired(true);
          ConsentAnalytics.trackDialogShown('first_visit');
        }
      } else if (ConsentStore.needsUpdate(snapshot)) {
        // Versão do termo mudou: solicitar re-consentimento
        if (import.meta.env.DEV) console.log('[ConsentProvider] snapshot needs update - version_mismatch', { snapshotVersion: snapshot.version, expected: CONSENT_VERSION });
        if (!cancelled) {
          setState({
            type: 'version_mismatch',
            currentChoices: snapshot.choices,
            oldVersion: snapshot.version,
            newVersion: CONSENT_VERSION,
          });
          setIsDialogOpen(true);
          setIsDialogRequired(true);
          ConsentAnalytics.trackDialogShown('version_change');
        }
      } else {
        // Consentimento válido
        if (import.meta.env.DEV) console.log('[ConsentProvider] snapshot OK - consented', { timestamp: snapshot.timestamp });
        if (!cancelled) setState({
          type: 'consented',
          choices: snapshot.choices,
          timestamp: snapshot.timestamp,
        });
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [user, identifier, isAuthenticated]);

  /**
   * Salva consentimento (chamado pelos botões do dialog)
   */
  const saveConsent = useCallback(
    async (choices: ConsentChoice) => {
      if (!identifier) {
        throw new Error('Cannot save consent without authenticated user identifier');
      }

      setState({ type: 'saving', choices });

      try {
        const snapshot = await ConsentStore.save(identifier, choices, { requireApi: true });

        // Clear any pending flag (successful API confirmation)
        try {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('consentimento-pending');
            sessionStorage.setItem('consentimento-lgpd-checked', 'true');
          }
        } catch {
          // ignore
        }

        setState({
          type: 'consented',
          choices: snapshot.choices,
          timestamp: snapshot.timestamp,
        });

        setIsDialogOpen(false);
        setIsDialogRequired(false);

        return snapshot;
      } catch (error: unknown) {
        console.error('[ConsentProvider] Erro ao salvar:', error);
        const message = error instanceof Error ? error.message : 'Erro desconhecido ao salvar consentimento';
        try {
          // mark pending so reloads keep the dialog open until successful
          if (typeof window !== 'undefined') sessionStorage.setItem('consentimento-pending', 'true');
        } catch {
          // ignore
        }
        try {
          toastError(`Não foi possível salvar o consentimento: ${message}`);
        } catch {
          // ignore toast failures
        }

        setState({
          type: 'error',
          message,
          previousChoices: choices,
        });

        throw error;
      }
    },
    [identifier]
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
          onCompleteRejection={() => {
            if (import.meta.env.DEV) console.debug('[ConsentProvider] onCompleteRejection invoked - closing dialog and forcing logout');
            // Close dialog locally so UI is removed immediately
            try {
              setIsDialogOpen(false);
              setIsDialogRequired(false);
            } catch (err) {
              console.warn('[ConsentProvider] Failed to close dialog before logout:', err);
            }

            try {
              // Force logout and redirect to login
              forceLogout();
            } catch (err) {
              console.error('[ConsentProvider] Error forcing logout after complete rejection:', err);
            }
          }}
        />
      )}
    </ConsentContext.Provider>
  );
}
