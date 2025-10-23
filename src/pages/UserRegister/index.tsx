import { Alert, Button, Grid, Snackbar, type AlertColor, type SnackbarCloseReason } from "@mui/material";
import { buttonStyles, cancelButtonStyles, saveButtonStyles, stylesContainer, TitleStyles } from "./styles";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
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

  const handleSnackbarClose = (
    reason: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
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
    setTimeout(() => {
      navigate('/users');
    }, 1000);
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
      conselho: "",
      registro: "",
      uf: "",
      cbo: "",
      rqe: "",
      cnes: "",
      cep: "",
      endereco: "",
      bairro: "",
      cidade: "",
      numero: "",
      complemento: "",
    },
  });

  const handleSaveUser = async (data: UserFormInputs) => {
    try {
    
      const createDTO: CreateUserDTO = {
        nome: data.nomeUsuario,
        email: data.email,
        cpf: data.cpfUsuario,
        telefone: data.telefone,
        tipo: data.tipo,
        perfisIds: data.perfisIds,
      };

     
      const newUserResponse = await adminService.createUser(createDTO);
      const newUserId = newUserResponse.id; 

     
      const updateDTO: UpdateUserDTO = {
       
        dadosPessoais: {
          sexo: data.sexo,
          dataNascimento: data.dataNascimento,
          rg: data.rg,
          orgaoEmissor: data.orgaoEmissor,
          naturalidade: data.naturalidade,
          estadoCivil: data.estadoCivil,
          nomeMae: data.nomeMae,
          nomePai: data.nomePai,
          profissao: data.profissao,
          
          
          // @ts-ignore 
          conselho: data.conselho,
          // @ts-ignore 
          registro: data.registro,
          // @ts-ignore 
          cbo: data.cbo,
          // @ts-ignore 
          rqe: data.rqe,
          // @ts-ignore 
          cnes: data.cnes,
        },
       
        endereco: {
          cep: data.cep,
          logradouro: data.endereco, 
          numero: data.numero,
          bairro: data.bairro,
          cidade: data.cidade,
          uf: data.uf, 
          complemento: data.complemento,
        }
      };

      
      await adminService.updateUser(newUserId, updateDTO);

     
      setOpenSaveDialog(false);
      showSnackbar("Profissional cadastrado com sucesso!", "success");

      setTimeout(() => {
        navigate('/users');
      }, 2000);

    } catch (error: any) {
      console.error("Erro ao cadastrar profissional:", error);
      const message =
        error.response?.data?.message ||
        "Erro ao processar usuário. Tente novamente.";
      showSnackbar(message, "error");
      setOpenSaveDialog(false);
    }
  };
  const onError = (errors: FieldErrors<UserFormInputs>) => {
    console.log("Erros de validação do usuário:", errors);
    showSnackbar("Por favor, corrija os erros no formulário do usuário.", "error");
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