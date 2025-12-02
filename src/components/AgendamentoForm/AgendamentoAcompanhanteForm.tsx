import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { Controller, type Control, type FieldErrors, type UseFormWatch } from 'react-hook-form';
import { CheckCircle, Warning } from '@mui/icons-material';
import type { AgendamentoAcompanhanteFormData } from '../../schemas/agendamentoSchema';
import agendamentoAcompanhanteService from '../../api/agendamentoAcompanhante.service';
import * as agendamentoPacienteService from '../../api/agendamentoPaciente.service';
import { tipoServicoService } from '../../api/tipoServico.service';
import type { AcompanhanteElegivelDTO, ProfissionalElegivelDTO } from '../../api/agendamentoAcompanhante.dto';
import type { PacienteElegivelDTO } from '../../api/agendamentoPaciente.dto';
import type { TipoServicoDTO } from '../../api/tipoServico.dto';
import {
  TipoAtendimentoLabels,
  PrioridadeLabels,
  type TipoAtendimento,
  type Prioridade,
} from '../../api/agendamentoPaciente.dto';

interface AgendamentoAcompanhanteFormProps {
  control: Control<AgendamentoAcompanhanteFormData>;
  errors: FieldErrors<AgendamentoAcompanhanteFormData>;
  watch: UseFormWatch<AgendamentoAcompanhanteFormData>;
  isEdit?: boolean;
}

