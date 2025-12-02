// React import not needed with new JSX runtime
import { Grid, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import MaskedTextField from '../../MaskedTextField';
import type { CompanionFormInputs, EditCompanionFormInputs } from '../../../schemas/companionSchema';
import type { Control, UseFormRegister, UseFormWatch, FieldErrors, UseFormSetValue, UseFormSetError, UseFormClearErrors } from 'react-hook-form';

interface Props {
  control: Control<CompanionFormInputs | EditCompanionFormInputs>;
  register: UseFormRegister<CompanionFormInputs | EditCompanionFormInputs>;
  errors: FieldErrors<CompanionFormInputs | EditCompanionFormInputs>;
  watch: UseFormWatch<CompanionFormInputs | EditCompanionFormInputs>;
  onCepSearch: (cep: string) => Promise<void>;
  setValue?: UseFormSetValue<CompanionFormInputs | EditCompanionFormInputs>;
  setError?: UseFormSetError<CompanionFormInputs | EditCompanionFormInputs>;
  clearErrors?: UseFormClearErrors<CompanionFormInputs | EditCompanionFormInputs>;
}

export default function AddressSection({ control, register, errors, watch, onCepSearch }: Props) {
  const logradouroValue = watch('endereco.logradouro');

  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Controller
          name="endereco.cep"
          control={control}
          render={({ field }) => (
            <MaskedTextField
              {...field}
              id="endereco.cep"
              label="CEP"
              variant="outlined"
              fullWidth
              placeholder="00000-000"
              error={!!errors.endereco?.cep}
              helperText={errors.endereco?.cep?.message}
              mask="00000-000"
              lazy={true}
              onBlur={(e) => {
                field.onBlur();
                onCepSearch(e.target.value);
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          id="endereco.logradouro"
          label="Logradouro"
          variant="outlined"
          fullWidth
          placeholder="Rua, Avenida, etc."
          {...register('endereco.logradouro')}
          error={!!errors.endereco?.logradouro}
          helperText={errors.endereco?.logradouro?.message}
          slotProps={{ inputLabel: { shrink: !!logradouroValue }, formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } } }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Controller
          name="endereco.numero"
          control={control}
          render={({ field: { value, onChange, onBlur, ref } }) => (
            <TextField
              inputRef={ref}
              id="endereco.numero"
              label="Número"
              variant="outlined"
              fullWidth
              type="number"
              placeholder="000"
              value={value ?? ''}
              onChange={(e) => {
                const rawValue = e.target.value;
                if (rawValue === '') {
                  onChange(undefined);
                } else {
                  const numValue = parseInt(rawValue, 10);
                  if (!isNaN(numValue)) {
                    onChange(numValue);
                  }
                }
              }}
              onBlur={onBlur}
            />
          )}
        />
      </Grid>

      {/* further address fields (bairro, cidade, estado, complemento) are still rendered in main file to avoid large refactor in one pass */}
    </Grid>
  );
}
