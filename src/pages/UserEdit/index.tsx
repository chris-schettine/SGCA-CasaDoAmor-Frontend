import { Button, Grid, CircularProgress, Box } from "@mui/material";
import { isAxiosError } from "axios";
import PageHeader from "../../components/PageHeader";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import UserForm from "../../components/UserForm";
import { userSchemaConditional as userSchema, type UserFormInputs } from "../../schemas/userSchema";
import { useForm, type FieldErrors, type DeepPartial } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminService } from '../../api/admin.service';
import Breadcrumbs from "../../components/Breadcrumbs";
import { useUnsavedChangesWarning } from "../../hooks/useUnsavedChangesWarning";
import { useSaveShortcut } from "../../hooks/useSaveShortcut";
import { DevTools } from "../../utils/devTools";
import { toastError, toastSuccess, toastWarn } from "../../utils/toast";
import type { DadosPessoaisDTO, EnderecoDTO, RegistroProfissionalDTO, UpdateUserDTO, UserResponseDTO } from "../../api/admin.dto";

type PersonalFallbackFields = {
  dataNascimento?: string | null;
  sexo?: string | null;
  naturalidade?: string | null;
  estadoCivil?: string | null;
  nomeMae?: string | null;
  nomePai?: string | null;
  genero?: string | null;
  profissao?: string | null;
};

type ExtendedUserResponse = UserResponseDTO &
  PersonalFallbackFields & {
    dadosPessoais?: DadosPessoaisDTO | null;
    endereco?: EnderecoDTO | string | null;
    registroProfissional?: RegistroProfissionalDTO | null;
  };

const PROFESSIONAL_USER_TYPES = ["DENTISTA", "MEDICO", "ENFERMEIRO", "FISIOTERAPEUTA", "NUTRICIONISTA"] as const;

const formatCepDisplay = (value?: string | null): string => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) return value;
  return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
};

const hasMeaningfulValue = (payload: unknown): boolean => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }
  return Object.values(payload as Record<string, unknown>).some(
    (value) => value !== undefined && value !== null && value !== ""
  );
};


const UserEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [personalDataId, setPersonalDataId] = useState<number | null>(null);
  const [addressId, setAddressId] = useState<number | null>(null);

  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [lockedFields, setLockedFields] = useState<{
    nomeUsuario?: boolean;
    cpfUsuario?: boolean;
    sexo?: boolean;
    registro?: boolean;
    rqe?: boolean;
  }>({});

  const handleOpenSaveDialog = () => {
    handleSubmit(() => setOpenSaveDialog(true), onError)();
  };

  const handleCloseSaveDialog = () => setOpenSaveDialog(false);

  const handleOpenCancelDialog = () => setOpenCancelDialog(true);

  const handleCloseCancelDialog = () => setOpenCancelDialog(false);

  const handleConfirmCancel = () => {
    toastError("Alterações não salvas");
    setTimeout(() => {
      navigate('/users');
    }, 1000);
    setOpenCancelDialog(false);
  };

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
    getValues,
  } = useForm<UserFormInputs>({
    resolver: zodResolver(userSchema),
    mode: "onBlur",
  });

  // Alerta de mudanças não salvas
  useUnsavedChangesWarning(isDirty, 'Você tem alterações não salvas no formulário. Tem certeza que deseja sair?');

  // Atalho Ctrl+S para salvar
  useSaveShortcut(() => {
    handleSubmit(handleSaveUser, onError)();
  });

  // DevTools: Adiciona botão para preencher com dados fake (apenas em DEV)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const form = document.querySelector<HTMLFormElement>('form');
    const typedSetValue = setValue as unknown as Parameters<typeof DevTools.addFakeDataButton>[2];
    const cleanup = DevTools.addFakeDataButton(
      form,
      DevTools.fillUserFormWithFakeData,
      typedSetValue,
      clearErrors as unknown as Parameters<typeof DevTools.addFakeDataButton>[3]
    );
    return cleanup;
  }, [setValue, clearErrors]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setLoading(true);
      setPersonalDataId(null);
      setAddressId(null);
      try {
        const response = await adminService.getUserById(Number(id));
        setUserName(response.nome ?? 'Usuário');

        const { formatCPF, formatPhone, formatISOToDDMMYYYY } = await import('../../utils/formatters');

        const extended = response as ExtendedUserResponse;
        const personalFromResponse = extended.dadosPessoais ?? null;

        const personal: DadosPessoaisDTO | null =
          personalFromResponse ?? {
            dataNascimento: extended.dataNascimento ?? null,
            sexo: extended.sexo ?? null,
            naturalidade: extended.naturalidade ?? null,
            estadoCivil: extended.estadoCivil ?? null,
            nomeMae: extended.nomeMae ?? null,
            nomePai: extended.nomePai ?? null,
            genero: extended.genero ?? null,
            profissao: extended.profissao ?? null,
            registro: extended.registro ?? null,
            rqe: extended.rqe ?? null,
          };

        const structuredAddress =
          typeof extended.endereco === 'object' && extended.endereco !== null
            ? (extended.endereco as EnderecoDTO)
            : null;

        setPersonalDataId(personalFromResponse?.id ?? null);
        setAddressId(structuredAddress?.id ?? null);

        const normalizedAddress: EnderecoDTO = {
          cep: structuredAddress?.cep ?? extended.cep ?? null,
          logradouro:
            structuredAddress?.logradouro ??
            (typeof extended.endereco === 'string' ? extended.endereco : null),
          bairro: structuredAddress?.bairro ?? extended.bairro ?? null,
          cidade: structuredAddress?.cidade ?? extended.cidade ?? null,
          uf: structuredAddress?.uf ?? extended.uf ?? null,
          numero: structuredAddress?.numero ?? extended.numero ?? null,
          complemento: structuredAddress?.complemento ?? extended.complemento ?? null,
        };

        const registroValue =
          extended.registroProfissional?.numeroRegistro ?? extended.registro ?? null;
        const rqeValue = extended.registroProfissional?.rqe ?? extended.rqe ?? null;

        const defaultValues: DeepPartial<UserFormInputs> = {
          tipo: response.tipo as UserFormInputs['tipo'],
          cpfUsuario: formatCPF(response.cpf) ?? '',
          email: response.email ?? '',
          telefone: formatPhone(response.telefone ?? '') ?? '',
          nomeUsuario: response.nome ?? '',
          sexo: personal?.sexo ?? '',
          registro: registroValue ?? '',
          estado: normalizedAddress.uf ?? '',
          rqe: rqeValue ?? '',
          cep: formatCepDisplay(normalizedAddress.cep ?? undefined),
          endereco: normalizedAddress.logradouro ?? '',
          bairro: normalizedAddress.bairro ?? '',
          cidade: normalizedAddress.cidade ?? '',
          numero: normalizedAddress.numero ?? '',
          complemento: normalizedAddress.complemento ?? '',
          dataNascimento: personal?.dataNascimento
            ? formatISOToDDMMYYYY(personal.dataNascimento)
            : '',
          naturalidade: personal?.naturalidade ?? '',
          estadoCivil: personal?.estadoCivil ?? '',
          nomeMae: personal?.nomeMae ?? '',
          nomePai: personal?.nomePai ?? '',
          profissao: personal?.profissao ?? '',
          perfisIds: response.perfis?.map((perfil) => perfil.id) ?? [],
        };

        setLockedFields({
          nomeUsuario: true,
          cpfUsuario: true,
          sexo: true,
          registro: Boolean(registroValue),
          rqe: Boolean(rqeValue),
        });

        reset(defaultValues);
      } catch (error: unknown) {
        console.error('Erro ao buscar usuário', error);
        const message = isAxiosError(error)
          ? error.response?.data?.message ?? 'Erro ao carregar usuário'
          : 'Erro ao carregar usuário';
        toastError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, reset]);

  // CEP auto-fill logic (same as patients)
  const cepValue = watch('cep');
  useEffect(() => {
    const handleCepSearch = async (cep: string) => {
      clearErrors('cep');

      // don't overwrite existing address values coming from backend; only populate empties
      const hasEndereco = !!getValues('endereco');
      const hasBairro = !!getValues('bairro');
      const hasCidade = !!getValues('cidade');
      const hasEstado = !!getValues('estado');
      const hasComplemento = !!getValues('complemento');

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
            toastWarn('CEP não encontrado ou inválido.');
          }
        } catch (err) {
          console.error('Erro ao buscar CEP:', err);
          setError('cep', { type: 'manual', message: 'Erro ao buscar CEP. Tente novamente.' });
          toastError('Erro ao buscar CEP. Tente novamente.');
        }
      }
    };
    if (cepValue && cepValue.replace(/\D/g, '').length === 8) {
      handleCepSearch(cepValue);
    }
  }, [cepValue, setValue, setError, clearErrors, getValues]);

  const handleSaveUser = async (data: UserFormInputs) => {
    if (!id) return;
    try {
      const { removeNonNumeric, formatDateToISO } = await import('../../utils/formatters');

      const personalPayload: UpdateUserDTO['dadosPessoais'] = {
        id: personalDataId ?? undefined,
        dataNascimento: data.dataNascimento ? formatDateToISO(data.dataNascimento) : undefined,
        sexo: data.sexo || undefined,
        naturalidade: data.naturalidade || undefined,
        estadoCivil: data.estadoCivil || undefined,
        nomeMae: data.nomeMae || undefined,
        nomePai: data.nomePai || undefined,
        profissao: data.profissao || undefined,
        registro: data.registro || undefined,
        rqe: data.rqe || undefined,
      };

      const enderecoPayload: UpdateUserDTO['endereco'] = {
        id: addressId ?? undefined,
        logradouro: data.endereco || undefined,
        numero: data.numero || undefined,
        complemento: data.complemento || undefined,
        bairro: data.bairro || undefined,
        cidade: data.cidade || undefined,
        uf: data.estado || undefined,
        cep: data.cep ? removeNonNumeric(data.cep) : undefined,
      };

      const isProfessionalType = PROFESSIONAL_USER_TYPES.some((tipo) => tipo === data.tipo);
      const registroProfissionalPayload: UpdateUserDTO['registroProfissional'] = isProfessionalType
        ? {
            tipoProfissional: data.tipo,
            numeroRegistro: data.registro || undefined,
            rqe: data.tipo === 'MEDICO' ? data.rqe || undefined : undefined,
          }
        : null;

      const userDTO: UpdateUserDTO = {
        nome: data.nomeUsuario,
        email: data.email,
        telefone: data.telefone ? removeNonNumeric(data.telefone) : undefined,
        tipo: data.tipo,
        ativo: true,
        cpf: data.cpfUsuario ? removeNonNumeric(data.cpfUsuario) : undefined,
  dadosPessoais: hasMeaningfulValue(personalPayload) ? personalPayload : null,
  endereco: hasMeaningfulValue(enderecoPayload) ? enderecoPayload : null,
        registroProfissional: registroProfissionalPayload,
      };

      await adminService.updateUser(Number(id), userDTO);

      if (Array.isArray(data.perfisIds) && data.perfisIds.length > 0) {
        const perfisIds = data.perfisIds
          .map((perfilId) => Number(perfilId))
          .filter((perfilId) => !Number.isNaN(perfilId));

        if (perfisIds.length > 0) {
          await adminService.assignRoles(Number(id), { perfisIds });
        }
      }

      setOpenSaveDialog(false);
      toastSuccess('Usuário atualizado com sucesso');
      setTimeout(() => navigate('/users'), 1200);
    } catch (error: unknown) {
      console.error('Erro ao atualizar usuário', error);
      const message = isAxiosError(error)
        ? error.response?.data?.message ?? 'Erro ao atualizar usuário'
        : 'Erro ao atualizar usuário';
      toastError(message);
      setOpenSaveDialog(false);
    }
  };

  const onError = (errors: FieldErrors<UserFormInputs>) => {
    console.log('Erros de validação do usuário:', errors);
    toastError('Por favor, corrija os erros no formulário do usuário.');
    setOpenSaveDialog(false);
  };

  const handleConfirmSave = handleSubmit(handleSaveUser, onError);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>;
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
      <Breadcrumbs items={[
        { label: 'Profissionais', path: '/users' },
        { label: userName || 'Carregando...', path: `/users/${id}` },
        { label: 'Editar' }
      ]} />
      <PageHeader title="Editar Profissional" subtitle="Atualize os dados do usuário" />
      <form noValidate>

        <UserForm
          register={register}
          errors={errors}
          control={control}
          watch={watch}
          setValue={setValue}
          setError={setError}
          clearErrors={clearErrors}
          disabledFields={lockedFields}
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
            aria-label="Salvar alterações do profissional"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Salvar
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleOpenCancelDialog}
            aria-label="Cancelar edição e voltar"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Cancelar
          </Button>
        </Grid>
      </form>

      <ConfirmationDialog open={openCancelDialog} onClose={handleCloseCancelDialog} onConfirm={handleConfirmCancel} title="Confirmar Cancelamento" message="Tem certeza que deseja cancelar? Você perderá todos os dados preenchidos." confirmButtonText="Sim, Cancelar" cancelButtonText="Não, Continuar Editando" />

      <ConfirmationDialog open={openSaveDialog} onClose={handleCloseSaveDialog} onConfirm={handleConfirmSave} title="Confirmar Salvamento" message="Tem certeza que deseja salvar o profissional?" confirmButtonText="Sim, Salvar" cancelButtonText="Não, Voltar" />

    </Box>
  );
}

export default UserEditPage;