export default function AgendamentoAcompanhanteForm({
  control,
  errors,
  watch,
  isEdit = false,
}: AgendamentoAcompanhanteFormProps) {
  const [acompanhantes, setAcompanhantes] = useState<AcompanhanteElegivelDTO[]>([]);
  const [pacientes, setPacientes] = useState<PacienteElegivelDTO[]>([]);
  const [profissionais, setProfissionais] = useState<ProfissionalElegivelDTO[]>([]);
  const [tiposServico, setTiposServico] = useState<TipoServicoDTO[]>([]);
  const [loadingAcompanhantes, setLoadingAcompanhantes] = useState(false);
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [loadingProfissionais, setLoadingProfissionais] = useState(false);
  const [loadingTiposServico, setLoadingTiposServico] = useState(false);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictResult, setConflictResult] = useState<any>(null);

  const profissionalUsuarioId = watch('profissionalUsuarioId');
  const dataHoraInicio = watch('dataHoraInicio');
  const dataHoraFim = watch('dataHoraFim');

  useEffect(() => {
    loadAcompanhantes();
    loadPacientes();
    loadProfissionais();
  }, []);

  // Load services when professional is selected
  useEffect(() => {
    if (profissionalUsuarioId) {
      loadTiposServicoPorProfissional(profissionalUsuarioId);
    } else {
      setTiposServico([]);
    }
  }, [profissionalUsuarioId]);

  useEffect(() => {
    if (profissionalUsuarioId && dataHoraInicio && dataHoraFim && !isEdit) {
      checkConflicts();
    } else {
      setConflictResult(null);
    }
  }, [profissionalUsuarioId, dataHoraInicio, dataHoraFim, isEdit]);

  const loadAcompanhantes = async () => {
    try {
      setLoadingAcompanhantes(true);
      const data = await agendamentoAcompanhanteService.listarAcompanhantesElegiveis();
      setAcompanhantes(data);
    } catch (error) {
      console.error('Error loading companions:', error);
    } finally {
      setLoadingAcompanhantes(false);
    }
  };

  const loadPacientes = async () => {
    try {
      setLoadingPacientes(true);
      const data = await agendamentoPacienteService.listarPacientesElegiveis();
      setPacientes(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoadingPacientes(false);
    }
  };

  const loadProfissionais = async () => {
    try {
      setLoadingProfissionais(true);
      const data = await agendamentoAcompanhanteService.listarProfissionaisElegiveis();
      console.log('🔍 [Acompanhante] Profissionais carregados:', data);
      console.log('🔍 [Acompanhante] Primeiro profissional tem idNumerico?', data[0]?.idNumerico);
      setProfissionais(data);
    } catch (error) {
      console.error('Error loading professionals:', error);
    } finally {
      setLoadingProfissionais(false);
    }
  };

  const loadTiposServicoPorProfissional = async (profissionalId: string | number) => {
    try {
      setLoadingTiposServico(true);
      const data = await tipoServicoService.listarPorProfissional(profissionalId);
      setTiposServico(data.filter(ts => ts.ativo));
    } catch (error) {
      console.error('Error loading service types for professional:', error);
      setTiposServico([]);
    } finally {
      setLoadingTiposServico(false);
    }
  };

  const checkConflicts = async () => {
    if (!profissionalUsuarioId || !dataHoraInicio || !dataHoraFim) return;

    try {
      setCheckingConflict(true);
      const result = await agendamentoAcompanhanteService.verificarConflito({
        profissionalId: profissionalUsuarioId,
        inicio: dataHoraInicio,
        fim: dataHoraFim,
      });
      setConflictResult(result);
    } catch (error) {
      console.error('Error checking conflicts:', error);
      setConflictResult(null);
    } finally {
      setCheckingConflict(false);
    }
  };

  const tipoAtendimentoOptions: TipoAtendimento[] = [
    'PRIMEIRA_VEZ',
    'RETORNO',
    'EMERGENCIAL',
    'ROTINA',
    'TRIAGEM',
  ];

  const prioridadeOptions: Prioridade[] = ['BAIXA', 'NORMAL', 'ALTA', 'URGENTE'];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="acompanhanteId"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  options={acompanhantes}
                  getOptionLabel={(option) =>
                    `${option.nome} - CPF: ${option.cpf} (Paciente: ${option.pacienteNome})`
                  }
                  value={acompanhantes.find((a) => (a.idNumerico ?? a.id) === value) || null}
                  onChange={(_, newValue) => {
                    const companionId = newValue?.idNumerico ?? newValue?.id;
                    onChange(companionId);
                  }}
                  loading={loadingAcompanhantes}
                  disabled={isEdit}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Acompanhante"
                      required
                      error={!!errors.acompanhanteId}
                      helperText={errors.acompanhanteId?.message}
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingAcompanhantes && <CircularProgress size={20} />}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        },
                      }}
                    />
                  )}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Quarto"
              value={acompanhantes.find(a => (a.idNumerico ?? a.id) === watch('acompanhanteId'))?.quartoNome || ''}
              fullWidth
              disabled
              helperText="Quarto do acompanhante selecionado"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="pacienteVinculadoId"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  options={pacientes}
                  getOptionLabel={(option) =>
                    `${option.nome} - CPF: ${option.cpf}`
                  }
                  value={pacientes.find((p) => (p.idNumerico ?? p.id) === value) || null}
                  onChange={(_, newValue) => {
                    const patientId = newValue?.idNumerico ?? newValue?.id;
                    onChange(patientId);
                  }}
                  loading={loadingPacientes}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Paciente Vinculado (Opcional)"
                      error={!!errors.pacienteVinculadoId}
                      helperText={errors.pacienteVinculadoId?.message || 'Paciente relacionado a este agendamento'}
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingPacientes && <CircularProgress size={20} />}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        },
                      }}
                    />
                  )}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="profissionalUsuarioId"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  options={profissionais}
                  getOptionLabel={(option) => `${option.nome} (${option.tipo})`}
                  value={profissionais.find((p) => p.id === value) || null}
                  onChange={(_, newValue) => onChange(newValue?.id)}
                  loading={loadingProfissionais}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Profissional"
                      required
                      error={!!errors.profissionalUsuarioId}
                      helperText={errors.profissionalUsuarioId?.message}
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingProfissionais && <CircularProgress size={20} />}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        },
                      }}
                    />
                  )}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="tipoServicoId"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  options={tiposServico}
                  getOptionLabel={(option) =>
                    `${option.nome} (${option.categoria})`
                  }
                  value={tiposServico.find((t) => t.id === value) || null}
                  onChange={(_, newValue) => onChange(newValue?.id)}
                  loading={loadingTiposServico}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tipo de Serviço"
                      required
                      error={!!errors.tipoServicoId}
                      helperText={errors.tipoServicoId?.message}
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingTiposServico ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.id}>
                      <Box>
                        <Typography variant="body2">{option.nome}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.categoria} • {option.duracaoMinutos} min
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="dataHoraInicio"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DateTimePicker
                  label="Data e Hora de Início"
                  value={value ? new Date(value) : null}
                  onChange={(newValue) => onChange(newValue ? newValue.toISOString() : '')}
                  format="dd/MM/yyyy HH:mm"
                  ampm={false}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.dataHoraInicio,
                      helperText: errors.dataHoraInicio?.message,
                    },
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="dataHoraFim"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DateTimePicker
                  label="Data e Hora de Fim"
                  value={value ? new Date(value) : null}
                  onChange={(newValue) => onChange(newValue ? newValue.toISOString() : '')}
                  format="dd/MM/yyyy HH:mm"
                  ampm={false}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.dataHoraFim,
                      helperText: errors.dataHoraFim?.message,
                    },
                  }}
                />
              )}
            />
          </Grid>

          {profissionalUsuarioId && dataHoraInicio && dataHoraFim && (
            <Grid size={{ xs: 12 }}>
              {checkingConflict ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Verificando conflitos...</Typography>
                </Box>
              ) : conflictResult ? (
                conflictResult.temConflito ? (
                  <Alert severity="warning" icon={<Warning />}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Conflito Detectado
                    </Typography>
                    <Typography variant="body2">{conflictResult.mensagem}</Typography>
                    {conflictResult.details && (
                      <Typography variant="caption" display="block" mt={1}>
                        {conflictResult.details.tipo}: {conflictResult.details.descricao}
                      </Typography>
                    )}
                  </Alert>
                ) : (
                  <Alert severity="success" icon={<CheckCircle />}>
                    Horário disponível! Não há conflitos.
                  </Alert>
                )
              ) : null}
            </Grid>
          )}

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="tipoAtendimento"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  select
                  label="Tipo de Atendimento"
                  fullWidth
                  error={!!errors.tipoAtendimento}
                  helperText={errors.tipoAtendimento?.message}
                >
                  {tipoAtendimentoOptions.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {TipoAtendimentoLabels[tipo]}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="prioridade"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  select
                  label="Prioridade"
                  fullWidth
                  error={!!errors.prioridade}
                  helperText={errors.prioridade?.message}
                >
                  {prioridadeOptions.map((prioridade) => (
                    <MenuItem key={prioridade} value={prioridade}>
                      {PrioridadeLabels[prioridade]}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="observacoes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Observações"
                  multiline
                  rows={3}
                  fullWidth
                  error={!!errors.observacoes}
                  helperText={errors.observacoes?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}
