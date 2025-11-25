import { useEffect, useState, useRef } from 'react';
import { Box, Button, Grid, TextField, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { isAxiosError } from 'axios';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AuthSessionResponse } from '../../api/auth.dto';
import { authService } from '../../api/auth.service';
import { adminService } from '../../api/admin.service';
import type { UpdateUserDTO } from '../../api/admin.dto';
import MaskedTextField from '../../components/MaskedTextField';
import PageHeader from '../../components/PageHeader';
import LoadingState from '../../components/LoadingState';
import { useAuth } from '../../hooks/useAuth';
import type { UserType } from '../../contexts/AuthContext';
import { formatCPF, formatDateToISO, formatISOToDDMMYYYY, formatPhone, removeNonNumeric } from '../../utils/formatters';
import { toastError, toastSuccess, toastWarn } from '../../utils/toast';
import { cepSchema, phoneSchema, requiredString } from '../../schemas/commonValidation';

type SexoOption = 'MASCULINO' | 'FEMININO';

const myProfileSchema = z.object({
  email: z.string().trim().min(1, 'O e-mail é obrigatório').email('Digite um e-mail válido'),
  telefone: phoneSchema,
  cep: cepSchema,
  endereco: requiredString,
  bairro: requiredString,
  cidade: requiredString,
  estado: requiredString,
  numero: requiredString,
  complemento: z.string().trim().optional(),
  estadoCivil: z.string().trim().optional(),
  naturalidade: z.string().trim().optional(),
  dataNascimento: z.string().trim().optional(),
  nome: z.string().trim().optional(),
  cpf: z.string().trim().optional(),
  registro: z.string().trim().optional(),
  rqe: z.string().trim().optional(),
  sexo: z.union([z.enum(['MASCULINO', 'FEMININO']), z.literal('')]).optional(),
});

type MyProfileFormData = z.infer<typeof myProfileSchema>;

interface PasswordFormInputs {
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
}

type PersonalData = {
  dataNascimento?: string | null;
  estadoCivil?: string | null;
  naturalidade?: string | null;
  nomeMae?: string | null;
  nomePai?: string | null;
  sexo?: SexoOption | string | null;
};

type AddressData = {
  bairro?: string | null;
  cep?: string | null;
  cidade?: string | null;
  complemento?: string | null;
  endereco?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  uf?: string | null;
};

type ProfessionalData = {
  numeroRegistro?: string | null;
  rqe?: string | null;
};

type DetailedAuthSession = AuthSessionResponse & {
  id?: number | string;
  telefone?: string | null;
  dadosPessoais?: PersonalData | null;
  endereco?: AddressData | string | null;
  registro?: string | null;
  rqe?: string | null;
  registroProfissional?: ProfessionalData | null;
  cep?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  numero?: string | null;
  complemento?: string | null;
  sexo?: SexoOption | string | null;
};

const formatCepDisplay = (value?: string | null): string => {
  if (!value) return '';
  const digitsOnly = removeNonNumeric(value);
  if (digitsOnly.length !== 8) {
    return value;
  }
  return digitsOnly.replace(/(\d{5})(\d{3})/, '$1-$2');
};

const PROFESSIONAL_USER_TYPES: ReadonlyArray<string> = ['DENTISTA', 'MEDICO', 'ENFERMEIRO', 'FISIOTERAPEUTA', 'NUTRICIONISTA'];


