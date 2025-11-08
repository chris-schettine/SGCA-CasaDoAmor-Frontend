import { Button, type AlertColor, CircularProgress, Box } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import Grid from '@mui/material/Grid';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, type PatientFormInputs } from '../../schemas/patientSchema';
import { useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { fetchAddressByCep } from "../../utils/cepService";
import PatientPersonalDataForm from "../../components/PatientForm/PatientPersonalDataForm";
import PatientDetailsForm from "../../components/PatientForm/PatientDetailsForm";
import PageHeader from "../../components/PageHeader";
import Snackbar from '@mui/material/Snackbar';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { pacienteService } from "../../api/paciente.service";
import type { EditarPacienteDTO, PacienteDTO } from "../../api/paciente.dto";
import { useAuth } from "../../hooks/useAuth";
import { useLocation } from 'react-router-dom';
import { formatDateToISO, removeNonNumeric, formatISOToDDMMYYYY } from "../../utils/formatters";
import { useUnsavedChangesWarning } from "../../hooks/useUnsavedChangesWarning";
import { useSaveShortcut } from "../../hooks/useSaveShortcut";
import Breadcrumbs from "../../components/Breadcrumbs";

const PatientEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const passedPatient = (location.state as any)?.patient as PacienteDTO | undefined;
  const { isAuthenticated } = useAuth();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [patientName, setPatientName] = useState<string>("");

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
    formState: { errors, isDirty },
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
      cidade: "",
      estado: "",
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

  // Alerta de mudanças não salvas
  useUnsavedChangesWarning(isDirty, 'Você tem alterações não salvas no formulário. Tem certeza que deseja sair?');

  // Atalho Ctrl+S para salvar
  useSaveShortcut(() => {
    handleSubmit(handleSavePatient, onError)();
  });

  const handleSavePatient = async (data: PatientFormInputs) => {
    try {
      if (!isAuthenticated) {
        showSnackbar("Usuário não autenticado. Faça login novamente.", "error");
        setTimeout(() => {
          navigate('/login');
        }, 2000)
        return;
      }

      if (!id) {
        showSnackbar("ID do paciente não fornecido.", "error");
        return;
      }

      const paciente: EditarPacienteDTO = {
        dadoPessoal: {
          nome: data.nomeCompletoPaciente,
          telefone: removeNonNumeric(data.telefone),
          dataNascimento: formatDateToISO(data.dataNascimento),
          cpf: removeNonNumeric(data.cpfPaciente),
          rg: removeNonNumeric(data.rg),
          naturalidade: data.naturalidade,
          nomeMae: data.nomeMae,
          profissao: data.profissao,
        },
        endereco: {
          logradouro: data.endereco,
          numero: parseInt(data.numero, 10),
          bairro: data.bairro,
          cep: removeNonNumeric(data.cep),
          cidade: data.cidade,
          estado: data.estado,
          complemento: data.complemento,
        },
      };

      setLoading(true);
      await pacienteService.editarPaciente(id, paciente);
      setLoading(false);

      setOpenSaveDialog(false);
      showSnackbar("Paciente atualizado com sucesso!", "success");
      setTimeout(() => {
        navigate('/patients');
      }, 1500);
    } catch (error) {
      console.error("Erro ao editar paciente:", error);
      setLoading(false);
      showSnackbar("Erro ao editar paciente. Tente novamente.", "error");
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
    setValue(`${targetFieldPrefix}cidade` as keyof PatientFormInputs, "");
    setValue(`${targetFieldPrefix}estado` as keyof PatientFormInputs, "");
    setValue(`${targetFieldPrefix}complemento` as keyof PatientFormInputs, "");

    const cleanedCep = cep.replace(/\D/g, '');
    if (cleanedCep.length === 8) {
      setIsCepLoading(true);
      try {
        const addressData = await fetchAddressByCep(cleanedCep);
        if (addressData) {
          setValue(`${targetFieldPrefix}endereco` as keyof PatientFormInputs, addressData.logradouro);
          setValue(`${targetFieldPrefix}bairro` as keyof PatientFormInputs, addressData.bairro);
          setValue(`${targetFieldPrefix}cidade` as keyof PatientFormInputs, (addressData as any).localidade);
          setValue(`${targetFieldPrefix}estado` as keyof PatientFormInputs, (addressData as any).uf);
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
      } finally {
        setIsCepLoading(false);
      }
    } else if (cleanedCep.length > 0 && cleanedCep.length < 8) {
      setValue(`${targetFieldPrefix}endereco` as keyof PatientFormInputs, "");
      setValue(`${targetFieldPrefix}bairro` as keyof PatientFormInputs, "");
      setValue(`${targetFieldPrefix}cidade` as keyof PatientFormInputs, "");
      setValue(`${targetFieldPrefix}estado` as keyof PatientFormInputs, "");
      setValue(`${targetFieldPrefix}complemento` as keyof PatientFormInputs, "");
    }
  }, [setValue, setError, clearErrors, showSnackbar]);

  useEffect(() => {
    if (cepValue && cepValue.replace(/\D/g, '').length === 8) {
      handleCepSearch(cepValue, "");
    }
  }, [cepValue, handleCepSearch]);

  // Carregar paciente por id quando a página monta
  useEffect(() => {
    if (!id) return;

    const fillWithPatient = (p: PacienteDTO) => {
      setValue('nomeCompletoPaciente', p.nome || '');
      setValue('cpfPaciente', p.cpf || '');
      setValue('dataNascimento', p.dataNascimento ? formatISOToDDMMYYYY(p.dataNascimento) : '');
      setValue('naturalidade', p.naturalidade || '');
  setValue('nomeMae', p.nomeMae || '');
  setValue('profissao', p.profissao || '');
      setValue('rg', p.rg || '');
      setValue('telefone', p.telefone || '');
      setValue('endereco', p.logradouro || '');
      setValue('numero', p.numero?.toString() || '');
      setValue('complemento', p.complemento || '');
      setValue('bairro', p.bairro || '');
      setValue('cidade', p.cidade || '');
      setValue('estado', p.estado || '');
      setValue('cep', p.cep || '');
    };

    if (passedPatient) {
      fillWithPatient(passedPatient);
      setPatientName(passedPatient.nome);
      return;
    }

    const fetchPatientFallback = async () => {
      try {
        setLoading(true);
        const response = await pacienteService.listarPacientes(10, 0, id);
        if (response.nodes.length > 0) {
          fillWithPatient(response.nodes[0]);
          setPatientName(response.nodes[0].nome);
        } else {
          showSnackbar('Paciente não encontrado', 'warning');
          setTimeout(() => navigate('/patients'), 1500);
        }
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar paciente:', err);
        showSnackbar('Erro ao carregar dados do paciente', 'error');
        setLoading(false);
        setTimeout(() => navigate('/patients'), 1500);
      }
    };

    fetchPatientFallback();
  }, [id, navigate, setValue, showSnackbar, passedPatient]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ 
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: 'column',
      position: "relative",
      minHeight: "56px",
      margin: "24px auto",
      paddingBottom: "15px",
      width: "90%"
    }}>
      <Breadcrumbs
        items={[
          { label: 'Pacientes', path: '/patients' },
          { label: patientName || 'Carregando...', path: `/patient/information/${id}` },
          { label: 'Editar' }
        ]}
      />
      
      <PageHeader title="Editar Paciente" subtitle="Atualize os dados do paciente" />
      <form noValidate>

        {/* Dados Pessoais */}
        <PatientPersonalDataForm
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          handleCepSearch={handleCepSearch}
          control={control}
          isCepLoading={isCepLoading}
          disabledFields={["nomeCompletoPaciente", "dataNascimento", "cpfPaciente", "rg", "naturalidade", "nomeMae"]}
        />

        {/* Mais detalhes do paciente */}
        <PatientDetailsForm
          register={register}
          errors={errors}
          control={control}
          watch={watch}
        />

        {/* Botões Salvar e Cancelar */}
        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4, ml: 3 }}>
          <Button
              variant="contained"
              color="primary"
              onClick={handleOpenSaveDialog}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Salvar'}
            </Button>
          <Button
            variant="outlined"
            color="error"
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
    </Box>
  );
}

export default PatientEditPage;
