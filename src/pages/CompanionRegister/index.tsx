import { Button, type AlertColor } from "@mui/material";
import Grid from '@mui/material/Grid';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchAddressByCep } from "../../utils/cepService";
import RegisterCompanionForm from "../../components/CompanionForm";
import Snackbar from '@mui/material/Snackbar';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useNavigate } from "react-router-dom";
import { companionSchema, type CompanionFormInputs } from "../../schemas/companionSchema";
import { buttonStyles, cancelButtonStyles, stylesContainer, saveButtonStyles, TitleStyles } from "../PatientRegister/styles";
import ConfirmationDialog from "../../components/ConfirmationDialog";

const CompanionRegisterPage = () => {
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
    showSnackbar("Acompanhante não cadastrado", "warning");
    setTimeout(() => {
      navigate('/patients');
    }, 1000);
    setOpenCancelDialog(false);
  };

  const [existingCompanionId, setExistingCompanionId] = useState<string | null>(null);

  const initialCompanionDefaultValues = useMemo(() => ({
    acompanhanteNome: "",
    cpfAcompanhante: "",
    telefoneAcompanhante: "",
    cepAcompanhante: "",
    enderecoAcompanhante: "",
    bairroAcompanhante: "",
    numeroAcompanhante: "",
    complementoAcompanhante: "",
    vinculoPaciente: "",
    podeAjudarCozinha: "nao",
    acompanhanteResponsavel: "nao",
  }) as const, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    reset,
  } = useForm<CompanionFormInputs>({
    resolver: zodResolver(companionSchema),
    mode: "onBlur",
    defaultValues: initialCompanionDefaultValues
  });

  const cepAcompanhanteValue = watch("cepAcompanhante");
  const cpfAcompanhanteValue = watch("cpfAcompanhante");

  const handleCepSearch = useCallback(async (cep: string, targetFieldPrefix: "acompanhante") => {
    clearErrors(`${targetFieldPrefix}cep` as keyof CompanionFormInputs);
    setValue(`${targetFieldPrefix}endereco` as keyof CompanionFormInputs, "");
    setValue(`${targetFieldPrefix}bairro` as keyof CompanionFormInputs, "");
    setValue(`${targetFieldPrefix}complemento` as keyof CompanionFormInputs, "");

    const cleanedCep = cep.replace(/\D/g, '');
    if (cleanedCep.length === 8) {
      try {
        const addressData = await fetchAddressByCep(cleanedCep);
        if (addressData) {
          setValue(`${targetFieldPrefix}endereco` as keyof CompanionFormInputs, addressData.logradouro);
          setValue(`${targetFieldPrefix}bairro` as keyof CompanionFormInputs, addressData.bairro);
          setValue(`${targetFieldPrefix}complemento` as keyof CompanionFormInputs, addressData.complemento || "");
        } else {
          setError(`${targetFieldPrefix}cep` as keyof CompanionFormInputs, {
            type: "manual",
            message: "CEP não encontrado ou inválido."
          });
          showSnackbar("CEP não encontrado ou inválido.", "warning");
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
        setError(`${targetFieldPrefix}cep` as keyof CompanionFormInputs, {
          type: "manual",
          message: "Erro ao buscar CEP. Tente novamente."
        });
        showSnackbar("Erro ao buscar CEP. Tente novamente.", "error");
      }
    } else if (cleanedCep.length > 0 && cleanedCep.length < 8) {
      setValue(`${targetFieldPrefix}endereco` as keyof CompanionFormInputs, "");
      setValue(`${targetFieldPrefix}bairro` as keyof CompanionFormInputs, "");
      setValue(`${targetFieldPrefix}complemento` as keyof CompanionFormInputs, "");
    }
  }, [setValue, setError, clearErrors, showSnackbar]);

  useEffect(() => {
    if (cepAcompanhanteValue && cepAcompanhanteValue.replace(/\D/g, '').length === 8) {
      handleCepSearch(cepAcompanhanteValue, "acompanhante");
    }
  }, [cepAcompanhanteValue, handleCepSearch]);

  // Função para buscar acompanhante pelo CPF
  const searchCompanionByCpf = useCallback(async (cpf: string) => {
    const cleanedCpf = cpf.replace(/\D/g, '');
    if (cleanedCpf.length === 11) { // CPF completo
      try {
        // Simulação de chamada API: substitua por sua lógica real
        // const foundCompanion = await companionApiService.getByCpf(cleanedCpf);
        const foundCompanion = cleanedCpf === "11122233344" // Exemplo: CPF 111.222.333-44 existe
          ? {
            id: "comp123",
            acompanhanteNome: "João da Silva",
            cpfAcompanhante: "111.222.333-44",
            telefoneAcompanhante: "77 99999-8888",
            cepAcompanhante: "46750-000",
            enderecoAcompanhante: "Rua do Acompanhante",
            bairroAcompanhante: "Centro",
            numeroAcompanhante: "123",
            complementoAcompanhante: "Apto 101",
            vinculoPaciente: "Pai",
            podeAjudarCozinha: "sim",
            acompanhanteResponsavel: "sim",
          }
          : null;

        if (foundCompanion) {
          showSnackbar("Acompanhante encontrado! Preenchendo dados.", "success");
          reset(foundCompanion as CompanionFormInputs);
          setExistingCompanionId(foundCompanion.id);
        } else {
          showSnackbar("Acompanhante não encontrado. Prossiga com o cadastro.", "warning");
          reset({ ...initialCompanionDefaultValues, cpfAcompanhante: cpf });
          setExistingCompanionId(null);
        }
      } catch (error) {
        console.error("Erro ao buscar acompanhante:", error);
        showSnackbar("Erro ao buscar acompanhante. Tente novamente.", "error");
        setExistingCompanionId(null);
      }
    } else if (cleanedCpf.length > 0 && cleanedCpf.length < 11) {
      reset({ ...initialCompanionDefaultValues, cpfAcompanhante: cpf });
      setExistingCompanionId(null);
    }
  }, [reset, showSnackbar, initialCompanionDefaultValues]);

  useEffect(() => {
    if (cpfAcompanhanteValue && cpfAcompanhanteValue.replace(/\D/g, '').length === 11) {
      searchCompanionByCpf(cpfAcompanhanteValue);
    }
  }, [cpfAcompanhanteValue, searchCompanionByCpf]);

  const handleSaveCompanion = async (data: CompanionFormInputs) => {
    console.log("Formulário Válido, Dados do Acompanhante:", data);
    try {
      if (existingCompanionId) {
        // Se o acompanhante já existe, apenas vincule-o ao paciente
        // Você precisará do ID do paciente, que pode vir da rota ou de um contexto
        // Ex: const patientId = 'algum_id_do_paciente';
        // await companionApiService.linkToPatient(existingCompanionId, patientId, data.vinculoPaciente);
        showSnackbar("Acompanhante existente vinculado com sucesso!", "success");
      } else {
        // Se não existe, crie um novo acompanhante
        // await companionApiService.createCompanion(data);
        showSnackbar("Novo acompanhante cadastrado com sucesso!", "success");
      }

      setOpenSaveDialog(false);
      setTimeout(() => {
        navigate('/patients');
      }, 3000);
    } catch (error) {
      console.error("Erro ao processar acompanhante:", error);
      showSnackbar("Erro ao processar acompanhante. Tente novamente.", "error");
    }
  };

  const onError = (errors: FieldErrors<CompanionFormInputs>) => {
    console.log("Erros de validação do Acompanhante:", errors);
    showSnackbar("Por favor, corrija os erros no formulário do acompanhante.", "error");
    setOpenSaveDialog(false);
  };

  const handleConfirmSave = handleSubmit(handleSaveCompanion, onError);

  return (
    <div css={stylesContainer}>
      <h1 css={TitleStyles}>Cadastrar Acompanhante</h1>

      <form
        onSubmit={handleConfirmSave}
        noValidate
      >
        <RegisterCompanionForm
          register={register}
          errors={errors}
          watch={watch}
          control={control}
          handleCepSearch={handleCepSearch}
          isExistingCompanion={!!existingCompanionId}
        />

        {/* Botões Salvar e Cancelar */}
        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-start', mt: 4, ml: 3 }}>
          <Button
            variant="contained"
            css={[buttonStyles, saveButtonStyles]}
            onClick={handleOpenSaveDialog}
          >
            {existingCompanionId ? "Vincular Acompanhante Existente" : "Salvar Novo Acompanhante"}
          </Button>
          <Button
            variant="contained"
            onClick={handleOpenCancelDialog}
            css={[buttonStyles, cancelButtonStyles]}
          >
            Não Cadastrar Acompanhante
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

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={openSaveDialog}
        onClose={handleCloseSaveDialog}
        onConfirm={handleConfirmSave}
        title="Confirmar Salvamento do Acompanhante"
        message="Tem certeza que deseja salvar os dados do acompanhante?"
        confirmButtonText="Sim, Salvar"
        cancelButtonText="Não, Voltar"
      />

      {/* Diálogo de Confirmação para Não Cadastrar/Cancelar */}
      <ConfirmationDialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancel}
        title="Não Cadastrar Acompanhante"
        message="Tem certeza que não quer cadastrar um acompanhante para este paciente? Você pode adicioná-lo depois."
        confirmButtonText="Sim, Não Cadastrar"
        cancelButtonText="Voltar e Cadastrar"
      />
    </div>
  )
}

export default CompanionRegisterPage;