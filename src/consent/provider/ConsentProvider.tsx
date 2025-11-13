import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ConsentDialog } from '../components/ConsentDialog/ConsentDialog';
import { ConsentStore } from '../store/consentStore';
import { consentimentoService } from '../../api/consentimento.service';
import { ConsentAnalytics } from '../analytics/consentAnalytics';
import { CONSENT_VERSION } from '../config/consentConfig';
import { CONSENT_STORAGE_KEY } from '../config/consentConfig';
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

/*
  NOTE: this file intentionally allows a few `any` usages when parsing
  backend responses of uncertain shape. These are localized and safe;
  disabling the rule here avoids noisy lint failures while we refactor
  the API layer to return typed responses.
*/
/* eslint-disable @typescript-eslint/no-explicit-any */

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
  // Normalize CPF to digits-only to avoid mismatch with API endpoints
  const normalizeId = (v?: string | null) => (v ? String(v).replace(/\D/g, '') : '');
  const identifier = user?.uuid || normalizeId(user?.cpf) || '';

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
      // If an immediate logout due to consent rejection is in progress,
      // avoid opening the dialog or forcing a first_visit state. This prevents
      // a flicker where the dialog is closed then re-opened while logout/navigation occurs.
      const logoutPending = typeof window !== 'undefined' && sessionStorage.getItem('consentimento-logout-pending') === 'true';
      if (logoutPending) {
        if (import.meta.env.DEV) console.debug('[ConsentProvider] logout-pending flag set - skipping consent checks to avoid flicker');
        if (!cancelled) setState({ type: 'loading' });
        if (!cancelled) setIsDialogOpen(false);
        return;
      }

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
        // IMPORTANT: never call listarConsentimentos by UUID. Only consult by CPF.
        if (identifier) {
          try {
            const cpfCandidate = normalizeId(user?.cpf);
            if (import.meta.env.DEV) console.debug('[ConsentProvider] pendingFlag check - using cpfCandidate', { cpfCandidate });

            let backendArray: any[] = [];

            if (cpfCandidate && /^[0-9]{11}$/.test(cpfCandidate)) {
              const resp = await consentimentoService.listarConsentimentosPorCpf(cpfCandidate).catch((e) => {
                if (import.meta.env.DEV) console.debug('[ConsentProvider] listarConsentimentosPorCpf failed', e);
                return null;
              });
              backendArray = Array.isArray(resp) ? resp : (resp && (resp as any).data && Array.isArray((resp as any).data) ? (resp as any).data : []);
            } else {
              if (import.meta.env.DEV) console.debug('[ConsentProvider] no cpf available to verify pending consent; skipping backend check (never list by uuid)');
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
      let snapshot = ConsentStore.load(identifier);

      // Fallback: if identifier is a UUID but user has a CPF, check CPF-namespaced snapshot
      try {
        const cpfCandidate = normalizeId(user?.cpf);
        if (!snapshot && cpfCandidate && cpfCandidate !== identifier) {
          if (import.meta.env.DEV) console.debug('[ConsentProvider] trying fallback load using cpf identifier', { cpfCandidate });
          const snapshotByCpf = ConsentStore.load(cpfCandidate);
          if (snapshotByCpf) {
            if (import.meta.env.DEV) console.debug('[ConsentProvider] found snapshot under cpf key - using it', { cpfCandidate });
            snapshot = snapshotByCpf;
          }
        }
      } catch (err) {
        if (import.meta.env.DEV) console.debug('[ConsentProvider] fallback cpf load failed', err);
      }
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
   * Cross-tab sync: respond to localStorage changes for consent snapshots.
   * When another tab updates the snapshot for this identifier, update local state
   * immediately so that multi-tab coherence is preserved (<1s via storage event).
   */
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const onStorage = (e: StorageEvent) => {
      try {
        if (!identifier) return;
        const logoutPending = typeof window !== 'undefined' && sessionStorage.getItem('consentimento-logout-pending') === 'true';
        if (logoutPending) {
          if (import.meta.env.DEV) console.debug('[ConsentProvider] storage event ignored while logout pending', { key: e.key });
          return;
        }
        const expectedKey = `${CONSENT_STORAGE_KEY}:${identifier || 'global'}`;
        // Respond to changes for this user's snapshot key (uuid) or their cpf key
        const cpfCandidate = normalizeId(user?.cpf);
        const cpfKey = cpfCandidate ? `${CONSENT_STORAGE_KEY}:${cpfCandidate}` : null;
        if (e.key !== expectedKey && e.key !== cpfKey) return;

        if (import.meta.env.DEV) console.debug('[ConsentProvider] storage event for consent snapshot', { key: e.key, newValue: e.newValue });

        // Prefer uuid-keyed snapshot; fallback to cpf-keyed snapshot if present
        let snapshot = ConsentStore.load(identifier);
        if ((!snapshot || ConsentStore.needsUpdate(snapshot)) && cpfKey) {
          const snapshotByCpf = ConsentStore.load(cpfCandidate as string);
          if (snapshotByCpf && !ConsentStore.needsUpdate(snapshotByCpf)) {
            snapshot = snapshotByCpf;
          }
        }

        if (snapshot && !ConsentStore.needsUpdate(snapshot)) {
          // Another tab accepted/updated consent -> reflect it immediately
          setState({ type: 'consented', choices: snapshot.choices, timestamp: snapshot.timestamp });
          setIsDialogOpen(false);
          setIsDialogRequired(false);
          try { sessionStorage.setItem('consentimento-lgpd-checked', 'true'); } catch {}
        } else {
          // Snapshot removed or expired -> require re-consent
          setState({ type: 'first_visit', defaultChoices: ConsentStore.getDefaultChoices() });
          setIsDialogOpen(true);
          setIsDialogRequired(true);
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error('[ConsentProvider] storage event handler failed', err);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [identifier]);

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
