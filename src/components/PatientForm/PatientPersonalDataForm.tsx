import { Grid, TextField, InputAdornment, CircularProgress, Button, IconButton, MenuItem } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { type UseFormRegister, type FieldErrors, type UseFormWatch, type UseFormSetValue, Controller, type Control, useFieldArray } from "react-hook-form";
import type { PatientFormInputs } from "../../schemas/patientSchema";
import { useEffect } from "react";
import { calculateAge } from "../../utils/dateCalculations";
import MaskedTextField from "../MaskedTextField";

interface PatientPersonalDataFormProps {
  register: UseFormRegister<PatientFormInputs>;
  errors: FieldErrors<PatientFormInputs>;
  watch: UseFormWatch<PatientFormInputs>;
  setValue: UseFormSetValue<PatientFormInputs>;
  control: Control<PatientFormInputs>;
  handleCepSearch: (cep: string) => Promise<void>;
  isCepLoading: boolean;
  disabledFields?: (keyof PatientFormInputs)[];
}

const PatientPersonalDataForm = (
  {
    register,
    errors,
    watch,
    setValue,
    handleCepSearch,
    isCepLoading,
    control,
    disabledFields,
  }: PatientPersonalDataFormProps
) => {

  const isDisabled = (fieldName: keyof PatientFormInputs) => {
    return Array.isArray(disabledFields) && disabledFields.includes(fieldName);
  };

  const dataNascimentoValue = watch("dataNascimento");
  const enderecoValue = watch("endereco");
  const bairroValue = watch("bairro");
  const cidadeValue = watch("cidade");
  const estadoValue = watch("estado");
  const complementoValue = watch("complemento");

  const { fields: contatosFields, append, remove } = useFieldArray<PatientFormInputs, "contatosDeEmergencia">({
    control,
    name: 'contatosDeEmergencia',
  });

  useEffect(() => {
    const age = calculateAge(dataNascimentoValue);
    if (age !== null) {
      setValue("idade", String(age), { shouldValidate: true });
    } else {
      setValue("idade", "", { shouldValidate: true });
    }
  }, [dataNascimentoValue, setValue]);


  return (
    <>
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ padding: '0 26px 18px', maxWidth: '1200px' }}>

        {/* PRIMEIRA LINHA: Nome Completo e CPF */}
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            id="nome-completo-paciente"
            label="Nome completo do paciente"
            variant="outlined"
            fullWidth
            placeholder="Digite o nome completo do paciente"
            {...register("nomeCompletoPaciente")}
            disabled={isDisabled('nomeCompletoPaciente')}
            error={!!errors.nomeCompletoPaciente}
            helperText={errors.nomeCompletoPaciente?.message}
            required
            slotProps={{
              inputLabel: {
                required: true,
              },
              formHelperText: {
                sx: { maxHeight: '0.4em', margin: '0 0.2em' },
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="cpfPaciente"
            control={control}
            render={({ field }) => (
              <MaskedTextField
                {...field}
                id="cpf-paciente"
                label="CPF"
                variant="outlined"
                fullWidth
                placeholder="000.000.000-00"
                error={!!errors.cpfPaciente}
                helperText={errors.cpfPaciente?.message}
                mask="000.000.000-00"
                lazy={true}
                disabled={isDisabled('cpfPaciente')}
                required
                InputLabelProps={{
                  required: true,
                }}
              />
            )}
          />
        </Grid>

        {/* SEGUNDA LINHA: Data Nascimento, Idade, Sexo */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="dataNascimento"
            control={control}
            render={({ field }) => (
              <MaskedTextField
                {...field}
                id="data-nascimento"
                label="Data de Nascimento"
                variant="outlined"
                fullWidth
                placeholder="00/00/0000"
                error={!!errors.dataNascimento}
                helperText={errors.dataNascimento?.message}
                mask="00/00/0000"
                lazy={true}
                disabled={isDisabled('dataNascimento')}
                required
                InputLabelProps={{
                  required: true,
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 6, md: 2 }}>
          <TextField
            id="idade"
            label="Idade"
            variant="outlined"
            fullWidth
            {...register("idade")}
            error={!!errors.idade}
            helperText={errors.idade?.message}
            placeholder="Idade"
            inputProps={{ readOnly: true }}
            disabled
            slotProps={{
              inputLabel: { shrink: true },
              formHelperText: { sx: { maxHeight: '0.4em', margin: '0 0.2em' } },
            }}
          />
        </Grid>

        {/* NOVO CAMPO: SEXO */}
        <Grid size={{ xs: 6, md: 3 }}>
          <Controller
            name="sexo"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                // Garante que não dê erro de uncontrolled input caso venha undefined
                value={field.value || ''}
                id="sexo"
                label="Sexo / Gênero"
                variant="outlined"
                fullWidth
                select
                required
                error={!!errors.sexo}
                helperText={errors.sexo?.message}
                disabled={isDisabled('sexo')}
              >
                <MenuItem value="">Selecione...</MenuItem>
                <MenuItem value="MASCULINO">Masculino</MenuItem>
                <MenuItem value="FEMININO">Feminino</MenuItem>
                <MenuItem value="NAO_INFORMADO">Prefiro não informar</MenuItem>
              </TextField>
            )}
          />
        </Grid>

        {/* Movi Naturalidade para completar a linha ou descer conforme a tela */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            id="naturalidade"
            label="Naturalidade"
            variant="outlined"
            fullWidth
            placeholder="Brasileiro"
            {...register("naturalidade")}
            disabled={isDisabled('naturalidade')}
            error={!!errors.naturalidade}
            helperText={errors.naturalidade?.message}
            slotProps={{
              formHelperText: { sx: { maxHeight: '0.4em', margin: '0 0.2em' } },
            }}
          />
        </Grid>

        {/* TERCEIRA LINHA: RG, Nome da Mãe */}
        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
          <Controller
            name="rg"
            control={control}
            render={({ field }) => (
              <MaskedTextField
                {...field}
                id="rg"
                label="RG"
                variant="outlined"
                fullWidth
                placeholder="00.000.000-00"
                error={!!errors.rg}
                helperText={errors.rg?.message}
                mask="00.000.000-0"
                lazy={true}
                disabled={isDisabled('rg')}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 8, md: 8 }}>
          <TextField
            id="nome-mae"
            label="Nome da Mãe"
            variant="outlined"
            fullWidth
            placeholder="Digite o nome da mãe do paciente"
            {...register("nomeMae")}
            disabled={isDisabled('nomeMae')}
            error={!!errors.nomeMae}
            helperText={errors.nomeMae?.message}
            slotProps={{
              formHelperText: { sx: { maxHeight: 0, margin: '0 0.2em' } },
            }}
          />
        </Grid>

        {/* QUARTA LINHA: Profissão e Telefone */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            id="profissao"
            label="Profissão"
            variant="outlined"
            fullWidth
            placeholder="Digite a profissão do paciente"
            {...register("profissao")}
            error={!!errors.profissao}
            helperText={errors.profissao?.message}
            slotProps={{
              formHelperText: { sx: { maxHeight: 0, margin: '0 0.2em' } },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
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
                required
                InputLabelProps={{
                  required: true,
                }}
              />
            )}
          />
        </Grid>

        {/* QUINTA LINHA: Email, Estado Civil */}
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <TextField
            id="email"
            label="E-mail"
            variant="outlined"
            fullWidth
            placeholder="email@exemplo.com"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message || 'Opcional'}
            slotProps={{
              formHelperText: { sx: { maxHeight: '0.4em', margin: '0 0.2em' } },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <Controller
            name="estadoCivil"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ''}
                id="estado-civil"
                label="Estado Civil"
                variant="outlined"
                fullWidth
                select
                error={!!errors.estadoCivil}
                helperText={errors.estadoCivil?.message || 'Opcional'}
              >
                <MenuItem value="">Selecione...</MenuItem>
                <MenuItem value="SOLTEIRO">Solteiro(a)</MenuItem>
                <MenuItem value="CASADO">Casado(a)</MenuItem>
                <MenuItem value="DIVORCIADO">Divorciado(a)</MenuItem>
                <MenuItem value="VIUVO">Viúvo(a)</MenuItem>
                <MenuItem value="SEPARADO">Separado(a)</MenuItem>
                <MenuItem value="UNIAO_ESTAVEL">União Estável</MenuItem>
              </TextField>
            )}
          />
        </Grid>

        {/* SEXTA LINHA: CEP e Endereço */}
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
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
                helperText={errors.cep?.message || (isCepLoading ? "Buscando..." : "")}
                mask="00000-000"
                lazy={true}
                onBlur={(e) => {
                  field.onBlur();
                  handleCepSearch(e.target.value);
                }}
                required
                InputLabelProps={{ required: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {isCepLoading && <CircularProgress size={20} />}
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <TextField
            id="endereco"
            label="Endereço"
            variant="outlined"
            fullWidth
            placeholder="Digite o endereço"
            {...register("endereco")}
            error={!!errors.endereco}
            helperText={errors.endereco?.message}
            disabled={isCepLoading}
            required
            InputLabelProps={{ shrink: !!enderecoValue || isCepLoading, required: true }}
            slotProps={{
              inputLabel: { shrink: !!enderecoValue, required: true },
              formHelperText: { sx: { maxHeight: '0.4em', margin: '0 0.2em' } },
            }}
          />
        </Grid>

        {/* SÉTIMA LINHA: Bairro, Cidade, Estado */}
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
            disabled={isCepLoading}
            InputLabelProps={{ shrink: !!bairroValue || isCepLoading }}
            slotProps={{
              inputLabel: { shrink: !!bairroValue },
              formHelperText: { sx: { maxHeight: 0, margin: '0 0.2em' } },
            }}
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
            slotProps={{
              inputLabel: { shrink: !!cidadeValue },
              formHelperText: { sx: { maxHeight: 0, margin: '0 0.2em' } },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            id="estado"
            label="Estado"
            variant="outlined"
            fullWidth
            placeholder="Estado"
            {...register("estado")}
            error={!!errors.estado}
            helperText={errors.estado?.message}
            slotProps={{
              inputLabel: { shrink: !!estadoValue },
              formHelperText: { sx: { maxHeight: 0, margin: '0 0.2em' } },
            }}
          />
        </Grid>

        {/* OITAVA LINHA: Número e Complemento */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            id="numero"
            label="Número"
            variant="outlined"
            fullWidth
            placeholder="000"
            {...register("numero")}
            error={!!errors.numero}
            helperText={errors.numero?.message}
            required
            slotProps={{
              inputLabel: { required: true },
              formHelperText: { sx: { maxHeight: 0, margin: '0 0.2em' } },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <TextField
            id="complemento"
            label="Complemento"
            variant="outlined"
            fullWidth
            placeholder="Complemento"
            {...register("complemento")}
            error={!!errors.complemento}
            helperText={errors.complemento?.message}
            disabled={isCepLoading}
            InputLabelProps={{ shrink: !!complementoValue || isCepLoading }}
            slotProps={{ inputLabel: { shrink: !!complementoValue } }}
          />
        </Grid>

        {/* Contatos de Emergência */}
        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0 }}>Contatos de Emergência</h4>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => append({ nome: '', email: '', telefone: '' })}
            >
              Adicionar
            </Button>
          </div>
          <div style={{ marginTop: 6, marginBottom: 8 }}>
            <small style={{ color: '#666' }}>Informe ao menos um contato para acionamento em caso de emergência.</small>
          </div>
        </Grid>
        {contatosFields && contatosFields.length > 0 && contatosFields.map((field, idx) => (
          <Grid key={field.id} size={{ xs: 12 }} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              id={`contato-nome-${idx}`}
              label="Nome"
              variant="outlined"
              fullWidth
              placeholder="Nome do contato"
              {...register(`contatosDeEmergencia.${idx}.nome` as const)}
              error={!!errors?.contatosDeEmergencia?.[idx]?.nome}
            />
            <TextField
              id={`contato-email-${idx}`}
              label="E-mail"
              variant="outlined"
              fullWidth
              placeholder="email@exemplo.com"
              {...register(`contatosDeEmergencia.${idx}.email` as const)}
              error={!!errors?.contatosDeEmergencia?.[idx]?.email}
            />
            <Controller
              name={`contatosDeEmergencia.${idx}.telefone` as const}
              control={control}
              render={({ field: phoneField }) => (
                <MaskedTextField
                  {...phoneField}
                  id={`contato-telefone-${idx}`}
                  label="Telefone"
                  variant="outlined"
                  fullWidth
                  placeholder="00 00000-0000"
                  mask="00 00000-0000"
                />
              )}
            />
            <IconButton aria-label="remover" color="error" onClick={() => remove(idx)}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        ))}

        {/* Dado Social */}
        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
          <h4 style={{ marginTop: 8 }}>Dado Social</h4>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            id="renda-familiar"
            label="Renda Familiar (R$)"
            variant="outlined"
            fullWidth
            type="number"
            inputProps={{ min: 0 }}
            {...register('dadoSocial.rendaFamiliar' as const, { valueAsNumber: true })}
            helperText={'Informe a soma da renda familiar em reais (opcional)'}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            id="composicao-familiar"
            label="Composição Familiar"
            variant="outlined"
            fullWidth
            {...register('dadoSocial.composicaoFamiliar' as const)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            id="situacao-moradia"
            label="Situação Moradia"
            variant="outlined"
            fullWidth
            {...register('dadoSocial.situacaoMoradia' as const)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            id="necessidades-especiais"
            label="Necessidades Especiais"
            variant="outlined"
            fullWidth
            {...register('dadoSocial.necessidadesEspeciais' as const)}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default PatientPersonalDataForm;