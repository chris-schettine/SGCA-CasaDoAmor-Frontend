import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { AnimatedPage } from '../../components/AnimatedPage';
import PageContainer from '../../components/PageContainer';
import Breadcrumbs from '../../components/Breadcrumbs';
import LoadingBackdrop from '../../components/LoadingBackdrop';
import * as agendamentoPacienteService from '../../api/agendamentoPaciente.service';
import {
  StatusAgendamento,
  StatusAgendamentoLabels,
  StatusAgendamentoColors,
  TipoAtendimentoLabels,
  PrioridadeLabels,
} from '../../api/agendamentoPaciente.dto';
import type { AgendamentoPacienteResponse } from '../../api/agendamentoPaciente.dto';

export default function AgendamentoPacienteView() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [agendamento, setAgendamento] = useState<AgendamentoPacienteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid) {
      setError('UUID do agendamento não fornecido');
      setLoading(false);
      return;
    }

    const fetchAgendamento = async () => {
      try {
        setLoading(false);
        const data = await agendamentoPacienteService.obterPorUuid(uuid);
        setAgendamento(data);
      } catch (err) {
        console.error('Erro ao buscar agendamento:', err);
        setError('Erro ao carregar agendamento');
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamento();
  }, [uuid]);

  if (loading) {
    return <LoadingBackdrop />;
  }

  if (error || !agendamento) {
    return (
      <AnimatedPage>
        <PageContainer>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Agendamento não encontrado'}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/agendamentos/pacientes')}
          >
            Voltar
          </Button>
        </PageContainer>
      </AnimatedPage>
    );
  }

  const canEdit =
    agendamento.status !== StatusAgendamento.CANCELADO &&
    agendamento.status !== StatusAgendamento.CONCLUIDO;

  return (
    <AnimatedPage>
      <PageContainer>
        <Breadcrumbs
          items={[
            { label: 'Agendamentos de Pacientes', path: '/agendamentos/pacientes' },
            { label: 'Visualizar Agendamento' },
          ]}
        />

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Detalhes do Agendamento
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Informações completas do agendamento de paciente
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/agendamentos/pacientes')}
            >
              Voltar
            </Button>
            {canEdit && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/agendamentos/pacientes/${uuid}/editar`)}
              >
                Editar
              </Button>
            )}
          </Box>
        </Box>

        <Card>
          <CardContent>
            {/* Status e Informações Gerais */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informações Gerais
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={StatusAgendamentoLabels[agendamento.status as StatusAgendamento]}
                    color={StatusAgendamentoColors[agendamento.status as StatusAgendamento]}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    UUID
                  </Typography>
                  <Typography variant="body1">{agendamento.uuid}</Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Dados do Paciente */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Paciente
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nome
                  </Typography>
                  <Typography variant="body1">{agendamento.pacienteNome}</Typography>
                </Grid>
                {agendamento.quartoNome && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Quarto
                    </Typography>
                    <Typography variant="body1">{agendamento.quartoNome}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Serviço e Profissional */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Serviço e Profissional
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tipo de Serviço
                  </Typography>
                  <Typography variant="body1">{agendamento.tipoServicoNome}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    Profissional
                  </Typography>
                  <Typography variant="body1">{agendamento.profissionalNome}</Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Data e Horário */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Data e Horário
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Data/Hora Início
                  </Typography>
                  <Typography variant="body1">
                    {new Date(agendamento.dataHoraInicio).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Data/Hora Fim
                  </Typography>
                  <Typography variant="body1">
                    {new Date(agendamento.dataHoraFim).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Duração
                  </Typography>
                  <Typography variant="body1">
                    {Math.round(
                      (new Date(agendamento.dataHoraFim).getTime() -
                        new Date(agendamento.dataHoraInicio).getTime()) /
                        (1000 * 60)
                    )}{' '}
                    minutos
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Detalhes do Atendimento */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Detalhes do Atendimento
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Tipo de Atendimento
                  </Typography>
                  <Typography variant="body1">
                    {agendamento.tipoAtendimento
                      ? TipoAtendimentoLabels[agendamento.tipoAtendimento]
                      : '—'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Prioridade
                  </Typography>
                  <Typography variant="body1">
                    {agendamento.prioridade ? PrioridadeLabels[agendamento.prioridade] : '—'}
                  </Typography>
                </Grid>
                {agendamento.geradoAutomaticamente && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Geração Automática
                    </Typography>
                    <Typography variant="body1">
                      {agendamento.motivoGeracaoAutomatica || 'Sim'}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Observações */}
            {agendamento.observacoes && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Observações
                  </Typography>
                  <Typography variant="body1">{agendamento.observacoes}</Typography>
                </Box>
              </>
            )}

            {/* Motivo de Cancelamento */}
            {agendamento.motivoCancelamento && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Motivo do Cancelamento
                  </Typography>
                  <Alert severity="error">{agendamento.motivoCancelamento}</Alert>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </AnimatedPage>
  );
}
