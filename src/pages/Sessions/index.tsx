import { Suspense, startTransition, useEffect, useMemo, useOptimistic, useState } from 'react';
import { Button, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Box, useMediaQuery, useTheme, lighten } from '@mui/material';
import { isAxiosError } from 'axios';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { authService } from '../../api/auth.service';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import { TableSkeleton } from '../../components/SuspenseWrapper';
import { formatISOToLocalDateTime } from '../../utils/formatters';
import MobileCard from '../../components/Table/MobileCard';
import { toastError, toastSuccess } from '../../utils/toast';
import type { SessaoAuditDTO } from '../../api/auth.dto';
import { sessionKeys } from '../../api/queries';
import { usePermissions } from '../../hooks/usePermissions';

const MotionBox = motion.create(Box);

const SessionsContent = () => {
  const { isAdmin } = usePermissions();
  const theme = useTheme();
  const isNarrowDesktop = useMediaQuery(theme.breakpoints.down('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const prefersReducedMotion = useReducedMotion();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery({
    queryKey: sessionKeys.list(),
    queryFn: () => authService.listSessions(),
    staleTime: 60_000,
  });

  const baseSessions = useMemo(() => data?.sessoes || [], [data?.sessoes]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [optimisticSessions, setOptimisticSessions] = useOptimistic(
    baseSessions,
    (state, action: { type: 'remove'; id: number } | { type: 'reset'; sessions: SessaoAuditDTO[] }) => {
      if (action.type === 'remove') {
        return state.filter((session) => session.id !== action.id);
      }
      if (action.type === 'reset') {
        return action.sessions;
      }
      return state;
    }
  );

  useEffect(() => {
    startTransition(() => {
      setOptimisticSessions({ type: 'reset', sessions: baseSessions });
    });
  }, [baseSessions, setOptimisticSessions]);

  const fadeProps = prefersReducedMotion ? {} : {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.25 },
  };

  const cardLayoutProps = prefersReducedMotion ? {} : {
    layout: true as const,
    transition: { type: 'spring' as const, stiffness: 300, damping: 28 },
  };

  // Increase lightness for success chip backgrounds in light mode so text remains legible and green feels softer
  const successBg = theme.palette.mode === 'light' ? lighten(theme.palette.success.main, 0.6) : theme.palette.success.main;
  const primaryBg = theme.palette.mode === 'light' ? lighten(theme.palette.primary.main, 0.34) : theme.palette.primary.main;
  const revokeBg = theme.palette.mode === 'light' ? lighten(theme.palette.error.main, 0.42) : theme.palette.error.main;

  const handleRevokeClick = (id: number) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  if (!isAdmin) {
    return <Navigate to="/patients" replace />;
  }

  const handleConfirmRevoke = async () => {
    if (!selectedId) return;
    setIsRevoking(true);

    startTransition(() => {
      setOptimisticSessions({ type: 'remove', id: selectedId });
    });

    try {
      await authService.revokeSession(selectedId);
      toastSuccess('Sessão revogada com sucesso');
      setConfirmOpen(false);
      setSelectedId(null);
      await queryClient.invalidateQueries({ queryKey: sessionKeys.list() });
    } catch (err: unknown) {
      console.error('Erro ao revogar sessão', err);
      const message = isAxiosError(err)
        ? err.response?.status === 403
          ? 'Você não tem permissão para revogar esta sessão.'
          : err.response?.data?.message ?? 'Erro ao revogar sessão'
        : 'Erro ao revogar sessão';
      toastError(message);
    } finally {
      setIsRevoking(false);
      startTransition(() => {
        setOptimisticSessions({ type: 'reset', sessions: baseSessions });
      });
    }
  };

  return (
    <>
      <Breadcrumbs items={[
        { label: 'Sessões Ativas' }
      ]} />
      
      <PageHeader 
        title="Sessões Ativas"
        subtitle="Visualização e gerenciamento de sessões ativas no sistema"
      />

      <AnimatePresence mode="wait" initial={false}>
        {optimisticSessions.length === 0 ? (
          <MotionBox key="empty" {...fadeProps}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                <Chip label="Sem sessões ativas" color="default" />
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  Não encontramos sessões ativas no momento.
                </Box>
                <Button variant="outlined" onClick={() => queryClient.invalidateQueries({ queryKey: sessionKeys.list() })} size="small">
                  Recarregar
                </Button>
              </Box>
            </Paper>
          </MotionBox>
        ) : isTablet ? (
          <MotionBox key="mobile-list" sx={{ mt: 2 }} {...fadeProps}>
            {optimisticSessions.map(s => (
              <MotionBox
                key={s.id}
                {...cardLayoutProps}
              >
                <MobileCard
                  isLoading={false}
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
                      disabled={s.atual || isRevoking}
                      data-testid={`btn-revoke-session-${s.id}`}
                      aria-label={`Revogar sessão de ${s.usuario?.nome || 'usuário'}`}
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
              </MotionBox>
            ))}
          </MotionBox>
        ) : (
          <MotionBox key="desktop-table" {...fadeProps}>
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table
                size={isNarrowDesktop ? 'small' : 'medium'}
                sx={{
                  '& .MuiTableCell-root': {
                    padding: isNarrowDesktop ? theme.spacing(1) : theme.spacing(1.5),
                    fontSize: isNarrowDesktop ? '0.85rem' : '0.95rem',
                  },
                  '& thead .MuiTableCell-root': {
                    padding: theme.spacing(2),
                    fontSize: '0.84rem',
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
                    <TableCell align="center" sx={{ textAlign: 'center' }}>Status</TableCell>
                    <TableCell align="center" sx={{ textAlign: 'center' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {optimisticSessions.map(s => (
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
                      <TableCell align="center" sx={{ textAlign: 'center' }}>
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
                      <TableCell align="center" sx={{ textAlign: 'center' }}>
                        <Button 
                          variant="contained" 
                          color="error" 
                          size="small" 
                          onClick={() => handleRevokeClick(s.id)}
                          sx={{ mr: 1, backgroundColor: revokeBg, color: theme.palette.getContrastText(revokeBg), '&:hover': { backgroundColor: theme.palette.error.main }, '&.Mui-disabled': { backgroundColor: theme.palette.action.disabledBackground, color: theme.palette.action.disabled } }}
                          disabled={s.atual || isRevoking}
                          data-testid={`btn-revoke-session-${s.id}`}
                          aria-label={`Revogar sessão de ${s.usuario?.nome || 'usuário'}`}
                        >
                          Revogar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </MotionBox>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => { if (!isRevoking) setConfirmOpen(false); }}
        onConfirm={handleConfirmRevoke}
        title="Confirmar revogação"
        message={`Tem certeza que deseja revogar a sessão ${selectedId}? Isso encerrará a sessão do usuário.`}
        confirmButtonText={isRevoking ? 'Revogando...' : 'Revogar'}
        cancelButtonText="Cancelar"
        confirmButtonProps={{ disabled: isRevoking }}
        dialogTitleId="confirm-revoke-title"
      />
    </>
  );
};

const SessionsPage = () => (
  <Container sx={{ mt: 3 }}>
    <Suspense fallback={<TableSkeleton rows={8} />}>
      <SessionsContent />
    </Suspense>
  </Container>
);

export default SessionsPage;
