import { useEffect, useState } from 'react';
import { Button, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Box, useMediaQuery, useTheme, lighten } from '@mui/material';
import { isAxiosError } from 'axios';
import { authService } from '../../api/auth.service';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import PageHeader from '../../components/PageHeader';
import LoadingState from '../../components/LoadingState';
import { formatISOToLocalDateTime } from '../../utils/formatters';
import MobileCard from '../../components/Table/MobileCard';
import { toastError, toastSuccess } from '../../utils/toast';
import type { SessaoAuditDTO } from '../../api/auth.dto';

const SessionsPage = () => {
  const [sessions, setSessions] = useState<SessaoAuditDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  const theme = useTheme();
  const isNarrowDesktop = useMediaQuery(theme.breakpoints.down('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Increase lightness for success chip backgrounds in light mode so text remains legible and green feels softer
  const successBg = theme.palette.mode === 'light' ? lighten(theme.palette.success.main, 0.6) : theme.palette.success.main;
  const primaryBg = theme.palette.mode === 'light' ? lighten(theme.palette.primary.main, 0.34) : theme.palette.primary.main;
  const revokeBg = theme.palette.mode === 'light' ? lighten(theme.palette.error.main, 0.42) : theme.palette.error.main;

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const resp = await authService.listSessions();
      // resp tem o shape { totalSessoes, sessoes }
      setSessions(resp.sessoes || []);
    } catch (err: unknown) {
      console.error('Erro ao buscar sessões', err);
      const message = isAxiosError(err)
        ? err.response?.data?.message ?? 'Erro ao buscar sessões'
        : 'Erro ao buscar sessões';
      toastError(message);
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
      toastSuccess('Sessão revogada com sucesso');
      setConfirmOpen(false);
      setSelectedId(null);
      // refresh
      await fetchSessions();
    } catch (err: unknown) {
      console.error('Erro ao revogar sessão', err);
      const message = isAxiosError(err)
        ? err.response?.data?.message ?? 'Erro ao revogar sessão'
        : 'Erro ao revogar sessão';
      toastError(message);
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
      ) : isTablet ? (
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
                  label: 'User Agent', 
                  value: <Box component="span" sx={{ wordBreak: 'break-word' }}>{s.userAgent || '-'}</Box>,
                  hidden: isMobile,
                },
                { 
                  label: 'Status', 
                  value: (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {s.ativo ? (
                        <Chip
                          label="Ativo"
                          size="small"
                          sx={{
                            backgroundColor: successBg,
                            color: theme.palette.getContrastText(successBg),
                          }}
                        />
                      ) : (
                        <Chip label="Inativo" size="small" />
                      )}
                      {s.atual && (
                        <Chip
                          label="Atual"
                          size="small"
                          sx={{
                            backgroundColor: primaryBg,
                            color: theme.palette.getContrastText(primaryBg),
                          }}
                        />
                      )}
                    </Box>
                  )
                },
              ]}
              actions={
                <Button 
                  variant="contained" 
                  color="error" 
                  size="small" 
                  onClick={() => handleRevokeClick(s.id)} 
                  disabled={s.atual}
                  fullWidth
                  sx={{
                    backgroundColor: revokeBg,
                    color: theme.palette.getContrastText(revokeBg),
                    '&:hover': { backgroundColor: theme.palette.error.main },
                    '&.Mui-disabled': { backgroundColor: theme.palette.action.disabledBackground, color: theme.palette.action.disabled }
                  }}
                >
                  Revogar
                </Button>
              }
            />
          ))}
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table
            size={isNarrowDesktop ? 'small' : 'medium'}
            sx={{
              '& .MuiTableCell-root': {
                padding: isNarrowDesktop ? theme.spacing(1) : theme.spacing(1.5),
                fontSize: isNarrowDesktop ? '0.9rem' : '1rem',
              },
              '& thead .MuiTableCell-root': {
                padding: theme.spacing(2),
                fontSize: '0.875rem',
                fontWeight: 600,
                lineHeight: 1.6,
              },
            }}
          >
            <TableHead>
              <TableRow>
                {!isNarrowDesktop && <TableCell>ID</TableCell>}
                <TableCell>Nome</TableCell>
                <TableCell>CPF</TableCell>
                <TableCell>Conexão</TableCell>
                <TableCell>Criado Em</TableCell>
                <TableCell>Expira Em</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map(s => (
                <TableRow key={s.id}>
                  {!isNarrowDesktop && <TableCell>{s.id}</TableCell>}
                  <TableCell>{s.usuario?.nome || '-'}</TableCell>
                  <TableCell>{s.usuario?.cpf || '-'}</TableCell>
                  <TableCell sx={{ maxWidth: isNarrowDesktop ? 260 : 340 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {s.ipOrigem || '-'}
                      </Box>
                      <Box
                        component="span"
                        title={s.userAgent || '-'}
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordBreak: 'break-word',
                          lineHeight: 1.3,
                        }}
                      >
                        {s.userAgent || '-'}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{formatISOToLocalDateTime(s.criadoEm) || s.criadoEm}</TableCell>
                  <TableCell>{formatISOToLocalDateTime(s.expiraEm) || s.expiraEm}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', justifyContent: 'center' }}>
                      {s.ativo ? (
                        <Chip label="Ativo" size="small" sx={{ backgroundColor: successBg, color: theme.palette.getContrastText(successBg) }} />
                      ) : (
                        <Chip label="Inativo" size="small" />
                      )}
                      {s.atual && (
                        <Chip label="Atual" size="small" sx={{ backgroundColor: primaryBg, color: theme.palette.getContrastText(primaryBg) }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => handleRevokeClick(s.id)}
                      sx={{ mr: 1, backgroundColor: revokeBg, color: theme.palette.getContrastText(revokeBg), '&:hover': { backgroundColor: theme.palette.error.main }, '&.Mui-disabled': { backgroundColor: theme.palette.action.disabledBackground, color: theme.palette.action.disabled } }}
                      disabled={s.atual}
                    >
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
    </Container>
  );
};

export default SessionsPage;
