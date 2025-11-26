import { Button, Box, CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import Grid from '@mui/material/Grid';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, type PatientFormInputs } from '../../schemas/patientSchema';
import { useForm, type SubmitErrorHandler, type SubmitHandler, type Resolver } from "react-hook-form";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
// `fetchAddressByCep` will be dynamically imported where used to allow code-splitting
import React, { Suspense } from 'react';
const PatientPersonalDataForm = React.lazy(() => import('../../components/PatientForm/PatientPersonalDataForm'));
const PatientDetailsForm = React.lazy(() => import('../../components/PatientForm/PatientDetailsForm'));
import { FormSkeleton } from '../../components/SuspenseWrapper';
import PageHeader from "../../components/PageHeader";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { pacienteService } from "../../api/paciente.service";
import type {
  PacienteDTO,
  EditarPacienteDTO,
  DadoClinicoInputDTO,
  DadoClinicoDTO,
} from "../../api/paciente.dto";
import { useAuth } from "../../hooks/useAuth";
import { useLocation } from 'react-router-dom';
import { formatDateToISO, removeNonNumeric, formatISOToDDMMYYYY } from "../../utils/formatters";
import { useUnsavedChangesWarning } from "../../hooks/useUnsavedChangesWarning";
import { useSaveShortcut } from "../../hooks/useSaveShortcut";
import Breadcrumbs from "../../components/Breadcrumbs";
import { DevTools } from "../../utils/devTools";
import { toastError, toastSuccess, toastWarn } from "../../utils/toast";
import { useFormDraft } from "../../hooks/useFormDraft";

interface PatientEditLocationState {
  patient?: PacienteDTO;
}

const patientFormResolver = zodResolver(patientSchema) as Resolver<PatientFormInputs>;

const normalizeOptionalString = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

const PatientEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const locationState = useMemo<PatientEditLocationState | null>(
    () => (location.state as PatientEditLocationState | null) ?? null,
    [location.state]
  );
  const passedPatient = locationState?.patient;
  const { isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [patientName, setPatientName] = useState<string>("");
  const [dadoClinicoId, setDadoClinicoId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm<PatientFormInputs>({
    resolver: patientFormResolver,
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
      email: "",
      tratamento: undefined,
      estadoCivil: undefined,
      diagnostico: "",
      condicaoChegada: "nenhum",
      usoCurativo: "nao",
      usoOxigenoterapia: "nao",
      usoSonda: "nao",
      tipoSondaNasal: undefined,
      tipoSondaCirurgica: undefined,
      tipoSondaVesical: undefined,
      tipoSanguineo: "A_POSITIVO",
      seForOutra: "",
      tratamentoOutroDescricao: "",
    }
  });

  const draftKey = `draft:patient-edit:${id ?? 'novo'}`;
  const { hasDraft, restoreDraft } = useFormDraft<PatientFormInputs>(draftKey, watch, reset, { debounceMs: 1200 });

  // Alerta de mudanças não salvas
  useUnsavedChangesWarning(isDirty, 'Você tem alterações não salvas no formulário. Tem certeza que deseja sair?');

  // Atalho Ctrl+S para salvar
  useSaveShortcut(() => {
    handleSubmit(handleSavePatient, onError)();
  });

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

  const handleSavePatient = useCallback<SubmitHandler<PatientFormInputs>>(async (data) => {
    try {
      setIsSaving(true);
      if (!isAuthenticated) {
        toastError("Usuário não autenticado. Faça login novamente.");
        setTimeout(() => {
          navigate('/login');
        }, 2000)
        return;
      }

      if (!id) {
        toastError("ID do paciente não fornecido.");
        return;
      }

      setLoading(true);

      // 1. Atualizar dados pessoais, endereço, e outras informações (exceto dados clínicos)
      const enderecoNumero = Number.parseInt(data.numero, 10);

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
          estadoCivil: data.estadoCivil ?? undefined,
        },
        endereco: {
          logradouro: data.endereco,
          numero: Number.isNaN(enderecoNumero) ? undefined : enderecoNumero,
          bairro: data.bairro,
          cep: removeNonNumeric(data.cep),
          cidade: data.cidade,
          estado: data.estado,
          complemento: data.complemento?.trim() ? data.complemento.trim() : undefined,
        },
        email: data.email,
        informacaoHospitalar: data.informacaoHospitalar
          ? {
              nomeHospitalReferencia: normalizeOptionalString(data.informacaoHospitalar.nomeHospitalReferencia),
              medicoResponsavel: normalizeOptionalString(data.informacaoHospitalar.medicoResponsavel),
              setorAla: normalizeOptionalString(data.informacaoHospitalar.setorAla),
              dataInternacao: data.informacaoHospitalar.dataInternacao
                ? formatDateToISO(data.informacaoHospitalar.dataInternacao)
                : null,
            }
          : undefined,
        dadoSocial: data.dadoSocial
          ? {
              rendaFamiliar: data.dadoSocial.rendaFamiliar ?? null,
              composicaoFamiliar: normalizeOptionalString(data.dadoSocial.composicaoFamiliar),
              situacaoMoradia: normalizeOptionalString(data.dadoSocial.situacaoMoradia),
              necessidadesEspeciais: normalizeOptionalString(data.dadoSocial.necessidadesEspeciais),
            }
          : undefined,
      };

      const updatedPatient = await pacienteService.editarPaciente(id, paciente);

      // 2. Atualizar dados clínicos separadamente (se existir ID do dado clínico)
      if (dadoClinicoId) {
        // Mapear condicaoChegada do schema para o DTO
        const condicaoChegadaMap: Record<
          PatientFormInputs['condicaoChegada'],
          DadoClinicoInputDTO['condicaoChegada']
        > = {
          de_ambulancia: 'AMBULANCIA',
          maca: 'MACA',
          cadeira_rodas: 'CADEIRA_RODAS',
          nenhum: 'NENHUMA',
        };

        const usaSonda = data.usoSonda === 'sim';

        const dadoClinico: DadoClinicoInputDTO = {
          diagnostico: data.diagnostico || undefined,
          tratamento: data.tratamento ?? undefined,
          tratamentoOutroDescricao:
            data.tratamento === 'OUTRO'
              ? normalizeOptionalString(data.tratamentoOutroDescricao)
              : null,
          condicaoChegada: condicaoChegadaMap[data.condicaoChegada],
          usaSonda,
          tipoSondaNasal: usaSonda ? data.tipoSondaNasal ?? null : null,
          tipoSondaCirurgica: usaSonda ? data.tipoSondaCirurgica ?? null : null,
          tipoSondaVesical: usaSonda ? data.tipoSondaVesical ?? null : null,
          sondaOutraDescricao:
            usaSonda && data.tipoSondaVesical === 'OUTRA'
              ? normalizeOptionalString(data.seForOutra)
              : null,
          usaCurativo: data.usoCurativo === 'sim',
          usaOxigenoterapia: data.usoOxigenoterapia === 'sim',
          tipoSanguineo: data.tipoSanguineo,
        };

        await pacienteService.atualizarDadosClinicos(dadoClinicoId, id, dadoClinico);
      }

      setLoading(false);
      setOpenSaveDialog(false);
      toastSuccess("Paciente atualizado com sucesso!");
      navigate('/patient/information', { state: { patientId: id, patient: updatedPatient } });
    } catch (error) {
      console.error("Erro ao editar paciente:", error);
      setLoading(false);
      setOpenSaveDialog(false);

      if (isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        toastError("Sessão expirada ou sem permissão. Faça login novamente.");
        setTimeout(() => {
          navigate('/login');
        }, 1200);
        return;
      }

      toastError("Erro ao editar paciente. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }, [dadoClinicoId, id, isAuthenticated, navigate]);

  const onError: SubmitErrorHandler<PatientFormInputs> = (errors) => {
    console.log("Erros de validação:", errors);
    toastError("Por favor, corrija os erros no formulário.");
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

  const handleCepSearch = useCallback(async (cep: string) => {
    clearErrors(['cep', 'endereco', 'bairro', 'cidade', 'estado', 'complemento']);
    setValue('endereco', "");
    setValue('bairro', "");
    setValue('cidade', "");
    setValue('estado', "");
    setValue('complemento', "");

    const cleanedCep = removeNonNumeric(cep);
    if (cleanedCep.length === 8) {
      setIsCepLoading(true);
      try {
        const { fetchAddressByCep } = await import('../../utils/cepService');
        const addressData = await fetchAddressByCep(cleanedCep);
        if (addressData) {
          setValue('endereco', addressData.logradouro ?? "");
          setValue('bairro', addressData.bairro ?? "");
          setValue('cidade', addressData.localidade ?? "");
          setValue('estado', addressData.uf ?? "");
          setValue('complemento', addressData.complemento ?? "");
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
      setValue('endereco', "");
      setValue('bairro', "");
      setValue('cidade', "");
      setValue('estado', "");
      setValue('complemento', "");
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

  // Carregar paciente por id quando a página monta
  useEffect(() => {
    if (hasDraft) {
      const restored = restoreDraft();
      if (restored) return;
    }
    if (!id) return;

    const fillWithPatient = (p: PacienteDTO) => {
      // Dados pessoais
      setValue('nomeCompletoPaciente', p.dadoPessoal?.nome ?? '');
      setValue('cpfPaciente', p.dadoPessoal?.cpf ?? '');
      setValue('dataNascimento', p.dadoPessoal?.dataNascimento ? formatISOToDDMMYYYY(p.dadoPessoal.dataNascimento) : '');
      setValue('naturalidade', p.dadoPessoal?.naturalidade ?? '');
      setValue('nomeMae', p.dadoPessoal?.nomeMae ?? '');
      setValue('profissao', p.dadoPessoal?.profissao ?? '');
      setValue('rg', p.dadoPessoal?.rg ?? '');
      setValue('telefone', p.dadoPessoal?.telefone ?? '');
      
      // Endereço
      setValue('endereco', p.endereco?.logradouro ?? '');
      setValue('numero', p.endereco?.numero?.toString() ?? '');
      setValue('complemento', p.endereco?.complemento ?? '');
      setValue('bairro', p.endereco?.bairro ?? '');
      setValue('cidade', p.endereco?.cidade ?? '');
      setValue('estado', p.endereco?.estado ?? '');
      setValue('cep', p.endereco?.cep ?? '');
      
      // Email e estado civil
      setValue('email', p.email ?? '');
      setValue('estadoCivil', p.dadoPessoal?.estadoCivil ?? undefined);
      
      // Dados clínicos - pegar o primeiro (mais recente)
      if (p.dadosClinicos && p.dadosClinicos.length > 0) {
        const dadoClinico = p.dadosClinicos[0];
        setDadoClinicoId(dadoClinico.id ?? null);
        
        setValue('diagnostico', dadoClinico.diagnostico ?? '');
        setValue('tratamento', dadoClinico.tratamento ?? undefined);
        setValue('tratamentoOutroDescricao', dadoClinico.tratamentoOutroDescricao ?? '');
        
        // Mapear condicaoChegada do DTO para o schema
        const condicaoChegadaMap: Record<
          NonNullable<DadoClinicoDTO['condicaoChegada']>,
          PatientFormInputs['condicaoChegada']
        > = {
          AMBULANCIA: 'de_ambulancia',
          MACA: 'maca',
          CADEIRA_RODAS: 'cadeira_rodas',
          NENHUMA: 'nenhum',
        };
        const condicaoChegada = dadoClinico.condicaoChegada
          ? condicaoChegadaMap[dadoClinico.condicaoChegada]
          : 'nenhum';
        setValue('condicaoChegada', condicaoChegada);
        
        setValue('usoCurativo', dadoClinico.usaCurativo ? 'sim' : 'nao');
        setValue('usoOxigenoterapia', dadoClinico.usaOxigenoterapia ? 'sim' : 'nao');
        setValue('usoSonda', dadoClinico.usaSonda ? 'sim' : 'nao');
        
        if (dadoClinico.usaSonda) {
          setValue('tipoSondaNasal', dadoClinico.tipoSondaNasal ?? undefined);
          setValue('tipoSondaCirurgica', dadoClinico.tipoSondaCirurgica ?? undefined);
          setValue('tipoSondaVesical', dadoClinico.tipoSondaVesical ?? undefined);
          setValue('seForOutra', dadoClinico.sondaOutraDescricao ?? '');
        }
        
        setValue('tipoSanguineo', dadoClinico.tipoSanguineo);
      }
      
      // Informação hospitalar
      if (p.informacaoHospitalar) {
        setValue('informacaoHospitalar', {
          nomeHospitalReferencia: p.informacaoHospitalar.nomeHospitalReferencia ?? undefined,
          medicoResponsavel: p.informacaoHospitalar.medicoResponsavel ?? undefined,
          setorAla: p.informacaoHospitalar.setorAla ?? undefined,
          dataInternacao: p.informacaoHospitalar.dataInternacao
            ? formatISOToDDMMYYYY(p.informacaoHospitalar.dataInternacao)
            : undefined,
        });
      } else {
        setValue('informacaoHospitalar', undefined);
      }

      // Dado social
      if (p.dadoSocial) {
        setValue('dadoSocial', {
          rendaFamiliar: p.dadoSocial.rendaFamiliar ?? undefined,
          composicaoFamiliar: p.dadoSocial.composicaoFamiliar ?? undefined,
          situacaoMoradia: p.dadoSocial.situacaoMoradia ?? undefined,
          necessidadesEspeciais: p.dadoSocial.necessidadesEspeciais ?? undefined,
        });
      } else {
        setValue('dadoSocial', undefined);
      }

      // Contatos de emergência
      if (p.contatosDeEmergencia) {
        setValue(
          'contatosDeEmergencia',
          p.contatosDeEmergencia.map((contato) => ({
            nome: contato.nome ?? '',
            email: contato.email ?? '',
            telefone: contato.telefone ?? '',
          }))
        );
      } else {
        setValue('contatosDeEmergencia', undefined);
      }
    };

    if (passedPatient) {
      fillWithPatient(passedPatient);
      setPatientName(passedPatient.dadoPessoal?.nome ?? '');
      return;
    }

    const fetchPatientFallback = async () => {
      try {
        setLoading(true);
        const response = await pacienteService.listarPacientes(10, 0, id);
        if (response.nodes.length > 0) {
          fillWithPatient(response.nodes[0]);
          setPatientName(response.nodes[0].dadoPessoal?.nome ?? '');
        } else {
          toastWarn('Paciente não encontrado');
          setTimeout(() => navigate('/patients'), 1500);
        }
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar paciente:', err);
        toastError('Erro ao carregar dados do paciente');
        setLoading(false);
        setTimeout(() => navigate('/patients'), 1500);
      }
    };

    fetchPatientFallback();
  }, [hasDraft, restoreDraft, id, navigate, setValue, passedPatient]);

  if (loading) return <FormSkeleton fields={8} />;
  if (isSaving) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

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
        <Suspense fallback={<FormSkeleton fields={6} />}>
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
        </Suspense>

        {/* Mais detalhes do paciente */}
        <Suspense fallback={<FormSkeleton fields={4} />}>
          <PatientDetailsForm
            register={register}
            errors={errors}
            control={control}
            watch={watch}
          />
        </Suspense>

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
              disabled={loading}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Salvar'}
            </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleOpenCancelDialog}
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
