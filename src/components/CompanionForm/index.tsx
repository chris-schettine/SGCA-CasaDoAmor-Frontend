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
  Typography,
} from "@mui/material";
import { type UseFormRegister, type FieldErrors, Controller, type UseFormSetValue, type UseFormClearErrors, type UseFormSetError } from "react-hook-form";
import type { Control, UseFormWatch } from "react-hook-form";
import MaskedTextField from "../MaskedTextField";
import type { CompanionFormInputs, EditCompanionFormInputs } from "../../schemas/companionSchema";
import FormSection from "../FormSection";

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
  
  // Watch values for shrink behavior
  const nomeValue = watch("dadoPessoal.nome");
  const nomeMaeValue = watch("dadoPessoal.nomeMae");
  const naturalidadeValue = watch("dadoPessoal.naturalidade");
  const profissaoValue = watch("dadoPessoal.profissao");
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
          setValue('endereco.estado', addressData.uf as any || undefined);
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
      {/* Seção: Dados Pessoais */}
      <FormSection title="Dados Pessoais">
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Nome */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="dadoPessoal.nome"
              label="Nome Completo *"
              variant="outlined"
              fullWidth
              placeholder="Digite o nome completo"
              {...register("dadoPessoal.nome")}
              error={!!errors.dadoPessoal?.nome}
              helperText={errors.dadoPessoal?.nome?.message}
              slotProps={{
                inputLabel: { shrink: !!nomeValue },
                formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } },
              }}
            />
          </Grid>

          {/* CPF */}
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

          {/* Telefone */}
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

          {/* Data de Nascimento */}
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

          {/* RG */}
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

          {/* Nome da Mãe */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="dadoPessoal.nomeMae"
              label="Nome da Mãe"
              variant="outlined"
              fullWidth
              placeholder="Digite o nome da mãe"
              {...register("dadoPessoal.nomeMae")}
              error={!!errors.dadoPessoal?.nomeMae}
              helperText={errors.dadoPessoal?.nomeMae?.message}
              slotProps={{
                inputLabel: { shrink: !!nomeMaeValue },
                formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } },
              }}
            />
          </Grid>

          {/* Naturalidade */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              id="dadoPessoal.naturalidade"
              label="Naturalidade"
              variant="outlined"
              fullWidth
              placeholder="Cidade de nascimento"
              {...register("dadoPessoal.naturalidade")}
              error={!!errors.dadoPessoal?.naturalidade}
              helperText={errors.dadoPessoal?.naturalidade?.message}
              slotProps={{
                inputLabel: { shrink: !!naturalidadeValue },
                formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } },
              }}
            />
          </Grid>

          {/* Profissão */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              id="dadoPessoal.profissao"
              label="Profissão"
              variant="outlined"
              fullWidth
              placeholder="Profissão"
              {...register("dadoPessoal.profissao")}
              error={!!errors.dadoPessoal?.profissao}
              helperText={errors.dadoPessoal?.profissao?.message}
              slotProps={{
                inputLabel: { shrink: !!profissaoValue },
                formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } },
              }}
            />
          </Grid>

          {/* Estado Civil */}
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
                  slotProps={{
                    formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } },
                  }}
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
      </FormSection>

      {/* Seção: Endereço */}
      <FormSection title="Endereço">
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* CEP */}
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
                    handleCepSearch(e.target.value);
                  }}
                />
              )}
            />
          </Grid>

          {/* Logradouro */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="endereco.logradouro"
              label="Logradouro"
              variant="outlined"
              fullWidth
              placeholder="Rua, Avenida, etc."
              {...register("endereco.logradouro")}
              error={!!errors.endereco?.logradouro}
              helperText={errors.endereco?.logradouro?.message}
              slotProps={{
                inputLabel: { shrink: !!logradouroValue },
                formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } },
              }}
            />
          </Grid>

          {/* Número */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Controller
              name="endereco.numero"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <TextField
                  {...field}
                  id="endereco.numero"
                  label="Número"
                  variant="outlined"
                  fullWidth
                  type="number"
                  placeholder="000"
                  value={value ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onChange(val === '' ? undefined : Number(val));
                  }}
                  error={!!errors.endereco?.numero}
                  helperText={errors.endereco?.numero?.message}
                  slotProps={{
                    formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } },
                  }}
                />
              )}
            />
          </Grid>

          {/* Bairro */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              id="endereco.bairro"
              label="Bairro"
              variant="outlined"
              fullWidth
              placeholder="Bairro"
              {...register("endereco.bairro")}
              error={!!errors.endereco?.bairro}
              helperText={errors.endereco?.bairro?.message}
              slotProps={{
                inputLabel: { shrink: !!bairroValue },
                formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } },
              }}
            />
          </Grid>

          {/* Cidade */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              id="endereco.cidade"
              label="Cidade"
              variant="outlined"
              fullWidth
              placeholder="Cidade"
              {...register("endereco.cidade")}
              error={!!errors.endereco?.cidade}
              helperText={errors.endereco?.cidade?.message}
              slotProps={{
                inputLabel: { shrink: !!cidadeValue },
                formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } },
              }}
            />
          </Grid>

          {/* Estado */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Controller
              name="endereco.estado"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  id="endereco.estado"
                  label="Estado"
                  variant="outlined"
                  fullWidth
                  select
                  error={!!errors.endereco?.estado}
                  helperText={errors.endereco?.estado?.message}
                  slotProps={{
                    formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } },
                  }}
                >
                  <MenuItem value="">Selecione</MenuItem>
                  <MenuItem value="AC">Acre</MenuItem>
                  <MenuItem value="AL">Alagoas</MenuItem>
                  <MenuItem value="AP">Amapá</MenuItem>
                  <MenuItem value="AM">Amazonas</MenuItem>
                  <MenuItem value="BA">Bahia</MenuItem>
                  <MenuItem value="CE">Ceará</MenuItem>
                  <MenuItem value="DF">Distrito Federal</MenuItem>
                  <MenuItem value="ES">Espírito Santo</MenuItem>
                  <MenuItem value="GO">Goiás</MenuItem>
                  <MenuItem value="MA">Maranhão</MenuItem>
                  <MenuItem value="MT">Mato Grosso</MenuItem>
                  <MenuItem value="MS">Mato Grosso do Sul</MenuItem>
                  <MenuItem value="MG">Minas Gerais</MenuItem>
                  <MenuItem value="PA">Pará</MenuItem>
                  <MenuItem value="PB">Paraíba</MenuItem>
                  <MenuItem value="PR">Paraná</MenuItem>
                  <MenuItem value="PE">Pernambuco</MenuItem>
                  <MenuItem value="PI">Piauí</MenuItem>
                  <MenuItem value="RJ">Rio de Janeiro</MenuItem>
                  <MenuItem value="RN">Rio Grande do Norte</MenuItem>
                  <MenuItem value="RS">Rio Grande do Sul</MenuItem>
                  <MenuItem value="RO">Rondônia</MenuItem>
                  <MenuItem value="RR">Roraima</MenuItem>
                  <MenuItem value="SC">Santa Catarina</MenuItem>
                  <MenuItem value="SP">São Paulo</MenuItem>
                  <MenuItem value="SE">Sergipe</MenuItem>
                  <MenuItem value="TO">Tocantins</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          {/* Complemento */}
          <Grid size={{ xs: 12 }}>
            <TextField
              id="endereco.complemento"
              label="Complemento"
              variant="outlined"
              fullWidth
              placeholder="Apartamento, bloco, etc."
              {...register("endereco.complemento")}
              error={!!errors.endereco?.complemento}
              helperText={errors.endereco?.complemento?.message}
              slotProps={{
                inputLabel: { shrink: !!complementoValue },
                formHelperText: { sx: { minHeight: '1.25em', margin: '0 0.2em' } },
              }}
            />
          </Grid>
        </Grid>
      </FormSection>

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
                  control={control}
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          {...field}
                          checked={value}
                          onChange={(e) => onChange(e.target.checked)}
                        />
                      }
                      label={
                        <Typography variant="body2" color={value ? 'success.main' : 'error.main'}>
                          {value ? 'Ativo' : 'Inativo'}
                        </Typography>
                      }
                    />
                  )}
                />
              </FormControl>
            </Grid>
          )}
        </Grid>
      </FormSection>
    </>
  );
};

export default CompanionForm;
