import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import LoadingBackdrop from '../../components/LoadingBackdrop';
import AgendamentoAcompanhanteForm from '../../components/AgendamentoForm/AgendamentoAcompanhanteForm';
import PageContainer from '../../components/PageContainer';
import { AnimatedPage } from '../../components/AnimatedPage';
import Breadcrumbs from '../../components/Breadcrumbs';
import { agendamentoAcompanhanteSchema, type AgendamentoAcompanhanteFormData } from '../../schemas/agendamentoSchema';
import agendamentoAcompanhanteService from '../../api/agendamentoAcompanhante.service';

export default function AgendamentoAcompanhanteRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AgendamentoAcompanhanteFormData>({
    resolver: zodResolver(agendamentoAcompanhanteSchema),
    defaultValues: {
      status: 'AGENDADO',
      confirmadoAcompanhante: false,
      confirmadoProfissional: false,
    },
  });

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
      
      const response = await agendamentoAcompanhanteService.criar(formattedData);
      
      setSuccess(response.quartoNome || true);
      setTimeout(() => {
        navigate('/agendamentos/acompanhantes');
      }, 1500);
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      setError(err.response?.data?.message || 'Erro ao criar agendamento. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <PageContainer>
        <Breadcrumbs 
          items={[
            { label: 'Agend. Acompanhantes', path: '/agendamentos/acompanhantes' },
            { label: 'Novo Agendamento' }
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
            Novo Agendamento de Acompanhante
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Agendamento criado com sucesso{typeof success === 'string' ? ` - Quarto: ${success}` : ''}! Redirecionando...
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <AgendamentoAcompanhanteForm
              control={control}
              errors={errors}
              watch={watch}
              isEdit={false}
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
                Criar Agendamento
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
