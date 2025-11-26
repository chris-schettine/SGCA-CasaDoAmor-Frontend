import { Button, Grid, Box, Dialog, DialogTitle, DialogContent, Typography, DialogActions } from "@mui/material";
import WarningIcon from '@mui/icons-material/Warning';
import ConfirmationDialog from "../../components/ConfirmationDialog";
import PageHeader from "../../components/PageHeader";
import { ConsentDialog } from "../../consent/components/ConsentDialog/ConsentDialog";
import { ConsentStore } from "../../consent/store/consentStore";
import { ConsentAnalytics } from "../../consent/analytics/consentAnalytics";
import { CONSENT_VERSION } from "../../consent/config/consentConfig";
import { ConsentColors } from '../../consent/config/designTokens';
import type { ConsentChoice } from "../../consent/types/consent.types";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import UserForm from "../../components/UserForm";
import { userSchemaConditional as userSchema, type UserFormInputs } from "../../schemas/userSchema";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminService } from '../../api/admin.service';
import type { CreateUserDTO } from '../../api/admin.dto';
import { removeNonNumeric } from '../../utils/formatters';
import { useUnsavedChangesWarning } from "../../hooks/useUnsavedChangesWarning";
import { useSaveShortcut } from "../../hooks/useSaveShortcut";
import { DevTools } from "../../utils/devTools";
import { useFormDraft } from "../../hooks/useFormDraft";
import { useAuth } from "../../hooks/useAuth";
import { toastError, toastSuccessCritical, toastWarn, toastInfo } from "../../utils/toast";

const UserRegisterPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openConsentimentoDialog, setOpenConsentimentoDialog] = useState(false);
  const [openConfirmRejectionDialog, setOpenConfirmRejectionDialog] = useState(false);
  const newUserUuidRef = useRef<string>('');
  const [newUserId, setNewUserId] = useState<number | null>(null);
  const [isLoadingConsent, setIsLoadingConsent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<UserFormInputs | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    getValues,
    reset,
  } = useForm<UserFormInputs>({
    resolver: zodResolver(userSchema),
    mode: "onBlur",
    defaultValues: {
      cpfUsuario: "",
      email: "",
      telefone: "",
      nomeUsuario: "",
      sexo: "",
      registro: "",
      estadoCivil: undefined,
      estado: "",
      rqe: "",
      cep: "",
      endereco: "",
      bairro: "",
      cidade: "",
      numero: "",
      complemento: "",
    },
  });

  const draftKey = `draft:user-register:${user?.uuid || 'guest'}`;
  const { hasDraft, restoreDraft, clearDraft } = useFormDraft<UserFormInputs>(draftKey, watch, reset);
  const initialHasDraftRef = useRef(hasDraft);
  const restoredOnceRef = useRef(false);

  useEffect(() => {
    if (restoredOnceRef.current) return;
    if (initialHasDraftRef.current && hasDraft) {
      const restored = restoreDraft();
      if (restored) {
        toastInfo('Rascunho restaurado', { toastId: `${draftKey}-restore`, autoClose: 1500 });
        restoredOnceRef.current = true;
      }
    }
  }, [hasDraft, restoreDraft, draftKey]);

 const buildCreateUserDTO = (data: UserFormInputs): CreateUserDTO => {
    
    const temRegistroProfissional = !!data.registro;

    return {
      nome: data.nomeUsuario,
      email: data.email,
      cpf: removeNonNumeric(data.cpfUsuario),
      telefone: data.telefone || undefined,
      tipo: data.tipo || '',
      perfisIds: data.perfisIds,

      dadosPessoais: {
        sexo: data.sexo || null,
      },

      registroProfissional: temRegistroProfissional ? {
        numeroRegistro: data.registro,
        rqe: data.rqe || null,
        tipoProfissional: data.tipo || null, 
      } : null,

      endereco: {
        cep: data.cep || null,
        logradouro: data.endereco || null,
        numero: data.numero || null,
        complemento: data.complemento || null,
        bairro: data.bairro || null,
        cidade: data.cidade || null,
        uf: data.estado || null,
      }
    };
  };

  const handleOpenSaveDialog = () => {
    handleSubmit(() => setOpenSaveDialog(true), onError)();
  };

  const handleCloseSaveDialog = () => {
    if (isSaving || isLoadingConsent) return;
    setOpenSaveDialog(false);
  };
  const handleOpenCancelDialog = () => setOpenCancelDialog(true);
  const handleCloseCancelDialog = () => setOpenCancelDialog(false);

  const handleConfirmCancel = () => {
    clearDraft();
    toastError("Profissional não salvo");
    setTimeout(() => navigate('/users'), 1000);
    setOpenCancelDialog(false);
  };

  useUnsavedChangesWarning(isDirty, 'Você tem alterações não salvas no formulário. Tem certeza que deseja sair?');

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const form = document.querySelector('form');
      const typedSetValue = setValue as unknown as Parameters<typeof DevTools.addFakeDataButton>[2];
      const cleanup = DevTools.addFakeDataButton(
        form,
        DevTools.fillUserFormWithFakeData,
        typedSetValue
      );
      return cleanup;
    }
  }, [setValue]);

  const cepValue = watch('cep');
  useEffect(() => {
    const handleCepSearch = async (cep: string) => {
      clearErrors('cep');
      const hasEndereco = !!getValues('endereco');
      const hasBairro = !!getValues('bairro');
      const hasCidade = !!getValues('cidade');
      const hasEstado = !!getValues('estado');
      const hasComplemento = !!getValues('complemento');

      const cleanedCep = cep.replace(/\D/g, '');
      if (cleanedCep.length === 8) {
        try {
          const addressData = await (await import('../../utils/cepService')).fetchAddressByCep(cleanedCep);
          if (addressData) {
            if (!hasEndereco) setValue('endereco', addressData.logradouro || '');
            if (!hasBairro) setValue('bairro', addressData.bairro || '');
            if (!hasCidade) setValue('cidade', addressData.localidade || '');
            if (!hasEstado) setValue('estado', addressData.uf || '');
            if (!hasComplemento) setValue('complemento', addressData.complemento || '');
          } else {
            setError('cep', { type: 'manual', message: 'CEP não encontrado ou inválido.' });
            toastWarn('CEP não encontrado ou inválido.');
          }
        } catch (err) {
          console.error('Erro ao buscar CEP:', err);
          setError('cep', { type: 'manual', message: 'Erro ao buscar CEP. Tente novamente.' });
          toastError('Erro ao buscar CEP. Tente novamente.');
        }
      }
    };

    if (cepValue && cepValue.replace(/\D/g, '').length === 8) {
      handleCepSearch(cepValue);
    }
  }, [cepValue, setValue, setError, clearErrors, getValues]);

  useSaveShortcut(() => {
    handleSubmit(handleSaveUser, onError)();
  });

  const handleSaveUser = async (data: UserFormInputs) => {
    setPendingUserData(data);
    clearDraft();
    setOpenSaveDialog(false);
    setOpenConsentimentoDialog(true);
  };

  const onError = (errors: FieldErrors<UserFormInputs>) => {
    console.log('Erros de validação do usuário:', errors);
    toastError('Por favor, corrija os erros no formulário do usuário.');
    setOpenSaveDialog(false);
  };

  const handleConsentimentoSuccess = () => {
    setOpenConsentimentoDialog(false);
    setIsLoadingConsent(false);
    setIsSaving(false);
    
    setTimeout(() => {
      toastSuccessCritical('Profissional cadastrado com sucesso!');
      setTimeout(() => navigate('/users'), 5000);
    }, 200);
  };

  const handleAcceptAll = async () => {
    if (!pendingUserData) return;

    setIsLoadingConsent(true);
    setIsSaving(true);
    const choices = ConsentStore.getAcceptAllChoices();

    try {
      const createDTO = buildCreateUserDTO(pendingUserData);

      const newUserResponse = await adminService.createUser(createDTO);
      setNewUserId(newUserResponse.id);
      newUserUuidRef.current = newUserResponse.uuid;

      await ConsentStore.save(newUserResponse.uuid, choices, { requireApi: true });
      ConsentAnalytics.trackAcceptAll(CONSENT_VERSION);
      
      setTimeout(() => {
        handleConsentimentoSuccess();
      }, 100);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRejectNonEssential = async () => {
    if (!pendingUserData) return;

    setIsLoadingConsent(true);
    setIsSaving(true);
    const choices = ConsentStore.getEssentialOnlyChoices();

    try {
      const createDTO = buildCreateUserDTO(pendingUserData);

      const newUserResponse = await adminService.createUser(createDTO);
      setNewUserId(newUserResponse.id);
      newUserUuidRef.current = newUserResponse.uuid;

      await ConsentStore.save(newUserResponse.uuid, choices, { requireApi: true });
      ConsentAnalytics.trackRejectNonEssential(CONSENT_VERSION);
      
      setTimeout(() => {
        handleConsentimentoSuccess();
      }, 100);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async (choices: ConsentChoice) => {
    if (!pendingUserData) return;

    setIsLoadingConsent(true);
    setIsSaving(true);

    try {

      const createDTO = buildCreateUserDTO(pendingUserData);

      const newUserResponse = await adminService.createUser(createDTO);
      setNewUserId(newUserResponse.id);
      newUserUuidRef.current = newUserResponse.uuid;

      await ConsentStore.save(newUserResponse.uuid, choices, { requireApi: true });
      const purposesAccepted = Object.keys(choices).filter((k) => choices[k]);
      ConsentAnalytics.trackSavePreferences(CONSENT_VERSION, purposesAccepted);
      
      setTimeout(() => {
        handleConsentimentoSuccess();
      }, 100);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleError = (error: unknown) => {
    console.error('[UserRegister] Erro ao criar/salvar consentimento:', error);
    setIsLoadingConsent(false);
    setIsSaving(false);
    
    let errorMessage = 'Erro ao criar usuário ou salvar consentimento. Tente novamente.';
    
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
      if (axiosError.response?.status === 400) {
        errorMessage = 'Dados inválidos. Verifique os campos do formulário.';
      } else if (axiosError.response?.status === 409) {
        errorMessage = 'Usuário já existe com este CPF ou email.';
      } else if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        errorMessage = 'Sessão expirada ou sem permissão. Faça login novamente.';
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      }
    } else if (error instanceof Error) {
      errorMessage = `Erro: ${error.message}`;
    }
    
    try { 
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('consentimento-pending', 'true');
      }
    } catch { 
      void 0; 
    }
    
    setTimeout(() => {
      toastError(errorMessage);
    }, 100);
    
    setPendingUserData(null);
  };

  const handleCloseConsentDialog = () => {
    console.log('[UserRegister] Fechamento bloqueado - consentimento obrigatório');
  };

  const handleCompleteRejection = () => {
    if (import.meta.env.DEV) console.debug('[UserRegister] handleCompleteRejection called');
    setOpenConfirmRejectionDialog(true);
  };

  const handleConfirmRejection = () => {
    setOpenConfirmRejectionDialog(false);
    setOpenConsentimentoDialog(false);
    try {
      toastWarn('Cadastro cancelado. Consentimento necessário para usar o sistema.');
    } catch (e) {
      console.error('[UserRegister] Failed to call toastWarn:', e);
    }

    (async () => {
      try {
        if (newUserId) {
          await adminService.deleteUser(newUserId);
        }
      } catch (err) {
        console.error('[UserRegister] Erro ao excluir usuário (background):', err);
      }
    })();

    navigate('/users');
  };

  const handleCancelRejection = () => {
    setOpenConfirmRejectionDialog(false);
  };

  const handleConfirmSave = handleSubmit(handleSaveUser, onError);

  return (
    <Box sx={{ 
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: 'column',
      position: "relative",
      minHeight: "56px",
      margin: { xs: "16px auto", sm: "24px auto" },
      paddingBottom: { xs: "10px", sm: "15px" },
      width: { xs: '100%', sm: '95%', md: '90%' },
      px: { xs: 2, sm: 3 }
    }}>
      <PageHeader 
        title="Cadastrar Profissional"
        subtitle="Preencha os dados do novo usuário do sistema"
        action={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {hasDraft && (
              <Button variant="outlined" size="small" onClick={restoreDraft}>
                Restaurar rascunho
              </Button>
            )}
          </Box>
        }
      />
      <form noValidate>

        <UserForm
          register={register}
          errors={errors}
          control={control}
          watch={watch}
          setValue={setValue}
          setError={setError}
          clearErrors={clearErrors}
        />

        <Grid size={{ xs: 12 }} sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'flex-start', 
          gap: 2, 
          mt: { xs: 3, sm: 4 }, 
          mx: { xs: 0, sm: 3 }
        }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenSaveDialog}
            aria-label="Salvar cadastro do profissional"
            disabled={isSaving || isLoadingConsent}
            data-testid="btn-save-user"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleOpenCancelDialog}
            aria-label="Cancelar cadastro e voltar"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Cancelar
          </Button>
        </Grid>
      </form>

      <ConfirmationDialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancel}
        title="Confirmar Cancelamento"
        message="Tem certeza que deseja cancelar? Você perderá todos os dados preenchidos."
        confirmButtonText="Sim, Cancelar"
        cancelButtonText="Não, Continuar Editando"
      />

      <ConfirmationDialog
        open={openSaveDialog}
        onClose={handleCloseSaveDialog}
        onConfirm={handleConfirmSave}
        title="Confirmar Salvamento"
        message="Tem certeza que deseja salvar o profissional?"
        confirmButtonText={isSaving ? 'Salvando...' : 'Sim, Salvar'}
        cancelButtonText="Não, Voltar"
        confirmButtonProps={{ disabled: isSaving }}
      />

      {openConsentimentoDialog && (
        <ConsentDialog
          open={openConsentimentoDialog}
          onClose={handleCloseConsentDialog}
          onAcceptAll={handleAcceptAll}
          onRejectNonEssential={handleRejectNonEssential}
          onSavePreferences={handleSavePreferences}
          currentChoices={ConsentStore.getDefaultChoices()}
          isLoading={isLoadingConsent}
          required={true}
          onCompleteRejection={handleCompleteRejection}
        />
      )}

      <Dialog
        open={openConfirmRejectionDialog}
        onClose={handleCancelRejection}
        maxWidth="sm"
        fullWidth
        aria-labelledby="confirm-rejection-title"
      >
        <DialogTitle id="confirm-rejection-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningIcon color="error" fontSize="large" />
          <Typography component="div" variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem', color: ConsentColors.text.primary }}>
            Confirmar Cancelamento de Cadastro
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7, fontSize: '0.9rem' }}>
            Você está prestes a <strong>cancelar o cadastro</strong> por recusar o consentimento LGPD.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7, fontSize: '0.9rem' }}>
            <strong>Importante:</strong> O consentimento é obrigatório para que o profissional 
            possa usar o sistema. Sem aceitar os termos, o cadastro será cancelado.
          </Typography>
          <Typography variant="body2" color="error.main" sx={{ lineHeight: 1.7, fontSize: '0.9rem' }}>
            ⚠️ Os dados já preenchidos serão descartados e você voltará para a lista de usuários.
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
            Confirmar Cancelamento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserRegisterPage;
