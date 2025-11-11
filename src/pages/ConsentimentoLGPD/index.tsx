import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PageHeader from '../../components/PageHeader';
import ConsentimentoForm from '../../components/ConsentimentoForm';
import { useConsentimentos } from '../../hooks/useConsentimento';
import { useAuth } from '../../hooks/useAuth';

const ConsentimentoLGPDPage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);

  // Assumindo que o UUID do profissional está disponível no contexto de autenticação
  // Ajuste conforme a estrutura real do seu user object
  const profissionalUuid = (user as any)?.uuid || '';

  const {
    data: consentimentosData,
    isLoading,
    error,
    refetch,
  } = useConsentimentos(profissionalUuid, {
    page,
    size: rowsPerPage,
    sort: ['dataConsentimento,desc'],
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSuccess = () => {
    handleCloseDialog();
    refetch();
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} às ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  if (!profissionalUuid) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Não foi possível identificar o profissional. Por favor, faça login novamente.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: { xs: '100%', sm: '95%', md: '90%' },
        margin: '0 auto',
        py: { xs: 2, sm: 3 },
        px: { xs: 1, sm: 2 },
      }}
    >
      <PageHeader
        title="Consentimentos LGPD"
        subtitle="Gerencie seus consentimentos para tratamento de dados pessoais"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Novo Consentimento
          </Button>
        }
      />

      <Paper elevation={2} sx={{ mt: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">
              Erro ao carregar consentimentos. Por favor, tente novamente.
            </Alert>
          </Box>
        ) : !consentimentosData?.content || consentimentosData.content.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum consentimento registrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Clique em "Novo Consentimento" para registrar seu primeiro consentimento LGPD
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data/Hora</TableCell>
                    <TableCell>Versão</TableCell>
                    <TableCell>Escopo</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>IP Origem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {consentimentosData.content.map((consentimento) => (
                    <TableRow key={consentimento.id} hover>
                      <TableCell>{formatDateTime(consentimento.dataConsentimento)}</TableCell>
                      <TableCell>
                        <Chip label={consentimento.versaoTermo} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{consentimento.escopo}</TableCell>
                      <TableCell>
                        {consentimento.concorda ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Concordou"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<CancelIcon />}
                            label="Revogou"
                            color="error"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {consentimento.ipOrigem || '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={consentimentosData.totalElements}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Linhas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
              }
            />
          </>
        )}
      </Paper>

      {/* Dialog para Novo Consentimento */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={false}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Registrar Consentimento LGPD</Typography>
            <IconButton onClick={handleCloseDialog} edge="end" aria-label="fechar">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <ConsentimentoForm
            profissionalUuid={profissionalUuid}
            onSuccess={handleSuccess}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ConsentimentoLGPDPage;
