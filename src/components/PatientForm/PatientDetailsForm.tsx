import { FormControl, FormLabel, Grid, FormControlLabel, RadioGroup, Radio, TextField, MenuItem, useTheme } from "@mui/material";
import type { PatientFormInputs } from "../../schemas/patientSchema";
import { type UseFormRegister, type FieldErrors, Controller, type Control, type UseFormWatch } from "react-hook-form";
import MaskedTextField from '../MaskedTextField';

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
  const theme = useTheme();
  const usoSondaValue = watch("usoSonda");
  const tipoSondaVesicalValue = watch('tipoSondaVesical');
  const tratamentoValue = watch('tratamento');
  return (
    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ padding: '0 26px', gap: '10px', maxWidth: '1200px' }}>

      {/* Diagnóstico e Tratamento (Dados Médicos) */}
      <Grid size={{ xs: 12 }}>
        <h4 style={{ marginTop: 8, marginBottom: 16 }}>Informações Clínicas</h4>
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          id="diagnostico"
          label="Diagnóstico *"
          variant="outlined"
          fullWidth
          placeholder="Informe o diagnóstico do paciente"
          multiline
          rows={3}
          {...register("diagnostico")}
          FormHelperTextProps={{ sx: { color: `${theme.palette.getContrastText(theme.palette.background.paper)} !important` } }}
          error={!!errors.diagnostico}
          helperText={errors.diagnostico?.message || 'Diagnóstico médico principal do paciente.'}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name="tratamento"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ''}
              id="tratamento"
              label="Tratamento"
              variant="outlined"
              fullWidth
              select
              error={!!errors.tratamento}
              helperText={errors.tratamento?.message || 'Tipo de tratamento em curso (opcional).'}
              FormHelperTextProps={{ sx: { color: `${theme.palette.getContrastText(theme.palette.background.paper)} !important` } }}
            >
              <MenuItem value="">Selecione...</MenuItem>
              <MenuItem value={"RADIOTERAPIA"}>Radioterapia</MenuItem>
              <MenuItem value={"QUIMIOTERAPIA"}>Quimioterapia</MenuItem>
              <MenuItem value={"AMBOS"}>Ambos</MenuItem>
              <MenuItem value={"OUTRO"}>Outro</MenuItem>
            </TextField>
          )}
        />
      </Grid>

      {tratamentoValue === 'OUTRO' && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            id="tratamento-outro"
            label="Descreva o tratamento *"
            variant="outlined"
            fullWidth
            placeholder="Especifique o tipo de tratamento"
            {...register('tratamentoOutroDescricao' as const)}
            error={!!errors.tratamentoOutroDescricao}
            helperText={errors.tratamentoOutroDescricao?.message || 'Obrigatório quando "Outro" for selecionado.'}
            FormHelperTextProps={{ sx: { color: `${theme.palette.getContrastText(theme.palette.background.paper)} !important` } }}
          />
        </Grid>
      )}

      {/* Condição de chegada */}
      <Grid size={{ xs: 12 }}>
        <FormControl component="fieldset" error={!!errors.condicaoChegada} required>
          <FormLabel component="legend" required>Condição de chegada</FormLabel>
          <Controller
            name="condicaoChegada"
            control={control}
            render={({ field }) => (
              <RadioGroup row {...field}>
                <FormControlLabel value="de_ambulancia" control={<Radio />} label="De ambulância" />
                <FormControlLabel value="maca" control={<Radio />} label="Maca" />
                <FormControlLabel value="cadeira_rodas" control={<Radio />} label="Cadeira de Rodas" />
                <FormControlLabel value="nenhum" control={<Radio />} label="Nenhuma das opções" />
              </RadioGroup>
            )}
          />
          <div style={{ marginTop: 6 }}>
            <small style={{ color: '#666' }}>Selecione como o paciente chegou ao local.</small>
          </div>
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
          <FormLabel component="legend">Faz uso de sonda? *</FormLabel>
          <Controller
            name="usoSonda"
            control={control}
            render={({ field }) => (
              <RadioGroup row {...field}>
                <FormControlLabel value="sim" control={<Radio />} label="Sim" />
                <FormControlLabel value="nao" control={<Radio />} label="Não" />
              </RadioGroup>
            )}
          />
          <div style={{ marginTop: 6 }}>
            <small style={{ color: '#666' }}>Se "Sim", informe abaixo o(s) tipo(s) de sonda utilizados.</small>
          </div>
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
          label="Se for 'Outra', descreva"
          variant="outlined"
          fullWidth
          placeholder="Descreva a sonda vesical"
          {...register("seForOutra")}
          error={!!errors.seForOutra}
          helperText={
            errors.seForOutra?.message ||
            (tipoSondaVesicalValue === 'OUTRA'
              ? 'Obrigatório quando selecionar "Outra".'
              : 'Descreva a sonda vesical quando selecionar "Outra".')
          }
          required={tipoSondaVesicalValue === 'OUTRA'}
          disabled={tipoSondaVesicalValue !== 'OUTRA'}
            slotProps={{
            inputLabel: { required: tipoSondaVesicalValue === 'OUTRA' },
            formHelperText: {
              sx: {
                maxHeight: '0.4em',
                margin: '0 0.2em',
                color: `${theme.palette.getContrastText(theme.palette.background.paper)} !important`
              },
            },
          }}
        />
      </Grid>

      {/* Faz uso de curativo? */}
      <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
        <FormControl component="fieldset" error={!!errors.usoCurativo}>
          <FormLabel component="legend">Faz uso de curativo? *</FormLabel>
          <Controller
            name="usoCurativo"
            control={control}
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
          <FormLabel component="legend">Faz uso de oxigenoterapia? *</FormLabel>
          <Controller
            name="usoOxigenoterapia"
            control={control}
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

      {/* Tipos de sonda e tipo sanguíneo */}
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Controller
          name="tipoSondaNasal"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ''}
              id="tipo-sonda-nasal"
              label="Tipo Sonda Nasal"
              variant="outlined"
              fullWidth
              select
              disabled={usoSondaValue !== 'sim'}
              error={!!errors.tipoSondaNasal}
              helperText={
                errors.tipoSondaNasal?.message || 
                (usoSondaValue === 'sim' ? 'Selecione se utilizar (opcional).' : 'Habilitado somente se usar sonda.')
              }
              FormHelperTextProps={{ sx: { color: `${theme.palette.getContrastText(theme.palette.background.paper)} !important` } }}
            >
              <MenuItem value="">Nenhum</MenuItem>
              <MenuItem value={"SNG"}>SNG</MenuItem>
              <MenuItem value={"SNE"}>SNE</MenuItem>
              <MenuItem value={"OROGASTRICA"}>Orogástrica</MenuItem>
            </TextField>
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Controller
          name="tipoSondaCirurgica"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ''}
              id="tipo-sonda-cirurgica"
              label="Tipo Sonda Cirúrgica"
              variant="outlined"
              fullWidth
              select
              disabled={usoSondaValue !== 'sim'}
              error={!!errors.tipoSondaCirurgica}
              helperText={
                errors.tipoSondaCirurgica?.message || 
                (usoSondaValue === 'sim' ? 'Selecione se utilizar (opcional).' : 'Habilitado somente se usar sonda.')
              }
              FormHelperTextProps={{ sx: { color: `${theme.palette.getContrastText(theme.palette.background.paper)} !important` } }}
            >
              <MenuItem value="">Nenhum</MenuItem>
              <MenuItem value={"G"}>G</MenuItem>
              <MenuItem value={"J"}>J</MenuItem>
              <MenuItem value={"GJ"}>GJ</MenuItem>
            </TextField>
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Controller
          name="tipoSondaVesical"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ''}
              id="tipo-sonda-vesical"
              label="Tipo Sonda Vesical"
              variant="outlined"
              fullWidth
              select
              disabled={usoSondaValue !== 'sim'}
              error={!!errors.tipoSondaVesical}
              helperText={
                errors.tipoSondaVesical?.message || 
                (usoSondaValue === 'sim' ? 'Selecione o tipo ou "Não".' : 'Habilitado somente se usar sonda.')
              }
              FormHelperTextProps={{ sx: { color: `${theme.palette.getContrastText(theme.palette.background.paper)} !important` } }}
            >
              <MenuItem value="">Selecione...</MenuItem>
              <MenuItem value={"NAO"}>Não</MenuItem>
              <MenuItem value={"FOLEY"}>Foley</MenuItem>
              <MenuItem value={"CISTOSTOMIA"}>Cistostomia</MenuItem>
              <MenuItem value={"OUTRA"}>Outra</MenuItem>
            </TextField>
          )}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Controller
          name="tipoSanguineo"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ''}
              id="tipo-sanguineo"
              label="Tipo Sanguíneo *"
              variant="outlined"
              fullWidth
              select
              error={!!errors.tipoSanguineo}
              helperText={errors.tipoSanguineo?.message || 'Selecione o tipo sanguíneo do paciente.'}
              FormHelperTextProps={{ sx: { color: `${theme.palette.getContrastText(theme.palette.background.paper)} !important` } }}
            >
              <MenuItem value="">Selecione...</MenuItem>
              <MenuItem value={"A_POSITIVO"}>A+</MenuItem>
              <MenuItem value={"A_NEGATIVO"}>A-</MenuItem>
              <MenuItem value={"B_POSITIVO"}>B+</MenuItem>
              <MenuItem value={"B_NEGATIVO"}>B-</MenuItem>
              <MenuItem value={"AB_POSITIVO"}>AB+</MenuItem>
              <MenuItem value={"AB_NEGATIVO"}>AB-</MenuItem>
              <MenuItem value={"O_POSITIVO"}>O+</MenuItem>
              <MenuItem value={"O_NEGATIVO"}>O-</MenuItem>
            </TextField>
          )}
        />
      </Grid>

      {/* Informação Hospitalar */}
      <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
        <h4 style={{ marginTop: 8 }}>Informação Hospitalar</h4>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          id="nome-hospital"
          label="Hospital de Referência"
          variant="outlined"
          fullWidth
          {...register('informacaoHospitalar.nomeHospitalReferencia' as const)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          id="medico-responsavel"
          label="Médico Responsável"
          variant="outlined"
          fullWidth
          {...register('informacaoHospitalar.medicoResponsavel' as const)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          id="setor-ala"
          label="Setor / Ala"
          variant="outlined"
          fullWidth
          {...register('informacaoHospitalar.setorAla' as const)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Controller
          name={'informacaoHospitalar.dataInternacao' as const}
          control={control}
          render={({ field }) => (
            <MaskedTextField
              {...field}
              id="data-internacao"
              label="Data Internação"
              variant="outlined"
              fullWidth
              placeholder="00/00/0000"
              mask="00/00/0000"
              helperText={errors.informacaoHospitalar?.dataInternacao?.message || 'Formato DD/MM/AAAA (opcional)'}
              FormHelperTextProps={{ sx: { color: `${theme.palette.getContrastText(theme.palette.background.paper)} !important` } }}
            />
          )}
        />
      </Grid>
    </Grid>
  )
}

export default PatientDetailsForm;
