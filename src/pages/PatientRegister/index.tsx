import { Button, type AlertColor } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from '@mui/material/Grid';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, type PatientFormInputs } from '../../schemas/patientSchema';
import { useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { fetchAddressByCep } from "../../utils/cepService";
import PatientPersonalDataForm from "../../components/PatientForm/PatientPersonalDataForm";
import PatientDetailsForm from "../../components/PatientForm/PatientDetailsForm";
import { buttonStyles, cancelButtonStyles, stylesContainer, saveButtonStyles, TitleStyles } from "./styles";
import Snackbar from '@mui/material/Snackbar';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ConfirmationDialog from "../../components/ConfirmationDialog";
import type { PessoaFisicaDTO } from "../../api/api.gateway.dto";
import { apiGateway } from "../../api/api.gateway";
import { useAuth } from "../../hooks/useAuth";
import { formatDateToISO, removeNonNumeric } from "../../utils/formatters";

const PatientRegisterPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm<PatientFormInputs>({
    resolver: zodResolver(patientSchema),
    mode: "onBlur",
    defaultValues: {
      nomeCompletoPaciente: "",
      cpfPaciente: "",
      dataNascimento: "",
      idade: "",
      naturalidade: "",
      rg: "",
      nomeMae: "",
      profissao: "",
      telefone: "",
      cep: "",
      endereco: "",
      bairro: "",
      numero: "",
      complemento: "",
      tratamento: "",
      diagnostico: "",
      seForOutra: "",
      condicaoChegada: "de_ambulancia",
      usoSonda: "nao",
      usoCurativo: "sim",
      usoOxigenoterapia: "nao",
    }
  });

  const handleSavePatient = async (data: PatientFormInputs) => {
    console.log("Formulário Válido, Dados:", data);
    try {
      if (!token) {
        showSnackbar("Usuário não autenticado. Faça login novamente.", "error");
        setTimeout(() => {
          navigate('/login'); // Redireciona para a página de login
        }, 2000)
        return;
      }

      const paciente: PessoaFisicaDTO = {
        nome: data.nomeCompletoPaciente,
        telefone: removeNonNumeric(data.telefone),
        dataNascimento: formatDateToISO(data.dataNascimento),
        cpf: removeNonNumeric(data.cpfPaciente),
        rg: removeNonNumeric(data.rg),
        naturalidade: data.naturalidade,
        profissao: data.profissao,
        endereco: {
          rua: data.endereco,
          numero: data.numero,
          bairro: data.bairro,
          cep: removeNonNumeric(data.cep),
        },
      };

      await apiGateway.createPessoaFisica(token, paciente); // chamada real
      setOpenSaveDialog(false);
      showSnackbar("Paciente cadastrado com sucesso!", "success");
      setTimeout(() => {
        navigate('/patient/companion/register');
      }, 2000)
    } catch (error) {
      console.error("Erro ao cadastrar paciente:", error);
      showSnackbar("Erro ao cadastrar paciente. Tente novamente.", "error");
      setOpenSaveDialog(false);
    }
  };

  const onError = (errors: FieldErrors<PatientFormInputs>) => {
    console.log("Erros de validação:", errors);
    showSnackbar("Por favor, corrija os erros no formulário.", "error");
    setOpenSaveDialog(false);
  };

  const handleOpenCancelDialog = () => setOpenCancelDialog(true);
  const handleCloseCancelDialog = () => setOpenCancelDialog(false);
  const handleConfirmCancel = () => {
    setOpenCancelDialog(false);
    navigate('/patients');
  };

  const handleOpenSaveDialog = () => {
    handleSubmit(() => setOpenSaveDialog(true), onError)();
  };
  const handleCloseSaveDialog = () => setOpenSaveDialog(false);
  const handleConfirmSave = handleSubmit(handleSavePatient, onError);

  const cepValue = watch("cep");

  const handleCepSearch = useCallback(async (cep: string, targetFieldPrefix: "" | "acompanhante") => {
    clearErrors(`${targetFieldPrefix}cep` as keyof PatientFormInputs);
    setValue(`${targetFieldPrefix}endereco` as keyof PatientFormInputs, "");
    setValue(`${targetFieldPrefix}bairro` as keyof PatientFormInputs, "");
    setValue(`${targetFieldPrefix}complemento` as keyof PatientFormInputs, "");

    const cleanedCep = cep.replace(/\D/g, '');
    if (cleanedCep.length === 8) {
      try {
        const addressData = await fetchAddressByCep(cleanedCep);
        if (addressData) {
          setValue(`${targetFieldPrefix}endereco` as keyof PatientFormInputs, addressData.logradouro);
          setValue(`${targetFieldPrefix}bairro` as keyof PatientFormInputs, addressData.bairro);
          setValue(`${targetFieldPrefix}complemento` as keyof PatientFormInputs, addressData.complemento || "");
        } else {
          setError(`${targetFieldPrefix}cep` as keyof PatientFormInputs, {
            type: "manual",
            message: "CEP não encontrado ou inválido."
          });
          showSnackbar("CEP não encontrado ou inválido.", "warning");
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
        setError(`${targetFieldPrefix}cep` as keyof PatientFormInputs, {
          type: "manual",
          message: "Erro ao buscar CEP. Tente novamente."
        });
        showSnackbar("Erro ao buscar CEP. Tente novamente.", "error");
      }
    } else if (cleanedCep.length > 0 && cleanedCep.length < 8) {
      setValue(`${targetFieldPrefix}endereco` as keyof PatientFormInputs, "");
      setValue(`${targetFieldPrefix}bairro` as keyof PatientFormInputs, "");
      setValue(`${targetFieldPrefix}complemento` as keyof PatientFormInputs, "");
    }
  }, [setValue, setError, clearErrors, showSnackbar]);

  useEffect(() => {
    if (cepValue && cepValue.replace(/\D/g, '').length === 8) {
      handleCepSearch(cepValue, "");
    }
  }, [cepValue, handleCepSearch]);

  return (
    <div css={stylesContainer}>
      <h1 css={TitleStyles}>Cadastrar Paciente</h1>
      <form noValidate>

        {/* Dados Pessoais */}
        <PatientPersonalDataForm
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          handleCepSearch={handleCepSearch}
          control={control}
        />

        {/* Mais detalhes do paciente */}
        <PatientDetailsForm
          register={register}
          errors={errors}
          control={control}
          watch={watch}
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
        onConfirm={handleConfirmCancel} // Navega para /patients
        title="Confirmar Cancelamento"
        message="Tem certeza que deseja cancelar? Você perderá todos os dados preenchidos."
        confirmButtonText="Sim, Cancelar"
        cancelButtonText="Não, Continuar Editando"
      />

      {/* Diálogo de Confirmação para Salvar */}
      <ConfirmationDialog
        open={openSaveDialog}
        onClose={handleCloseSaveDialog}
        onConfirm={handleConfirmSave} // Chama handleSubmit(handleSavePatient, onError)
        title="Confirmar Salvamento"
        message="Tem certeza que deseja salvar o paciente?"
        confirmButtonText="Sim, Salvar"
        cancelButtonText="Não, Voltar"
      />
    </div>
  );
}

export default PatientRegisterPage;