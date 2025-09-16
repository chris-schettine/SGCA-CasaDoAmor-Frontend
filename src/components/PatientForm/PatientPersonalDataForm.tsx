import { Grid, TextField } from "@mui/material";
import { type UseFormRegister, type FieldErrors, type UseFormWatch, type UseFormSetValue, Controller, type Control } from "react-hook-form";
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
  handleCepSearch: (cep: string, targetFieldPrefix: "" | "acompanhante") => Promise<void>;
}

const PatientPersonalDataForm = (
  {
    register,
    errors,
    watch,
    setValue,
    handleCepSearch,
    control,
  }: PatientPersonalDataFormProps
) => {

  const dataNascimentoValue = watch("dataNascimento");
  const enderecoValue = watch("endereco");
  const bairroValue = watch("bairro");
  const complementoValue = watch("complemento");

  // Efeito para calcular e preencher a idade automaticamente
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
            error={!!errors.nomeCompletoPaciente}
            helperText={errors.nomeCompletoPaciente?.message}
            slotProps={{
              formHelperText: {
                sx: {
                  maxHeight: '0.4em',
                  margin: '0 0.2em',
                },
              },
            }}
          />
        </Grid>

        {/* CPF */}
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
              />
            )}
          />
        </Grid>

        {/* SEGUNDA LINHA: Data de Nascimento, Idade, Naturalidade, RG */}
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
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            id="idade"
            label="Idade"
            variant="outlined"
            fullWidth
            {...register("idade")}
            error={!!errors.idade}
            helperText={errors.idade?.message}
            placeholder="Idade"
            aria-readonly
            disabled
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              formHelperText: {
                sx: {
                  maxHeight: '0.4em',
                  margin: '0 0.2em',
                },
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            id="naturalidade"
            label="Naturalidade"
            variant="outlined"
            fullWidth
            placeholder="Brasileiro"
            {...register("naturalidade")}
            error={!!errors.naturalidade}
            helperText={errors.naturalidade?.message}
            slotProps={{
              formHelperText: {
                sx: {
                  maxHeight: '0.4em',
                  margin: '0 0.2em',
                },
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                mask="00.000.000-00"
                lazy={true}
              />
            )}
          />
        </Grid>

        {/* TERCEIRA LINHA: Nome da Mãe e Profissão */}
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            id="nome-mae"
            label="Nome da Mãe"
            variant="outlined"
            fullWidth
            placeholder="Digite o nome da mãe do paciente"
            {...register("nomeMae")}
            error={!!errors.nomeMae}
            helperText={errors.nomeMae?.message}
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
              formHelperText: {
                sx: {
                  maxHeight: 0,
                  margin: '0 0.2em',
                },
              },
            }}
          />
        </Grid>

        {/* QUARTA LINHA: Telefone, CEP, Endereço */}
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
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                onBlur={(e) => {
                  field.onBlur();
                  handleCepSearch(e.target.value, "");
                }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            id="endereco"
            label="Endereço"
            variant="outlined"
            fullWidth
            placeholder="Digite o endereço"
            {...register("endereco")}
            error={!!errors.endereco}
            helperText={errors.endereco?.message}
            slotProps={{
              inputLabel: {
                shrink: !!enderecoValue,
              },
              formHelperText: {
                sx: {
                  maxHeight: '0.4em',
                  margin: '0 0.2em',
                },
              },
            }}
          />
        </Grid>

        {/* QUINTA LINHA: Bairro, Número, Complemento */}
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
            slotProps={{
              inputLabel: {
                shrink: !!bairroValue,
              },
              formHelperText: {
                sx: {
                  maxHeight: 0,
                  margin: '0 0.2em',
                },
              },
            }}
          />
        </Grid>
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
        <Grid size={{ xs: 12, md: 5 }}>
          <TextField
            id="complemento"
            label="Complemento"
            variant="outlined"
            fullWidth
            placeholder="Complemento"
            {...register("complemento")}
            error={!!errors.complemento}
            helperText={errors.complemento?.message}
            slotProps={{
              inputLabel: {
                shrink: !!complementoValue,
              },
            }}
          />
        </Grid>
        {/* Tratamento e Diagnóstico */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            id="tratamento"
            label="Tratamento"
            variant="outlined"
            fullWidth
            placeholder="Tratamento"
            multiline
            rows={2}
            {...register("tratamento")}
            error={!!errors.tratamento}
            helperText={errors.tratamento?.message}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            id="diagnostico"
            label="Diagnóstico"
            variant="outlined"
            fullWidth
            placeholder="Diagnóstico"
            multiline
            rows={2}
            {...register("diagnostico")}
            error={!!errors.diagnostico}
            helperText={errors.diagnostico?.message}
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
      </Grid>
    </>
  )
}

export default PatientPersonalDataForm;
