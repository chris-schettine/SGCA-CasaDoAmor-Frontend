import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { Button, Stepper, Step, StepLabel, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Grid from '@mui/material/Grid';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, type PatientFormInputs } from '../../schemas/patientSchema';
import { useForm } from "react-hook-form";
import type { FieldErrors, SubmitHandler, Resolver } from "react-hook-form";
import { isAxiosError } from "axios";
// fetchAddressByCep is dynamically imported where needed to allow code-splitting
const PatientPersonalDataForm = React.lazy(() => import('../../components/PatientForm/PatientPersonalDataForm'));
const PatientDetailsForm = React.lazy(() => import('../../components/PatientForm/PatientDetailsForm'));
import { FormSkeleton } from '../../components/SuspenseWrapper';
import PageHeader from "../../components/PageHeader";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { pacienteService } from "../../api/paciente.service";
import type { RegistrarPacienteDTO } from "../../api/paciente.dto";
import { useAuth } from "../../hooks/useAuth";
import { formatDateToISO, removeNonNumeric } from "../../utils/formatters";
import { useUnsavedChangesWarning } from "../../hooks/useUnsavedChangesWarning";
import { useSaveShortcut } from "../../hooks/useSaveShortcut";
import { DevTools } from "../../utils/devTools";
import { toastError, toastErrorCritical, toastSuccessCritical, toastWarn } from "../../utils/toast";

const steps = ['Dados Pessoais e Endereço', 'Informações Médicas'];

const PatientRegisterPage = () => {
  const navigate = useNavigate();
  // location not used in this page; keep import removed to avoid unused var
  const { isAuthenticated } = useAuth();

  const [activeStep, setActiveStep] = useState(0);

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);

  const [isCepLoading, setIsCepLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm<PatientFormInputs, unknown, PatientFormInputs>({
    resolver: zodResolver(patientSchema) as Resolver<PatientFormInputs>,
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

  // PatientRegister is used to create a new patient — no pre-selected patient
  // is required. Removed redirect which belonged to companion registration.
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
      const typedSetValue = setValue as unknown as Parameters<typeof DevTools.addFakeDataButton>[2];
      const typedClearErrors = clearErrors as unknown as Parameters<typeof DevTools.addFakeDataButton>[3];
      const cleanup = DevTools.addFakeDataButton(
        form,
        DevTools.fillPatientFormWithFakeData,
        typedSetValue,
        typedClearErrors
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
  const handleSavePatient: SubmitHandler<PatientFormInputs> = async (data) => {
    console.log("Formulário Válido, Dados:", data);
    try {
      if (!isAuthenticated) {
        toastError("Usuário não autenticado. Faça login novamente.");
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
          tratamento: data.tratamento ?? undefined,
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
      toastSuccessCritical("✓ Paciente cadastrado com sucesso!");
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
        toastErrorCritical("Sessão expirada ou sem permissão. Faça login novamente.");
        setTimeout(() => {
          navigate('/login');
        }, 1200);
        return;
      }

      toastError("Erro ao cadastrar paciente. Tente novamente.");
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
      toastError(`Por favor, corrija o campo: ${firstErrorField}`);
    } else {
      toastError("Por favor, corrija os erros no formulário.");
    }
    
    setOpenSaveDialog(false);
  };

  const handleOpenCancelDialog = () => setOpenCancelDialog(true);
  const handleCloseCancelDialog = () => setOpenCancelDialog(false);
  const handleConfirmCancel = () => {
    setOpenCancelDialog(false);
    navigate('/patients');
  };

  const handleCloseSaveDialog = () => setOpenSaveDialog(false);
  const handleConfirmSave = handleSubmit(handleSavePatient, onError);

  const cepValue = watch("cep");

  const handleCepSearch = useCallback(async (cep: string) => {
    clearErrors(['cep', 'endereco', 'bairro', 'cidade', 'estado', 'complemento']);
    setValue('endereco', "", { shouldDirty: false });
    setValue('bairro', "", { shouldDirty: false });
    setValue('cidade', "", { shouldDirty: false });
    setValue('estado', "", { shouldDirty: false });
    setValue('complemento', "", { shouldDirty: false });

    const cleanedCep = removeNonNumeric(cep);
    if (cleanedCep.length === 8) {
      setIsCepLoading(true);
      try {
        const { fetchAddressByCep } = await import('../../utils/cepService');
        const addressData = await fetchAddressByCep(cleanedCep);
        if (addressData && !addressData.erro) {
          setValue('endereco', addressData.logradouro ?? "", { shouldDirty: true });
          setValue('bairro', addressData.bairro ?? "", { shouldDirty: true });
          setValue('cidade', addressData.localidade ?? "", { shouldDirty: true });
          setValue('estado', addressData.uf ?? "", { shouldDirty: true });
          setValue('complemento', addressData.complemento ?? "", { shouldDirty: true });
        } else {
          setError('cep', {
            type: "manual",
            message: "CEP não encontrado ou inválido."
          });
          toastWarn("CEP não encontrado ou inválido.");
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
        setError('cep', {
          type: "manual",
          message: "Erro ao buscar CEP. Tente novamente."
        });
        toastError("Erro ao buscar CEP. Tente novamente.");
      } finally {
        setIsCepLoading(false);
      }
    } else if (cleanedCep.length > 0 && cleanedCep.length < 8) {
      setValue('endereco', "", { shouldDirty: false });
      setValue('bairro', "", { shouldDirty: false });
      setValue('cidade', "", { shouldDirty: false });
      setValue('estado', "", { shouldDirty: false });
      setValue('complemento', "", { shouldDirty: false });
    }
  }, [clearErrors, setError, setIsCepLoading, setValue]);

  useEffect(() => {
    if (!cepValue) {
      return;
    }

    const sanitizedCep = removeNonNumeric(cepValue);
    if (sanitizedCep.length === 8) {
      handleCepSearch(cepValue);
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
      margin: { xs: "16px auto", sm: "24px auto" },
      paddingBottom: { xs: "10px", sm: "15px" },
      width: { xs: '100%', sm: '95%', md: '90%' },
      px: { xs: 2, sm: 3 }
    }}>
      <PageHeader 
        title="Cadastrar Paciente" 
        subtitle="Preencha os dados do paciente em duas etapas"
      />
      
      {/* Stepper */}
      <Box sx={{ width: '100%', mb: { xs: 3, sm: 4 } }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

    <form onSubmit={handleSubmit(handleSavePatient, onError)} noValidate>

        {/* Dados Pessoais - Step 0 */}
        {activeStep === 0 && (
          <Suspense fallback={<FormSkeleton fields={6} />}>
            <PatientPersonalDataForm
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              handleCepSearch={handleCepSearch}
              isCepLoading={isCepLoading}
              control={control}
            />
          </Suspense>
        )}

        {/* Mais detalhes do paciente - Step 1 */}
        {activeStep === 1 && (
          <Suspense fallback={<FormSkeleton fields={4} />}>
            <PatientDetailsForm
              register={register}
              errors={errors}
              control={control}
              watch={watch}
            />
          </Suspense>
        )}

        {/* Botões de Navegação */}
        <Grid size={{ xs: 12 }} sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          gap: 2, 
          mt: { xs: 3, sm: 4 }, 
          mx: { xs: 0, sm: 3 }
        }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Voltar
            </Button>
            {activeStep < steps.length - 1 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Próximo
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
            {activeStep === steps.length - 1 && (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                aria-label="Salvar cadastro do paciente"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                Salvar
              </Button>
            )}
            <Button
              variant="outlined"
              sx={{
                width: { xs: '100%', sm: 'auto' },
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