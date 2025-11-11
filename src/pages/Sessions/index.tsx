import { useEffect, useState } from 'react';
import { Button, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Snackbar, Alert, Box, useMediaQuery, useTheme } from '@mui/material';
import { authService } from '../../api/auth.service';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import PageHeader from '../../components/PageHeader';
import LoadingState from '../../components/LoadingState';
import { formatISOToLocalDateTime } from '../../utils/formatters';
import MobileCard from '../../components/Table/MobileCard';

interface SessaoDTO {
  id: number;
  ipOrigem: string;
  userAgent: string;
  criadoEm: string;
  expiraEm: string;
  ativo: boolean;
  atual: boolean;
  usuario?: {
    id: number;
    nome: string;
    email: string;
    cpf: string;
    tipo: string;
  };
}

const SessionsPage = () => {
  const [sessions, setSessions] = useState<SessaoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success'|'error'|'info'|'warning'>('success');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const resp = await authService.listSessions();
      // resp tem o shape { totalSessoes, sessoes }
      setSessions(resp.sessoes || []);
    } catch (err: any) {
      console.error('Erro ao buscar sessões', err);
      setSnackbarMessage(err?.response?.data?.message || 'Erro ao buscar sessões');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleRevokeClick = (id: number) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  const handleConfirmRevoke = async () => {
    if (!selectedId) return;
    try {
      await authService.revokeSession(selectedId);
      setSnackbarMessage('Sessão revogada com sucesso');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setConfirmOpen(false);
      setSelectedId(null);
      // refresh
      await fetchSessions();
    } catch (err: any) {
      console.error('Erro ao revogar sessão', err);
      setSnackbarMessage(err?.response?.data?.message || 'Erro ao revogar sessão');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <Container sx={{ mt: 3 }}>
      <PageHeader 
        title="Sessões Ativas"
        subtitle="Gerencie as sessões ativas do sistema"
      />

      {loading ? (
        <LoadingState message="Carregando sessões..." />
      ) : isMobile ? (
        <Box sx={{ mt: 2 }}>
          {sessions.map(s => (
            <MobileCard
              key={s.id}
              title={s.usuario?.nome || 'Usuário'}
              subtitle={`CPF: ${s.usuario?.cpf || '-'}`}
              fields={[
                { label: 'IP Origem', value: s.ipOrigem || '-' },
                { label: 'Criado Em', value: formatISOToLocalDateTime(s.criadoEm) || s.criadoEm },
                { label: 'Expira Em', value: formatISOToLocalDateTime(s.expiraEm) || s.expiraEm },
                { 
                  label: 'Status', 
                  value: (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {s.ativo ? <Chip label="Ativo" color="success" size="small" /> : <Chip label="Inativo" size="small" />}
                      {s.atual && <Chip label="Atual" color="primary" size="small" />}
                    </Box>
                  )
                },
              ]}
              actions={
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small" 
                  onClick={() => handleRevokeClick(s.id)} 
                  disabled={s.atual}
                  fullWidth
                >
                  Revogar
                </Button>
              }
            />
          ))}
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>CPF</TableCell>
                <TableCell>IP Origem</TableCell>
                <TableCell>User Agent</TableCell>
                <TableCell>Criado Em</TableCell>
                <TableCell>Expira Em</TableCell>
                <TableCell>Ativo</TableCell>
                <TableCell>Atual</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.usuario?.nome || '-'}</TableCell>
                  <TableCell>{s.usuario?.cpf || '-'}</TableCell>
                  <TableCell>{s.ipOrigem || '-'}</TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.userAgent || '-'}</TableCell>
                  <TableCell>{formatISOToLocalDateTime(s.criadoEm) || s.criadoEm}</TableCell>
                  <TableCell>{formatISOToLocalDateTime(s.expiraEm) || s.expiraEm}</TableCell>
                  <TableCell>{s.ativo ? <Chip label="Sim" color="success" size="small" /> : <Chip label="Não" size="small" />}</TableCell>
                  <TableCell>{s.atual ? <Chip label="Sim" color="primary" size="small" /> : <Chip label="Não" size="small" />}</TableCell>
                  <TableCell>
                    <Button variant="outlined" color="error" size="small" onClick={() => handleRevokeClick(s.id)} sx={{ mr: 1 }} disabled={s.atual}>
                      Revogar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmRevoke}
        title="Confirmar revogação"
        message={`Tem certeza que deseja revogar a sessão ${selectedId}? Isso encerrará a sessão do usuário.`}
        confirmButtonText="Revogar"
        cancelButtonText="Cancelar"
      />

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMessage}</Alert>
      </Snackbar>
    </Container>
  );
};

export default SessionsPage;
