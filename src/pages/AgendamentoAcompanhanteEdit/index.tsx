import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import LoadingBackdrop from '../../components/LoadingBackdrop';
import AgendamentoAcompanhanteForm from '../../components/AgendamentoForm/AgendamentoAcompanhanteForm';
import PageContainer from '../../components/PageContainer';
import { AnimatedPage } from '../../components/AnimatedPage';
import Breadcrumbs from '../../components/Breadcrumbs';
import { agendamentoAcompanhanteSchema, type AgendamentoAcompanhanteFormData } from '../../schemas/agendamentoSchema';
import agendamentoAcompanhanteService from '../../api/agendamentoAcompanhante.service';

export default function AgendamentoAcompanhanteEdit() {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<AgendamentoAcompanhanteFormData>({
    resolver: zodResolver(agendamentoAcompanhanteSchema),
  });

  useEffect(() => {
    if (uuid) {
      loadAgendamento();
    }
  }, [uuid]);

  const loadAgendamento = async () => {
    try {
      setLoading(true);
      const data = await agendamentoAcompanhanteService.obterPorUuid(uuid!);
      
      reset({
        acompanhanteId: data.acompanhanteId,
        tipoServicoId: data.tipoServicoId,
        profissionalUsuarioId: data.profissionalUsuarioId,
        dataHoraInicio: data.dataHoraInicio,
        dataHoraFim: data.dataHoraFim,
        pacienteVinculadoId: data.pacienteVinculadoId || undefined,
        tipoAtendimento: data.tipoAtendimento as any,
        prioridade: data.prioridade as any,
        status: data.status as any,
        observacoes: data.observacoes || undefined,
        confirmadoAcompanhante: data.confirmadoAcompanhante,
        confirmadoProfissional: data.confirmadoProfissional,
      });
    } catch (err: any) {
      console.error('Error loading appointment:', err);
      setError('Erro ao carregar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AgendamentoAcompanhanteFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate duration in minutes
      const inicio = new Date(data.dataHoraInicio);
      const fim = new Date(data.dataHoraFim);
      const duracaoMinutos = Math.round((fim.getTime() - inicio.getTime()) / (1000 * 60));
      
      // Format dates for Java LocalDateTime (remove milliseconds and timezone)
      const formattedData = {
        ...data,
        dataHoraInicio: data.dataHoraInicio.replace(/\.\d{3}Z$/, ''),
        dataHoraFim: data.dataHoraFim.replace(/\.\d{3}Z$/, ''),
        duracaoMinutos,
      };
      
      // Note: atualizar method needs to be added to service
      await agendamentoAcompanhanteService.criar(formattedData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/agendamentos/acompanhantes');
      }, 1500);
    } catch (err: any) {
      console.error('Error updating appointment:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar agendamento. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AnimatedPage>
        <PageContainer>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </PageContainer>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <PageContainer>
        <Breadcrumbs 
          items={[
            { label: 'Agend. Acompanhantes', path: '/agendamentos/acompanhantes' },
            { label: 'Editar Agendamento' }
          ]} 
        />
        
        <Box sx={{ maxWidth: '900px', margin: '0 auto', padding: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/agendamentos/acompanhantes')}
            variant="outlined"
          >
            Voltar
          </Button>
          <Typography variant="h4" component="h1">
            Editar Agendamento de Acompanhante
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Agendamento atualizado com sucesso! Redirecionando...
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <AgendamentoAcompanhanteForm
              control={control}
              errors={errors}
              watch={watch}
              isEdit={true}
            />

            <Box display="flex" gap={2} justifyContent="flex-end" mt={4}>
              <Button
                variant="outlined"
                onClick={() => navigate('/agendamentos/acompanhantes')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
              >
                Salvar Alterações
              </Button>
            </Box>
          </form>
        </Paper>

        {loading && <LoadingBackdrop />}
        </Box>
      </PageContainer>
    </AnimatedPage>
  );
}
