import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  MenuItem,
  Switch,
} from "@mui/material";
import { type UseFormRegister, type FieldErrors, Controller, type UseFormSetValue, type UseFormClearErrors, type UseFormSetError } from "react-hook-form";
import type { Control, UseFormWatch } from "react-hook-form";
import type { CompanionFormInputs, EditCompanionFormInputs } from "../../schemas/companionSchema";
import FormSection from "../FormSection";
import PersonalInfo from './parts/PersonalInfo';
import AddressSection from './parts/AddressSection';

interface CompanionFormProps {
  register: UseFormRegister<CompanionFormInputs | EditCompanionFormInputs>;
  errors: FieldErrors<CompanionFormInputs | EditCompanionFormInputs>;
  watch: UseFormWatch<CompanionFormInputs | EditCompanionFormInputs>;
  control: Control<CompanionFormInputs | EditCompanionFormInputs>;
  setValue: UseFormSetValue<CompanionFormInputs | EditCompanionFormInputs>;
  setError: UseFormSetError<CompanionFormInputs | EditCompanionFormInputs>;
  clearErrors: UseFormClearErrors<CompanionFormInputs | EditCompanionFormInputs>;
  isEditMode?: boolean;
}

const BRAZILIAN_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

type BrazilianState = (typeof BRAZILIAN_STATES)[number];

const normalizeState = (value?: string | null): BrazilianState | undefined => {
  if (!value) {
    return undefined;
  }
  const upper = value.toUpperCase();
  return BRAZILIAN_STATES.includes(upper as BrazilianState)
    ? (upper as BrazilianState)
    : undefined;
};

const CompanionForm = ({
  register,
  errors,
  watch,
  control,
  setValue,
  setError,
  clearErrors,
  isEditMode = false,
}: CompanionFormProps) => {
  
  // Note: specific field watchers moved into subcomponents (PersonalInfo, AddressSection)
    const logradouroValue = watch("endereco.logradouro");
    const complementoValue = watch("endereco.complemento");
    const bairroValue = watch("endereco.bairro");
    const cidadeValue = watch("endereco.cidade");

  // CEP search handler
  const handleCepSearch = async (cep: string) => {
    clearErrors('endereco.cep');

    const cleanedCep = cep.replace(/\D/g, '');
    if (cleanedCep.length === 8) {
      try {
        const addressData = await (await import('../../utils/cepService')).fetchAddressByCep(cleanedCep);
        if (addressData) {
          if (!logradouroValue) setValue('endereco.logradouro', addressData.logradouro || '');
          if (!bairroValue) setValue('endereco.bairro', addressData.bairro || '');
          if (!cidadeValue) setValue('endereco.cidade', addressData.localidade || '');
          const stateValue = normalizeState(addressData.uf);
          if (stateValue) {
            setValue('endereco.estado', stateValue);
          }
          if (!complementoValue) setValue('endereco.complemento', addressData.complemento || '');
        } else {
          setError('endereco.cep', { type: 'manual', message: 'CEP não encontrado ou inválido.' });
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
        setError('endereco.cep', { type: 'manual', message: 'Erro ao buscar CEP. Tente novamente.' });
      }
    }
  };

  return (
    <>
      {/* Seção: Informações do Acompanhante */}
      <FormSection title="Informações do Acompanhante">
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Parentesco */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="parentesco"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  id="parentesco"
                  label="Parentesco *"
                  variant="outlined"
                  fullWidth
                  select
                  error={!!errors.parentesco}
                  helperText={errors.parentesco?.message || 'Relação com o paciente'}
                  slotProps={{
                    formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } },
                  }}
                >
                  <MenuItem value="">Selecione</MenuItem>
                  <MenuItem value="PAI">Pai</MenuItem>
                  <MenuItem value="MAE">Mãe</MenuItem>
                  <MenuItem value="IRMAO">Irmão</MenuItem>
                  <MenuItem value="IRMA">Irmã</MenuItem>
                  <MenuItem value="FILHO">Filho</MenuItem>
                  <MenuItem value="FILHA">Filha</MenuItem>
                  <MenuItem value="CONJUGE">Cônjuge</MenuItem>
                  <MenuItem value="AMIGO">Amigo(a)</MenuItem>
                  <MenuItem value="OUTRO">Outro</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          {/* Pode Ajudar na Cozinha */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Pode ajudar na cozinha? *</FormLabel>
              <Controller
                name="podeAjudarNaCozinha"
                control={control}
                render={({ field: { value, onChange, ...field } }) => (
                  <RadioGroup
                    {...field}
                    row
                    value={value ? "sim" : "nao"}
                    onChange={(e) => onChange(e.target.value === "sim")}
                  >
                    <FormControlLabel value="sim" control={<Radio />} label="Sim" />
                    <FormControlLabel value="nao" control={<Radio />} label="Não" />
                  </RadioGroup>
                )}
              />
            </FormControl>
          </Grid>

          {/* Ativo (apenas no modo de edição) */}
          {isEditMode && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend">Status</FormLabel>
                <Controller
                  name="ativo"
                  control={control as unknown as Control<EditCompanionFormInputs>}
                  render={({ field: { value, onChange, ...field } }) => {
                    const isActive = Boolean(value);
                    return (
                      <FormControlLabel
                        control={
                          <Switch
                            {...field}
                            color="primary"
                            sx={{
                              // Ajuste fino só no thumb para alinhar ao trilho
                              '& .MuiSwitch-thumb': {
                                transform: 'translateY(-1px)',
                              },
                            }}
                            checked={isActive}
                            onChange={(e) => onChange(e.target.checked)}
                          />
                        }
                        label={isActive ? 'Ativo' : 'Inativo'}
                      />
                    );
                  }}
                />
              </FormControl>
            </Grid>
          )}
        </Grid>
      </FormSection>
      {/* Seção: Dados Pessoais */}
      <FormSection title="Dados Pessoais">
        <PersonalInfo register={register} errors={errors} watch={watch} control={control} />
      </FormSection>

      {/* Seção: Endereço */}
      <FormSection title="Endereço">
        <AddressSection
          control={control}
          register={register}
          errors={errors}
          setValue={setValue}
          setError={setError}
          clearErrors={clearErrors}
          watch={watch}
          onCepSearch={handleCepSearch}
        />
      </FormSection>
    </>
  );
};

export default CompanionForm;
