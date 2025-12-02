import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ExitToApp as ExitIcon,
  SwapHoriz as TransferIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
// Using native Date methods instead of date-fns
import { hospedagemService } from '../../api/hospedagem.service';
import type { HospedagemDTO } from '../../api/hospedagem.dto';
import { usePermissions } from '../../hooks/usePermissions';
import ExitModal from '../../components/Modals/ExitModal';
import TransferModal from '../../components/Modals/TransferModal';

export default function HospedagemInformation() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();

  const [hospedagem, setHospedagem] = useState<HospedagemDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  useEffect(() => {
    if (uuid) {
      loadHospedagem(uuid);
    }
  }, [uuid]);

  const loadHospedagem = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await hospedagemService.buscarPorUuid(id);
      setHospedagem(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar hospedagem');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateOnly = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const getStatusChip = (status: string) => {
    const configs = {
      ATIVA: { label: 'Ativa', color: 'success' as const },
      ENCERRADA: { label: 'Encerrada', color: 'default' as const },
      TRANSFERIDA: { label: 'Transferida', color: 'info' as const },
    };
    const config = configs[status as keyof typeof configs] || { label: status, color: 'default' as const };
    return <Chip label={config.label} color={config.color} />;
  };

  const handleRefresh = () => {
    if (uuid) {
      loadHospedagem(uuid);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !hospedagem) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="error">{error || 'Hospedagem não encontrada'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/hospedagens')}
          sx={{ mt: 2 }}
        >
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/hospedagens')}
            sx={{ mb: 1 }}
          >
            Voltar
          </Button>
          <Typography variant="h4" component="h1">
            Informações da Hospedagem
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {hospedagem.pacienteNome}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {getStatusChip(hospedagem.status)}
        </Box>
      </Box>

      <Paper sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informações do Paciente
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Nome
            </Typography>
            <Typography variant="body1">{hospedagem.pacienteNome}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              CPF
            </Typography>
            <Typography variant="body1">{hospedagem.pacienteCpf}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              UUID do Paciente
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-all', fontSize: '0.875rem' }}>
              {hospedagem.pacienteId || '-'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informações do Quarto
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Quarto
            </Typography>
            <Typography variant="body1">{hospedagem.quartoNome || 'Não especificado'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Código do Quarto
            </Typography>
            <Typography variant="body1">{hospedagem.quartoCodigo || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              UUID do Quarto
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-all', fontSize: '0.875rem' }}>
              {hospedagem.quartoUuid || '-'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ padding: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Datas e Status
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Data de Entrada
            </Typography>
            <Typography variant="body1">{formatDateOnly(hospedagem.dataEntrada)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Hora de Entrada
            </Typography>
            <Typography variant="body1">{hospedagem.horaEntrada || '-'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Previsão de Saída
            </Typography>
            <Typography variant="body1">{formatDateOnly(hospedagem.dataSaidaPrevista)}</Typography>
          </Grid>
          {hospedagem.dataSaida && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Data de Saída
                </Typography>
                <Typography variant="body1">{formatDateOnly(hospedagem.dataSaida)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Hora de Saída
                </Typography>
                <Typography variant="body1">{hospedagem.horaSaida || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Motivo da Saída
                </Typography>
                <Typography variant="body1">{hospedagem.motivoSaida || '-'}</Typography>
              </Grid>
            </>
          )}
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            <Box sx={{ mt: 0.5 }}>{getStatusChip(hospedagem.status)}</Box>
          </Grid>
        </Grid>
      </Paper>

      {(hospedagem.observacoesEntrada || hospedagem.observacoesSaida || hospedagem.observacoesGerais) && (
        <Paper sx={{ padding: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Observações
          </Typography>
          {hospedagem.observacoesEntrada && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Observações de Entrada
              </Typography>
              <Typography variant="body1">{hospedagem.observacoesEntrada}</Typography>
            </Box>
          )}
          {hospedagem.observacoesSaida && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Observações de Saída
              </Typography>
              <Typography variant="body1">{hospedagem.observacoesSaida}</Typography>
            </Box>
          )}
          {hospedagem.observacoesGerais && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Observações Gerais
              </Typography>
              <Typography variant="body1">{hospedagem.observacoesGerais}</Typography>
            </Box>
          )}
        </Paper>
      )}

      <Paper sx={{ padding: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informações de Auditoria
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Criado em
            </Typography>
            <Typography variant="body1">{formatDate(hospedagem.createdAt)}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Criado por
            </Typography>
            <Typography variant="body1">{hospedagem.createdByNome || '-'}</Typography>
          </Grid>
          {hospedagem.updatedAt && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Atualizado em
                </Typography>
                <Typography variant="body1">{formatDate(hospedagem.updatedAt)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Atualizado por
                </Typography>
                <Typography variant="body1">{hospedagem.updatedByNome || '-'}</Typography>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {isAdmin && hospedagem.status === 'ATIVA' && (
        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<ExitIcon />}
            onClick={() => setExitModalOpen(true)}
            sx={{
              color: 'white !important',
              WebkitTextFillColor: 'white !important',
            }}
          >
            Registrar Saída
          </Button>
          <Button
            variant="contained"
            color="info"
            startIcon={<TransferIcon />}
            onClick={() => setTransferModalOpen(true)}
            sx={{
              color: 'white !important',
              WebkitTextFillColor: 'white !important',
            }}
          >
            Transferir
          </Button>
        </Box>
      )}

      {/* Modals */}
      <ExitModal
        open={exitModalOpen}
        hospedagem={hospedagem}
        onClose={() => setExitModalOpen(false)}
        onSuccess={() => {
          setExitModalOpen(false);
          handleRefresh();
        }}
      />
      <TransferModal
        open={transferModalOpen}
        hospedagem={hospedagem}
        onClose={() => setTransferModalOpen(false)}
        onSuccess={() => {
          setTransferModalOpen(false);
          handleRefresh();
        }}
      />
    </Box>
  );
}
