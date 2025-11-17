import { Button, Box } from "@mui/material";
import Grid from '@mui/material/Grid';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Control, FieldErrors, UseFormClearErrors, UseFormRegister, UseFormSetError, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { editCompanionSchema, type CompanionFormInputs, type EditCompanionFormInputs } from "../../schemas/companionSchema";
import PageHeader from "../../components/PageHeader";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { useEditarAcompanhante } from "../../hooks/useAcompanhantes";
import Breadcrumbs from "../../components/Breadcrumbs";
import type { AcompanhanteDTO } from "../../api/acompanhante.dto";
import CompanionForm from "../../components/CompanionForm";
import { formatDateToISO, formatISOToDDMMYYYY } from "../../utils/formatters";
import { DevTools } from "../../utils/devTools";
import { toastWarn, toastError, toastInfo, toastSuccessCritical } from "../../utils/toast";

const CompanionEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const acompanhante = (location.state as { acompanhante?: AcompanhanteDTO })?.acompanhante;
  
  const editarAcompanhanteMutation = useEditarAcompanhante();


  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  // Verificar se temos o acompanhante
  useEffect(() => {
    if (!acompanhante && !id) {
      toastWarn("Acompanhante não encontrado. Redirecionando...");
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }
  }, [acompanhante, id, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm<EditCompanionFormInputs>({
    resolver: zodResolver(editCompanionSchema),
    mode: "onBlur",
    defaultValues: acompanhante ? {
      dadoPessoal: {
        nome: acompanhante.dadoPessoal?.nome || "",
        nomeMae: acompanhante.dadoPessoal?.nomeMae || "",
        dataNascimento: acompanhante.dadoPessoal?.dataNascimento ? formatISOToDDMMYYYY(acompanhante.dadoPessoal.dataNascimento) : "",
        cpf: acompanhante.dadoPessoal?.cpf || "",
        rg: acompanhante.dadoPessoal?.rg || "",
        naturalidade: acompanhante.dadoPessoal?.naturalidade || "",
        profissao: acompanhante.dadoPessoal?.profissao || "",
        telefone: acompanhante.dadoPessoal?.telefone || "",
        estadoCivil: acompanhante.dadoPessoal?.estadoCivil || undefined,
      },
      endereco: {
        logradouro: acompanhante.endereco?.logradouro || "",
        numero: acompanhante.endereco?.numero || undefined,
        complemento: acompanhante.endereco?.complemento || "",
        bairro: acompanhante.endereco?.bairro || "",
        cidade: acompanhante.endereco?.cidade || "",
        estado: (acompanhante.endereco?.estado as "AC" | "AL" | "AP" | "AM" | "BA" | "CE" | "DF" | "ES" | "GO" | "MA" | "MT" | "MS" | "MG" | "PA" | "PB" | "PR" | "PE" | "PI" | "RJ" | "RN" | "RS" | "RO" | "RR" | "SC" | "SP" | "SE" | "TO" | undefined) || undefined,
        cep: acompanhante.endereco?.cep || "",
      },
      parentesco: acompanhante.parentesco,
      podeAjudarNaCozinha: acompanhante.podeAjudarNaCozinha,
      ativo: acompanhante.ativo,
    } : undefined
  });

  // DevTools: Adiciona botão para preencher com dados fake (apenas em DEV)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const form = document.querySelector('form');
      const typedSetValue = setValue as unknown as Parameters<typeof DevTools.addFakeDataButton>[2];
      const cleanup = DevTools.addFakeDataButton(
        form,
        DevTools.fillCompanionFormWithFakeData,
        typedSetValue
      );
      return cleanup;
    }
  }, [setValue]);

  const handleOpenSaveDialog = () => {
    handleSubmit(() => setOpenSaveDialog(true), onError)();
  };
  
  const handleCloseSaveDialog = () => setOpenSaveDialog(false);

  const handleOpenCancelDialog = () => setOpenCancelDialog(true);
  const handleCloseCancelDialog = () => setOpenCancelDialog(false);
  
  const handleConfirmCancel = () => {
    toastInfo("Edição cancelada");
    setTimeout(() => {
      navigate(-1);
    }, 1000);
    setOpenCancelDialog(false);
  };

  const handleSaveCompanion = async (data: EditCompanionFormInputs) => {
    console.log("Formulário Válido, Dados do Acompanhante:", data);
    if (!id) {
      toastError("ID do acompanhante não encontrado");
      return;
    }

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
        podeAjudarNaCozinha: data.podeAjudarNaCozinha,
        ativo: data.ativo,
      };
      
      await editarAcompanhanteMutation.mutateAsync({ id, dto });
      setOpenSaveDialog(false);
      toastSuccessCritical("Acompanhante atualizado com sucesso!");
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error("Erro ao atualizar acompanhante:", error);
      toastError("Erro ao atualizar acompanhante. Tente novamente.");
      setOpenSaveDialog(false);
    }
  };

  const onError = (errors: FieldErrors<EditCompanionFormInputs>) => {
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
      margin: "24px auto",
      paddingBottom: "15px",
      width: "90%"
    }}>
      <Breadcrumbs items={[
        { label: 'Pacientes', path: '/patients' },
        { label: acompanhante?.pacienteNome || 'Paciente' },
        { label: 'Editar Acompanhante' }
      ]} />
      
      <PageHeader 
        title="Editar Acompanhante"
        subtitle={`Atualize os dados de ${acompanhante?.dadoPessoal?.nome || 'acompanhante'}`}
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
          isEditMode={true}
        />

        {/* Botões Salvar e Cancelar */}
        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 4, ml: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenSaveDialog}
            disabled={editarAcompanhanteMutation.isPending}
          >
            {editarAcompanhanteMutation.isPending ? "Salvando..." : "Salvar Alterações"}
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


      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={openSaveDialog}
        onClose={handleCloseSaveDialog}
        onConfirm={handleConfirmSave}
        title="Confirmar Alterações"
        message="Tem certeza que deseja salvar as alterações do acompanhante?"
        confirmButtonText="Sim, Salvar"
        cancelButtonText="Não, Voltar"
      />

      {/* Diálogo de Confirmação para Cancelar */}
      <ConfirmationDialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancel}
        title="Cancelar Edição"
        message="Tem certeza que deseja cancelar? As alterações não serão salvas."
        confirmButtonText="Sim, Cancelar"
        cancelButtonText="Voltar"
      />
    </Box>
  )
}

export default CompanionEditPage;
