import { Alert, Button, Grid, Snackbar, type AlertColor, type SnackbarCloseReason } from "@mui/material";
import { buttonStyles, cancelButtonStyles, saveButtonStyles, stylesContainer, TitleStyles } from "./styles";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import UserForm from "../../components/UserForm";
import { userSchemaConditional as userSchema, type UserFormInputs } from "../../schemas/userSchema";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminService } from '../../api/admin.service';
import type { CreateUserDTO, UpdateUserDTO } from '../../api/admin.dto';

const UserRegisterPage = () => {
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

  const showSnackbar = useCallback((message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleSnackbarClose = (reason: SnackbarCloseReason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  const handleOpenSaveDialog = () => {
    handleSubmit(() => setOpenSaveDialog(true), onError)();
  };

  const handleCloseSaveDialog = () => setOpenSaveDialog(false);
  const handleOpenCancelDialog = () => setOpenCancelDialog(true);
  const handleCloseCancelDialog = () => setOpenCancelDialog(false);

  const handleConfirmCancel = () => {
    showSnackbar("Profissional não salvo", "error");
    setTimeout(() => navigate('/users'), 1000);
    setOpenCancelDialog(false);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    
  } = useForm<UserFormInputs>({
    resolver: zodResolver(userSchema),
    mode: "onBlur",
    defaultValues: {
      tipo: undefined as any,
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

  // CEP auto-fill logic (similar to edit page)
  const cepValue = watch('cep');
  useEffect(() => {
    const handleCepSearch = async (cep: string) => {
      clearErrors('cep');

      const hasEndereco = !!watch('endereco');
      const hasBairro = !!watch('bairro');
      const hasCidade = !!watch('cidade');
      const hasEstado = !!watch('estado');
      const hasComplemento = !!watch('complemento');

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
            showSnackbar('CEP não encontrado ou inválido.', 'warning');
          }
        } catch (err) {
          console.error('Erro ao buscar CEP:', err);
          setError('cep', { type: 'manual', message: 'Erro ao buscar CEP. Tente novamente.' });
          showSnackbar('Erro ao buscar CEP. Tente novamente.', 'error');
        }
      }
    };

    if (cepValue && cepValue.replace(/\D/g, '').length === 8) {
      handleCepSearch(cepValue);
    }
  }, [cepValue, setValue, setError, clearErrors, showSnackbar, watch]);

  const handleSaveUser = async (data: UserFormInputs) => {
    try {
      const { removeNonNumeric } = await import('../../utils/formatters');

      const createDTO: CreateUserDTO = {
        nome: data.nomeUsuario,
        email: data.email,
        cpf: data.cpfUsuario ? removeNonNumeric(data.cpfUsuario) : '',
        telefone: data.telefone || undefined,
        tipo: data.tipo || '',
        perfisIds: data.perfisIds,
      };

     
      const newUserResponse = await adminService.createUser(createDTO);
      const newUserId = newUserResponse.id; 

      
      const updateDTO: UpdateUserDTO = {
        dadosPessoais: {
          dataNascimento: data.dataNascimento || undefined,
          sexo: data.sexo || undefined,
          naturalidade: data.naturalidade || undefined,
          estadoCivil: data.estadoCivil || undefined,
          nomeMae: data.nomeMae || undefined,
          nomePai: data.nomePai || undefined,
          profissao: data.profissao || undefined,

          // O DTO é inconsistente, mas o schema e o form
          // possuem estes campos. Enviamos eles aqui.
          // @ts-ignore
          conselho: data.conselho,
          // @ts-ignore
          registro: data.registro,
          // @ts-ignore
          rqe: data.rqe,
        },
        endereco: {
          cep: data.cep ? removeNonNumeric(data.cep) : undefined,
          logradouro: data.endereco || undefined,
          numero: data.numero || undefined,
          bairro: data.bairro || undefined,
          cidade: data.cidade || undefined,
          uf: data.estado || undefined, 
          complemento: data.complemento || undefined,
        },
      };

      
      await adminService.updateUser(newUserId, updateDTO);
      


      setOpenSaveDialog(false);
      showSnackbar('Profissional cadastrado com sucesso!', 'success');
      setTimeout(() => navigate('/users'), 1200);

    } catch (error: any) {
      console.error('Erro ao cadastrar profissional:', error);
      const message = error.response?.data?.message || 'Erro ao processar usuário. Tente novamente.';
      showSnackbar(message, 'error');
      setOpenSaveDialog(false);
    }
  };

  const onError = (errors: FieldErrors<UserFormInputs>) => {
    console.log('Erros de validação do usuário:', errors);
    showSnackbar('Por favor, corrija os erros no formulário do usuário.', 'error');
    setOpenSaveDialog(false);
  };

  const handleConfirmSave = handleSubmit(handleSaveUser, onError);

  return (
    <div css={stylesContainer}>
      <h1 css={TitleStyles}>Cadastrar Profissional</h1>
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
        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-start', mt: 4, ml: 3 }}>
          <Button
            variant="contained"
            css={[buttonStyles, saveButtonStyles]}
            onClick={handleOpenSaveDialog}
          >
            Salvar
          </Button>
          <Button
            variant="contained"
            css={[buttonStyles, cancelButtonStyles]}
            onClick={handleOpenCancelDialog}
          >
            Cancelar
          </Button>
        </Grid>
      </form>

      {/* Snackbar Component */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={(_, reason) => handleSnackbarClose(reason as SnackbarCloseReason)}
      >
        <Alert
          onClose={() => handleSnackbarClose('clickaway')}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

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
    </div>
  );
}

export default UserRegisterPage;