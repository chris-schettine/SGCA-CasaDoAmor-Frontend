import { Box, Chip, FormControl, Grid, InputLabel, MenuItem, Select, TextField, FormHelperText } from "@mui/material";
import MaskedTextField from "../MaskedTextField";
import { type UseFormRegister, type FieldErrors, Controller, type Control, type UseFormWatch, type UseFormSetValue, type UseFormSetError, type UseFormClearErrors } from "react-hook-form";
import type { UserFormInputs } from "../../schemas/userSchema";
import { useEffect, useState } from 'react';
import { adminService } from '../../api/admin.service';
import type { PerfilDTO } from '../../api/admin.dto';
import { fetchAddressByCep } from '../../utils/cepService';

interface UserFormProps {
  register: UseFormRegister<UserFormInputs>;
  errors: FieldErrors<UserFormInputs>;
  control: Control<UserFormInputs>;
  watch: UseFormWatch<UserFormInputs>;
  setValue: UseFormSetValue<UserFormInputs>;
  setError: UseFormSetError<UserFormInputs>;
  clearErrors: UseFormClearErrors<UserFormInputs>;
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

  useEffect(() => {
    const handleCepSearch = async (cep: string) => {
      clearErrors('cep');
      // only clear / autofill if we don't already have address data (avoid overwriting prefilled values)
      const hasEndereco = !!watch('endereco');
      const hasBairro = !!watch('bairro');
      const hasCidade = !!watch('cidade');
      const hasUf = !!watch('uf');
      const hasComplemento = !!watch('complemento');
      if (!hasEndereco && !hasBairro && !hasCidade && !hasUf && !hasComplemento) {
        setValue('endereco', '');
        setValue('bairro', '');
        setValue('cidade', '');
        setValue('uf', '');
        setValue('complemento', '');
      }

      const cleanedCep = cep.replace(/\D/g, '');
      if (cleanedCep.length === 8) {
        try {
          const addressData = await fetchAddressByCep(cleanedCep);
          if (addressData) {
            // only set fields that are currently empty to avoid clobbering backend-provided values
            if (!hasEndereco) setValue('endereco', addressData.logradouro || '');
            if (!hasBairro) setValue('bairro', addressData.bairro || '');
            if (!hasCidade) setValue('cidade', addressData.localidade || '');
            if (!hasUf) setValue('uf', addressData.uf || '');
            if (!hasComplemento) setValue('complemento', addressData.complemento || '');
          } else {
            setError('cep', { type: 'manual', message: 'CEP não encontrado ou inválido.' });
          }
        } catch (err) {
          console.error('Erro ao buscar CEP:', err);
          setError('cep', { type: 'manual', message: 'Erro ao buscar CEP. Tente novamente.' });
        }
      } else if (cleanedCep.length > 0 && cleanedCep.length < 8) {
        if (!hasEndereco) setValue('endereco', '');
        if (!hasBairro) setValue('bairro', '');
        if (!hasCidade) setValue('cidade', '');
        if (!hasUf) setValue('uf', '');
        if (!hasComplemento) setValue('complemento', '');
      }
    };

    // If CEP changed and we don't already have address info, trigger lookup
    const hasAnyAddress = !!watch('endereco') || !!watch('bairro') || !!watch('cidade') || !!watch('uf') || !!watch('complemento');
    if (cepValue && !hasAnyAddress) {
      handleCepSearch(cepValue);
    }
  }, [cepValue, setValue, setError, clearErrors]);

  

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
              const showConselho = ["DENTISTA", "MEDICO", "ENFERMEIRO"].includes(tipoValue);
              const showCbo = ["ENFERMEIRO", "FISIOTERAPEUTA", "MEDICO", "NUTRICIONISTA"].includes(tipoValue);
              const showRqe = ["DENTISTA"].includes(tipoValue);
              const showCnes = ["MEDICO", "ENFERMEIRO", "FISIOTERAPEUTA"].includes(tipoValue);

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
                  {showConselho && (
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <TextField id="conselho" label="Conselho" variant="outlined" fullWidth placeholder="Conselho" {...register('conselho')} error={!!errors.conselho} helperText={errors.conselho?.message} InputLabelProps={{ shrink: !!watch('conselho') }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <TextField id="registro" label="Registro" variant="outlined" fullWidth placeholder="Registro" {...register('registro')} error={!!errors.registro} helperText={errors.registro?.message} InputLabelProps={{ shrink: !!watch('registro') }} />
                        </Grid>
                      </Grid>
                    </Grid>
                  )}

                  {showCbo && (
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <TextField id="cbo" label="CBO" variant="outlined" fullWidth placeholder="CBO" {...register('cbo')} error={!!errors.cbo} helperText={errors.cbo?.message} InputLabelProps={{ shrink: !!watch('cbo') }} />
                        </Grid>
                      </Grid>
                    </Grid>
                  )}

                  {showRqe && (
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <TextField id="rqe" label="RQE" variant="outlined" fullWidth placeholder="RQE" {...register('rqe')} error={!!errors.rqe} helperText={errors.rqe?.message} InputLabelProps={{ shrink: !!watch('rqe') }} />
                        </Grid>
                      </Grid>
                    </Grid>
                  )}

                  {showCnes && (
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <TextField id="cnes" label="CNES" variant="outlined" fullWidth placeholder="CNES" {...register('cnes')} error={!!errors.cnes} helperText={errors.cnes?.message} InputLabelProps={{ shrink: !!watch('cnes') }} />
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
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
              />
            )}
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
            id="uf"
            label="UF"
            variant="outlined"
            fullWidth
            placeholder="UF"
            {...register("uf")}
            error={!!errors.uf}
            helperText={errors.uf?.message}
            InputLabelProps={{ shrink: !!watch('uf') }}
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

        {/* TERCEIRA LINHA: Nome e Sexo (Sem alterações) */}
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            id="nomeUsuario"
            label="Nome completo"
            variant="outlined"
            fullWidth
            placeholder="Digite o nome completo"
            {...register("nomeUsuario")}
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

        {/* CBO, RQE, CNES are rendered conditionally above based on `tipo` */}

        {/* SEXTA LINHA: Senha e confirmar senha (REMOVIDO) */}

        {/* security questions removed per new requirements */}
      </Grid>
    </>
  )
};

export default UserForm;