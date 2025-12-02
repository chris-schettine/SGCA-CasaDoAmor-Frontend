import { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { AnimatedPage } from '../../components/AnimatedPage';
import PageContainer from '../../components/PageContainer';
import Breadcrumbs from '../../components/Breadcrumbs';
import PageHeader from '../../components/PageHeader';
import TableAgendamentosPacientes from '../../components/Table/TableAgendamentosPacientes';
import LoadingBackdrop from '../../components/LoadingBackdrop';
import * as agendamentoPacienteService from '../../api/agendamentoPaciente.service';
import type { AgendamentoPacienteResponse } from '../../api/agendamentoPaciente.dto';

export default function AgendamentosPacientes() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [agendamentos, setAgendamentos] = useState<AgendamentoPacienteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');

  const fetchAgendamentos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await agendamentoPacienteService.listar();
      setAgendamentos(data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const handleCancelClick = (uuid: string) => {
    setSelectedUuid(uuid);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedUuid || !motivoCancelamento.trim()) {
      return;
    }

    try {
      await agendamentoPacienteService.cancelar(selectedUuid, motivoCancelamento);
      setCancelDialogOpen(false);
      setMotivoCancelamento('');
      setSelectedUuid(null);
      // Refresh list
      fetchAgendamentos();
    } catch (err) {
      console.error('Error canceling appointment:', err);
      setError('Erro ao cancelar agendamento');
    }
  };

  const handleView = (uuid: string) => {
    navigate(`/agendamentos/pacientes/${uuid}`);
  };

  const handleEdit = (uuid: string) => {
    navigate(`/agendamentos/pacientes/${uuid}/editar`);
  };

  return (
    <AnimatedPage>
      <PageContainer>
        <Breadcrumbs items={[{ label: 'Agendamentos de Pacientes' }]} />

        <PageHeader
          title="Agendamentos de Pacientes"
          subtitle="Gestão de agendamentos e consultas de pacientes"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/agendamentos/pacientes/novo')}
              sx={{
                backgroundColor: `${theme.palette.primary.main} !important`,
                color: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
                WebkitTextFillColor: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
                fontWeight: 600,
                '&:hover': { backgroundColor: `${theme.palette.primary.dark} !important` },
              }}
            >
              Novo Agendamento
            </Button>
          }
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TableAgendamentosPacientes
          agendamentos={agendamentos}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onCancel={handleCancelClick}
        />

        {loading && <LoadingBackdrop />}

        {/* Cancel Dialog */}
        <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Cancelar Agendamento</DialogTitle>
          <DialogContent>
            <TextField
              label="Motivo do Cancelamento"
              multiline
              rows={4}
              fullWidth
              value={motivoCancelamento}
              onChange={(e) => setMotivoCancelamento(e.target.value)}
              placeholder="Informe o motivo do cancelamento (mínimo 10 caracteres)"
              required
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleCancelConfirm}
              color="error"
              variant="contained"
              disabled={motivoCancelamento.trim().length < 10}
            >
              Confirmar Cancelamento
            </Button>
          </DialogActions>
        </Dialog>
      </PageContainer>
    </AnimatedPage>
  );
}
