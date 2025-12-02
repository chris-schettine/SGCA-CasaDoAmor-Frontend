import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TablePagination,
  Chip,
  Box,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  ExitToApp as ExitIcon,
  SwapHoriz as TransferIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
// Using native Date methods instead of date-fns
import { hospedagemService } from '../../../api/hospedagem.service';
import type { HospedagemDTO, HospedagemPageParams } from '../../../api/hospedagem.dto';
import { usePermissions } from '../../../hooks/usePermissions';
import ConfirmationDialog from '../../ConfirmationDialog';
import ExitModal from '../../Modals/ExitModal';
import TransferModal from '../../Modals/TransferModal';

interface TableHospedagensProps {
  pacienteNome?: string;
  quartoNome?: string;
  ala?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  refreshKey?: number;
  onRefresh?: () => void;
}

export default function TableHospedagens({
  pacienteNome,
  quartoNome,
  ala,
  status,
  dataInicio,
  dataFim,
  refreshKey,
  onRefresh,
}: TableHospedagensProps) {
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();

  const [hospedagens, setHospedagens] = useState<HospedagemDTO[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modals and dialogs
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHospedagem, setSelectedHospedagem] = useState<HospedagemDTO | null>(null);

  // Reset page when filters change
  useEffect(() => {
    if (typeof refreshKey === 'number' && refreshKey > 0) {
      setPage(0);
    }
  }, [refreshKey]);

  useEffect(() => {
    fetchHospedagens();
  }, [page, rowsPerPage, refreshKey]);

  const fetchHospedagens = async () => {
    setLoading(true);
    try {
      const params: HospedagemPageParams = {
        page,
        size: rowsPerPage,
      };

      if (pacienteNome) params.pacienteNome = pacienteNome;
      if (quartoNome) params.quartoNome = quartoNome;
      if (ala) params.ala = ala;
      if (status) params.status = status as any;
      if (dataInicio) params.dataInicio = dataInicio;
      if (dataFim) params.dataFim = dataFim;

      const response = await hospedagemService.listar(params);
      console.log('📋 Setting hospedagens to display:', response.content);
      console.log('📊 Total elements from backend:', response.totalElements);
      setHospedagens(response.content);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Error fetching hospedagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = (uuid: string) => {
    navigate(`/hospedagens/${uuid}`);
  };

  const handleExitClick = (hospedagem: HospedagemDTO) => {
    setSelectedHospedagem(hospedagem);
    setExitModalOpen(true);
  };

  const handleTransferClick = (hospedagem: HospedagemDTO) => {
    setSelectedHospedagem(hospedagem);
    setTransferModalOpen(true);
  };

  const handleDeleteClick = (hospedagem: HospedagemDTO) => {
    setSelectedHospedagem(hospedagem);
    setDeleteDialogOpen(true);
  };

  const handleExitSuccess = () => {
    setExitModalOpen(false);
    setSelectedHospedagem(null);
    if (onRefresh) onRefresh();
  };

  const handleTransferSuccess = () => {
    setTransferModalOpen(false);
    setSelectedHospedagem(null);
    if (onRefresh) onRefresh();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedHospedagem) return;
    try {
      await hospedagemService.deletar(selectedHospedagem.uuid);
      setDeleteDialogOpen(false);
      setSelectedHospedagem(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting hospedagem:', error);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateStr?: string | null) => {
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
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white !important', WebkitTextFillColor: 'white !important' }}>
                Paciente
              </TableCell>
              <TableCell sx={{ color: 'white !important', WebkitTextFillColor: 'white !important' }}>
                Quarto
              </TableCell>
              <TableCell sx={{ color: 'white !important', WebkitTextFillColor: 'white !important' }}>
                Data Entrada
              </TableCell>
              <TableCell sx={{ color: 'white !important', WebkitTextFillColor: 'white !important' }}>
                Previsão Saída
              </TableCell>
              <TableCell sx={{ color: 'white !important', WebkitTextFillColor: 'white !important' }}>
                Status
              </TableCell>
              <TableCell sx={{ color: 'white !important', WebkitTextFillColor: 'white !important' }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Carregando...</TableCell>
              </TableRow>
            ) : hospedagens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Nenhuma hospedagem encontrada</TableCell>
              </TableRow>
            ) : (
              hospedagens.map((hospedagem) => (
                <TableRow key={hospedagem.uuid} hover>
                  <TableCell>{hospedagem.pacienteNome}</TableCell>
                  <TableCell>{hospedagem.quartoNome || '-'}</TableCell>
                  <TableCell>{formatDate(hospedagem.dataEntrada)}</TableCell>
                  <TableCell>{formatDate(hospedagem.dataSaidaPrevista)}</TableCell>
                  <TableCell>{getStatusChip(hospedagem.status)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Visualizar">
                        <IconButton
                          color="primary"
                          onClick={() => handleViewClick(hospedagem.uuid)}
                          size="small"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && hospedagem.status === 'ATIVA' && (
                        <>
                          <Tooltip title="Registrar Saída">
                            <IconButton
                              color="success"
                              onClick={() => handleExitClick(hospedagem)}
                              size="small"
                            >
                              <ExitIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Transferir">
                            <IconButton
                              color="info"
                              onClick={() => handleTransferClick(hospedagem)}
                              size="small"
                            >
                              <TransferIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {isAdmin && (
                        <Tooltip title="Excluir">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(hospedagem)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>

      {/* Exit Modal */}
      {selectedHospedagem && (
        <ExitModal
          open={exitModalOpen}
          hospedagem={selectedHospedagem}
          onClose={() => setExitModalOpen(false)}
          onSuccess={handleExitSuccess}
        />
      )}

      {/* Transfer Modal */}
      {selectedHospedagem && (
        <TransferModal
          open={transferModalOpen}
          hospedagem={selectedHospedagem}
          onClose={() => setTransferModalOpen(false)}
          onSuccess={handleTransferSuccess}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Excluir Hospedagem"
        message={`Tem certeza que deseja excluir a hospedagem de ${selectedHospedagem?.pacienteNome}?`}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}
