import { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

// Removed unused BackendPayload interface

type ConsentRecord = ConsentChoice & {
  metadata?: string;
  createdAt?: string;
  dataConsentimento?: string;
  data?: string;
  concorda?: boolean;
  uuid?: string;
  [key: string]: unknown;
};

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
  
  // Estado para rastrear se estamos na página de login
  // Usa window.location.pathname diretamente (não depende do Router)
  const [isLoginPage, setIsLoginPage] = useState(() => {
    return typeof window !== 'undefined' && window.location.pathname === '/login';
  });
  
  // Atualizar isLoginPage quando a rota mudar
  useEffect(() => {
    const updateLoginPage = () => {
      const isLogin = typeof window !== 'undefined' && window.location.pathname === '/login';
      setIsLoginPage(isLogin);
    };
    
    // Verificar imediatamente
    updateLoginPage();
    
    // Listener para mudanças de rota (popstate para navegação do browser)
    window.addEventListener('popstate', updateLoginPage);
    
    // Interceptar pushState e replaceState do history API (usado pelo React Router)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      updateLoginPage();
    };
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      updateLoginPage();
    };
    
    return () => {
      window.removeEventListener('popstate', updateLoginPage);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);
  
  // Prefer uuid when available; otherwise use CPF as identifier for public endpoint
  // Normalize CPF to digits-only to avoid mismatch with API endpoints
  const normalizeId = (v?: string | null) => (v ? String(v).replace(/\D/g, '') : '');
  
  // Memoizar identifier para evitar recálculos desnecessários
  const identifier = useMemo(() => {
    return user?.uuid || normalizeId(user?.cpf) || '';
  }, [user?.uuid, user?.cpf]);
  
  // Memoizar CPF normalizado para uso no fallback
  const cpfNormalized = useMemo(() => {
    return normalizeId(user?.cpf);
  }, [user?.cpf]);

  // Estado do consentimento
  const [state, setState] = useState<ConsentState>({ type: 'loading' });
  
  // Controle do dialog
  const [isDialogOpen, setIsDialogOpen] = useState(forceOpen);
  const [isDialogRequired, setIsDialogRequired] = useState(false);
  
  // Ref para rastrear se já processamos o hydration para este identifier (evita loops)
  const processedIdentifierRef = useRef<string | null>(null);
  
  // Ref para forçar re-execução do hydration quando necessário
  const forceHydrationRef = useRef(0);
  
  // Timeout de segurança: se ficar em loading por muito tempo, forçar first_visit
  useEffect(() => {
    if (state.type !== 'loading' || !identifier || !isAuthenticated) {
      return;
    }
    
    const timeout = setTimeout(() => {
      // Usar função de atualização para garantir que verificamos o estado atual
      setState((currentState) => {
        // Se ainda está em loading após 3 segundos, forçar first_visit
        if (currentState.type === 'loading') {
          if (import.meta.env.DEV) console.warn('[ConsentProvider] Loading timeout (3s) - forcing first_visit to prevent infinite loading');
          setIsDialogOpen(true);
          setIsDialogRequired(true);
          processedIdentifierRef.current = identifier; // Marcar como processado
          return {
            type: 'first_visit',
            defaultChoices: ConsentStore.getDefaultChoices(),
          };
        }
        // Se mudou para outro estado, não fazer nada
        return currentState;
      });
    }, 3000); // 3 segundos de timeout (reduzido para aparecer mais rápido)
    
    return () => clearTimeout(timeout);
  }, [state.type, identifier, isAuthenticated]);

  /**
   * Monitor: fechar dialog se estiver na página de login
   */
  useEffect(() => {
    if (isLoginPage && isDialogOpen) {
      console.log('[ConsentProvider] on login page - closing dialog', { isLoginPage, isDialogOpen });
      setIsDialogOpen(false);
      setIsDialogRequired(false);
    }
  }, [isLoginPage, isDialogOpen]);

  /**
   * Monitor: garantir que o dialog está aberto quando o estado requer
   */
  useEffect(() => {
    // Se o estado é first_visit ou version_mismatch, o dialog deve estar aberto
    if ((state.type === 'first_visit' || state.type === 'version_mismatch') && !isLoginPage && isAuthenticated) {
      if (!isDialogOpen) {
        console.log('[ConsentProvider] state requires dialog but it is closed - opening dialog', { 
          stateType: state.type, 
          isLoginPage, 
          isAuthenticated 
        });
        setIsDialogOpen(true);
        setIsDialogRequired(true);
      }
    }
  }, [state.type, isDialogOpen, isLoginPage, isAuthenticated]);

  /**
   * Monitor: quando identifier aparece pela primeira vez, garantir que o hydration execute
   * E limpar flags de logout que podem estar bloqueando o hydration
   */
  useEffect(() => {
    if (!identifier || !isAuthenticated) {
      return;
    }
    
    // Limpar TODAS as flags relacionadas a consentimento quando usuário faz login
    // Isso garante que após logout/login, o fluxo seja limpo
    console.log('[ConsentProvider] user logged in - clearing all consent flags and resetting state', { identifier });
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('consentimento-logout-pending');
        sessionStorage.removeItem('consentimento-pending');
        sessionStorage.removeItem('consentimento-lgpd-checked');
        // Não limpar 'consentimento-api-called' pois pode ser útil para evitar chamadas duplicadas
      }
    } catch (err) {
      console.warn('[ConsentProvider] failed to clear consent flags', err);
    }
    
    // Resetar processedIdentifierRef quando identifier muda (novo login = novo processamento)
    // Isso garante que após logout/login, o hydration execute novamente
    if (processedIdentifierRef.current !== identifier) {
      console.log('[ConsentProvider] identifier changed on login - resetting processed ref', { 
        old: processedIdentifierRef.current, 
        new: identifier 
      });
      processedIdentifierRef.current = null;
    }
    
    // Se temos identifier e estamos autenticados mas ainda em loading,
    // forçar uma re-execução do hydration principal incrementando o ref
    if (state.type === 'loading') {
      console.log('[ConsentProvider] identifier appeared while in loading - forcing hydration', { identifier, isAuthenticated, stateType: state.type });
      forceHydrationRef.current += 1;
    }
  }, [identifier, isAuthenticated, state.type]); // Executar quando identifier, isAuthenticated ou state.type mudarem

  /**
   * Hydration inicial: carrega do cache ou detecta primeira visita
   */
  useEffect(() => {
    let cancelled = false;
    console.log('[ConsentProvider] useEffect triggered', { identifier, isAuthenticated, cpfNormalized, currentState: state.type, processedIdentifier: processedIdentifierRef.current });

    // Se não temos identifier, não estamos autenticados, ou estamos na página de login, aguardar
    if (!identifier || !isAuthenticated || isLoginPage) {
      console.log('[ConsentProvider] missing identifier, not authenticated, or on login page - waiting', { identifier, isAuthenticated, isLoginPage });
      // Garantir que o dialog está fechado se estiver na página de login
      if (isLoginPage && isDialogOpen) {
        setIsDialogOpen(false);
        setIsDialogRequired(false);
      }
      return;
    }

    // Se o identifier mudou, resetar o ref (novo usuário = novo processamento)
    if (processedIdentifierRef.current && processedIdentifierRef.current !== identifier) {
      if (import.meta.env.DEV) console.debug('[ConsentProvider] identifier changed - resetting processed ref', { old: processedIdentifierRef.current, new: identifier });
      processedIdentifierRef.current = null;
    }

    // IMPORTANTE: Se estamos em loading, SEMPRE executar (mesmo que já tenhamos processado antes)
    // Isso garante que o estado não fique travado em loading
    if (state.type === 'loading') {
      console.log('[ConsentProvider] in loading state - will execute hydration');
      // Continuar para executar o run()
    } else if (state.type === 'consented' && processedIdentifierRef.current === identifier) {
      // Se já está consented e já processamos, não executar novamente
      // MAS: se há flags de pending, pode ser que o consentimento não foi realmente salvo
      const hasPendingFlags = typeof window !== 'undefined' && (
        sessionStorage.getItem('consentimento-pending') === 'true' ||
        sessionStorage.getItem('consentimento-logout-pending') === 'true'
      );
      
      if (hasPendingFlags) {
        console.log('[ConsentProvider] consented but pending flags present - re-executing hydration to verify', { identifier });
        // Limpar flags e continuar para verificar novamente
        try {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('consentimento-pending');
            sessionStorage.removeItem('consentimento-logout-pending');
          }
        } catch (err) {
          console.warn('[ConsentProvider] failed to clear pending flags', err);
        }
        // Continuar para executar o run() e verificar novamente
      } else {
        console.log('[ConsentProvider] already consented and processed - skipping hydration to avoid reset');
        return;
      }
    } else if ((state.type === 'first_visit' || state.type === 'version_mismatch') && processedIdentifierRef.current === identifier) {
      // Se já está em first_visit/version_mismatch e já processamos, não resetar (evita loops)
      // MAS: garantir que o dialog está aberto se o estado requer isso
      console.log('[ConsentProvider] already in first_visit/version_mismatch and processed - ensuring dialog is open', { 
        identifier, 
        stateType: state.type, 
        isDialogOpen, 
        isDialogRequired 
      });
      
      // Garantir que o dialog está aberto se o estado requer
      if (!isDialogOpen) {
        console.log('[ConsentProvider] dialog not open but state requires it - opening dialog', { stateType: state.type });
        setIsDialogOpen(true);
        setIsDialogRequired(true);
      }
      
      // Se há flags de pending, limpar mas manter o estado
      const hasPendingFlags = typeof window !== 'undefined' && (
        sessionStorage.getItem('consentimento-pending') === 'true' ||
        sessionStorage.getItem('consentimento-logout-pending') === 'true'
      );
      
      if (hasPendingFlags) {
        console.log('[ConsentProvider] first_visit/version_mismatch but pending flags present - clearing flags', { identifier });
        try {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('consentimento-pending');
            sessionStorage.removeItem('consentimento-logout-pending');
          }
        } catch (err) {
          console.warn('[ConsentProvider] failed to clear pending flags', err);
        }
      }
      
      return; // Manter o estado atual
    } else {
      // Estado diferente de loading e não processamos ainda, executar
      console.log('[ConsentProvider] state is not loading and not processed - will execute hydration', { stateType: state.type });
    }

    console.log('[ConsentProvider] starting hydration run...');
    const run = async () => {
      console.log('[ConsentProvider] run() started', { identifier, isAuthenticated, cancelled });
      
      // Verificar cancelled logo no início
      if (cancelled) {
        console.warn('[ConsentProvider] run() cancelled before starting');
        return;
      }
      
      // If an immediate logout due to consent rejection is in progress,
      // avoid opening the dialog or forcing a first_visit state. This prevents
      // a flicker where the dialog is closed then re-opened while logout/navigation occurs.
      // IMPORTANTE: Se estamos autenticados e temos identifier, não devemos estar em logout.
      // Limpar a flag se ela existir (pode ter ficado de logout anterior).
      const logoutPending = typeof window !== 'undefined' && sessionStorage.getItem('consentimento-logout-pending') === 'true';
      console.log('[ConsentProvider] checking logoutPending', { logoutPending, cancelled, isAuthenticated, hasIdentifier: !!identifier });
      
      // Se estamos autenticados e temos identifier, não devemos estar em logout
      // Limpar a flag e continuar com o hydration
      if (logoutPending && isAuthenticated && identifier) {
        console.log('[ConsentProvider] logout-pending flag found but user is authenticated - clearing flag and continuing', { identifier });
        try {
          sessionStorage.removeItem('consentimento-logout-pending');
        } catch (err) {
          console.warn('[ConsentProvider] failed to clear logout-pending flag', err);
        }
        // Continuar com o hydration (não retornar)
      } else if (logoutPending && !isAuthenticated) {
        // Se realmente estamos em logout (não autenticados), pular
        console.log('[ConsentProvider] logout-pending flag set and user not authenticated - skipping consent checks to avoid flicker');
        if (!cancelled && state.type === 'loading') {
          setIsDialogOpen(false);
        }
        return;
      }

      const pendingFlag = typeof window !== 'undefined' && sessionStorage.getItem('consentimento-pending') === 'true';
      console.log('[ConsentProvider] checking pendingFlag', { pendingFlag, cancelled });

      // Only proceed when we have an authenticated user and an identifier (uuid or cpf).
      // This prevents the consent dialog from showing during unauthenticated flows
      // such as the login page where persisted-but-invalid user data can exist.
      console.log('[ConsentProvider] checking identifier, auth, and route', { identifier, isAuthenticated, isLoginPage, cancelled });
      if (!identifier || !isAuthenticated || isLoginPage) {
        console.log('[ConsentProvider] user not authenticated, missing identifier, or on login page - staying in loading', { identifier, isAuthenticated, isLoginPage });
        // Não resetar estado se já está em first_visit ou consented (evita loops)
        if (!cancelled && state.type === 'loading') {
          setIsDialogOpen(false);
          setIsDialogRequired(false);
        }
        return;
      }
      
      // Verificar cancelled novamente antes de continuar
      if (cancelled) {
        console.warn('[ConsentProvider] run() cancelled before loading snapshot');
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
            if (import.meta.env.DEV) console.debug('[ConsentProvider] pendingFlag check - using cpfNormalized', { cpfNormalized });

            type ConsentRecord = ConsentChoice & {
              metadata?: string;
            };
            let backendArray: ConsentRecord[] = [];

            if (cpfNormalized && /^[0-9]{11}$/.test(cpfNormalized)) {
              const resp = await consentimentoService.listarConsentimentosPorCpf(cpfNormalized).catch((e) => {
                if (import.meta.env.DEV) console.debug('[ConsentProvider] listarConsentimentosPorCpf failed', e);
                return null;
              });
              backendArray = Array.isArray(resp) ? (resp as unknown as ConsentRecord[]) : [];
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

      // Esta verificação já foi feita no início do useEffect, mas mantemos aqui como segurança
      if (!identifier) {
        console.log('[ConsentProvider] authenticated user has no identifier (uuid/cpf) - skipping consent check');
        // Não resetar estado se já está em first_visit ou consented (evita loops)
        if (!cancelled && state.type === 'loading') {
          setIsDialogOpen(false);
        }
        return;
      }
      
      // Verificar cancelled antes de carregar snapshot
      if (cancelled) {
        console.warn('[ConsentProvider] run() cancelled before loading snapshot');
        return;
      }
      
      // Garantir que processamos este identifier (mesmo que não encontremos snapshot)
      // Isso evita que o useEffect execute múltiplas vezes para o mesmo identifier

      // Load snapshot namespaced by identifier (uuid or cpf)
      // IMPORTANTE: Se identifier é UUID, tentar primeiro com CPF (que é o que o backend usa)
      console.log('[ConsentProvider] loading snapshot from localStorage...', { identifier, cpfNormalized, cancelled });
      
      let snapshot = null as ReturnType<typeof ConsentStore.load>;
      
      // Se temos CPF normalizado e é diferente do identifier (ou seja, identifier é UUID),
      // tentar carregar pelo CPF primeiro (é assim que o backend salva)
      if (cpfNormalized && cpfNormalized !== identifier && /^[0-9]{11}$/.test(cpfNormalized)) {
        console.log('[ConsentProvider] identifier is UUID, trying CPF first', { cpfNormalized });
        snapshot = ConsentStore.load(cpfNormalized);
        if (snapshot) {
          console.log('[ConsentProvider] found snapshot using CPF', { cpfNormalized });
        }
      }
      
      // Se não encontrou pelo CPF, tentar pelo identifier (pode ser CPF ou UUID)
      if (!snapshot) {
        snapshot = ConsentStore.load(identifier);
        console.log('[ConsentProvider] initial load attempt by identifier', { identifier, found: !!snapshot });
      }
      
      // Verificar cancelled após carregar snapshot
      if (cancelled) {
        console.warn('[ConsentProvider] run() cancelled after loading snapshot');
        return;
      }
      
      console.log('[ConsentProvider] final snapshot check', { 
        identifier: identifier || '[none]', 
        hasSnapshot: !!snapshot,
        snapshotVersion: snapshot?.version,
        needsUpdate: snapshot ? ConsentStore.needsUpdate(snapshot) : null,
        cancelled 
      });

      // Verificar cancelled antes de fazer qualquer setState
      if (cancelled) {
        console.warn('[ConsentProvider] operation cancelled - skipping state update');
        return;
      }

      // Garantir que sempre atualizamos o estado (não deixar em loading indefinidamente)
      // IMPORTANTE: Fazer setState mesmo se cancelled mudar depois, pois precisamos sair do loading
      if (!snapshot) {
        // Não há snapshot local - verificar backend antes de assumir primeira visita
        console.log('[ConsentProvider] no local snapshot - checking backend API', { identifier, cpfNormalized });
        
        let hasBackendConsent = false;
        
        // Verificar backend se temos CPF (nunca consultar por UUID)
            if (cpfNormalized && /^[0-9]{11}$/.test(cpfNormalized)) {
          try {
            console.log('[ConsentProvider] querying backend for consentimentos', { cpfNormalized });
            const resp = await consentimentoService.listarConsentimentosPorCpf(cpfNormalized).catch((e) => {
              console.warn('[ConsentProvider] listarConsentimentosPorCpf failed', e);
              return null;
            });

            const backendArray = Array.isArray(resp) ? (resp as unknown as ConsentRecord[]) : [];
            console.log('[ConsentProvider] backend API response', { cpfNormalized, count: backendArray.length, isEmpty: backendArray.length === 0 });
            
            // Se backend retornou array vazio, não há consentimento = primeira visita
            if (backendArray.length === 0) {
              console.log('[ConsentProvider] backend returned empty array - treating as first_visit');
              hasBackendConsent = false;
            } else {
              // Verificar se há algum consentimento aceito (concorda === true)
              const hasAccepted = backendArray.some((r: ConsentRecord) => r.concorda === true);
              console.log('[ConsentProvider] backend has records', { count: backendArray.length, hasAccepted });
              hasBackendConsent = hasAccepted;
              
              // Se há consentimento aceito, tentar criar snapshot local
              if (hasAccepted) {
                    const latestAccepted = backendArray
                  .filter((r: ConsentRecord) => r.concorda === true)
                  .sort((a: ConsentRecord, b: ConsentRecord) => {
                    const ta = (a.createdAt || a.dataConsentimento || a.data)
                      ? new Date(String(a.createdAt || a.dataConsentimento || a.data)).getTime()
                      : 0;
                    const tb = (b.createdAt || b.dataConsentimento || b.data)
                      ? new Date(String(b.createdAt || b.dataConsentimento || b.data)).getTime()
                      : 0;
                    return tb - ta;
                  })[0];
                
                let choices = ConsentStore.getDefaultChoices();
                try {
                  if (latestAccepted?.metadata) {
                    const parsed = JSON.parse(latestAccepted.metadata) as Record<string, unknown>;
                    if (parsed && typeof parsed === 'object') {
                      choices = parsed as ConsentChoice;
                    }
                  }
                } catch (err) {
                  console.warn('[ConsentProvider] failed to parse metadata from backend', err);
                }
                
                // Salvar snapshot local (sem chamar API novamente)
                await ConsentStore.save(cpfNormalized, choices, { requireApi: false });
                snapshot = ConsentStore.load(cpfNormalized);
                console.log('[ConsentProvider] created local snapshot from backend', { hasSnapshot: !!snapshot });
              }
            }
          } catch (err) {
            console.error('[ConsentProvider] error checking backend API', err);
            // Em caso de erro, tratar como primeira visita (mais seguro)
            hasBackendConsent = false;
          }
        }
        
        // Verificar cancelled novamente após consulta à API
        if (cancelled) {
          console.warn('[ConsentProvider] cancelled after backend check');
          return;
        }
        
        // Se encontrou snapshot após consulta ao backend, usar ele
        if (snapshot && !ConsentStore.needsUpdate(snapshot)) {
          console.log('[ConsentProvider] found snapshot after backend check - setting consented', { identifier });
          setState({
            type: 'consented',
            choices: snapshot.choices,
            timestamp: snapshot.timestamp,
          });
          setIsDialogOpen(false);
          setIsDialogRequired(false);
          processedIdentifierRef.current = identifier;
          return;
        }
        
        // Se não há snapshot nem consentimento no backend = primeira visita
        console.log('[ConsentProvider] no snapshot and no backend consent - first_visit - setting state', { cancelled, hasBackendConsent });
        console.log('[ConsentProvider] setting state to first_visit', { identifier, cancelled });
        setState({
          type: 'first_visit',
          defaultChoices: ConsentStore.getDefaultChoices(),
        });
        setIsDialogOpen(true);
        setIsDialogRequired(true);
        processedIdentifierRef.current = identifier; // Marcar como processado
        ConsentAnalytics.trackDialogShown('first_visit');
        console.log('[ConsentProvider] state set to first_visit, dialog should open');
      } else if (ConsentStore.needsUpdate(snapshot)) {
        // Versão do termo mudou: solicitar re-consentimento
        console.log('[ConsentProvider] snapshot needs update - version_mismatch - setting state', { snapshotVersion: snapshot.version, expected: CONSENT_VERSION });
        if (!cancelled) {
          setState({
            type: 'version_mismatch',
            currentChoices: snapshot.choices,
            oldVersion: snapshot.version,
            newVersion: CONSENT_VERSION,
          });
          setIsDialogOpen(true);
          setIsDialogRequired(true);
          processedIdentifierRef.current = identifier; // Marcar como processado
          ConsentAnalytics.trackDialogShown('version_change');
        }
      } else {
        // Consentimento válido
        console.log('[ConsentProvider] snapshot OK - setting consented state', { timestamp: snapshot.timestamp, choicesCount: Object.keys(snapshot.choices).length });
        if (!cancelled) {
          setState({
            type: 'consented',
            choices: snapshot.choices,
            timestamp: snapshot.timestamp,
          });
          setIsDialogOpen(false);
          setIsDialogRequired(false);
          processedIdentifierRef.current = identifier; // Marcar como processado
        }
      }
      
      console.log('[ConsentProvider] hydration completed', { cancelled, finalState: !cancelled ? 'set' : 'skipped', processedIdentifier: processedIdentifierRef.current });
    };

    void run();

    return () => {
      cancelled = true;
      console.log('[ConsentProvider] useEffect cleanup - cancelled');
    };
  }, [
    identifier,
    isAuthenticated,
    cpfNormalized,
    state.type,
    isLoginPage,
    isDialogOpen,
    isDialogRequired,
  ]); // Incluir isLoginPage para forçar execução quando necessário

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
        const cpfKey = cpfNormalized ? `${CONSENT_STORAGE_KEY}:${cpfNormalized}` : null;
        if (e.key !== expectedKey && e.key !== cpfKey) return;

        if (import.meta.env.DEV) console.debug('[ConsentProvider] storage event for consent snapshot', { key: e.key, newValue: e.newValue });

        // Prefer uuid-keyed snapshot; fallback to cpf-keyed snapshot if present
        let snapshot = ConsentStore.load(identifier);
        if ((!snapshot || ConsentStore.needsUpdate(snapshot)) && cpfNormalized) {
          const snapshotByCpf = ConsentStore.load(cpfNormalized);
          if (snapshotByCpf && !ConsentStore.needsUpdate(snapshotByCpf)) {
            snapshot = snapshotByCpf;
          }
        }

        if (snapshot && !ConsentStore.needsUpdate(snapshot)) {
          // Another tab accepted/updated consent -> reflect it immediately
          setState({ type: 'consented', choices: snapshot.choices, timestamp: snapshot.timestamp });
          setIsDialogOpen(false);
          setIsDialogRequired(false);
          try {
            sessionStorage.setItem('consentimento-lgpd-checked', 'true');
          } catch {
            /* ignore */
          }
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
  }, [identifier, cpfNormalized]);

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

        // Verificar se o snapshot foi realmente salvo no localStorage
        const savedSnapshot = ConsentStore.load(identifier);
        if (import.meta.env.DEV) {
          console.log('[ConsentProvider] saveConsent - snapshot saved, verifying localStorage', { 
            identifier, 
            savedInLocalStorage: !!savedSnapshot,
            savedVersion: savedSnapshot?.version 
          });
        }

        // Usar snapshot do localStorage se disponível, senão usar o snapshot retornado
        const finalSnapshot = savedSnapshot || snapshot;

        setState({
          type: 'consented',
          choices: finalSnapshot.choices,
          timestamp: finalSnapshot.timestamp,
        });

        setIsDialogOpen(false);
        setIsDialogRequired(false);

        return finalSnapshot;
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

  // Garantir que o dialog não apareça na página de login
  const shouldShowDialog = isDialogOpen && !isLoginPage && isAuthenticated;
  
  return (
    <ConsentContext.Provider value={contextValue}>
      {children}
      
      {/* Dialog renderizado apenas quando necessário e não estiver na página de login */}
      {shouldShowDialog && (
        <ConsentDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          onAcceptAll={handleAcceptAll}
          onRejectNonEssential={handleRejectNonEssential}
          onSavePreferences={handleSavePreferences}
          currentChoices={currentChoices}
          isLoading={state.type === 'saving'}
          required={isDialogRequired}
          onCompleteRejection={async () => {
            if (import.meta.env.DEV) console.debug('[ConsentProvider] onCompleteRejection invoked - closing dialog and forcing logout');
            
            // Limpar snapshot do localStorage quando usuário recusa tudo
            // Isso garante que na próxima vez que fizer login, o dialog apareça novamente
            console.log('[ConsentProvider] clearing consent snapshot from localStorage', { identifier, cpfNormalized });
            try {
              if (identifier) {
                ConsentStore.clear(identifier);
              }
              if (cpfNormalized && cpfNormalized !== identifier) {
                ConsentStore.clear(cpfNormalized);
              }
              // Resetar processedIdentifierRef para garantir que o hydration execute na próxima vez
              processedIdentifierRef.current = null;
              console.log('[ConsentProvider] consent snapshot cleared and processed ref reset');
            } catch (err) {
              console.warn('[ConsentProvider] Failed to clear consent snapshot:', err);
            }
            
            // Limpar todas as flags relacionadas
            try {
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem('consentimento-pending');
                sessionStorage.removeItem('consentimento-lgpd-checked');
                sessionStorage.setItem('consentimento-logout-pending', 'true');
              }
            } catch (err) {
              console.warn('[ConsentProvider] Failed to clear/set consent flags:', err);
            }
            
            // Resetar estado para loading para garantir que na próxima vez execute o hydration
            setState({ type: 'loading' });
            
            // Close dialog locally so UI is removed immediately
            try {
              setIsDialogOpen(false);
              setIsDialogRequired(false);
            } catch (err) {
              console.warn('[ConsentProvider] Failed to close dialog before logout:', err);
            }

            // Aguarda um pouco para garantir que o dialog foi fechado visualmente
            await new Promise(resolve => setTimeout(resolve, 200));

            try {
              // Force logout and redirect to login
              await forceLogout();
            } catch (err) {
              console.error('[ConsentProvider] Error forcing logout after complete rejection:', err);
              // Fallback: redireciona mesmo com erro
              if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
            }
          }}
        />
      )}
    </ConsentContext.Provider>
  );
}
