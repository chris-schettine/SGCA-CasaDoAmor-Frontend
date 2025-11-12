import { Button, Grid, Box, Dialog, DialogTitle, DialogContent, Typography, Alert } from "@mui/material";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import PageHeader from "../../components/PageHeader";
import ConsentimentoForm from "../../components/ConsentimentoForm";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import UserForm from "../../components/UserForm";
import { userSchemaConditional as userSchema, type UserFormInputs } from "../../schemas/userSchema";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminService } from '../../api/admin.service';
import type { CreateUserDTO, UpdateUserDTO } from '../../api/admin.dto';
import { formatDateToISO, removeNonNumeric } from '../../utils/formatters';
import { useUnsavedChangesWarning } from "../../hooks/useUnsavedChangesWarning";
import { useSaveShortcut } from "../../hooks/useSaveShortcut";
import { DevTools } from "../../utils/devTools";
import { toastError, toastSuccess, toastWarn } from "../../utils/toast";
import { isAxiosError } from "axios";

const UserRegisterPage = () => {
  const navigate = useNavigate();

  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openConsentimentoDialog, setOpenConsentimentoDialog] = useState(false);
  const [newUserUuid, setNewUserUuid] = useState<string>('');

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

  const handleSaveUser = async (data: UserFormInputs) => {
    try {

      const createDTO: CreateUserDTO = {
        nome: data.nomeUsuario,
        email: data.email,
        cpf: removeNonNumeric(data.cpfUsuario),
        telefone: data.telefone || undefined,
        tipo: data.tipo || '',
        perfisIds: data.perfisIds,
      };

      const newUserResponse = await adminService.createUser(createDTO);
      const newUserId = newUserResponse.id; 

      const normalize = (value?: string | null) => {
        if (!value) return undefined;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
      };
      const pruneObject = <T extends object>(obj: T): T | undefined => {
        const entries = Object.entries(obj as Record<string, unknown>).filter(([, value]) => value !== undefined && value !== null);
        if (entries.length === 0) {
          return undefined;
        }
        return Object.fromEntries(entries) as T;
      };

      const dadosPessoais = pruneObject<NonNullable<UpdateUserDTO['dadosPessoais']>>({
        dataNascimento: data.dataNascimento ? formatDateToISO(data.dataNascimento) : undefined,
        sexo: normalize(data.sexo),
        naturalidade: normalize(data.naturalidade),
        estadoCivil: normalize(data.estadoCivil),
        nomeMae: normalize(data.nomeMae),
        nomePai: normalize(data.nomePai),
        profissao: normalize(data.profissao),
      });

      const endereco = pruneObject<NonNullable<UpdateUserDTO['endereco']>>({
        cep: data.cep ? removeNonNumeric(data.cep) : undefined,
        logradouro: normalize(data.endereco),
        numero: normalize(data.numero),
        bairro: normalize(data.bairro),
        cidade: normalize(data.cidade),
        uf: normalize(data.estado),
        complemento: normalize(data.complemento),
      });

      const registroProfissional = pruneObject<NonNullable<UpdateUserDTO['registroProfissional']>>({
        tipoProfissional: normalize(data.tipo),
        numeroRegistro: normalize(data.registro),
        rqe: normalize(data.rqe),
      });

      const updateDTO: UpdateUserDTO = {};
      if (dadosPessoais) updateDTO.dadosPessoais = dadosPessoais;
      if (endereco) updateDTO.endereco = endereco;
      if (registroProfissional) updateDTO.registroProfissional = registroProfissional;

      
      await adminService.updateUser(newUserId, updateDTO);
      

      setOpenSaveDialog(false);
      
      // Armazenar o UUID do usuário recém-criado e abrir modal de consentimento
      setNewUserUuid(newUserResponse.uuid);
      setOpenConsentimentoDialog(true);

    } catch (error: unknown) {
      console.error('Erro ao cadastrar profissional:', error);
      const message = isAxiosError(error)
        ? error.response?.data?.message || 'Erro ao processar usuário. Tente novamente.'
        : 'Erro ao processar usuário. Tente novamente.';
      toastError(message);
      setOpenSaveDialog(false);
    }
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

      {/* Dialog de Consentimento LGPD - Exibido após cadastro */}
      <Dialog
        open={openConsentimentoDialog}
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
                Para concluir o cadastro, é necessário registrar o consentimento
              </Typography>
            </div>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              O cadastro do profissional foi realizado com sucesso! 
              Agora é obrigatório registrar o consentimento LGPD para prosseguir.
            </Typography>
          </Alert>
          <ConsentimentoForm
            profissionalUuid={newUserUuid}
            onSuccess={handleConsentimentoSuccess}
            obrigatorio={true}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default UserRegisterPage;