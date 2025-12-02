import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
  TablePagination,
  Tooltip,
  useTheme,
} from '@mui/material';
import { Visibility, Edit, Delete, PersonOff, PersonAdd, Build, BuildCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { quartoService } from '../../../api/quarto.service';
import type { QuartoDTO } from '../../../api/quarto.dto';
import { usePermissions } from '../../../hooks/usePermissions';
import ConfirmationDialog from '../../ConfirmationDialog';
import { TableSkeleton } from '../../SuspenseWrapper';
import { toastSuccess, toastError } from '../../../utils/toast';

interface TableQuartosProps {
  searchText?: string;
  filterAla?: string;
  filterTipo?: string;
  filterStatus?: string;
}

const TableQuartos = ({ searchText = '', filterAla = '', filterTipo = '', filterStatus = '' }: TableQuartosProps) => {
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();
  const theme = useTheme();
  
  const [quartos, setQuartos] = useState<QuartoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inactivateDialogOpen, setInactivateDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [selectedQuarto, setSelectedQuarto] = useState<QuartoDTO | null>(null);

  const fetchQuartos = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        size: rowsPerPage,
        sort: ['nome,asc'],
      };

      // Backend search parameters
      if (searchText) {
        params.nome = searchText;
      }
      if (filterAla) {
        params.ala = filterAla;
      }
      if (filterTipo) {
        params.tipo = filterTipo;
      }
      if (filterStatus === 'ativo') {
        params.ativo = true;
      } else if (filterStatus === 'inativo') {
        params.ativo = false;
      }
      // Note: emManutencao filtering would need to be added to backend API

      const response = await quartoService.listar(params);
      setQuartos(response.content);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Erro ao carregar quartos:', error);
      toastError('Erro ao carregar lista de quartos');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchText, filterAla, filterTipo, filterStatus]);

  useEffect(() => {
    fetchQuartos();
  }, [fetchQuartos]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleView = (quarto: QuartoDTO) => {
    navigate(`/quartos/${quarto.uuid}`);
  };

  const handleEdit = (quarto: QuartoDTO) => {
    navigate(`/quartos/${quarto.uuid}/editar`);
  };

  const handleDeleteClick = (quarto: QuartoDTO) => {
    setSelectedQuarto(quarto);
    setDeleteDialogOpen(true);
  };

  const handleInactivateClick = (quarto: QuartoDTO) => {
    setSelectedQuarto(quarto);
    setInactivateDialogOpen(true);
  };

  const handleReactivateClick = (quarto: QuartoDTO) => {
    setSelectedQuarto(quarto);
    setReactivateDialogOpen(true);
  };

  const handleMaintenanceClick = (quarto: QuartoDTO) => {
    setSelectedQuarto(quarto);
    setMaintenanceDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedQuarto?.uuid) return;
    
    try {
      await quartoService.deletar(selectedQuarto.uuid);
      setDeleteDialogOpen(false);
      toastSuccess('Quarto excluído com sucesso.');
      fetchQuartos();
    } catch (error: any) {
      console.error('Erro ao deletar quarto:', error);
      const message = error?.response?.data?.message || 'Erro ao deletar quarto';
      toastError(message);
    }
  };

  const handleInactivate = async () => {
    if (!selectedQuarto?.uuid) return;
    
    try {
      await quartoService.inativar(selectedQuarto.uuid);
      setInactivateDialogOpen(false);
      toastSuccess('Quarto inativado com sucesso.');
      fetchQuartos();
    } catch (error: any) {
      console.error('Erro ao inativar quarto:', error);
      const message = error?.response?.data?.message || 'Erro ao inativar quarto';
      toastError(message);
    }
  };

  const handleReactivate = async () => {
    if (!selectedQuarto?.uuid) return;
    
    try {
      await quartoService.ativar(selectedQuarto.uuid);
      setReactivateDialogOpen(false);
      toastSuccess('Quarto reativado com sucesso.');
      fetchQuartos();
    } catch (error: any) {
      console.error('Erro ao reativar quarto:', error);
      const message = error?.response?.data?.message || 'Erro ao reativar quarto';
      toastError(message);
    }
  };

  const handleMaintenanceToggle = async () => {
    if (!selectedQuarto?.uuid) return;
    
    try {
      const newStatus = !selectedQuarto.emManutencao;
      await quartoService.toggleManutencao(selectedQuarto.uuid, newStatus);
      setMaintenanceDialogOpen(false);
      toastSuccess(`Quarto ${newStatus ? 'colocado em' : 'removido da'} manutenção com sucesso.`);
      fetchQuartos();
    } catch (error: any) {
      console.error('Erro ao alterar status de manutenção:', error);
      const message = error?.response?.data?.message || 'Erro ao alterar status de manutenção';
      toastError(message);
    }
  };

  const getStatusChip = (quarto: QuartoDTO) => {
    if (!quarto.ativo) {
      return <Chip label="Inativo" size="small" color="default" />;
    }
    if (quarto.emManutencao) {
      return <Chip label="Manutenção" size="small" color="warning" />;
    }
    return <Chip label="Ativo" size="small" color="success" />;
  };

  if (loading) {
    return <TableSkeleton rows={rowsPerPage} />;
  }

  if (!quartos || quartos.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Nenhum quarto encontrado.
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ color: '#FFFFFF !important', WebkitTextFillColor: '#FFFFFF !important' }}>Nome</TableCell>
              <TableCell align="center" sx={{ color: '#FFFFFF !important', WebkitTextFillColor: '#FFFFFF !important' }}>Ala</TableCell>
              <TableCell align="center" sx={{ color: '#FFFFFF !important', WebkitTextFillColor: '#FFFFFF !important' }}>Tipo</TableCell>
              <TableCell align="center" sx={{ color: '#FFFFFF !important', WebkitTextFillColor: '#FFFFFF !important' }}>Andar</TableCell>
              <TableCell align="center" sx={{ color: '#FFFFFF !important', WebkitTextFillColor: '#FFFFFF !important' }}>Capacidade</TableCell>
              <TableCell align="center" sx={{ color: '#FFFFFF !important', WebkitTextFillColor: '#FFFFFF !important' }}>Status</TableCell>
              <TableCell align="center" sx={{ color: '#FFFFFF !important', WebkitTextFillColor: '#FFFFFF !important' }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quartos.map((quarto) => (
              <TableRow key={quarto.uuid} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {quarto.nome}
                  </Typography>
                </TableCell>
                <TableCell>{quarto.ala.descricao}</TableCell>
                <TableCell>{quarto.tipo.descricao}</TableCell>
                <TableCell>{quarto.andar}</TableCell>
                <TableCell>
                  {quarto.capacidadeOcupada}/{quarto.capacidadeTotal}
                  {' '}
                  <Typography component="span" variant="caption" color="text.secondary">
                    ({quarto.vagasDisponiveis} {quarto.vagasDisponiveis === 1 ? 'vaga' : 'vagas'})
                  </Typography>
                </TableCell>
                <TableCell>{getStatusChip(quarto)}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Tooltip title="Visualizar">
                      <IconButton
                        size="small"
                        onClick={() => handleView(quarto)}
                        sx={{ color: theme.palette.info.main }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {isAdmin && (
                      <>
                        {quarto.ativo && (
                          <>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(quarto)}
                                sx={{ color: theme.palette.warning.main }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title={quarto.emManutencao ? "Remover da Manutenção" : "Colocar em Manutenção"}>
                              <IconButton
                                size="small"
                                onClick={() => handleMaintenanceClick(quarto)}
                                sx={{ color: quarto.emManutencao ? theme.palette.success.main : theme.palette.warning.main }}
                              >
                                {quarto.emManutencao ? <BuildCircle fontSize="small" /> : <Build fontSize="small" />}
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Inativar">
                              <IconButton
                                size="small"
                                onClick={() => handleInactivateClick(quarto)}
                                sx={{ color: theme.palette.error.main }}
                              >
                                <PersonOff fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        {!quarto.ativo && (
                          <Tooltip title="Reativar">
                            <IconButton
                              size="small"
                              onClick={() => handleReactivateClick(quarto)}
                              sx={{ color: theme.palette.success.main }}
                            >
                              <PersonAdd fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(quarto)}
                            sx={{ color: theme.palette.error.dark }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o quarto ${selectedQuarto?.nome}? Esta ação não pode ser desfeita.`}
        confirmButtonText="Excluir"
        cancelButtonText="Cancelar"
      />

      {/* Inactivate Confirmation Dialog */}
      <ConfirmationDialog
        open={inactivateDialogOpen}
        onClose={() => setInactivateDialogOpen(false)}
        onConfirm={handleInactivate}
        title="Confirmar Inativação"
        message={`Tem certeza que deseja inativar o quarto ${selectedQuarto?.nome}?`}
        confirmButtonText="Inativar"
        cancelButtonText="Cancelar"
      />

      {/* Reactivate Confirmation Dialog */}
      <ConfirmationDialog
        open={reactivateDialogOpen}
        onClose={() => setReactivateDialogOpen(false)}
        onConfirm={handleReactivate}
        title="Confirmar Reativação"
        message={`Tem certeza que deseja reativar o quarto ${selectedQuarto?.nome}?`}
        confirmButtonText="Reativar"
        cancelButtonText="Cancelar"
      />

      {/* Maintenance Toggle Confirmation Dialog */}
      <ConfirmationDialog
        open={maintenanceDialogOpen}
        onClose={() => setMaintenanceDialogOpen(false)}
        onConfirm={handleMaintenanceToggle}
        title={selectedQuarto?.emManutencao ? "Remover da Manutenção" : "Colocar em Manutenção"}
        message={`Tem certeza que deseja ${selectedQuarto?.emManutencao ? 'remover' : 'colocar'} o quarto ${selectedQuarto?.nome} ${selectedQuarto?.emManutencao ? 'da' : 'em'} manutenção?`}
        confirmButtonText={selectedQuarto?.emManutencao ? "Remover" : "Colocar"}
        cancelButtonText="Cancelar"
      />
    </>
  );
};

export default TableQuartos;
