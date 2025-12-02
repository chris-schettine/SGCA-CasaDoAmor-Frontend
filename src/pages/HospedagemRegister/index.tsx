import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hospedagemCreateSchema } from '../../schemas/hospedagemSchema';
import type { HospedagemCreateFormData } from '../../schemas/hospedagemSchema';
import { hospedagemService } from '../../api/hospedagem.service';
import { quartoService } from '../../api/quarto.service';
import type { QuartoDTO } from '../../api/quarto.dto';
import { pacienteService } from '../../api/paciente.service';
import MaskedTextField from '../../components/MaskedTextField';
import { removeNonNumeric } from '../../utils/formatters';

export default function HospedagemRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quartosDisponiveis, setQuartosDisponiveis] = useState<QuartoDTO[]>([]);
  const [checkingActiveStay, setCheckingActiveStay] = useState(false);
  const [activeStayWarning, setActiveStayWarning] = useState<string | null>(null);
  const [patientNotFoundError, setPatientNotFoundError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<HospedagemCreateFormData>({
    resolver: zodResolver(hospedagemCreateSchema),
    defaultValues: {
      pacienteId: '',
      quartoUuid: '',
      dataEntrada: new Date().toISOString().split('T')[0],
      horaEntrada: new Date().toTimeString().slice(0, 5),
      dataSaidaPrevista: '',
      observacoesEntrada: '',
      observacoesGerais: '',
    },
  });

  const pacienteId = watch('pacienteId');

  useEffect(() => {
    loadQuartosDisponiveis();
  }, []);

  useEffect(() => {
    // Check for active stay when CPF is complete
    if (pacienteId && pacienteId.length >= 11) {
      const cleanCpf = removeNonNumeric(pacienteId);
      if (cleanCpf.length === 11) {
        checkActiveStay(cleanCpf);
      }
    } else {
      setActiveStayWarning(null);
    }
  }, [pacienteId]);

  const loadQuartosDisponiveis = async () => {
    try {
      const response = await quartoService.listar({ page: 0, size: 100, ativo: true });
      const available = response.content.filter((q) => q.vagasDisponiveis > 0);
      setQuartosDisponiveis(available);
    } catch (err) {
      console.error('Error loading available rooms:', err);
    }
  };

  const checkActiveStay = async (cpf: string) => {
    setCheckingActiveStay(true);
    setActiveStayWarning(null);
    setPatientNotFoundError(null);
    try {
      // First, check if patient exists
      const patient = await pacienteService.searchPacienteByCpf(cpf);
      if (!patient) {
        setPatientNotFoundError('Paciente não encontrado. Cadastre o paciente antes de registrar a hospedagem.');
        return;
      }
      
      // Then check for active stay
      const result = await hospedagemService.verificarHospedagemAtiva(cpf);
      if (result.possuiHospedagemAtiva && result.quartoAtual) {
        setActiveStayWarning(
          `Atenção: Paciente já possui hospedagem ativa no quarto ${result.quartoAtual}.`
        );
      }
    } catch (err) {
      console.error('Error checking patient/stay:', err);
    } finally {
      setCheckingActiveStay(false);
    }
  };

  const onSubmit = async (data: HospedagemCreateFormData) => {
    if (activeStayWarning) {
      setError('Não é possível registrar nova hospedagem. Paciente já possui hospedagem ativa.');
      return;
    }

    if (patientNotFoundError) {
      setError(patientNotFoundError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Search for patient by CPF to get UUID
      const cleanCpf = removeNonNumeric(data.pacienteId);
      const patient = await pacienteService.searchPacienteByCpf(cleanCpf);
      
      if (!patient) {
        setError('Paciente não encontrado. Verifique o CPF e tente novamente.');
        setLoading(false);
        return;
      }

      // Use patient UUID instead of CPF
      const payload = {
        ...data,
        pacienteId: patient.id,
      };
      await hospedagemService.criar(payload);
      navigate('/hospedagens');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar hospedagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Paper sx={{ padding: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Nova Hospedagem
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeStayWarning && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {activeStayWarning}
          </Alert>
        )}

        {patientNotFoundError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {patientNotFoundError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="pacienteId"
                control={control}
                render={({ field }) => (
                  <MaskedTextField
                    {...field}
                    fullWidth
                    label="CPF do Paciente *"
                    mask="999.999.999-99"
                    error={!!errors.pacienteId}
                    helperText={errors.pacienteId?.message}
                    disabled={loading}
                    InputProps={{
                      endAdornment: checkingActiveStay && <CircularProgress size={20} />,
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="quartoUuid"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Quarto"
                    error={!!errors.quartoUuid}
                    helperText={errors.quartoUuid?.message || 'Deixe vazio para atribuição automática'}
                    disabled={loading}
                  >
                    <MenuItem value="">Atribuir automaticamente</MenuItem>
                    {quartosDisponiveis.map((quarto) => (
                      <MenuItem key={quarto.uuid} value={quarto.uuid}>
                        {quarto.nome} ({quarto.tipo.descricao} - {quarto.ala.descricao}) - {quarto.vagasDisponiveis} vaga(s)
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="dataEntrada"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Data de Entrada *"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.dataEntrada}
                    helperText={errors.dataEntrada?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="horaEntrada"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Hora de Entrada"
                    type="time"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.horaEntrada}
                    helperText={errors.horaEntrada?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="dataSaidaPrevista"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Previsão de Saída"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.dataSaidaPrevista}
                    helperText={errors.dataSaidaPrevista?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="observacoesEntrada"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Observações de Entrada"
                    multiline
                    rows={3}
                    placeholder="Informações sobre o estado do paciente na entrada..."
                    error={!!errors.observacoesEntrada}
                    helperText={errors.observacoesEntrada?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="observacoesGerais"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Observações Gerais"
                    multiline
                    rows={3}
                    placeholder="Outras informações relevantes..."
                    error={!!errors.observacoesGerais}
                    helperText={errors.observacoesGerais?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/hospedagens')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || !!activeStayWarning || !!patientNotFoundError}
                  sx={{
                    color: 'white !important',
                    WebkitTextFillColor: 'white !important',
                  }}
                >
                  {loading ? 'Registrando...' : 'Registrar Hospedagem'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
