import { Box, Chip, FormControl, Grid, InputLabel, MenuItem, Select, TextField, FormHelperText } from "@mui/material";
import MaskedTextField from "../MaskedTextField";
import { type UseFormRegister, type FieldErrors, Controller, type Control, type UseFormWatch, type UseFormSetValue, type UseFormSetError, type UseFormClearErrors } from "react-hook-form";
import type { UserFormInputs } from "../../schemas/userSchema";
import { useEffect, useState, useRef } from 'react';
import { adminService } from '../../api/admin.service';
import type { PerfilDTO } from '../../api/admin.dto';

interface UserFormProps {
  register: UseFormRegister<UserFormInputs>;
  errors: FieldErrors<UserFormInputs>;
  control: Control<UserFormInputs>;
  watch: UseFormWatch<UserFormInputs>;
  setValue: UseFormSetValue<UserFormInputs>;
  setError: UseFormSetError<UserFormInputs>;
  clearErrors: UseFormClearErrors<UserFormInputs>;
  disabledFields?: {
    nomeUsuario?: boolean;
    cpfUsuario?: boolean;
    sexo?: boolean;
    registro?: boolean;
    rqe?: boolean;
  };
}


// roles will be loaded from the backend

const UserForm = (
  {
    register,
    errors,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    disabledFields,
  }: UserFormProps
) => {
  const [roles, setRoles] = useState<PerfilDTO[]>([]);

  useEffect(() => {
    let mounted = true;
    adminService.listRoles()
      .then((res) => {
        if (mounted) setRoles(res || []);
      })
      .catch((err) => console.error('Erro ao carregar perfis:', err));
    return () => { mounted = false };
  }, []);
  // CEP auto-fill: watch cep and populate address fields when valid
  const cepValue = watch('cep');

  // track previous/initial CEP so we can decide whether to overwrite prefilled address fields
  const prevCepRef = useRef<string | null>(null);
  const initialCepCapturedRef = useRef(false);

  // capture initial CEP value once (useful when editing and form was reset with backend data)
  useEffect(() => {
    if (!initialCepCapturedRef.current && cepValue) {
      const cleaned = String(cepValue).replace(/\D/g, '');
      if (cleaned.length > 0) {
        prevCepRef.current = cleaned;
      }
      initialCepCapturedRef.current = true;
    }
  }, [cepValue]);

  useEffect(() => {
    // Debounced CEP lookup: wait 500ms after the user stops typing the full CEP
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

        // clear any previous CEP error
        clearErrors('cep');

        const prev = prevCepRef.current;
        const isFirstLookup = prev === null;
        const isDifferent = prev !== null && prev !== cleanedCep;

        // If this is the first time we look up CEP in this lifecycle, prefer not to overwrite backend-provided values.
        // But if the user changed the CEP (isDifferent), overwrite address fields with fresh lookup data.
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
          // user explicitly changed CEP -> replace all address fields with fetched values
          setValue('endereco', addressData.logradouro || '');
          setValue('bairro', addressData.bairro || '');
          setValue('cidade', addressData.localidade || '');
          setValue('estado', addressData.uf || '');
          setValue('complemento', addressData.complemento || '');
        }

        // remember last CEP we fetched
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

  

  return (
    <>
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ padding: '0 26px', maxWidth: '1200px' }}>

        {/* PRIMEIRA LINHA: Tipo do profissional (Correto) */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="tipo"
            control={control}
            defaultValue={undefined as any}
            render={({ field }) => {
              const tipoValue = field.value as string;
              // decide which additional fields to show
              const showRegistro = ["DENTISTA", "MEDICO", "ENFERMEIRO", "FISIOTERAPEUTA", "NUTRICIONISTA"].includes(tipoValue);
              const showRqe = ["MEDICO"].includes(tipoValue);

              return (
                <>
                  <FormControl fullWidth error={!!errors.tipo}>
                    <InputLabel id="tipo-profissional-label">Tipo de Profissional</InputLabel>
                    <Select
                      labelId="tipo-profissional-label"
                      id="tipo"
                      label="Tipo de Profissional"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange((e.target as HTMLInputElement).value as any)}
                      onBlur={field.onBlur}
                      name={field.name}
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
                    {errors.tipo && <FormHelperText sx={{ maxHeight: 0, margin: '0 0.2em' }}>{errors.tipo.message}</FormHelperText>}
                  </FormControl>

                  {/* conditional fields based on tipo */}
                  {showRegistro && (
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <TextField id="registro" label="Registro" variant="outlined" fullWidth placeholder="Registro" {...register('registro')} error={!!errors.registro} helperText={errors.registro?.message} InputLabelProps={{ shrink: !!watch('registro') }} disabled={!!disabledFields?.registro} />
                        </Grid>
                      </Grid>
                    </Grid>
                  )}

                  {/* CBO field removed */}

                  {showRqe && (
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <TextField id="rqe" label="RQE" variant="outlined" fullWidth placeholder="RQE" {...register('rqe')} error={!!errors.rqe} helperText={errors.rqe?.message} InputLabelProps={{ shrink: !!watch('rqe') }} disabled={!!disabledFields?.rqe} />
                        </Grid>
                      </Grid>
                    </Grid>
                  )}

                  {/* CNES removed per request */}
                </>
              );
            }}
          />
        </Grid>

        {/* NOVO CAMPO: Perfis de Acesso */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="perfisIds" 
            control={control}
            defaultValue={[]} 
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.perfisIds}>
                <InputLabel id="perfis-label">Perfis de Acesso</InputLabel>
                <Select
                  labelId="perfis-label"
                  id="perfisIds"
                  multiple 
                  label="Perfis de Acesso"
                  value={field.value ?? []}
                  onChange={(e) => field.onChange((e.target as HTMLInputElement).value as unknown as number[])}
                  onBlur={field.onBlur}
                  name={field.name}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as number[]).map((id) => {
                        const perfil = roles.find(p => p.id === id);
                        return <Chip key={id} label={perfil ? perfil.nome : id} />;
                      })}
                    </Box>
                  )}
                >
                  {roles.map((perfil) => (
                    <MenuItem key={perfil.id} value={perfil.id}>
                      {perfil.nome}
                    </MenuItem>
                  ))}
                </Select>
                {errors.perfisIds && <FormHelperText sx={{ maxHeight: 0, margin: '0 0.2em' }}>{errors.perfisIds.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        {/* SEGUNDA LINHA: Email e Telefone (Sem alterações) */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            id="email"
            label="Email"
            variant="outlined"
            fullWidth
            placeholder="Digite o email"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            InputLabelProps={{ shrink: !!watch('email') }}
            slotProps={{
              formHelperText: {
                sx: {
                  maxHeight: 0,
                  margin: '0 0.2em',
                },
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name="telefone"
            control={control}
            render={({ field }) => (
              <MaskedTextField
                {...field}
                id="telefone"
                label="Telefone"
                variant="outlined"
                fullWidth
                placeholder="00 00000-0000"
                error={!!errors.telefone}
                helperText={errors.telefone?.message}
                mask="00 00000-0000"
                lazy={true}
              />
            )}
          />
        </Grid>

        {/* Reordered: Nome completo above CPF per user request */}
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            id="nomeUsuario"
            label="Nome completo"
            variant="outlined"
            fullWidth
            placeholder="Digite o nome completo"
            {...register("nomeUsuario")}
            disabled={!!disabledFields?.nomeUsuario}
            error={!!errors.nomeUsuario}
            helperText={errors.nomeUsuario?.message}
            InputLabelProps={{ shrink: !!watch('nomeUsuario') }}
            slotProps={{
              formHelperText: {
                sx: {
                  maxHeight: 0,
                  margin: '0 0.2em',
                },
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name="cpfUsuario"
            control={control}
            render={({ field }) => (
              <MaskedTextField
                {...field}
                id="cpf-paciente"
                label="CPF"
                variant="outlined"
                fullWidth
                placeholder="000.000.000-00"
                error={!!errors.cpfUsuario}
                helperText={errors.cpfUsuario?.message}
                mask="000.000.000-00"
                lazy={true}
                disabled={!!disabledFields?.cpfUsuario}
              />
            )}
          />
        </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Controller
            name="dataNascimento"
            control={control}
            render={({ field }) => (
              <MaskedTextField
                {...field}
                id="dataNascimento"
                label="Data de Nascimento"
                variant="outlined"
                fullWidth
                placeholder="DD/MM/AAAA"
                error={!!errors.dataNascimento}
                helperText={errors.dataNascimento?.message}
                mask="00/00/0000"
                lazy={true}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            id="naturalidade"
            label="Naturalidade"
            variant="outlined"
            fullWidth
            placeholder="Naturalidade"
            {...register("naturalidade")}
            error={!!errors.naturalidade}
            helperText={errors.naturalidade?.message}
            InputLabelProps={{ shrink: !!watch('naturalidade') }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            id="estadoCivil"
            label="Estado Civil"
            variant="outlined"
            fullWidth
            placeholder="Estado Civil"
            {...register("estadoCivil")}
            error={!!errors.estadoCivil}
            helperText={errors.estadoCivil?.message}
            InputLabelProps={{ shrink: !!watch('estadoCivil') }}
          />
        </Grid>
        
        
        {/* Address fields (same as patient) */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                error={!!errors.cep}
                helperText={errors.cep?.message}
                mask="00000-000"
                lazy={true}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 8 }}>
          <TextField
            id="endereco"
            label="Endereço"
            variant="outlined"
            fullWidth
            placeholder="Endereço"
            {...register("endereco")}
            error={!!errors.endereco}
            helperText={errors.endereco?.message}
            InputLabelProps={{ shrink: !!watch('endereco') }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            id="bairro"
            label="Bairro"
            variant="outlined"
            fullWidth
            placeholder="Bairro"
            {...register("bairro")}
            error={!!errors.bairro}
            helperText={errors.bairro?.message}
            InputLabelProps={{ shrink: !!watch('bairro') }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            id="cidade"
            label="Cidade"
            variant="outlined"
            fullWidth
            placeholder="Cidade"
            {...register("cidade")}
            error={!!errors.cidade}
            helperText={errors.cidade?.message}
            InputLabelProps={{ shrink: !!watch('cidade') }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            id="estado"
            label="Estado"
            variant="outlined"
            fullWidth
            placeholder="Estado"
            {...register("estado")}
            error={!!errors.estado}
            helperText={errors.estado?.message}
            InputLabelProps={{ shrink: !!watch('estado') }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            id="numero"
            label="Número"
            variant="outlined"
            fullWidth
            placeholder="Número"
            {...register("numero")}
            error={!!errors.numero}
            helperText={errors.numero?.message}
            InputLabelProps={{ shrink: !!watch('numero') }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <TextField
            id="complemento"
            label="Complemento"
            variant="outlined"
            fullWidth
            placeholder="Complemento"
            {...register("complemento")}
            error={!!errors.complemento}
            helperText={errors.complemento?.message}
            InputLabelProps={{ shrink: !!watch('complemento') }}
          />
        </Grid>

        {/* TERCEIRA LINHA: Sexo (Nome já renderizado acima) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="sexo"
            control={control}
            defaultValue={undefined as any}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.sexo}>
                <InputLabel id="sexo-label">Sexo</InputLabel>
                <Select
                  labelId="sexo-label"
                  id="sexo"
                  label="Sexo"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange((e.target as HTMLInputElement).value as any)}
                  onBlur={field.onBlur}
                  name={field.name}
                  disabled={!!disabledFields?.sexo}
                >
                  <MenuItem value={"MASCULINO"}>Masculino</MenuItem>
                  <MenuItem value={"FEMININO"}>Feminino</MenuItem>
                </Select>
                {errors.sexo && <FormHelperText sx={{ maxHeight: 0, margin: '0 0.2em' }}>{errors.sexo.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        {/* removed duplicate UF — UF is now inside the address group */}

  {/* RQE, CNES are rendered conditionally above based on `tipo` */}

        {/* SEXTA LINHA: Senha e confirmar senha (REMOVIDO) */}

        {/* security questions removed per new requirements */}
      </Grid>
    </>
  )
};

export default UserForm;