const MyProfilePage = () => {
  const { token, user, login } = useAuth();
  const [rawUser, setRawUser] = useState<DetailedAuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const { control, handleSubmit, reset, watch, setValue, setError, clearErrors, register, formState: { errors, isSubmitting } } = useForm<MyProfileFormData>({
    mode: 'onBlur',
    resolver: zodResolver(myProfileSchema),
  });

  // CEP auto-fill: mirror logic used in UserForm
  const cepValue = watch('cep');
  const prevCepRef = useRef<string | null>(null);
  const initialCepCapturedRef = useRef(false);

  useEffect(() => {
    if (!initialCepCapturedRef.current && cepValue) {
      const cleaned = String(cepValue).replace(/\D/g, '');
      if (cleaned.length > 0) prevCepRef.current = cleaned;
      initialCepCapturedRef.current = true;
    }
  }, [cepValue]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const doLookup = async (rawCep: string) => {
      const cleanedCep = rawCep.replace(/\D/g, '');
      if (cleanedCep.length !== 8) return;
      try {
        const mod = await import('../../utils/cepService');
        const addressData = await mod.fetchAddressByCep(cleanedCep);
        if (!addressData) {
          setError('cep', { type: 'manual', message: 'CEP não encontrado ou inválido.' });
          return;
        }

        clearErrors('cep');

        const prev = prevCepRef.current;
        const isFirstLookup = prev === null;
        const isDifferent = prev !== null && prev !== cleanedCep;

        if (isFirstLookup) {
          const currentEndereco = watch('endereco');
          const currentBairro = watch('bairro');
          const currentCidade = watch('cidade');
          const currentEstado = watch('estado');
          const currentComplemento = watch('complemento');

          if (!currentEndereco) setValue('endereco', addressData.logradouro || '');
          if (!currentBairro) setValue('bairro', addressData.bairro || '');
          if (!currentCidade) setValue('cidade', addressData.localidade || '');
          if (!currentEstado) setValue('estado', addressData.uf || '');
          if (!currentComplemento) setValue('complemento', addressData.complemento || '');
        } else if (isDifferent) {
          setValue('endereco', addressData.logradouro || '');
          setValue('bairro', addressData.bairro || '');
          setValue('cidade', addressData.localidade || '');
          setValue('estado', addressData.uf || '');
          setValue('complemento', addressData.complemento || '');
        }

        prevCepRef.current = cleanedCep;

      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
        setError('cep', { type: 'manual', message: 'Erro ao buscar CEP. Tente novamente.' });
      }
    };

    if (cepValue) {
      timer = setTimeout(() => doLookup(cepValue), 500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [cepValue, setValue, setError, clearErrors, watch]);

  const { control: pwControl, handleSubmit: handleSubmitPw, reset: resetPw, formState: { isSubmitting: isPwSubmitting } } = useForm<PasswordFormInputs>({ mode: 'onBlur' });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const me = (await authService.getActiveSession()) as DetailedAuthSession;
        setRawUser(me);

        const personal: PersonalData = me.dadosPessoais ?? {
          sexo: me.sexo ?? null,
          estadoCivil: null,
          dataNascimento: null,
          naturalidade: null,
          nomeMae: null,
          nomePai: null,
        };

        const addressFromSession: AddressData | null =
          typeof me.endereco === 'object' && me.endereco !== null ? (me.endereco as AddressData) : null;
        const addressAsString = typeof me.endereco === 'string' ? me.endereco : null;

        const address: AddressData = addressFromSession ?? {
          cep: me.cep ?? null,
          logradouro: addressAsString,
          endereco: addressAsString,
          bairro: me.bairro ?? null,
          cidade: me.cidade ?? null,
          uf: me.uf ?? null,
          numero: me.numero ?? null,
          complemento: me.complemento ?? null,
        };

        const isProfessionalUser = me.tipo ? PROFESSIONAL_USER_TYPES.includes(me.tipo) : false;

        const professional: ProfessionalData = isProfessionalUser
          ? me.registroProfissional ?? {
              numeroRegistro: me.registro ?? null,
              rqe: me.rqe ?? null,
            }
          : { numeroRegistro: null, rqe: null };

        const rawSexo = personal?.sexo;
        const normalizedSexo: SexoOption | '' = rawSexo === 'MASCULINO' || rawSexo === 'FEMININO' ? rawSexo : '';

        reset({
          nome: me.nome ?? me.user?.nome ?? '',
          cpf: formatCPF(me.cpf ?? me.user?.cpf ?? ''),
          sexo: normalizedSexo,
          email: me.email ?? me.user?.email ?? '',
          telefone: formatPhone(me.telefone ?? ''),
          cep: formatCepDisplay(address?.cep ?? null),
          endereco: address?.logradouro ?? address?.endereco ?? '',
          bairro: address?.bairro ?? '',
          cidade: address?.cidade ?? '',
          estado: address?.uf ?? '',
          registro: professional?.numeroRegistro ?? '',
          rqe: professional?.rqe ?? '',
          numero: address?.numero ?? '',
          complemento: address?.complemento ?? '',
          estadoCivil: personal?.estadoCivil ?? '',
          dataNascimento: personal?.dataNascimento ? formatISOToDDMMYYYY(personal.dataNascimento) : '',
          naturalidade: personal?.naturalidade ?? '',
        });
      } catch (err) {
        console.error('Erro ao carregar perfil', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [reset]);

  const onSaveProfile: SubmitHandler<MyProfileFormData> = async (data) => {
    if (!rawUser?.id) {
      toastError('Não foi possível identificar o usuário.');
      return;
    }

    const userId = Number(rawUser.id);
    if (Number.isNaN(userId)) {
      toastError('Identificador de usuário inválido.');
      return;
    }

    try {
      const sanitizedTelefone = removeNonNumeric(data.telefone);
      const sanitizedCep = removeNonNumeric(data.cep);

      const personalPayload: UpdateUserDTO['dadosPessoais'] = {
        sexo: data.sexo ? data.sexo : null,
        estadoCivil: data.estadoCivil ? data.estadoCivil : null,
        dataNascimento: data.dataNascimento ? formatDateToISO(data.dataNascimento) : null,
        naturalidade: data.naturalidade ? data.naturalidade : null,
      };

      const hasPersonalData = Object.values(personalPayload ?? {}).some((value) => Boolean(value));

      const addressPayload: UpdateUserDTO['endereco'] = {
        logradouro: data.endereco ? data.endereco : null,
        numero: data.numero ? data.numero : null,
        complemento: data.complemento ? data.complemento : null,
        bairro: data.bairro ? data.bairro : null,
        cidade: data.cidade ? data.cidade : null,
        uf: data.estado ? data.estado : null,
        cep: sanitizedCep ? sanitizedCep : null,
      };

      const hasAddressData = Object.values(addressPayload ?? {}).some((value) => Boolean(value));

      const isProfessional = rawUser.tipo ? PROFESSIONAL_USER_TYPES.includes(rawUser.tipo) : false;

      const professionalPayload: UpdateUserDTO['registroProfissional'] = isProfessional
        ? {
            tipoProfissional: rawUser.tipo,
            numeroRegistro: data.registro ? data.registro : null,
            rqe: rawUser.tipo === 'MEDICO' ? (data.rqe ? data.rqe : null) : null,
          }
        : null;

      const payload: UpdateUserDTO = {
        nome: data.nome,
        email: data.email,
        telefone: sanitizedTelefone || undefined,
        dadosPessoais: hasPersonalData ? personalPayload : null,
        endereco: hasAddressData ? addressPayload : null,
        registroProfissional: professionalPayload,
      };

      await adminService.updateUser(userId, payload);

      const fallbackRoles = Array.isArray(rawUser.perfis)
        ? rawUser.perfis
            .map((perfil) => perfil?.nome)
            .filter((roleName): roleName is string => Boolean(roleName))
        : rawUser.roles ?? rawUser.user?.roles ?? [];

      const previousUser: UserType = user ?? {
        nome: rawUser.nome ?? rawUser.user?.nome ?? '',
        email: rawUser.email ?? rawUser.user?.email ?? '',
        cpf: rawUser.cpf ?? rawUser.user?.cpf ?? '',
        roles: fallbackRoles,
        tipoUsuario: rawUser.tipoUsuario ?? rawUser.tipo ?? rawUser.user?.tipoUsuario,
        uuid: rawUser.uuid ?? rawUser.user?.uuid,
      };

      const mergedUser: UserType = {
        nome: data.nome || previousUser.nome,
        email: data.email || previousUser.email,
        cpf: previousUser.cpf,
        roles: previousUser.roles,
        tipoUsuario: previousUser.tipoUsuario,
        uuid: previousUser.uuid,
      };

      login(token ?? '', mergedUser);

      toastSuccess('Perfil atualizado com sucesso');
    } catch (error: unknown) {
      console.error('Erro ao salvar perfil', error);
      if (isAxiosError(error)) {
        const message = typeof error.response?.data === 'object' && error.response?.data !== null
          ? (error.response.data as { message?: string }).message
          : undefined;
        toastError(message ?? 'Erro ao salvar perfil');
      } else {
        toastError('Erro ao salvar perfil');
      }
    }
  };

  const onChangePassword: SubmitHandler<PasswordFormInputs> = async (data) => {
    const { senhaAtual, novaSenha, confirmarSenha } = data;
    if (novaSenha !== confirmarSenha) {
      toastWarn('A nova senha e a confirmação não coincidem');
      return;
    }
    try {
      await authService.changePassword({ senhaAtual, novaSenha });
      toastSuccess('Senha alterada com sucesso');
      resetPw({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
    } catch (error: unknown) {
      console.error('Erro ao alterar senha', error);
      if (isAxiosError(error)) {
        const message = typeof error.response?.data === 'object' && error.response?.data !== null
          ? (error.response.data as { message?: string }).message
          : undefined;
        toastError(message ?? 'Erro ao alterar senha');
      } else {
        toastError('Erro ao alterar senha');
      }
    }
  };

  // (2FA removed from profile page)

  if (loading) return <LoadingState message="Carregando perfil..." />;

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', p: 3, color: 'text.primary' }}>
      <Box sx={{ padding: 3 }}>
      <PageHeader title="Meu Perfil" subtitle="Visualize e edite suas informações pessoais" />

      <form onSubmit={handleSubmit(onSaveProfile)}>
        <Grid container spacing={2}>
          {/* Row 1: Nome | CPF */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="nome"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField fullWidth label="Nome" {...field} disabled />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="cpf"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <MaskedTextField {...field} id="cpf" label="CPF" mask="000.000.000-00" fullWidth disabled />
              )}
            />
          </Grid>

          {/* Row 2: Email | Telefone */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="email"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  fullWidth
                  label="E-mail"
                  autoComplete="email"
                  {...field}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  required
                  InputLabelProps={{ required: true }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="telefone"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <MaskedTextField
                  {...field}
                  fullWidth
                  label="Telefone"
                  mask="00 00000-0000"
                  autoComplete="tel"
                  error={!!errors.telefone}
                  helperText={errors.telefone?.message}
                  required
                  InputLabelProps={{ required: true }}
                />
              )}
            />
          </Grid>
          

          {/* Sexo (shown but disabled) */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ mt: 1 }}>
            <Controller
              name="sexo"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="sexo-label">Sexo</InputLabel>
                  <Select
                    labelId="sexo-label"
                    id="sexo"
                    label="Sexo"
                    value={field.value ?? ''}
                    onChange={(event: SelectChangeEvent<SexoOption | ''>) => field.onChange(event.target.value as SexoOption | '')}
                    onBlur={field.onBlur}
                    name={field.name}
                 
                  >
                    <MenuItem value="MASCULINO">Masculino</MenuItem>
                    <MenuItem value="FEMININO">Feminino</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          
          <Grid size={{ xs: 12, md: 4 }} sx={{ mt: 1 }}>
            <TextField
              id="estadoCivil"
              label="Estado Civil"
              variant="outlined"
              fullWidth
              placeholder="Estado Civil"
              {...register('estadoCivil')}
              InputLabelProps={{ shrink: !!watch('estadoCivil') }}
              helperText={errors.estadoCivil?.message || 'Opcional'}
              error={!!errors.estadoCivil}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ mt: 1 }}>
            <Controller
              name="dataNascimento"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <MaskedTextField
                  {...field}
                  id="dataNascimento"
                  label="Data de Nascimento"
                  variant="outlined"
                  fullWidth
                  placeholder="DD/MM/AAAA"
                  mask="00/00/0000"
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ mt: 1 }}>
            <TextField
              id="naturalidade"
              label="Naturalidade"
              variant="outlined"
              fullWidth
              placeholder="Naturalidade"
              {...register('naturalidade')}
              InputLabelProps={{ shrink: !!watch('naturalidade') }}
              helperText={errors.naturalidade?.message || 'Opcional'}
              error={!!errors.naturalidade}
            />
          </Grid>

          {/* Registro profissional / RQE (shown conditionally based on user tipo) */}
          {rawUser?.tipo && PROFESSIONAL_USER_TYPES.includes(rawUser.tipo) && (
            <>
              <Grid size={{ xs: 12, md: 4 }} sx={{ mt: 1 }}>
                <TextField id="registro" label="Registro" variant="outlined" fullWidth placeholder="Registro" {...register('registro')} InputLabelProps={{ shrink: !!watch('registro') }} />
              </Grid>
              {rawUser.tipo === 'MEDICO' && (
                <Grid size={{ xs: 12, md: 4 }} sx={{ mt: 1 }}>
                  <TextField id="rqe" label="RQE" variant="outlined" fullWidth placeholder="RQE" {...register('rqe')} InputLabelProps={{ shrink: !!watch('rqe') }} />
                </Grid>
              )}
            </>
          )}

          {/* Address fields */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ mt: 1 }}>
            <Controller
              name="cep"
              control={control}
              render={({ field }) => (
                <MaskedTextField
                  {...field}
                  id="cep"
                  label="CEP"
                  variant="outlined"
                  fullWidth
                  placeholder="00000-000"
                  autoComplete="postal-code"
                  mask="00000-000"
                  error={!!errors.cep}
                  helperText={errors.cep?.message}
                  required
                  InputLabelProps={{ required: true }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 8 }} sx={{ mt: 1 }}>
            <TextField
              id="endereco"
              label="Endereço"
              variant="outlined"
              fullWidth
              placeholder="Endereço"
              autoComplete="address-line1"
              {...register('endereco')}
              error={!!errors.endereco}
              helperText={errors.endereco?.message}
              required
              InputLabelProps={{ shrink: !!watch('endereco'), required: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              id="bairro"
              label="Bairro"
              variant="outlined"
              fullWidth
              placeholder="Bairro"
              autoComplete="address-level3"
              {...register('bairro')}
              error={!!errors.bairro}
              helperText={errors.bairro?.message}
              required
              InputLabelProps={{ shrink: !!watch('bairro'), required: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              id="cidade"
              label="Cidade"
              variant="outlined"
              fullWidth
              placeholder="Cidade"
              autoComplete="address-level2"
              {...register('cidade')}
              error={!!errors.cidade}
              helperText={errors.cidade?.message}
              required
              InputLabelProps={{ shrink: !!watch('cidade'), required: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              id="estado"
              label="Estado"
              variant="outlined"
              fullWidth
              placeholder="Estado"
              autoComplete="address-level1"
              {...register('estado')}
              error={!!errors.estado}
              helperText={errors.estado?.message}
              required
              InputLabelProps={{ shrink: !!watch('estado'), required: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              id="numero"
              label="Número"
              variant="outlined"
              fullWidth
              placeholder="Número"
              autoComplete="off"
              {...register('numero')}
              error={!!errors.numero}
              helperText={errors.numero?.message}
              required
              InputLabelProps={{ shrink: !!watch('numero'), required: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <TextField id="complemento" label="Complemento" variant="outlined" fullWidth placeholder="Complemento" autoComplete="address-line2" {...register('complemento')} InputLabelProps={{ shrink: !!watch('complemento') }} />
          </Grid>

          <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
            <Button
              variant="contained"
              type="submit"
              disabled={isSubmitting}
              sx={{
                '&:focus-visible': {
                  outline: (theme) => `3px solid ${theme.palette.primary.light}`,
                  outlineOffset: '2px',
                },
              }}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </Grid>
        </Grid>
      </form>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h2">Alterar senha</Typography>
  <form onSubmit={handleSubmitPw(onChangePassword)}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="senhaAtual"
                control={pwControl}
                defaultValue=""
                render={({ field }) => (
                  <TextField fullWidth label="Senha atual" type="password" {...field} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="novaSenha"
                control={pwControl}
                defaultValue=""
                render={({ field }) => (
                  <TextField fullWidth label="Nova senha" type="password" {...field} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Controller
                name="confirmarSenha"
                control={pwControl}
                defaultValue=""
                render={({ field }) => (
                  <TextField fullWidth label="Confirmar nova senha" type="password" {...field} />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
              <Button
                variant="outlined"
                color="primary"
                type="submit"
                disabled={isPwSubmitting}
                sx={{
                  '&:focus-visible': {
                    outline: (theme) => `3px solid ${theme.palette.primary.light}`,
                    outlineOffset: '2px',
                  },
                }}
              >
                {isPwSubmitting ? 'Salvando...' : 'Alterar senha'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
        </Box>
      </Box>
  );
};

export default MyProfilePage;
