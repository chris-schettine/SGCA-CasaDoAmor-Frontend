import { Button, Grid, CircularProgress, Box } from "@mui/material";
import PageHeader from "../../components/PageHeader";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import UserForm from "../../components/UserForm";
import { userSchemaConditional as userSchema, type UserFormInputs } from "../../schemas/userSchema";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminService } from '../../api/admin.service';
import Breadcrumbs from "../../components/Breadcrumbs";
import { useUnsavedChangesWarning } from "../../hooks/useUnsavedChangesWarning";
import { useSaveShortcut } from "../../hooks/useSaveShortcut";
import { DevTools } from "../../utils/devTools";
import { toastError, toastSuccess, toastWarn } from "../../utils/toast";


const UserEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");

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
    if (process.env.NODE_ENV === 'development') {
      const form = document.querySelector('form');
      const cleanup = DevTools.addFakeDataButton(
        form,
        DevTools.fillUserFormWithFakeData,
        setValue
      );
      return cleanup;
    }
  }, [setValue]);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await adminService.getUserById(Number(id));
        setUserName(res.nome || 'Usuário');
        // map response to form shape
        const { formatCPF, formatPhone, formatISOToDDMMYYYY } = await import('../../utils/formatters');
        // backend may return nested objects (dadosPessoais, endereco) or flattened fields; support both
        const personal = (res as any).dadosPessoais || {
          dataNascimento: (res as any).dataNascimento,
          sexo: (res as any).sexo,
          naturalidade: (res as any).naturalidade,
          estadoCivil: (res as any).estadoCivil,
          nomeMae: (res as any).nomeMae,
          nomePai: (res as any).nomePai,
          profissao: (res as any).profissao,
        };

        const address = (res as any).endereco || {
          cep: (res as any).cep,
          endereco: (res as any).endereco,
          bairro: (res as any).bairro,
          cidade: (res as any).cidade,
          uf: (res as any).uf,
          numero: (res as any).numero,
          complemento: (res as any).complemento,
        };

        const defaultValues: any = {
          tipo: res.tipo || undefined,
          cpfUsuario: formatCPF((res as any).cpf || (res as any).cpfUsuario) || '',
          email: res.email || '',
          telefone: formatPhone(res.telefone || (res as any).telefone) || '',
          nomeUsuario: res.nome || '',
          // prefer nested personal.sexo, fallback to top-level
          sexo: personal?.sexo || (res as any).sexo || '',
          // prefer registro from nested dadosPessoais, then top-level registro, then registroProfissional
          registro: personal?.registro || (res as any).registro || (res as any).registroProfissional?.numeroRegistro || '',
          estado: address?.uf || (res as any).uf || '',
          // rqe may live under dadosPessoais, top-level rqe, or registroProfissional.rqe
          rqe: personal?.rqe || (res as any).rqe || (res as any).registroProfissional?.rqe || '',
          cep: address?.cep ? (address.cep.includes('-') ? address.cep : (address.cep.length === 8 ? address.cep.replace(/(\d{5})(\d{3})/, "$1-$2") : address.cep)) : '',
          endereco: address?.logradouro || address?.endereco || '',
          bairro: address?.bairro || '',
          cidade: address?.cidade || '',
          numero: address?.numero || '',
          complemento: address?.complemento || '',
          // personal data
          dataNascimento: personal?.dataNascimento ? formatISOToDDMMYYYY(personal.dataNascimento) : '',
          genero: personal?.genero || '',
          naturalidade: personal?.naturalidade || '',
          estadoCivil: personal?.estadoCivil || '',
          perfisIds: (res.perfis || []).map((p: any) => p.id),
        };
        // determine which fields should be locked for admin edits
        const existingRegistro = !!(personal?.registro || (res as any).registro || (res as any).registroProfissional?.numeroRegistro);
        const existingRqe = !!(personal?.rqe || (res as any).rqe || (res as any).registroProfissional?.rqe);
        setLockedFields({
          nomeUsuario: true, // admin cannot edit name
          cpfUsuario: true, // admin cannot edit cpf
          sexo: true, // admin cannot edit sexo
          registro: existingRegistro,
          rqe: existingRqe,
        });

        reset(defaultValues);
      } catch (error: any) {
        console.error('Erro ao buscar usuário', error);
        toastError('Erro ao carregar usuário');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, reset, toastError]);

  // CEP auto-fill logic (same as patients)
  const cepValue = watch('cep');
  useEffect(() => {
    const handleCepSearch = async (cep: string) => {
      clearErrors('cep');

      // don't overwrite existing address values coming from backend; only populate empties
  const hasEndereco = !!watch('endereco');
  const hasBairro = !!watch('bairro');
  const hasCidade = !!watch('cidade');
  const hasEstado = !!watch('estado');
  const hasComplemento = !!watch('complemento');

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
  }, [cepValue, setValue, setError, clearErrors, toastError, toastWarn]);

  const handleSaveUser = async (data: UserFormInputs) => {
    if (!id) return;
    try {
      const { removeNonNumeric, formatDateToISO } = await import('../../utils/formatters');

      const userDTO: any = {
        nome: data.nomeUsuario,
        email: data.email,
        telefone: data.telefone,
        tipo: data.tipo,
        ativo: true,
        // send cpf as digits-only (backend seems to accept digits)
        cpf: data.cpfUsuario ? removeNonNumeric(data.cpfUsuario) : undefined,
        dadosPessoais: {
          dataNascimento: data.dataNascimento ? formatDateToISO(data.dataNascimento) : undefined,
          sexo: data.sexo || undefined,
          naturalidade: data.naturalidade || undefined,
          estadoCivil: data.estadoCivil || undefined,
          // keep registro/rqe in dadosPessoais for backward compatibility
          registro: data.registro || undefined,
          rqe: data.rqe || undefined,
        },
        endereco: {
          logradouro: data.endereco || undefined,
          numero: data.numero || undefined,
          complemento: data.complemento || undefined,
          bairro: data.bairro || undefined,
          cidade: data.cidade || undefined,
          uf: data.estado || undefined,
          cep: data.cep ? removeNonNumeric(data.cep) : undefined,
        },
        // include registroProfissional object as well so backend receives structured professional data
        registroProfissional: {
          tipoProfissional: data.tipo || undefined,
          numeroRegistro: data.registro || undefined,
          rqe: data.rqe || undefined,
        },
      };

      await adminService.updateUser(Number(id), userDTO);

      // assign roles if provided
      if (Array.isArray(data.perfisIds)) {
        await adminService.assignRoles(Number(id), { perfisIds: data.perfisIds });
      }

      setOpenSaveDialog(false);
      toastSuccess('Usuário atualizado com sucesso');
      setTimeout(() => navigate('/users'), 1200);
    } catch (error: any) {
      console.error('Erro ao atualizar usuário', error);
      const message = error.response?.data?.message || 'Erro ao atualizar usuário';
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
