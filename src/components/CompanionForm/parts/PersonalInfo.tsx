// React import not needed with new JSX runtime
import { Grid, TextField, MenuItem } from '@mui/material';
import { Controller } from 'react-hook-form';
import MaskedTextField from '../../MaskedTextField';
import type { CompanionFormInputs, EditCompanionFormInputs } from '../../../schemas/companionSchema';
import type { Control, UseFormRegister, UseFormWatch, FieldErrors } from 'react-hook-form';

interface Props {
  register: UseFormRegister<CompanionFormInputs | EditCompanionFormInputs>;
  errors: FieldErrors<CompanionFormInputs | EditCompanionFormInputs>;
  watch: UseFormWatch<CompanionFormInputs | EditCompanionFormInputs>;
  control: Control<CompanionFormInputs | EditCompanionFormInputs>;
}

export default function PersonalInfo({ register, errors, watch, control }: Props) {
  const nomeValue = watch('dadoPessoal.nome');
  const nomeMaeValue = watch('dadoPessoal.nomeMae');
  const naturalidadeValue = watch('dadoPessoal.naturalidade');
  const profissaoValue = watch('dadoPessoal.profissao');

  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          id="dadoPessoal.nome"
          label="Nome Completo *"
          variant="outlined"
          fullWidth
          placeholder="Digite o nome completo"
          {...register('dadoPessoal.nome')}
          error={!!errors.dadoPessoal?.nome}
          helperText={errors.dadoPessoal?.nome?.message}
          slotProps={{ inputLabel: { shrink: !!nomeValue }, formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } } }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Controller
          name="dadoPessoal.cpf"
          control={control}
          render={({ field }) => (
            <MaskedTextField
              {...field}
              id="dadoPessoal.cpf"
              label="CPF *"
              variant="outlined"
              fullWidth
              placeholder="000.000.000-00"
              error={!!errors.dadoPessoal?.cpf}
              helperText={errors.dadoPessoal?.cpf?.message}
              mask="000.000.000-00"
              lazy={true}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Controller
          name="dadoPessoal.telefone"
          control={control}
          render={({ field }) => (
            <MaskedTextField
              {...field}
              id="dadoPessoal.telefone"
              label="Telefone *"
              variant="outlined"
              fullWidth
              placeholder="00 00000-0000"
              error={!!errors.dadoPessoal?.telefone}
              helperText={errors.dadoPessoal?.telefone?.message}
              mask="00 00000-0000"
              lazy={true}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Controller
          name="dadoPessoal.dataNascimento"
          control={control}
          render={({ field }) => (
            <MaskedTextField
              {...field}
              id="dadoPessoal.dataNascimento"
              label="Data de Nascimento *"
              variant="outlined"
              fullWidth
              placeholder="DD/MM/AAAA"
              error={!!errors.dadoPessoal?.dataNascimento}
              helperText={errors.dadoPessoal?.dataNascimento?.message}
              mask="00/00/0000"
              lazy={true}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Controller
          name="dadoPessoal.rg"
          control={control}
          render={({ field }) => (
            <MaskedTextField
              {...field}
              id="dadoPessoal.rg"
              label="RG"
              variant="outlined"
              fullWidth
              placeholder="00.000.000-0"
              error={!!errors.dadoPessoal?.rg}
              helperText={errors.dadoPessoal?.rg?.message}
              mask="00.000.000-0"
              lazy={true}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          id="dadoPessoal.nomeMae"
          label="Nome da Mãe"
          variant="outlined"
          fullWidth
          placeholder="Digite o nome da mãe"
          {...register('dadoPessoal.nomeMae')}
          error={!!errors.dadoPessoal?.nomeMae}
          helperText={errors.dadoPessoal?.nomeMae?.message}
          slotProps={{ inputLabel: { shrink: !!nomeMaeValue }, formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } } }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          id="dadoPessoal.naturalidade"
          label="Naturalidade"
          variant="outlined"
          fullWidth
          placeholder="Cidade de nascimento"
          {...register('dadoPessoal.naturalidade')}
          error={!!errors.dadoPessoal?.naturalidade}
          helperText={errors.dadoPessoal?.naturalidade?.message}
          slotProps={{ inputLabel: { shrink: !!naturalidadeValue }, formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } } }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          id="dadoPessoal.profissao"
          label="Profissão"
          variant="outlined"
          fullWidth
          placeholder="Profissão"
          {...register('dadoPessoal.profissao')}
          error={!!errors.dadoPessoal?.profissao}
          helperText={errors.dadoPessoal?.profissao?.message}
          slotProps={{ inputLabel: { shrink: !!profissaoValue }, formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } } }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Controller
          name="dadoPessoal.estadoCivil"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ''}
              id="dadoPessoal.estadoCivil"
              label="Estado Civil"
              variant="outlined"
              fullWidth
              select
              error={!!errors.dadoPessoal?.estadoCivil}
              helperText={errors.dadoPessoal?.estadoCivil?.message}
              slotProps={{ formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } } }}
            >
              <MenuItem value="">Selecione</MenuItem>
              <MenuItem value="SOLTEIRO">Solteiro(a)</MenuItem>
              <MenuItem value="CASADO">Casado(a)</MenuItem>
              <MenuItem value="DIVORCIADO">Divorciado(a)</MenuItem>
              <MenuItem value="VIUVO">Viúvo(a)</MenuItem>
              <MenuItem value="UNIAO_ESTAVEL">União Estável</MenuItem>
              <MenuItem value="SEPARADO">Separado(a)</MenuItem>
            </TextField>
          )}
        />
      </Grid>
    </Grid>
  );
}
