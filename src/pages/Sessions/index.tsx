import { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Chip, Snackbar, Alert } from '@mui/material';
import { authService } from '../../api/auth.service';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { formatISOToLocalDateTime } from '../../utils/formatters';

interface SessaoDTO {
  id: number;
  ipOrigem: string;
  userAgent: string;
  criadoEm: string;
  expiraEm: string;
  ativo: boolean;
  atual: boolean;
}

const SessionsPage = () => {
  const [sessions, setSessions] = useState<SessaoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success'|'error'|'info'|'warning'>('success');

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const resp = await authService.listSessions();
      setSessions(resp);
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
      <Typography variant="h4" sx={{ mb: 2 }}>Sessões Ativas</Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
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

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMessage}</Alert>
      </Snackbar>
    </Container>
  );
};

export default SessionsPage;
