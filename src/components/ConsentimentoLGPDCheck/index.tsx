import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  Button 
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useAuth } from '../../hooks/useAuth';
import { useConsentimentos } from '../../hooks/useConsentimento';
import { ConsentDialog } from '../../consent/components/ConsentDialog/ConsentDialog';
import { ConsentStore } from '../../consent/store/consentStore';
import { ConsentAnalytics } from '../../consent/analytics/consentAnalytics';
import { CONSENT_VERSION } from '../../consent/config/consentConfig';
import { ConsentColors } from '../../consent/config/designTokens';
import type { UserType } from '../../stores/useAuthStore';
import type { ConsentChoice } from '../../consent/types/consent.types';
import { toastInfo } from '../../utils/toast';

/**
 * Componente que verifica se o usuário logado precisa registrar consentimento LGPD
 * Exibe automaticamente no primeiro login de administradores
 * 
 * ✨ NOVO: Usa sistema de consentimento WCAG 2.2 AA compliant
 */
const ConsentimentoLGPDCheck = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Obter UUID do usuário do contexto
  type UserWithUuid = UserType & { uuid?: string };
  const userUuid = (user as UserWithUuid)?.uuid ?? '';
  const tipoUsuario = user?.tipoUsuario || '';

  // Buscar consentimentos existentes do backend (React Query)
  const { data: consentimentosData, isLoading: isLoadingConsents, refetch: refetchConsentimentos } = useConsentimentos(
    userUuid,
    { page: 0, size: 1 }
  );

  const location = useLocation();

  useEffect(() => {
    // Verifica se já foi checado nesta sessão
    const consentimentoChecked = sessionStorage.getItem('consentimento-lgpd-checked');
    
    // Only run when we have a logged user and we haven't already processed checks for this session
    if (!hasChecked && !consentimentoChecked && !isLoadingConsents && userUuid) {
      // Ensure the backend API was called at least once for this session. We trigger a refetch
      // when we detect a navigation (location changes) and the session flag is missing.
      const ensureApiCall = async () => {
        try {
          // Try to refetch the consent list from backend (this will call the API)
          await refetchConsentimentos();
        } catch (err) {
          // Ignore fetch errors here - we'll fallback to local cache below
          console.error('[ConsentimentoLGPDCheck] Erro ao listar consentimentos:', err);
        } finally {
          // Mark that we've invoked the API this session (prevents repeated calls on every route)
          sessionStorage.setItem('consentimento-api-called', 'true');
        }
      };

      // If the API wasn't called yet this session, call it now (on first navigation)
      const apiCalled = sessionStorage.getItem('consentimento-api-called');
      if (!apiCalled) {
        // trigger API call but continue to the consent check after it
        ensureApiCall().finally(() => {
          // After trying API, decide whether to require consent based on backend/local cache
          const hasBackendConsent = consentimentosData?.content && consentimentosData.content.length > 0;
          const localSnapshot = ConsentStore.load(userUuid);
          const hasLocalConsent = localSnapshot && !ConsentStore.needsUpdate(localSnapshot);

          if (import.meta.env.DEV) console.log('[ConsentimentoLGPDCheck] Decision after API call:', { userUuid, hasBackendConsent, hasLocalConsent, consentimentosData });

          if (!hasBackendConsent && !hasLocalConsent) {
            // No consent anywhere: force the required dialog (blocks interaction)
            setOpenDialog(true);
            ConsentAnalytics.trackDialogShown('first_visit');
          } else {
            // There is consent in either backend or local cache
            sessionStorage.setItem('consentimento-lgpd-checked', 'true');
          }

          setHasChecked(true);
        });
      } else {
        // API was called previously this session — just check caches
        const hasBackendConsent = consentimentosData?.content && consentimentosData.content.length > 0;
        const localSnapshot = ConsentStore.load(userUuid);
        const hasLocalConsent = localSnapshot && !ConsentStore.needsUpdate(localSnapshot);

        if (import.meta.env.DEV) console.log('[ConsentimentoLGPDCheck] Decision without API call:', { userUuid, hasBackendConsent, hasLocalConsent, consentimentosData });

        if (!hasBackendConsent && !hasLocalConsent) {
          setOpenDialog(true);
          ConsentAnalytics.trackDialogShown('first_visit');
        } else {
          sessionStorage.setItem('consentimento-lgpd-checked', 'true');
        }

        setHasChecked(true);
      }
    }
  }, [userUuid, tipoUsuario, consentimentosData, isLoadingConsents, hasChecked, location.pathname]);

  /**
   * Handler: Aceitar todos
   */
  const handleAcceptAll = async () => {
    if (!userUuid) return;
    
    setIsLoading(true);
    const choices = ConsentStore.getAcceptAllChoices();
    
    try {
      await ConsentStore.save(userUuid, choices);
      ConsentAnalytics.trackAcceptAll(CONSENT_VERSION);
      
      // Marca como checado APÓS sucesso
      sessionStorage.setItem('consentimento-lgpd-checked', 'true');
      setOpenDialog(false);
    } catch (error) {
      console.error('[ConsentimentoLGPDCheck] Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handler: Apenas essenciais
   */
  const handleRejectNonEssential = async () => {
    if (!userUuid) return;
    
    setIsLoading(true);
    const choices = ConsentStore.getEssentialOnlyChoices();
    
    try {
      await ConsentStore.save(userUuid, choices);
      ConsentAnalytics.trackRejectNonEssential(CONSENT_VERSION);
      
      // Marca como checado APÓS sucesso
      sessionStorage.setItem('consentimento-lgpd-checked', 'true');
      setOpenDialog(false);
    } catch (error) {
      console.error('[ConsentimentoLGPDCheck] Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handler: Salvar preferências customizadas
   */
  const handleSavePreferences = async (choices: ConsentChoice) => {
    if (!userUuid) return;
    
    setIsLoading(true);
    
    try {
      await ConsentStore.save(userUuid, choices);
      const purposesAccepted = Object.keys(choices).filter((k) => choices[k]);
      ConsentAnalytics.trackSavePreferences(CONSENT_VERSION, purposesAccepted);
      
      // Marca como checado APÓS sucesso
      sessionStorage.setItem('consentimento-lgpd-checked', 'true');
      setOpenDialog(false);
    } catch (error) {
      console.error('[ConsentimentoLGPDCheck] Erro ao salvar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handler: Fechar dialog (bloqueado se obrigatório)
   */
  const handleClose = () => {
    // Não permite fechar sem consentir (primeira visita obrigatória)
    console.log('[ConsentimentoLGPDCheck] Fechamento bloqueado - consentimento obrigatório');
  };

  /**
   * Handler: Rejeição completa do consentimento
   * Abre dialog de confirmação primeiro
   */
  const handleCompleteRejection = () => {
    setOpenConfirmDialog(true);
  };

  /**
   * Handler: Confirma rejeição e faz logout
   */
  const handleConfirmRejection = async () => {
    setOpenConfirmDialog(false);
    setOpenDialog(false);
    
    toastInfo('Consentimento necessário para usar o sistema. Fazendo logout...');
    
    // Aguarda 2s para usuário ler o toast
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Faz logout
    logout();
    navigate('/login');
  };

  /**
   * Handler: Cancela rejeição e volta ao dialog
   */
  const handleCancelRejection = () => {
    setOpenConfirmDialog(false);
  };

  // Não renderiza nada se não for para exibir o dialog
  if (!openDialog && !openConfirmDialog) {
    return null;
  }

  // Choices atuais (cache local ou defaults)
  const currentChoices = ConsentStore.load(userUuid)?.choices || ConsentStore.getDefaultChoices();

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
        required={true} // Obrigatório para administradores no primeiro login
        onCompleteRejection={handleCompleteRejection}
      />

      {/* Dialog de Confirmação de Rejeição */}
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
