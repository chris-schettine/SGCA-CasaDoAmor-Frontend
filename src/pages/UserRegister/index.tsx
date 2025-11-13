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
import { toastError, toastSuccess, toastWarn } from "../../utils/toast";

const UserRegisterPage = () => {
  const navigate = useNavigate();

  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openConsentimentoDialog, setOpenConsentimentoDialog] = useState(false);
  const [openConfirmRejectionDialog, setOpenConfirmRejectionDialog] = useState(false);
  const newUserUuidRef = useRef<string>('');
  const [newUserId, setNewUserId] = useState<number | null>(null);
  const [isLoadingConsent, setIsLoadingConsent] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<UserFormInputs | null>(null);

  const handleOpenSaveDialog = () => {
    handleSubmit(() => setOpenSaveDialog(true), onError)();
  };

  const handleCloseSaveDialog = () => setOpenSaveDialog(false);
  const handleOpenCancelDialog = () => setOpenCancelDialog(true);
  const handleCloseCancelDialog = () => setOpenCancelDialog(false);

  const handleConfirmCancel = () => {
    toastError("Profissional não salvo");
    setTimeout(() => navigate('/users'), 1000);
    setOpenCancelDialog(false);
  };

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

  // Alerta de mudanças não salvas
  useUnsavedChangesWarning(isDirty, 'Você tem alterações não salvas no formulário. Tem certeza que deseja sair?');

  // DevTools: Adiciona botão para preencher com dados fake (apenas em DEV)
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

  // CEP auto-fill logic (similar to edit page)
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

  // Atalho Ctrl+S para salvar
  useSaveShortcut(() => {
    handleSubmit(handleSaveUser, onError)();
  });

  // When saving the user form, don't create the user yet. Open the consent
  // dialog immediately and keep the form data in memory (pendingUserData).
  // The actual creation will happen after the user accepts consent or saves
  // granular preferences. This removes the delay and prevents creating
  // a user only to delete them afterward.
  const handleSaveUser = async (data: UserFormInputs) => {
    setPendingUserData(data);
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
    toastSuccess('Profissional cadastrado com sucesso!');
    setTimeout(() => navigate('/users'), 1200);
  };

  /**
   * ✨ NOVO: Handlers do sistema de consentimento WCAG 2.2 AA
   */
  const handleAcceptAll = async () => {
    if (!pendingUserData) return;

    setIsLoadingConsent(true);
    const choices = ConsentStore.getAcceptAllChoices();

    try {
      // Create user now that consent was given
      const createDTO: CreateUserDTO = {
        nome: pendingUserData.nomeUsuario,
        email: pendingUserData.email,
        cpf: removeNonNumeric(pendingUserData.cpfUsuario),
        telefone: pendingUserData.telefone || undefined,
        tipo: pendingUserData.tipo || '',
        perfisIds: pendingUserData.perfisIds,
      };

  const newUserResponse = await adminService.createUser(createDTO);
  setNewUserId(newUserResponse.id);
  newUserUuidRef.current = newUserResponse.uuid;

      await ConsentStore.save(newUserResponse.uuid, choices);
      ConsentAnalytics.trackAcceptAll(CONSENT_VERSION);
      handleConsentimentoSuccess();
    } catch (error) {
      console.error('[UserRegister] Erro ao criar/salvar consentimento:', error);
      toastError('Erro ao criar usuário ou salvar consentimento. Tente novamente.');
    } finally {
      setIsLoadingConsent(false);
      setPendingUserData(null);
    }
  };

  const handleRejectNonEssential = async () => {
    if (!pendingUserData) return;

    setIsLoadingConsent(true);
    const choices = ConsentStore.getEssentialOnlyChoices();

    try {
      const createDTO: CreateUserDTO = {
        nome: pendingUserData.nomeUsuario,
        email: pendingUserData.email,
        cpf: removeNonNumeric(pendingUserData.cpfUsuario),
        telefone: pendingUserData.telefone || undefined,
        tipo: pendingUserData.tipo || '',
        perfisIds: pendingUserData.perfisIds,
      };

  const newUserResponse = await adminService.createUser(createDTO);
  setNewUserId(newUserResponse.id);
  newUserUuidRef.current = newUserResponse.uuid;

      await ConsentStore.save(newUserResponse.uuid, choices);
      ConsentAnalytics.trackRejectNonEssential(CONSENT_VERSION);
      handleConsentimentoSuccess();
    } catch (error) {
      console.error('[UserRegister] Erro ao criar/salvar consentimento:', error);
      toastError('Erro ao criar usuário ou salvar consentimento. Tente novamente.');
    } finally {
      setIsLoadingConsent(false);
      setPendingUserData(null);
    }
  };

  const handleSavePreferences = async (choices: ConsentChoice) => {
    if (!pendingUserData) return;

    setIsLoadingConsent(true);

    try {
      const createDTO: CreateUserDTO = {
        nome: pendingUserData.nomeUsuario,
        email: pendingUserData.email,
        cpf: removeNonNumeric(pendingUserData.cpfUsuario),
        telefone: pendingUserData.telefone || undefined,
        tipo: pendingUserData.tipo || '',
        perfisIds: pendingUserData.perfisIds,
      };

  const newUserResponse = await adminService.createUser(createDTO);
  setNewUserId(newUserResponse.id);
  newUserUuidRef.current = newUserResponse.uuid;

      await ConsentStore.save(newUserResponse.uuid, choices);
      const purposesAccepted = Object.keys(choices).filter((k) => choices[k]);
      ConsentAnalytics.trackSavePreferences(CONSENT_VERSION, purposesAccepted);
      handleConsentimentoSuccess();
    } catch (error) {
      console.error('[UserRegister] Erro ao criar/salvar consentimento:', error);
      toastError('Erro ao criar usuário ou salvar consentimento. Tente novamente.');
    } finally {
      setIsLoadingConsent(false);
      setPendingUserData(null);
    }
  };

  const handleCloseConsentDialog = () => {
    // Não permite fechar sem consentir (obrigatório)
    console.log('[UserRegister] Fechamento bloqueado - consentimento obrigatório');
  };

  /**
   * Handler: Rejeição completa do consentimento
   * Abre dialog de confirmação
   */
  const handleCompleteRejection = () => {
    setOpenConfirmRejectionDialog(true);
  };

  /**
   * Handler: Confirma rejeição e cancela cadastro
   */
  const handleConfirmRejection = () => {
    setOpenConfirmRejectionDialog(false);
    setOpenConsentimentoDialog(false);

    // Se já existe um usuário criado, tentar remover o registro criado para não deixar dados órfãos
    (async () => {
      try {
        if (newUserId) {
          await adminService.deleteUser(newUserId);
        }
      } catch (err) {
        console.error('[UserRegister] Erro ao excluir usuário após recusa de consentimento:', err);
      } finally {
        toastWarn('Cadastro cancelado. Consentimento necessário para usar o sistema.');
        // Aguarda 1.5s e volta para listagem
        setTimeout(() => navigate('/users'), 1500);
      }
    })();
  };

  /**
   * Handler: Cancela rejeição e volta ao dialog de consentimento
   */
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

        {/* Botões Salvar e Cancelar */}
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
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Salvar
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

      {/* Diálogo de Confirmação para Cancelar */}
      <ConfirmationDialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancel}
        title="Confirmar Cancelamento"
        message="Tem certeza que deseja cancelar? Você perderá todos os dados preenchidos."
        confirmButtonText="Sim, Cancelar"
        cancelButtonText="Não, Continuar Editando"
      />

      {/* Diálogo de Confirmação para Salvar */}
      <ConfirmationDialog
        open={openSaveDialog}
        onClose={handleCloseSaveDialog}
        onConfirm={handleConfirmSave}
        title="Confirmar Salvamento"
        message="Tem certeza que deseja salvar o profissional?"
        confirmButtonText="Sim, Salvar"
        cancelButtonText="Não, Voltar"
      />

      {/* ✨ NOVO: Dialog de Consentimento LGPD com WCAG 2.2 AA */}
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

      {/* Dialog de Confirmação de Rejeição */}
      <Dialog
        open={openConfirmRejectionDialog}
        onClose={handleCancelRejection}
        maxWidth="sm"
        fullWidth
        aria-labelledby="confirm-rejection-title"
      >
        <DialogTitle id="confirm-rejection-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningIcon color="error" fontSize="large" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1rem', color: ConsentColors.text.primary }}>
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