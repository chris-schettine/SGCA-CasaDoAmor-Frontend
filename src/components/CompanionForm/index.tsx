import { FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, TextField } from "@mui/material";
import { type UseFormRegister, type FieldErrors, Controller } from "react-hook-form";
import type { Control, UseFormWatch } from "react-hook-form";
import MaskedTextField from "../MaskedTextField";
import type { CompanionFormInputs } from "../../schemas/companionSchema";

interface CompanionFormProps {
  register: UseFormRegister<CompanionFormInputs>;
  errors: FieldErrors<CompanionFormInputs>;
  watch: UseFormWatch<CompanionFormInputs>;
  control: Control<CompanionFormInputs>;
  handleCepSearch: (cep: string, targetFieldPrefix: "acompanhante") => Promise<void>;
  isExistingCompanion: boolean;
}

const RegisterCompanionForm = (
  {
    register,
    errors,
    watch,
    control,
    handleCepSearch,
    isExistingCompanion,
  }: CompanionFormProps
) => {

  const companionAddressValue = watch("enderecoAcompanhante");
  const companionNeighborhoodValue = watch("bairroAcompanhante");
  const companionComplementValue = watch("complementoAcompanhante");
  const companionNameValue = watch("acompanhanteNome");

  return (
    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ padding: '26px', maxWidth: '1200px' }}>
      {/* NOVO: CAMPO DE CPF para busca no topo */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Controller
          name="cpfAcompanhante"
          control={control}
          render={({ field }) => (
            <MaskedTextField
              {...field}
              id="cpf-acompanhante"
              label="CPF do Acompanhante"
              variant="outlined"
              fullWidth
              placeholder="000.000.000-00"
              error={!!errors.cpfAcompanhante}
              helperText={errors.cpfAcompanhante?.message}
              mask="000.000.000-00"
              lazy={true}
            />
          )}
        />
      </Grid>

      {/* SEXTA LINHA: Acompanhante (agora no segundo nível, depois do CPF) */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          id="acompanhanteNome"
          label="Nome Completo do Acompanhante"
          variant="outlined"
          fullWidth
          placeholder="Digite o nome completo do acompanhante"
          {...register("acompanhanteNome")}
          error={!!errors.acompanhanteNome}
          helperText={errors.acompanhanteNome?.message}
          slotProps={{
            inputLabel: {
              shrink: !!companionNameValue,
            },
            formHelperText: {
              sx: {
                minHeight: '1.25em',
                margin: '0 0.2em',
              },
            },
          }}
          disabled={isExistingCompanion}
        />
      </Grid>

      {/* SÉTIMA LINHA: Telefone do acompanhante, CEP do acompanhante, Endereço do acompanhante */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Controller
          name="telefoneAcompanhante"
          control={control}
          render={({ field }) => (
            <MaskedTextField
              {...field}
              id="telefone-acompanhante"
              label="Telefone"
              variant="outlined"
              fullWidth
              placeholder="00 00000-0000"
              error={!!errors.telefoneAcompanhante}
              helperText={errors.telefoneAcompanhante?.message}
              mask="00 00000-0000"
              lazy={true}
              disabled={isExistingCompanion}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Controller
          name="cepAcompanhante"
          control={control}
          render={({ field }) => (
            <MaskedTextField
              {...field}
              id="cep-acompanhante"
              label="CEP"
              variant="outlined"
              fullWidth
              placeholder="00000-000"
              error={!!errors.cepAcompanhante}
              helperText={errors.cepAcompanhante?.message}
              mask="00000-000"
              lazy={true}
              onBlur={(e) => {
                field.onBlur();
                handleCepSearch(e.target.value, "acompanhante");
              }}
              disabled={isExistingCompanion}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <TextField
          id="endereco-acompanhante"
          label="Endereço do acompanhante"
          variant="outlined"
          fullWidth
          placeholder="Endereço do acompanhante"
          {...register("enderecoAcompanhante")}
          error={!!errors.enderecoAcompanhante}
          helperText={errors.enderecoAcompanhante?.message}
          slotProps={{
            inputLabel: {
              shrink: !!companionAddressValue,
            },
            formHelperText: {
              sx: {
                maxHeight: '0.4em',
                margin: '0 0.2em',
              },
            },
          }}
          disabled={isExistingCompanion}
        />
      </Grid>

      {/* OITAVA LINHA: Bairro, Número, Complemento do acompanhante */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <TextField
          id="bairro-acompanhante"
          label="Bairro"
          variant="outlined"
          fullWidth
          placeholder="Bairro"
          {...register("bairroAcompanhante")}
          error={!!errors.bairroAcompanhante}
          helperText={errors.bairroAcompanhante?.message}
          slotProps={{
            inputLabel: {
              shrink: !!companionNeighborhoodValue,
            },
            formHelperText: {
              sx: {
                maxHeight: '0.4em',
                margin: '0 0.2em',
              },
            },
          }}
          disabled={isExistingCompanion}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TextField
          id="numero-acompanhante"
          label="Número"
          variant="outlined"
          fullWidth
          placeholder="000"
          {...register("numeroAcompanhante")}
          error={!!errors.numeroAcompanhante}
          helperText={errors.numeroAcompanhante?.message}
          slotProps={{
            inputLabel: {
              shrink: !!companionAddressValue,
            },
            formHelperText: {
              sx: {
                maxHeight: '0.4em',
                margin: '0 0.2em',
              },
            },
          }}
          disabled={isExistingCompanion}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <TextField
          id="complemento-acompanhante"
          label="Complemento"
          variant="outlined"
          fullWidth
          placeholder="Complemento"
          {...register("complementoAcompanhante")}
          error={!!errors.complementoAcompanhante}
          helperText={errors.complementoAcompanhante?.message}
          slotProps={{
            inputLabel: {
              shrink: !!companionComplementValue,
            },
            formHelperText: {
              sx: {
                maxHeight: '0.4em',
                margin: '0 0.2em',
              },
            },
          }}
          disabled={isExistingCompanion}
        />
      </Grid>

      {/* Vínculo com o paciente */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          id="vinculo-paciente"
          label="Vínculo com o paciente"
          variant="outlined"
          fullWidth
          placeholder="Filho"
          {...register("vinculoPaciente")}
          error={!!errors.vinculoPaciente}
          helperText={errors.vinculoPaciente?.message}
          slotProps={{
            inputLabel: {
              shrink: !!companionAddressValue,
            },
            formHelperText: {
              sx: {
                maxHeight: '0.4em',
                margin: '0 0.2em',
              },
            },
          }}
        // O vínculo geralmente NÃO é desabilitado, pois pode ser diferente para cada paciente
        />
      </Grid>

      {/* Pode ajudar na cozinha? */}
      <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControl
          component="fieldset"
          error={!!errors.podeAjudarCozinha}
          disabled={isExistingCompanion}
        >
          <FormLabel component="legend">Pode ajudar na cozinha?</FormLabel>
          <Controller
            name="podeAjudarCozinha"
            control={control}
            defaultValue="nao"
            render={({ field }) => (
              <RadioGroup row {...field}>
                <FormControlLabel value="sim" control={<Radio />} label="Sim" />
                <FormControlLabel value="nao" control={<Radio />} label="Não" />
              </RadioGroup>
            )}
          />
          {errors.podeAjudarCozinha && (
            <span style={{ color: 'red', fontSize: '0.8em', marginTop: '4px' }}>
              {errors.podeAjudarCozinha.message}
            </span>
          )}
        </FormControl>
      </Grid>

      {/* O acompanhante é responsável pelo paciente?
      <Grid size={{ xs: 12 }}>
        <FormControl component="fieldset" error={!!errors.acompanhanteResponsavel}>
          <FormLabel component="legend">O acompanhante é responsável pelo paciente?</FormLabel>
          <Controller
            name="acompanhanteResponsavel"
            control={control}
            defaultValue="nao"
            render={({ field }) => (
              <RadioGroup row {...field}>
                <FormControlLabel value="sim" control={<Radio />} label="Sim" />
                <FormControlLabel value="nao" control={<Radio />} label="Não" />
              </RadioGroup>
            )}
          />
          {errors.acompanhanteResponsavel && (
            <span style={{ color: 'red', fontSize: '0.8em', marginTop: '4px' }}>
              {errors.acompanhanteResponsavel.message}
            </span>
          )}
        </FormControl>
      </Grid> */}
    </Grid>
  )
}

export default RegisterCompanionForm;