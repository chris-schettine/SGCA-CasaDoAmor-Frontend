import { useEffect, useState, useRef } from 'react';
import { Box, Button, Grid, TextField, Typography, CircularProgress, Alert, Snackbar, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { authService } from '../../api/auth.service';
import { adminService } from '../../api/admin.service';
import MaskedTextField from '../../components/MaskedTextField';
import { useAuth } from '../../hooks/useAuth';
import { formatISOToDDMMYYYY } from '../../utils/formatters';


const MyProfilePage = () => {
  const { token, user, login } = useAuth();
  const [rawUser, setRawUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success'| 'error' | 'warning' | 'info'>('success');

  const { control, handleSubmit, reset, watch, setValue, setError, clearErrors, register } = useForm({ mode: 'onBlur' });

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

  const { control: pwControl, handleSubmit: handleSubmitPw } = useForm({ mode: 'onBlur' });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const me: any = await authService.getActiveSession();
        setRawUser(me);
        const personal = me.dadosPessoais || { sexo: me.sexo };
        const address = me.endereco || {
          cep: me.cep,
          endereco: me.endereco,
          bairro: me.bairro,
          cidade: me.cidade,
          uf: me.uf,
          numero: me.numero,
          complemento: me.complemento,
        };

        const { formatCPF, formatPhone } = await import('../../utils/formatters').catch(() => ({} as any));

        reset({
          nome: me.nome || me.user?.nome || '',
          cpf: formatCPF ? formatCPF(me.cpf || '') : (me.cpf || ''),
          sexo: personal?.sexo || '',
          email: me.email || me.user?.email || '',
          telefone: formatPhone ? formatPhone(me.telefone || '') : (me.telefone || ''),
          cep: address?.cep ? (String(address.cep).includes('-') ? address.cep : (String(address.cep).replace(/(\d{5})(\d{3})/, "$1-$2"))) : '',
          endereco: address?.logradouro || address?.endereco || '',
          bairro: address?.bairro || '',
          cidade: address?.cidade || '',
          estado: address?.uf || '',
          registro: personal?.registro || me.registro || '',
          rqe: personal?.rqe || me.rqe || '',
          numero: address?.numero || '',
          complemento: address?.complemento || '',
          tipo: rawUser?.tipo || rawUser?.tipoUsuario || '',
          estadoCivil: personal?.estadoCivil || '',
          dataNascimento: personal?.dataNascimento ? formatISOToDDMMYYYY(personal.dataNascimento) : '',
          naturalidade: personal?.naturalidade || '',
          nomeMae: personal?.nomeMae || '',
          nomePai: personal?.nomePai || '',
        });
      } catch (err) {
        console.error('Erro ao carregar perfil', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [reset]);

  const showSnackbar = (msg: string, severity: typeof snackbarSeverity) => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const onSaveProfile = async (data: any) => {
    if (!rawUser) return;
    try {
      const { removeNonNumeric } = await import('../../utils/formatters');

      const formatDDMMYYYYToISO = (d: string | undefined) => {
        if (!d) return undefined;
        const parts = String(d).split('/');
        if (parts.length !== 3) return undefined;
        const [dd, mm, yyyy] = parts;
        
        if (!/^\d{1,2}$/.test(dd) || !/^\d{1,2}$/.test(mm) || !/^\d{4}$/.test(yyyy)) return undefined;
        return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
      };

      const payload: any = {
        email: data.email,
        telefone: data.telefone,
        tipo: data.tipo,
        // include nested personal/registration info for medical/professional users
        dadosPessoais: {
          registro: data.registro || undefined,
          sexo: data.sexo || undefined,
          estadoCivil: data.estadoCivil || undefined,
          dataNascimento: data.dataNascimento ? formatDDMMYYYYToISO(data.dataNascimento) : undefined,
          naturalidade: data.naturalidade || undefined,
          nomeMae: data.nomeMae || undefined,
          nomePai: data.nomePai || undefined,
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
        registroProfissional: {
          tipoProfissional: rawUser?.tipo || undefined,
          numeroRegistro: data.registro || undefined,
          rqe: data.rqe || undefined,
        },
      };

      await adminService.updateUser(Number(rawUser.id), payload);

      // update local auth user (merge)
      const merged = {
        ...user,
        email: data.email || user?.email,
        telefone: data.telefone || (user as any)?.telefone,
      } as any;

      // call login with current token to update context
      login(token || '', merged);

      showSnackbar('Perfil atualizado com sucesso', 'success');
    } catch (err: any) {
      console.error('Erro ao salvar perfil', err);
      showSnackbar(err?.response?.data?.message || 'Erro ao salvar perfil', 'error');
    }
  };

  const onChangePassword = async (data: any) => {
    const { senhaAtual, novaSenha, confirmarSenha } = data;
    if (novaSenha !== confirmarSenha) {
      showSnackbar('A nova senha e a confirmação não coincidem', 'warning');
      return;
    }
    try {
      await authService.changePassword({ senhaAtual, novaSenha });
      showSnackbar('Senha alterada com sucesso', 'success');
      // optionally clear pw fields - forms are uncontrolled here so not doing it
    } catch (err: any) {
      console.error('Erro ao alterar senha', err);
      showSnackbar(err?.response?.data?.message || 'Erro ao alterar senha', 'error');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><CircularProgress /></div>;

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Meu Perfil</Typography>

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
                <TextField fullWidth label="E-mail" {...field} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="telefone"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <MaskedTextField {...field} fullWidth label="Telefone" mask="00 00000-0000" />
              )}
            />
          </Grid>

          {/* Row 3: Tipo | Perfis */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="tipo"
              control={control}
              defaultValue={rawUser?.tipo || ''}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="tipo-label">Tipo</InputLabel>
                  <Select
                    labelId="tipo-label"
                    id="tipo"
                    label="Tipo"
                    {...field}
                  >
                    
                    <MenuItem value={"ADMINISTRADOR"}>Administrador</MenuItem>
                    <MenuItem value={"DENTISTA"}>Dentista</MenuItem>
                    <MenuItem value={"ENFERMEIRO"}>Enfermeiro</MenuItem>
                    <MenuItem value={"FISIOTERAPEUTA"}>Fisioterapeuta</MenuItem>
                    <MenuItem value={"MEDICO"}>Médico</MenuItem>
                    <MenuItem value={"NUTRICIONISTA"}>Nutricionista</MenuItem>
                    <MenuItem value={"RECEPCIONISTA"}>Recepcionista</MenuItem>
                    <MenuItem value={"AUDITOR"}>Auditor</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          {/* Sexo (shown but disabled) */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ mt: 1 }}>
            <Controller
              name="sexo"
              control={control}
              defaultValue={undefined as any}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="sexo-label">Sexo</InputLabel>
                  <Select
                    labelId="sexo-label"
                    id="sexo"
                    label="Sexo"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange((e.target as HTMLInputElement).value as any)}
                    onBlur={field.onBlur}
                    name={field.name}
                 
                  >
                    <MenuItem value={"MASCULINO"}>Masculino</MenuItem>
                    <MenuItem value={"FEMININO"}>Feminino</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          
          <Grid size={{ xs: 12, md: 4 }} sx={{ mt: 1 }}>
            <TextField id="estadoCivil" label="Estado Civil" variant="outlined" fullWidth placeholder="Estado Civil" {...register('estadoCivil')} InputLabelProps={{ shrink: !!watch('estadoCivil') }} />
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
            <TextField id="naturalidade" label="Naturalidade" variant="outlined" fullWidth placeholder="Naturalidade" {...register('naturalidade')} InputLabelProps={{ shrink: !!watch('naturalidade') }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ mt: 1 }}>
            <TextField id="nomeMae" label="Nome da Mãe" variant="outlined" fullWidth placeholder="Nome da Mãe" {...register('nomeMae')} InputLabelProps={{ shrink: !!watch('nomeMae') }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ mt: 1 }}>
            <TextField id="nomePai" label="Nome do Pai" variant="outlined" fullWidth placeholder="Nome do Pai (opcional)" {...register('nomePai')} InputLabelProps={{ shrink: !!watch('nomePai') }} />
          </Grid>

          {/* Registro profissional / RQE (shown conditionally based on user tipo) */}
          {(rawUser && ["DENTISTA", "MEDICO", "ENFERMEIRO", "FISIOTERAPEUTA", "NUTRICIONISTA"].includes(rawUser.tipo)) && (
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
                  mask="00000-000"
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 8 }} sx={{ mt: 1 }}>
            <TextField id="endereco" label="Endereço" variant="outlined" fullWidth placeholder="Endereço" {...register('endereco')} InputLabelProps={{ shrink: !!watch('endereco') }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField id="bairro" label="Bairro" variant="outlined" fullWidth placeholder="Bairro" {...register('bairro')} InputLabelProps={{ shrink: !!watch('bairro') }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField id="cidade" label="Cidade" variant="outlined" fullWidth placeholder="Cidade" {...register('cidade')} InputLabelProps={{ shrink: !!watch('cidade') }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField id="estado" label="Estado" variant="outlined" fullWidth placeholder="Estado" {...register('estado')} InputLabelProps={{ shrink: !!watch('estado') }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField id="numero" label="Número" variant="outlined" fullWidth placeholder="Número" {...register('numero')} InputLabelProps={{ shrink: !!watch('numero') }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <TextField id="complemento" label="Complemento" variant="outlined" fullWidth placeholder="Complemento" {...register('complemento')} InputLabelProps={{ shrink: !!watch('complemento') }} />
          </Grid>

          <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
            <Button variant="contained" type="submit">Salvar</Button>
          </Grid>
        </Grid>
      </form>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Alterar senha</Typography>
        <form onSubmit={pwControl ? handleSubmitPw(onChangePassword) as any : undefined}>
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
              <Button variant="outlined" color="primary" onClick={pwControl ? (handleSubmitPw(onChangePassword) as any) : undefined}>Alterar senha</Button>
            </Grid>
          </Grid>
        </form>
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MyProfilePage;
