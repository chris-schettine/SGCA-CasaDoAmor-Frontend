import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Typography, Alert } from '@mui/material';
import ConsentimentoForm from '../ConsentimentoForm';
import { useAuth } from '../../hooks/useAuth';
import { useConsentimentos } from '../../hooks/useConsentimento';
import type { UserType } from '../../stores/useAuthStore';

/**
 * Componente que verifica se o usuário logado precisa registrar consentimento LGPD
 * Exibe automaticamente no primeiro login de administradores
 */
const ConsentimentoLGPDCheck = () => {
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Obter UUID do usuário do contexto
  type UserWithUuid = UserType & { uuid?: string };
  const userUuid = (user as UserWithUuid)?.uuid ?? '';
  const tipoUsuario = user?.tipoUsuario || '';

  // Buscar consentimentos existentes
  const { data: consentimentosData, isLoading } = useConsentimentos(
    userUuid,
    { page: 0, size: 1 }
  );

  useEffect(() => {
    // Verifica se já foi checado nesta sessão
    const consentimentoChecked = sessionStorage.getItem('consentimento-lgpd-checked');
    
    if (
      !hasChecked &&
      !consentimentoChecked &&
      !isLoading &&
      userUuid &&
      tipoUsuario === 'ADMINISTRADOR'
    ) {
      // Verifica se não há consentimentos registrados
      const hasConsentimentos = consentimentosData?.content && consentimentosData.content.length > 0;
      
      if (!hasConsentimentos) {
        // Exibe modal de consentimento
        setOpenDialog(true);
      }
      
      // Marca como checado para não exibir novamente nesta sessão
      sessionStorage.setItem('consentimento-lgpd-checked', 'true');
      setHasChecked(true);
    }
  }, [userUuid, tipoUsuario, consentimentosData, isLoading, hasChecked]);

  const handleSuccess = () => {
    setOpenDialog(false);
  };

  // Não renderiza nada se não for para exibir o dialog
  if (!openDialog) {
    return null;
  }

  return (
    <Dialog
      open={openDialog}
      onClose={undefined} // Impede fechar clicando fora
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown // Impede fechar com ESC
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              📋 Consentimento LGPD Obrigatório
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Primeiro acesso - É necessário concordar com os termos
            </Typography>
          </div>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Para garantir a conformidade com a LGPD, é obrigatório registrar seu consentimento 
            para tratamento de dados pessoais antes de prosseguir.
          </Typography>
        </Alert>
        <ConsentimentoForm
          profissionalUuid={userUuid}
          onSuccess={handleSuccess}
          obrigatorio={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ConsentimentoLGPDCheck;
