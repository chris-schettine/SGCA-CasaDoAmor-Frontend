import { FormControl, FormLabel, Grid, FormControlLabel, RadioGroup, Radio, TextField } from "@mui/material";
import type { PatientFormInputs } from "../../schemas/patientSchema";
import { type UseFormRegister, type FieldErrors, Controller, type Control, type UseFormWatch } from "react-hook-form";

// Definição da interface de props para este componente
interface PatientHealthDetailsFormProps {
  register: UseFormRegister<PatientFormInputs>;
  errors: FieldErrors<PatientFormInputs>;
  control: Control<PatientFormInputs>;
  watch: UseFormWatch<PatientFormInputs>;
}

const PatientDetailsForm = (
  {
    register,
    errors,
    control,
    watch,
  }: PatientHealthDetailsFormProps
) => {
  const usoSondaValue = watch("usoSonda");
  return (
    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ padding: '0 26px', gap: '10px', maxWidth: '1200px' }}>

      {/* Condição de chegada */}
      <Grid size={{ xs: 12 }}>
        <FormControl component="fieldset" error={!!errors.condicaoChegada}>
          <FormLabel component="legend">Condição de chegada</FormLabel>
          <Controller
            name="condicaoChegada"
            control={control}
            defaultValue="nenhum"
            render={({ field }) => (
              <RadioGroup row {...field}>
                <FormControlLabel value="de_ambulancia" control={<Radio />} label="De ambulância" />
                <FormControlLabel value="maca" control={<Radio />} label="Maca" />
                <FormControlLabel value="cadeira_rodas" control={<Radio />} label="Cadeira de Rodas" />
                <FormControlLabel value="nenhum" control={<Radio />} label="Nenhuma da opções" />
              </RadioGroup>
            )}
          />
          {errors.condicaoChegada && (
            <span style={{ color: 'red', fontSize: '0.8em', marginTop: '4px' }}>
              {errors.condicaoChegada.message}
            </span>
          )}
        </FormControl>
      </Grid>

      {/* Faz uso de sonda? */}
      <Grid size={{ xs: 12 }}>
        <FormControl component="fieldset" error={!!errors.usoSonda}>
          <FormLabel component="legend">Faz uso de sonda?</FormLabel>
          <Controller
            name="usoSonda"
            control={control}
            defaultValue="nao"
            render={({ field }) => (
              <RadioGroup row {...field}>
                <FormControlLabel value="nao" control={<Radio />} label="Não" />
                <FormControlLabel value="sonda_foley" control={<Radio />} label="Sonda Foley" />
                <FormControlLabel value="cislostomia" control={<Radio />} label="Cislostomia" />
                <FormControlLabel value="outra" control={<Radio />} label="Outra" />
              </RadioGroup>
            )}
          />
          {errors.usoSonda && (
            <span style={{ color: 'red', fontSize: '0.8em', marginTop: '4px' }}>
              {errors.usoSonda.message}
            </span>
          )}
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          id="se-for-outra"
          label="Se for outra:"
          variant="outlined"
          fullWidth
          placeholder="Descreva"
          {...register("seForOutra")}
          error={!!errors.seForOutra}
          helperText={errors.seForOutra?.message}
          disabled={usoSondaValue !== 'outra'} // Desabilita o campo se não for "outra"
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

      {/* Faz uso de curativo? */}
      <Grid size={{ xs: 12 }}>
        <FormControl component="fieldset" error={!!errors.usoCurativo}>
          <FormLabel component="legend">Faz uso de curativo?</FormLabel>
          <Controller
            name="usoCurativo"
            control={control}
            defaultValue="nao"
            render={({ field }) => (
              <RadioGroup row {...field}>
                <FormControlLabel value="sim" control={<Radio />} label="Sim" />
                <FormControlLabel value="nao" control={<Radio />} label="Não" />
              </RadioGroup>
            )}
          />
          {errors.usoCurativo && (
            <span style={{ color: 'red', fontSize: '0.8em', marginTop: '4px' }}>
              {errors.usoCurativo.message}
            </span>
          )}
        </FormControl>
      </Grid>

      {/* Faz uso de oxigenoterapia? */}
      <Grid size={{ xs: 12 }}>
        <FormControl component="fieldset" error={!!errors.usoOxigenoterapia}>
          <FormLabel component="legend">Faz uso de oxigenoterapia?</FormLabel>
          <Controller
            name="usoOxigenoterapia"
            control={control}
            defaultValue="nao"
            render={({ field }) => (
              <RadioGroup row {...field}>
                <FormControlLabel value="sim" control={<Radio />} label="Sim" />
                <FormControlLabel value="nao" control={<Radio />} label="Não" />
              </RadioGroup>
            )}
          />
          {errors.usoOxigenoterapia && (
            <span style={{ color: 'red', fontSize: '0.8em', marginTop: '4px' }}>
              {errors.usoOxigenoterapia.message}
            </span>
          )}
        </FormControl>
      </Grid>
    </Grid>
  )
}

export default PatientDetailsForm;