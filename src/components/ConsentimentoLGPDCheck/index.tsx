import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useAuth } from '../../hooks/useAuth';
import { useConsentimentosPorCpf } from '../../hooks/useConsentimento';
import { ConsentDialog } from '../../consent/components/ConsentDialog/ConsentDialog';
import { ConsentStore } from '../../consent/store/consentStore';
import { toastError } from '../../utils/toast';
import { ConsentAnalytics } from '../../consent/analytics/consentAnalytics';
import { CONSENT_VERSION } from '../../consent/config/consentConfig';
import { ConsentColors } from '../../consent/config/designTokens';
import type { ConsentChoice } from '../../consent/types/consent.types';
import { toastInfo } from '../../utils/toast';

/**
 * Verifica consentimento LGPD preferindo a busca por CPF público.
 * Faz uma chamada por navegação para garantir que a API foi consultada
 * e abre o dialog obrigatório se não houver consentimento backend/local.
 */
const ConsentimentoLGPDCheck = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefetchPath, setLastRefetchPath] = useState('');

  // Preferir CPF do usuário logado, senão procurar em sessionStorage
  const cpfFromSessionStorage = typeof window !== 'undefined'
    ? (sessionStorage.getItem('cpfFor2FA') || sessionStorage.getItem('cpf') || '')
    : '';

  const cpfToUse = user?.cpf ?? cpfFromSessionStorage;

  // Snapshot key uses CPF for this component so local snapshots don't collide with uuid-based ones
  const snapshotKey = cpfToUse;

  const {
    data: consentimentosDataByCpf,
    isLoading: isLoadingConsentsByCpf,
    refetch: refetchConsentimentosByCpf,
  } = useConsentimentosPorCpf(cpfToUse);

  useEffect(() => {
    const consentimentoChecked = sessionStorage.getItem('consentimento-lgpd-checked');

    // On navigation, trigger a refetch at least once per path
    if (cpfToUse && location.pathname && location.pathname !== lastRefetchPath) {
      try {
        refetchConsentimentosByCpf();
      } catch {
        void 0;
      } finally {
        setLastRefetchPath(location.pathname);
      }
    }

    if (import.meta.env.DEV) {
      console.debug('[ConsentimentoLGPDCheck] useEffect start', {
        cpfToUse,
        consentimentoChecked,
        apiCalled: sessionStorage.getItem('consentimento-api-called'),
        consentimentosDataByCpf,
        isLoadingConsentsByCpf,
        hasChecked,
        location: location.pathname,
        lastRefetchPath,
        snapshotKey,
      });
    }

    if (!hasChecked && !consentimentoChecked && !isLoadingConsentsByCpf && cpfToUse) {
      const ensureApiCall = async () => {
        try {
          const result = await refetchConsentimentosByCpf();
          return result?.data as unknown;
        } catch (err) {
          console.error('[ConsentimentoLGPDCheck] Erro ao listar consentimentos:', err);
          return undefined;
        } finally {
          sessionStorage.setItem('consentimento-api-called', 'true');
        }
      };

      const apiCalled = sessionStorage.getItem('consentimento-api-called');
      if (!apiCalled) {
        ensureApiCall().then((refetchedData) => {
          if (import.meta.env.DEV) console.debug('[ConsentimentoLGPDCheck] refetch result (raw)', { refetchedData, consentimentosDataByCpf });

          // Normalizar resultado do refetch / query para um array quando possível.
          // Alguns adapters/padrões podem devolver o payload em { data: [...] } ou diretamente [...].
          const normalizeToArray = (maybeArrayOrResp: unknown): unknown[] | null => {
            if (!maybeArrayOrResp) return null;
            if (Array.isArray(maybeArrayOrResp)) return maybeArrayOrResp as unknown[];
            // Caso o resultado venha como { data: [...] }
            if (typeof maybeArrayOrResp === 'object' && (maybeArrayOrResp as any).data && Array.isArray((maybeArrayOrResp as any).data)) {
              return (maybeArrayOrResp as any).data as unknown[];
            }
            return null;
          };

          const backendFromRefetch = normalizeToArray(refetchedData);
          const backendFromQuery = normalizeToArray(consentimentosDataByCpf as unknown);

          const backendData = backendFromRefetch ?? backendFromQuery ?? [];
          const hasBackendConsent = backendData.length > 0;

          if (import.meta.env.DEV) {
            try {
              console.debug('[ConsentimentoLGPDCheck] normalized backendData', {
                cpfToUse,
                backendFromRefetchPreview: Array.isArray(backendFromRefetch) ? backendFromRefetch.slice(0, 5) : backendFromRefetch,
                backendFromQueryPreview: Array.isArray(backendFromQuery) ? backendFromQuery.slice(0, 5) : backendFromQuery,
                backendDataCount: backendData.length,
                sessionFlags: {
                  apiCalled: sessionStorage.getItem('consentimento-api-called'),
                  checked: sessionStorage.getItem('consentimento-lgpd-checked'),
                  pending: sessionStorage.getItem('consentimento-pending'),
                },
              });
            } catch (err) {
              console.debug('[ConsentimentoLGPDCheck] failed to stringify debug info', err);
            }
          }

          const localSnapshot = ConsentStore.load(snapshotKey);
          const hasLocalConsent = localSnapshot && !ConsentStore.needsUpdate(localSnapshot);

          if (import.meta.env.DEV) console.log('[ConsentimentoLGPDCheck] Decision after API call:', { snapshotKey, hasBackendConsent, hasLocalConsent, backendData });

          if (!hasBackendConsent && !hasLocalConsent) {
            if (import.meta.env.DEV) console.debug('[ConsentimentoLGPDCheck] Opening dialog (no backend or local consent)', { backendData, localSnapshot });
            setOpenDialog(true);
            ConsentAnalytics.trackDialogShown('first_visit');
          } else {
            if (import.meta.env.DEV) console.debug('[ConsentimentoLGPDCheck] Consent present, skipping dialog', { hasBackendConsent, hasLocalConsent });
            sessionStorage.setItem('consentimento-lgpd-checked', 'true');
          }

          setHasChecked(true);
        });
      } else {
        // Normalize query result as above
        const normalizeToArray = (maybeArrayOrResp: unknown): unknown[] | null => {
          if (!maybeArrayOrResp) return null;
          if (Array.isArray(maybeArrayOrResp)) return maybeArrayOrResp as unknown[];
          if (typeof maybeArrayOrResp === 'object' && (maybeArrayOrResp as any).data && Array.isArray((maybeArrayOrResp as any).data)) {
            return (maybeArrayOrResp as any).data as unknown[];
          }
          return null;
        };

        const backendFromQuery = normalizeToArray(consentimentosDataByCpf as unknown) ?? [];
        const hasBackendConsent = backendFromQuery.length > 0;

        if (import.meta.env.DEV) console.debug('[ConsentimentoLGPDCheck] backendFromQuery preview', { cpfToUse, backendFromQueryPreview: backendFromQuery.slice(0,5), backendFromQueryCount: backendFromQuery.length, sessionFlags: { apiCalled: sessionStorage.getItem('consentimento-api-called'), checked: sessionStorage.getItem('consentimento-lgpd-checked') } });
        const localSnapshot = ConsentStore.load(snapshotKey);
        const hasLocalConsent = localSnapshot && !ConsentStore.needsUpdate(localSnapshot);

        if (import.meta.env.DEV) console.debug('[ConsentimentoLGPDCheck] Decision without API call:', { snapshotKey, hasBackendConsent, hasLocalConsent, consentimentosDataByCpf, localSnapshot });

        if (!hasBackendConsent && !hasLocalConsent) {
          if (import.meta.env.DEV) console.debug('[ConsentimentoLGPDCheck] Opening dialog (no backend or local consent) - no apiCalled branch');
          setOpenDialog(true);
          ConsentAnalytics.trackDialogShown('first_visit');
        } else {
          if (import.meta.env.DEV) console.debug('[ConsentimentoLGPDCheck] Consent present, skipping dialog - no apiCalled branch', { hasBackendConsent, hasLocalConsent });
          sessionStorage.setItem('consentimento-lgpd-checked', 'true');
        }

        setHasChecked(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpfToUse, consentimentosDataByCpf, isLoadingConsentsByCpf, hasChecked, location.pathname, lastRefetchPath]);

  /** Handler: Aceitar todos */
  const handleAcceptAll = async () => {
    setIsLoading(true);
    const choices = ConsentStore.getAcceptAllChoices();

    try {
      await ConsentStore.save(snapshotKey, choices, { requireApi: true });
      ConsentAnalytics.trackAcceptAll(CONSENT_VERSION);
      sessionStorage.setItem('consentimento-lgpd-checked', 'true');
      setOpenDialog(false);
      } catch (error) {
      console.error('[ConsentimentoLGPDCheck] Erro ao salvar:', error);
      const msg = error instanceof Error ? error.message : 'Erro desconhecido ao salvar consentimento';
      // Mark pending so reloads keep the dialog open until successful
      try { if (typeof window !== 'undefined') sessionStorage.setItem('consentimento-pending', 'true'); } catch { void 0; }
      toastError(`Falha ao registrar consentimento: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  /** Handler: Apenas essenciais */
  const handleRejectNonEssential = async () => {
    setIsLoading(true);
    const choices = ConsentStore.getEssentialOnlyChoices();

    try {
      await ConsentStore.save(snapshotKey, choices, { requireApi: true });
      ConsentAnalytics.trackRejectNonEssential(CONSENT_VERSION);
      sessionStorage.setItem('consentimento-lgpd-checked', 'true');
      setOpenDialog(false);
    } catch (error) {
      console.error('[ConsentimentoLGPDCheck] Erro ao salvar:', error);
      const msg = error instanceof Error ? error.message : 'Erro desconhecido ao salvar consentimento';
      try { if (typeof window !== 'undefined') sessionStorage.setItem('consentimento-pending', 'true'); } catch { void 0; }
      toastError(`Falha ao registrar consentimento: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  /** Handler: Salvar preferências customizadas */
  const handleSavePreferences = async (choices: ConsentChoice) => {
    setIsLoading(true);

    try {
      await ConsentStore.save(snapshotKey, choices, { requireApi: true });
      const purposesAccepted = Object.keys(choices).filter((k) => choices[k]);
      ConsentAnalytics.trackSavePreferences(CONSENT_VERSION, purposesAccepted);
      sessionStorage.setItem('consentimento-lgpd-checked', 'true');
      setOpenDialog(false);
    } catch (error) {
      console.error('[ConsentimentoLGPDCheck] Erro ao salvar:', error);
      const msg = error instanceof Error ? error.message : 'Erro desconhecido ao salvar consentimento';
      try { if (typeof window !== 'undefined') sessionStorage.setItem('consentimento-pending', 'true'); } catch { void 0; }
      toastError(`Falha ao registrar consentimento: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  /** Handler: Fechar dialog (bloqueado se obrigatório) */
  const handleClose = () => {
    console.log('[ConsentimentoLGPDCheck] Fechamento bloqueado - consentimento obrigatório');
  };

  /** Handler: Rejeição completa do consentimento (logout imediato) */
  const handleCompleteRejection = async () => {
    setOpenDialog(false);
    toastInfo('Consentimento necessário para usar o sistema. Fazendo logout...');
    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      await logout();
    } catch (err) {
      console.error('[ConsentimentoLGPDCheck] Erro ao deslogar após recusa de consentimento:', err);
    }

    navigate('/login');
  };

  /** Handler: Confirma rejeição e faz logout */
  const handleConfirmRejection = async () => {
    setOpenConfirmDialog(false);
    setOpenDialog(false);
    toastInfo('Consentimento necessário para usar o sistema. Fazendo logout...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    try { await logout(); } catch { /* ignore */ }
    navigate('/login');
  };

  const handleCancelRejection = () => setOpenConfirmDialog(false);

  // Não renderiza nada se não for para exibir o dialog
  if (!openDialog && !openConfirmDialog) return null;

  const currentChoices = ConsentStore.load(snapshotKey)?.choices || ConsentStore.getDefaultChoices();

  return (
    <>
      <ConsentDialog
        open={openDialog}
        onClose={handleClose}
        onAcceptAll={handleAcceptAll}
        onRejectNonEssential={handleRejectNonEssential}
        onSavePreferences={handleSavePreferences}
        currentChoices={currentChoices}
        isLoading={isLoading}
        required={true}
        onCompleteRejection={handleCompleteRejection}
      />

      <Dialog
        open={openConfirmDialog}
        onClose={handleCancelRejection}
        maxWidth="sm"
        fullWidth
        aria-labelledby="confirm-rejection-title"
      >
        <DialogTitle id="confirm-rejection-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningIcon color="error" fontSize="large" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem', color: ConsentColors.text.primary }}>
            Confirmar Recusa de Consentimento
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7, fontSize: '0.9rem' }}>
            Você está prestes a <strong>recusar o consentimento LGPD</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7, fontSize: '0.9rem' }}>
            <strong>Importante:</strong> O consentimento é obrigatório para usar o sistema.
            Ao recusar, você será desconectado e redirecionado para a tela de login.
          </Typography>
          <Typography variant="body2" color="error.main" sx={{ lineHeight: 1.7, fontSize: '0.9rem' }}>
            ⚠️ Você não poderá acessar o sistema sem aceitar os termos.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
          <Button
            onClick={handleCancelRejection}
            variant="outlined"
            color="primary"
            sx={{
              height: 48,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9rem',
              borderRadius: 2,
            }}
          >
            Voltar e Revisar Termos
          </Button>
          <Button
            onClick={handleConfirmRejection}
            variant="contained"
            color="error"
            sx={{
              height: 48,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9rem',
              borderRadius: 2,
            }}
          >
            Confirmar Recusa e Fazer Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConsentimentoLGPDCheck;
