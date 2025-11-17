import { Button, Box } from "@mui/material";
import Grid from '@mui/material/Grid';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Control, FieldErrors, UseFormClearErrors, UseFormRegister, UseFormSetError, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { companionSchema, type CompanionFormInputs, type EditCompanionFormInputs } from "../../schemas/companionSchema";
import PageHeader from "../../components/PageHeader";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { useRegistrarAcompanhante } from "../../hooks/useAcompanhantes";
import Breadcrumbs from "../../components/Breadcrumbs";
import CompanionForm from "../../components/CompanionForm";
import { formatDateToISO } from "../../utils/formatters";
import { DevTools } from "../../utils/devTools";
import { toastWarn, toastSuccessCritical, toastError } from "../../utils/toast";

const CompanionRegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId, patientName } = location.state || {};
  
  const registrarAcompanhanteMutation = useRegistrarAcompanhante();

  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  // Verificar se temos o pacienteId
  useEffect(() => {
    if (!patientId) {
      toastWarn("Nenhum paciente selecionado. Redirecionando...");
      setTimeout(() => {
        navigate('/patients');
      }, 2000);
    }
  }, [patientId, navigate]);

  const defaultValues: Partial<CompanionFormInputs> = {
    dadoPessoal: {
      nome: "",
      nomeMae: "",
      dataNascimento: "",
      cpf: "",
      rg: "",
      naturalidade: "",
      profissao: "",
      telefone: "",
      estadoCivil: undefined,
    },
    endereco: {
      logradouro: "",
      numero: undefined,
      complemento: "",
      bairro: "",
      cidade: "",
      estado: undefined,
      cep: "",
    },
    parentesco: undefined,
    pacienteId: patientId || "",
    podeAjudarNaCozinha: false,
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
  } = useForm<CompanionFormInputs>({
    resolver: zodResolver(companionSchema),
    mode: "onBlur",
    defaultValues,
  });

  // DevTools: Adiciona botão para preencher com dados fake (apenas em DEV)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const form = document.querySelector('form');
      const typedSetValue = setValue as unknown as Parameters<typeof DevTools.addFakeDataButton>[2];
      const typedClearErrors = clearErrors as unknown as Parameters<typeof DevTools.addFakeDataButton>[3];
      const cleanup = DevTools.addFakeDataButton(
        form,
        DevTools.fillCompanionFormWithFakeData,
        typedSetValue,
        typedClearErrors
      );
      return cleanup;
    }
  }, [setValue, clearErrors]);

  const handleOpenSaveDialog = () => {
    handleSubmit(() => setOpenSaveDialog(true), onError)();
  };
  
  const handleCloseSaveDialog = () => setOpenSaveDialog(false);

  const handleOpenCancelDialog = () => setOpenCancelDialog(true);
  const handleCloseCancelDialog = () => setOpenCancelDialog(false);
  
  const handleConfirmCancel = () => {
    toastWarn("Acompanhante não cadastrado");
    setTimeout(() => {
      navigate('/patients');
    }, 1000);
    setOpenCancelDialog(false);
  };

  const handleSaveCompanion = async (data: CompanionFormInputs) => {
    console.log("Formulário Válido, Dados do Acompanhante:", data);
    try {
      // Converter para o DTO esperado pela API
      const dto = {
        dadoPessoal: {
          nome: data.dadoPessoal.nome,
          nomeMae: data.dadoPessoal.nomeMae || "",
          dataNascimento: data.dadoPessoal.dataNascimento ? formatDateToISO(data.dadoPessoal.dataNascimento) : "",
          cpf: data.dadoPessoal.cpf,
          rg: data.dadoPessoal.rg || "",
          naturalidade: data.dadoPessoal.naturalidade || "",
          profissao: data.dadoPessoal.profissao || "",
          telefone: data.dadoPessoal.telefone,
          estadoCivil: data.dadoPessoal.estadoCivil || "SOLTEIRO",
        },
        endereco: {
          logradouro: data.endereco.logradouro || "",
          numero: data.endereco.numero || 0,
          complemento: data.endereco.complemento || null,
          bairro: data.endereco.bairro || "",
          cidade: data.endereco.cidade || "",
          estado: data.endereco.estado || "AC",
          cep: data.endereco.cep || "",
        },
        parentesco: data.parentesco,
        pacienteId: data.pacienteId,
        podeAjudarNaCozinha: data.podeAjudarNaCozinha,
      };
      
      await registrarAcompanhanteMutation.mutateAsync(dto);
      setOpenSaveDialog(false);
      toastSuccessCritical("Acompanhante cadastrado com sucesso!");
      setTimeout(() => {
        navigate('/patients');
      }, 2000);
    } catch (error) {
      console.error("Erro ao cadastrar acompanhante:", error);
      toastError("Erro ao cadastrar acompanhante. Tente novamente.");
      setOpenSaveDialog(false);
    }
  };

  const onError = (errors: FieldErrors<CompanionFormInputs>) => {
    console.log("Erros de validação do Acompanhante:", errors);
    toastError("Por favor, corrija os erros no formulário do acompanhante.");
    setOpenSaveDialog(false);
  };

  const handleConfirmSave = handleSubmit(handleSaveCompanion, onError);

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
      <Breadcrumbs items={[
        { label: 'Pacientes', path: '/patients' },
        { label: patientName || 'Paciente' },
        { label: 'Cadastrar Acompanhante' }
      ]} />
      
      <PageHeader 
        title="Cadastrar Acompanhante"
        subtitle={`Preencha os dados do acompanhante do paciente ${patientName || ''}`}
      />

      <form
        onSubmit={handleConfirmSave}
        noValidate
      >
        <CompanionForm
          register={register as unknown as UseFormRegister<CompanionFormInputs | EditCompanionFormInputs>}
          errors={errors as FieldErrors<CompanionFormInputs | EditCompanionFormInputs>}
          watch={watch as UseFormWatch<CompanionFormInputs | EditCompanionFormInputs>}
          control={control as unknown as Control<CompanionFormInputs | EditCompanionFormInputs>}
          setValue={setValue as unknown as UseFormSetValue<CompanionFormInputs | EditCompanionFormInputs>}
          setError={setError as unknown as UseFormSetError<CompanionFormInputs | EditCompanionFormInputs>}
          clearErrors={clearErrors as UseFormClearErrors<CompanionFormInputs | EditCompanionFormInputs>}
          isEditMode={false}
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
            disabled={registrarAcompanhanteMutation.isPending}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {registrarAcompanhanteMutation.isPending ? "Salvando..." : "Salvar Acompanhante"}
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleOpenCancelDialog}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Não Cadastrar Acompanhante
          </Button>
        </Grid>
      </form>

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
    </Box>
  )
}

export default CompanionRegisterPage;
