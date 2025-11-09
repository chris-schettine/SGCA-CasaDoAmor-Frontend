import { Button, type AlertColor, Stepper, Step, StepLabel, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from '@mui/material/Grid';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, type PatientFormInputs } from '../../schemas/patientSchema';
import { useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { fetchAddressByCep } from "../../utils/cepService";
import PatientPersonalDataForm from "../../components/PatientForm/PatientPersonalDataForm";
import PatientDetailsForm from "../../components/PatientForm/PatientDetailsForm";
import PageHeader from "../../components/PageHeader";
import Snackbar from '@mui/material/Snackbar';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { pacienteService } from "../../api/paciente.service";
import type { RegistrarPacienteDTO } from "../../api/paciente.dto";
import { useAuth } from "../../hooks/useAuth";
import { formatDateToISO, removeNonNumeric } from "../../utils/formatters";
import { useUnsavedChangesWarning } from "../../hooks/useUnsavedChangesWarning";
import { useSaveShortcut } from "../../hooks/useSaveShortcut";
import { DevTools } from "../../utils/devTools";
import { toastSuccessCritical } from "../../utils/toast";

const steps = ['Dados Pessoais e Endereço', 'Informações Médicas'];

const PatientRegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");
  const [snackbarAutoHide, setSnackbarAutoHide] = useState(6000);

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);

  const [isCepLoading, setIsCepLoading] = useState(false);

  const showSnackbar = useCallback((message: string, severity: AlertColor, autoHideDuration: number = 6000) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
    setSnackbarAutoHide(autoHideDuration);
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
  } = useForm<PatientFormInputs, any, PatientFormInputs>({
    resolver: zodResolver(patientSchema) as any,
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
      tratamento: undefined,
      diagnostico: "",
      seForOutra: "",
    }
  });

  // Alerta de mudanças não salvas
  useUnsavedChangesWarning(isDirty, 'Você tem alterações não salvas no formulário. Tem certeza que deseja sair?');

  // Atalho Ctrl+S para salvar (apenas na última etapa)
  useSaveShortcut(() => {
    if (activeStep === steps.length - 1) {
      handleSubmit(handleSavePatient, onError)();
    }
  }, activeStep === steps.length - 1);

  // DevTools: Adiciona botão para preencher com dados fake (apenas em DEV)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const form = document.querySelector('form');
      const cleanup = DevTools.addFakeDataButton(
        form,
        DevTools.fillPatientFormWithFakeData,
        setValue,
        clearErrors
      );
      return cleanup;
    }
  }, [setValue, clearErrors]);

  // Quando o usuário indica que não usa sonda, limpamos valores e erros relacionados
  const usoSondaValue = watch('usoSonda');

  useEffect(() => {
    if (usoSondaValue === 'nao') {
      setValue('tipoSondaNasal', undefined, { shouldValidate: false, shouldDirty: false, shouldTouch: false });
      setValue('tipoSondaCirurgica', undefined, { shouldValidate: false, shouldDirty: false, shouldTouch: false });
      setValue('tipoSondaVesical', undefined, { shouldValidate: false, shouldDirty: false, shouldTouch: false });
      setValue('seForOutra', '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
      clearErrors(['tipoSondaNasal', 'tipoSondaCirurgica', 'tipoSondaVesical', 'seForOutra']);
    }
  }, [usoSondaValue, setValue, clearErrors]);

  const handleSavePatient = async (data: PatientFormInputs) => {
    console.log("Formulário Válido, Dados:", data);
    try {
      if (!isAuthenticated) {
        showSnackbar("Usuário não autenticado. Faça login novamente.", "error");
        setTimeout(() => {
          navigate('/login'); // Redireciona para a página de login
        }, 2000)
        return;
      }

      // Monta o payload no formato esperado pelo novo endpoint (/pacientes/)
      const paciente: RegistrarPacienteDTO = {
        dadoPessoal: {
          nome: data.nomeCompletoPaciente,
          telefone: removeNonNumeric(data.telefone),
          dataNascimento: formatDateToISO(data.dataNascimento),
          cpf: removeNonNumeric(data.cpfPaciente),
          rg: removeNonNumeric(data.rg),
          naturalidade: data.naturalidade,
          nomeMae: data.nomeMae,
          profissao: data.profissao,
          estadoCivil: data.estadoCivil || undefined,
        },
        dadoClinico: {
          diagnostico: data.diagnostico || undefined,
          tratamento: (data.tratamento as any) || undefined,
          tratamentoOutroDescricao: data.tratamentoOutroDescricao || null,
          condicaoChegada: (() => {
            switch (data.condicaoChegada) {
              case 'de_ambulancia':
                return 'AMBULANCIA';
              case 'maca':
                return 'MACA';
              case 'cadeira_rodas':
                return 'CADEIRA_RODAS';
              case 'nenhum':
              default:
                return 'NENHUMA';
            }
          })(),
          usaSonda: data.usoSonda === 'sim',
          tipoSondaNasal: data.tipoSondaNasal || null,
          tipoSondaCirurgica: data.tipoSondaCirurgica || null,
          tipoSondaVesical: data.tipoSondaVesical || null,
          sondaOutraDescricao: data.seForOutra || null,
          usaCurativo: data.usoCurativo === 'sim',
          usaOxigenoterapia: data.usoOxigenoterapia === 'sim',
          tipoSanguineo: data.tipoSanguineo,
        },
        endereco: {
          logradouro: data.endereco,
          numero: parseInt(data.numero, 10),
          bairro: data.bairro,
          cep: removeNonNumeric(data.cep),
          cidade: data.cidade,
          estado: data.estado,
          complemento: data.complemento || undefined,
        },
        email: data.email,
        contatosDeEmergencia: (data.contatosDeEmergencia && data.contatosDeEmergencia.length > 0) ? (data.contatosDeEmergencia || []).map(c => ({
          nome: c.nome,
          email: c.email,
          telefone: removeNonNumeric(c.telefone),
        })) : undefined,
        informacaoHospitalar: data.informacaoHospitalar ? {
          nomeHospitalReferencia: data.informacaoHospitalar.nomeHospitalReferencia || null,
          medicoResponsavel: data.informacaoHospitalar.medicoResponsavel || null,
          setorAla: data.informacaoHospitalar.setorAla || null,
          dataInternacao: data.informacaoHospitalar.dataInternacao ? formatDateToISO(data.informacaoHospitalar.dataInternacao) : null,
        } : undefined,
        dadoSocial: (data.dadoSocial && (
          data.dadoSocial.rendaFamiliar != null || 
          data.dadoSocial.composicaoFamiliar || 
          data.dadoSocial.situacaoMoradia || 
          data.dadoSocial.necessidadesEspeciais
        )) ? {
          rendaFamiliar: data.dadoSocial.rendaFamiliar ?? null,
          composicaoFamiliar: data.dadoSocial.composicaoFamiliar || null,
          situacaoMoradia: data.dadoSocial.situacaoMoradia || null,
          necessidadesEspeciais: data.dadoSocial.necessidadesEspeciais || null,
        } : undefined,
      };

      const response = await pacienteService.registrarPaciente(paciente); // chamada real com token automático
      setOpenSaveDialog(false);
      toastSuccessCritical("✓ Paciente cadastrado com sucesso!"); // Operação crítica - 8 segundos
      setTimeout(() => {
        navigate('/patient/companion/register', { 
          state: { 
            patientId: response.id,
            patientName: response.dadoPessoal?.nome 
          } 
        });
      }, 2000)
    } catch (error) {
      console.error("Erro ao cadastrar paciente:", error);
      setOpenSaveDialog(false);

      if (isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        showSnackbar("Sessão expirada ou sem permissão. Faça login novamente.", "error", 6000);
        setTimeout(() => {
          navigate('/login');
        }, 1200);
        return;
      }

      showSnackbar("Erro ao cadastrar paciente. Tente novamente.", "error");
    }
  };

  const onError = (errors: FieldErrors<PatientFormInputs>) => {
    console.log("Erros de validação:", errors);
    
    // Identifica campos com erro para mensagem mais específica
    const errorFields = Object.keys(errors);
    const fieldLabels: Record<string, string> = {
      nomeCompletoPaciente: "Nome Completo",
      cpfPaciente: "CPF",
      dataNascimento: "Data de Nascimento",
      telefone: "Telefone",
      cep: "CEP",
      endereco: "Endereço",
      bairro: "Bairro",
      cidade: "Cidade",
      estado: "Estado",
      numero: "Número"
    };
    
    if (errorFields.length > 0) {
      const firstErrorField = fieldLabels[errorFields[0]] || errorFields[0];
      showSnackbar(`Por favor, corrija o campo: ${firstErrorField}`, "error");
    } else {
      showSnackbar("Por favor, corrija os erros no formulário.", "error");
    }
    
    setOpenSaveDialog(false);
  };

  const handleOpenCancelDialog = () => setOpenCancelDialog(true);
  const handleCloseCancelDialog = () => setOpenCancelDialog(false);
  const handleConfirmCancel = () => {
    setOpenCancelDialog(false);
    navigate('/patients');
  };

  /*const handleOpenSaveDialog = () => {
    handleSubmit(() => setOpenSaveDialog(true), onError)();
  };*/
  const handleCloseSaveDialog = () => setOpenSaveDialog(false);
  const handleConfirmSave = handleSubmit(handleSavePatient as any, onError);

  const cepValue = watch("cep");

  const handleCepSearch = useCallback(async (cep: string, targetFieldPrefix: "" | "acompanhante") => {
    clearErrors(`${targetFieldPrefix}cep` as keyof PatientFormInputs);
    clearErrors(`${targetFieldPrefix}endereco` as keyof PatientFormInputs);
    clearErrors(`${targetFieldPrefix}bairro` as keyof PatientFormInputs);
    clearErrors(`${targetFieldPrefix}cidade` as keyof PatientFormInputs);
    clearErrors(`${targetFieldPrefix}estado` as keyof PatientFormInputs);
    setValue(`${targetFieldPrefix}endereco` as keyof PatientFormInputs, "");
    setValue(`${targetFieldPrefix}bairro` as keyof PatientFormInputs, "");
    setValue(`${targetFieldPrefix}cidade` as keyof PatientFormInputs, "");
    setValue(`${targetFieldPrefix}estado` as keyof PatientFormInputs, "");
    setValue(`${targetFieldPrefix}complemento` as keyof PatientFormInputs, "");

    const cleanedCep = cep.replace(/\D/g, '');
    if (cleanedCep.length === 8) {
      try {
        const addressData = await fetchAddressByCep(cleanedCep);
        if (addressData && !addressData.erro) {
          setValue(`${targetFieldPrefix}endereco` as keyof PatientFormInputs, addressData.logradouro || "", { shouldDirty: true });
          setValue(`${targetFieldPrefix}bairro` as keyof PatientFormInputs, addressData.bairro || "", { shouldDirty: true });
          setValue(`${targetFieldPrefix}cidade` as keyof PatientFormInputs, addressData.localidade || "", { shouldDirty: true });
          setValue(`${targetFieldPrefix}estado` as keyof PatientFormInputs, addressData.uf || "", { shouldDirty: true });
          setValue(`${targetFieldPrefix}complemento` as keyof PatientFormInputs, addressData.complemento || "", { shouldDirty: true });
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

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

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
      <PageHeader 
        title="Cadastrar Paciente" 
        subtitle="Preencha os dados do paciente em duas etapas"
      />
      
      {/* Stepper */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <form onSubmit={handleSubmit(handleSavePatient as any, onError)} noValidate>

        {/* Dados Pessoais - Step 0 */}
        {activeStep === 0 && (
          <PatientPersonalDataForm
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            handleCepSearch={handleCepSearch}
            isCepLoading={isCepLoading}
            control={control}
          />
        )}

        {/* Mais detalhes do paciente - Step 1 */}
        {activeStep === 1 && (
          <PatientDetailsForm
            register={register}
            errors={errors}
            control={control}
            watch={watch}
          />
        )}

        {/* Botões de Navegação */}
        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 4, ml: 3, mr: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Voltar
            </Button>
            {activeStep < steps.length - 1 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Próximo
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep === steps.length - 1 && (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                aria-label="Salvar cadastro do paciente"
              >
                Salvar
              </Button>
            )}
            <Button
              variant="outlined"
              sx={{
                borderColor: '#d32f2f',
                color: '#d32f2f',
                '&:hover': {
                  borderColor: '#c62828',
                  backgroundColor: 'rgba(211, 47, 47, 0.04)',
                },
              }}
              onClick={handleOpenCancelDialog}
              aria-label="Cancelar cadastro e voltar"
            >
              Cancelar
            </Button>
          </Box>
        </Grid>
      </form>

      {/* Snackbar Component */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={snackbarOpen}
        autoHideDuration={snackbarAutoHide}
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

export default PatientRegisterPage;