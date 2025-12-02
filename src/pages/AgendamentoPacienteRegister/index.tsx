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
import AgendamentoPacienteForm from '../../components/AgendamentoForm/AgendamentoPacienteForm';
import PageContainer from '../../components/PageContainer';
import { AnimatedPage } from '../../components/AnimatedPage';
import Breadcrumbs from '../../components/Breadcrumbs';
import { agendamentoPacienteSchema, type AgendamentoPacienteFormData } from '../../schemas/agendamentoSchema';
import * as agendamentoPacienteService from '../../api/agendamentoPaciente.service';

export default function AgendamentoPacienteRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AgendamentoPacienteFormData>({
    resolver: zodResolver(agendamentoPacienteSchema),
    defaultValues: {
      status: 'AGENDADO',
      confirmadoPaciente: false,
      confirmadoProfissional: false,
    },
  });

  const onSubmit = async (data: AgendamentoPacienteFormData) => {
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
      
      console.log('🔍 Dados formatados a enviar:', formattedData);
      console.log('🔍 duracaoMinutos calculado:', duracaoMinutos);
      
      const response = await agendamentoPacienteService.criar(formattedData);
      
      setSuccess(response.quartoNome || true);
      setTimeout(() => {
        navigate('/agendamentos/pacientes');
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
            { label: 'Agend. Pacientes', path: '/agendamentos/pacientes' },
            { label: 'Novo Agendamento' }
          ]} 
        />
        
        <Box sx={{ maxWidth: '900px', margin: '0 auto', padding: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/agendamentos/pacientes')}
            variant="outlined"
          >
            Voltar
          </Button>
          <Typography variant="h4" component="h1">
            Novo Agendamento de Paciente
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
            <AgendamentoPacienteForm
              control={control}
              errors={errors}
              watch={watch}
              isEdit={false}
            />

            <Box display="flex" gap={2} justifyContent="flex-end" mt={4}>
              <Button
                variant="outlined"
                onClick={() => navigate('/agendamentos/pacientes')}
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
