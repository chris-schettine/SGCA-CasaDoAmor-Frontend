import { Alert, Button, Grid, Snackbar, type AlertColor, type SnackbarCloseReason, CircularProgress } from "@mui/material";
import { buttonStyles, cancelButtonStyles, saveButtonStyles, stylesContainer, TitleStyles } from "../UserRegister/styles";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import UserForm from "../../components/UserForm";
import { userSchemaConditional as userSchema, type UserFormInputs } from "../../schemas/userSchema";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminService } from '../../api/admin.service';

const UserEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");
  const [loading, setLoading] = useState(true);

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
    showSnackbar("Alterações não salvas", "error");
    setTimeout(() => {
      navigate('/users');
    }, 1000);
    setOpenCancelDialog(false);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
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

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await adminService.getUserById(Number(id));
        // map response to form shape
        const { formatCPF, formatPhone, formatISOToDDMMYYYY } = await import('../../utils/formatters');
        // backend may return nested objects (dadosPessoais, endereco) or flattened fields; support both
        const personal = (res as any).dadosPessoais || {
          dataNascimento: (res as any).dataNascimento,
          sexo: (res as any).sexo,
          rg: (res as any).rg,
          orgaoEmissor: (res as any).orgaoEmissor,
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
          conselho: (res as any).conselho || '',
          registro: (res as any).registro || '',
          uf: address?.uf || (res as any).uf || '',
          cbo: (res as any).cbo || '',
          rqe: (res as any).rqe || '',
          cnes: (res as any).cnes || '',
          cep: address?.cep ? (address.cep.includes('-') ? address.cep : (address.cep.length === 8 ? address.cep.replace(/(\d{5})(\d{3})/, "$1-$2") : address.cep)) : '',
          endereco: address?.logradouro || address?.endereco || '',
          bairro: address?.bairro || '',
          cidade: address?.cidade || '',
          numero: address?.numero || '',
          complemento: address?.complemento || '',
          // personal data
          dataNascimento: personal?.dataNascimento ? formatISOToDDMMYYYY(personal.dataNascimento) : '',
          rg: personal?.rg || '',
          orgaoEmissor: personal?.orgaoEmissor || '',
          naturalidade: personal?.naturalidade || '',
          estadoCivil: personal?.estadoCivil || '',
          nomeMae: personal?.nomeMae || '',
          nomePai: personal?.nomePai || '',
          profissao: personal?.profissao || '',
          perfisIds: (res.perfis || []).map((p: any) => p.id),
        };
        reset(defaultValues);
      } catch (error: any) {
        console.error('Erro ao buscar usuário', error);
        showSnackbar('Erro ao carregar usuário', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, reset, showSnackbar]);

  // CEP auto-fill logic (same as patients)
  const cepValue = watch('cep');
  useEffect(() => {
    const handleCepSearch = async (cep: string) => {
      clearErrors('cep');

      // don't overwrite existing address values coming from backend; only populate empties
      const hasEndereco = !!watch('endereco');
      const hasBairro = !!watch('bairro');
      const hasCidade = !!watch('cidade');
      const hasUf = !!watch('uf');
      const hasComplemento = !!watch('complemento');

      const cleanedCep = cep.replace(/\D/g, '');
      if (cleanedCep.length === 8) {
        try {
          const addressData = await (await import('../../utils/cepService')).fetchAddressByCep(cleanedCep);
          if (addressData) {
            if (!hasEndereco) setValue('endereco', addressData.logradouro || '');
            if (!hasBairro) setValue('bairro', addressData.bairro || '');
            if (!hasCidade) setValue('cidade', addressData.localidade || '');
            if (!hasUf) setValue('uf', addressData.uf || '');
            if (!hasComplemento) setValue('complemento', addressData.complemento || '');
          } else {
            setError('cep', { type: 'manual', message: 'CEP não encontrado ou inválido.' });
            showSnackbar('CEP não encontrado ou inválido.', 'warning');
          }
        } catch (err) {
          console.error('Erro ao buscar CEP:', err);
          setError('cep', { type: 'manual', message: 'Erro ao buscar CEP. Tente novamente.' });
          showSnackbar('Erro ao buscar CEP. Tente novamente.', 'error');
        }
      }
    };
    if (cepValue && cepValue.replace(/\D/g, '').length === 8) {
      handleCepSearch(cepValue);
    }
  }, [cepValue, setValue, setError, clearErrors, showSnackbar]);

  const handleSaveUser = async (data: UserFormInputs) => {
    if (!id) return;
    try {
      const { removeNonNumeric } = await import('../../utils/formatters');

      const userDTO: any = {
        nome: data.nomeUsuario,
        email: data.email,
        telefone: data.telefone,
        tipo: data.tipo,
        ativo: true,
        // send cpf as digits-only (backend seems to accept digits)
        cpf: data.cpfUsuario ? removeNonNumeric(data.cpfUsuario) : undefined,
        dadosPessoais: {
          dataNascimento: data.dataNascimento || undefined,
          sexo: data.sexo || undefined,
          rg: data.rg || undefined,
          orgaoEmissor: data.orgaoEmissor || undefined,
          naturalidade: data.naturalidade || undefined,
          estadoCivil: data.estadoCivil || undefined,
          nomeMae: data.nomeMae || undefined,
          nomePai: data.nomePai || undefined,
          profissao: data.profissao || undefined,
        },
        endereco: {
          logradouro: data.endereco || undefined,
          numero: data.numero || undefined,
          complemento: data.complemento || undefined,
          bairro: data.bairro || undefined,
          cidade: data.cidade || undefined,
          uf: data.uf || undefined,
          cep: data.cep ? removeNonNumeric(data.cep) : undefined,
        },
      };

      await adminService.updateUser(Number(id), userDTO);

      // assign roles if provided
      if (Array.isArray(data.perfisIds)) {
        await adminService.assignRoles(Number(id), { perfisIds: data.perfisIds });
      }

      setOpenSaveDialog(false);
      showSnackbar('Usuário atualizado com sucesso', 'success');
      setTimeout(() => navigate('/users'), 1200);
    } catch (error: any) {
      console.error('Erro ao atualizar usuário', error);
      const message = error.response?.data?.message || 'Erro ao atualizar usuário';
      showSnackbar(message, 'error');
      setOpenSaveDialog(false);
    }
  };

  const onError = (errors: FieldErrors<UserFormInputs>) => {
    console.log('Erros de validação do usuário:', errors);
    showSnackbar('Por favor, corrija os erros no formulário do usuário.', 'error');
    setOpenSaveDialog(false);
  };

  const handleConfirmSave = handleSubmit(handleSaveUser, onError);

  if (loading) {
    return <div css={stylesContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></div>;
  }

  return (
    <div css={stylesContainer}>
      <h1 css={TitleStyles}>Editar Profissional</h1>
      <form noValidate>

        <UserForm
          register={register}
          errors={errors}
          control={control}
          watch={watch}
          setValue={setValue}
          setError={setError}
          clearErrors={clearErrors}
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

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={(_, reason) => handleSnackbarClose(reason as SnackbarCloseReason)}
      >
        <Alert onClose={() => handleSnackbarClose('clickaway')} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>{snackbarMessage}</Alert>
      </Snackbar>

      <ConfirmationDialog open={openCancelDialog} onClose={handleCloseCancelDialog} onConfirm={handleConfirmCancel} title="Confirmar Cancelamento" message="Tem certeza que deseja cancelar? Você perderá todos os dados preenchidos." confirmButtonText="Sim, Cancelar" cancelButtonText="Não, Continuar Editando" />

      <ConfirmationDialog open={openSaveDialog} onClose={handleCloseSaveDialog} onConfirm={handleConfirmSave} title="Confirmar Salvamento" message="Tem certeza que deseja salvar o profissional?" confirmButtonText="Sim, Salvar" cancelButtonText="Não, Voltar" />

    </div>
  );
}

export default UserEditPage;
