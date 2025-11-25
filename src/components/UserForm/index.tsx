import { Box, FormControl, Grid, InputLabel, MenuItem, Select, TextField, FormHelperText } from "@mui/material";
import StandardTooltip from '../StandardTooltip';
import type { SelectChangeEvent } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
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
            render={({ field }) => {
              const tipoValue = field.value as string;
              // decide which additional fields to show
              const showRegistro = ["DENTISTA", "MEDICO", "ENFERMEIRO", "FISIOTERAPEUTA", "NUTRICIONISTA"].includes(tipoValue);
              const showRqe = ["MEDICO"].includes(tipoValue);
              const handleTipoChange = (event: SelectChangeEvent<UserFormInputs['tipo']>) => {
                field.onChange(event.target.value as UserFormInputs['tipo']);
              };

              return (
                <>
                  <FormControl fullWidth error={!!errors.tipo} required>
                    <InputLabel id="tipo-profissional-label" required>Tipo de Profissional</InputLabel>
                    <Select
                      labelId="tipo-profissional-label"
                      id="tipo"
                      label="Tipo de Profissional"
                      required
                      value={field.value ?? ''}
                      onChange={handleTipoChange}
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
                          <Box sx={{ position: 'relative' }}>
                          <TextField 
                            id="registro" 
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                Registro
                                <StandardTooltip title="Número de registro profissional (ex: CRM para médicos, COREN para enfermeiros)">
                                    <InfoIcon sx={{ fontSize: 16, color: 'action.active' }} />
                                  </StandardTooltip>
                                </Box>
                              }
                              variant="outlined" 
                              fullWidth 
                              placeholder="Ex: CRM 12345" 
                              {...register('registro')} 
                              error={!!errors.registro} 
                              helperText={errors.registro?.message} 
                              InputLabelProps={{ shrink: !!watch('registro'), required: showRegistro }} 
                              required={showRegistro}
                              disabled={!!disabledFields?.registro} 
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  )}

                  {/* CBO field removed */}

                  {showRqe && (
                    <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Box sx={{ position: 'relative' }}>
                            <TextField 
                              id="rqe" 
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  RQE
                                    <StandardTooltip title="Registro de Qualificação de Especialista - certifica que o médico tem especialização reconhecida">
                                    <InfoIcon sx={{ fontSize: 16, color: 'action.active' }} />
                                  </StandardTooltip>
                                </Box>
                              }
                              variant="outlined" 
                              fullWidth 
                              placeholder="Ex: RQE 5678" 
                              {...register('rqe')} 
                              error={!!errors.rqe} 
                              helperText={errors.rqe?.message} 
                              InputLabelProps={{ shrink: !!watch('rqe') }} 
                              disabled={!!disabledFields?.rqe} 
                            />
                          </Box>
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

        {/* CAMPO: Perfil de Acesso (único) */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="perfisIds" 
            control={control}
            defaultValue={[]} 
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.perfisIds} required>
                <InputLabel id="perfil-label" required>Perfil de Acesso</InputLabel>
                <Select
                  labelId="perfil-label"
                  id="perfisIds"
                  label="Perfil de Acesso"
                  value={(field.value && field.value.length > 0) ? field.value[0] : ''}
                  required
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    // Sempre mantém como array com um único elemento
                    field.onChange(selectedId ? [selectedId as number] : []);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
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

        {/* SEGUNDA LINHA: Email e Telefone */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            id="email"
            label="Email"
            variant="outlined"
            fullWidth
            placeholder="Digite o email"
            autoComplete="email"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            InputLabelProps={{ shrink: !!watch('email'), required: true }}
            required
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
                    autoComplete="tel"
                    error={!!errors.telefone}
                    helperText={errors.telefone?.message}
                    mask="00 00000-0000"
                    lazy={true}
                    InputLabelProps={{ required: true }}
                    required
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
            autoComplete="name"
            {...register("nomeUsuario")}
            disabled={!!disabledFields?.nomeUsuario}
            error={!!errors.nomeUsuario}
            helperText={errors.nomeUsuario?.message}
            InputLabelProps={{ shrink: !!watch('nomeUsuario'), required: true }}
            required
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
                autoComplete="off"
                error={!!errors.cpfUsuario}
                helperText={errors.cpfUsuario?.message}
                mask="000.000.000-00"
                lazy={true}
                disabled={!!disabledFields?.cpfUsuario}
                InputLabelProps={{ required: true }}
                required
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
                autoComplete="postal-code"
                error={!!errors.cep}
                helperText={errors.cep?.message}
                mask="00000-000"
                lazy={true}
                InputLabelProps={{ required: true }}
                required
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
            autoComplete="address-line1"
            {...register("endereco")}
            error={!!errors.endereco}
            helperText={errors.endereco?.message}
            InputLabelProps={{ shrink: !!watch('endereco'), required: true }}
            required
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
            {...register("bairro")}
            error={!!errors.bairro}
            helperText={errors.bairro?.message}
            InputLabelProps={{ shrink: !!watch('bairro'), required: true }}
            required
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
            {...register("cidade")}
            error={!!errors.cidade}
            helperText={errors.cidade?.message}
            InputLabelProps={{ shrink: !!watch('cidade'), required: true }}
            required
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
            {...register("estado")}
            error={!!errors.estado}
            helperText={errors.estado?.message}
            InputLabelProps={{ shrink: !!watch('estado'), required: true }}
            required
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
            {...register("numero")}
            error={!!errors.numero}
            helperText={errors.numero?.message}
            InputLabelProps={{ shrink: !!watch('numero'), required: true }}
            required
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
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.sexo} required>
                <InputLabel id="sexo-label" required>Sexo</InputLabel>
                <Select
                  labelId="sexo-label"
                  id="sexo"
                  label="Sexo"
                  required
                  value={field.value ?? ''}
                  onChange={(event: SelectChangeEvent<UserFormInputs['sexo']>) => field.onChange(event.target.value as UserFormInputs['sexo'])}
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
