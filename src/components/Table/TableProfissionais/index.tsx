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
import { Visibility, Edit, Delete, PersonOff, PersonAdd } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { profissionalService } from '../../../api/profissional.service';
import type { ProfissionalDTO } from '../../../api/profissional.dto';
import { usePermissions } from '../../../hooks/usePermissions';
import ConfirmationDialog from '../../ConfirmationDialog';
import { TableSkeleton } from '../../SuspenseWrapper';
import { toastSuccess, toastError } from '../../../utils/toast';

interface TableProfissionaisProps {
  searchText?: string;
}

const TableProfissionais = ({ searchText = '' }: TableProfissionaisProps) => {
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();
  const theme = useTheme();
  
  const [profissionais, setProfissionais] = useState<ProfissionalDTO[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inactivateDialogOpen, setInactivateDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [selectedProfissional, setSelectedProfissional] = useState<ProfissionalDTO | null>(null);

  // Fetch profissionais - make stable so handlers can call it
  const fetchProfissionais = useCallback(async () => {
    try {
      setLoading(true);
      // Detect search type: if numeric (digits only), search by CPF
      // If the searchText matches a known categoria name, search by categoria
      // Otherwise search by nome (partial name match)
      const trimmedSearch = searchText.trim();
      const isNumericSearch = /^\d+$/.test(trimmedSearch);

      let params: any = {
        page,
        size: rowsPerPage,
        sort: ['nome,asc'],
      };

      if (trimmedSearch) {
        if (isNumericSearch) {
          params.cpf = trimmedSearch;
        } else {
          // try to detect category by exact name match (case-insensitive)
          // Only attempt categoria matching if categorias have loaded
          if (categorias.length > 0) {
            const match = categorias.find(c => String(c.nome ?? c.name ?? c.valor ?? c.descricao).toLowerCase() === trimmedSearch.toLowerCase());
            if (match) {
              // If the backend expects an id, send categoria_id; also send a
              // readable categoria value (name or valor) to cover backends that
              // filter by name. This avoids sending unrelated fields together.
              const categoriaId = match.id ?? match.valor ?? null;
              const categoriaName = (match.nome ?? match.name ?? match.valor ?? '').toString();
              if (categoriaId) params.categoria_id = String(categoriaId);
              if (categoriaName) params.categoria = categoriaName;
            } else {
              // No categoria match, search by name
              params.nome = trimmedSearch;
            }
          } else {
            // Categorias not loaded yet, default to name search
            params.nome = trimmedSearch;
          }
        }
      }

      console.log('Fetching profissionais with params:', params);
      const response = await profissionalService.listar(params);
      console.log('Response:', response);
      if (response.content.length > 0) {
        console.log('First professional object:', response.content[0]);
      }

      // Frontend filtering fallback: if backend doesn't filter properly,
      // apply client-side filtering
      let filteredContent = response.content;

      if (trimmedSearch) {
        const searchLower = trimmedSearch.toLowerCase();
        filteredContent = response.content.filter((prof: any) => {
          // If searching by CPF (numeric), match exactly
          if (isNumericSearch) {
            return prof.cpf?.includes(trimmedSearch);
          }
          // If searching by categoria name, match categoria
          if (params.categoria_id || params.categoria) {
            // Check both prof.categoria and prof.categoria_id (backend inconsistency)
            const categoriaObj = prof.categoria_id || prof.categoria;
            const profCategoria = categoriaObj?.descricao || categoriaObj?.valor || categoriaObj?.nome || categoriaObj;
            const profCategoriaStr = String(profCategoria || '').toLowerCase();
            console.log('Filtering by categoria:', {
              profNome: prof.nome,
              categoriaObj,
              profCategoriaStr,
              searchLower,
              matches: profCategoriaStr === searchLower || profCategoriaStr.includes(searchLower),
            });
            // Match if the professional's categoria matches the search term
            return profCategoriaStr === searchLower || profCategoriaStr.includes(searchLower);
          }
          // Otherwise, search by nome (partial match, case-insensitive)
          const nomeCompleto = (prof.nome || prof.nome_completo || '').toLowerCase();
          return nomeCompleto.includes(searchLower);
        });
      }

      setProfissionais(filteredContent);
      setTotalElements(filteredContent.length);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      toastError('Erro ao buscar profissionais. Verifique o console para mais detalhes.');
      setProfissionais([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchText, categorias]);

  useEffect(() => {
    fetchProfissionais();
  }, [fetchProfissionais]);

  // Load categories once so we can map category searches
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const cats = await profissionalService.listarCategorias();
        if (mounted) setCategorias(cats ?? []);
      } catch (error) {
        console.warn('Erro ao carregar categorias:', error);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Handlers
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleView = (uuid: string) => {
    navigate(`/profissional/information/${uuid}`);
  };

  const handleEdit = (uuid: string) => {
    navigate(`/profissional/edit/${uuid}`);
  };

  const handleDeleteClick = (profissional: ProfissionalDTO) => {
    setSelectedProfissional(profissional);
    setDeleteDialogOpen(true);
  };

  const handleInactivateClick = (profissional: ProfissionalDTO) => {
    setSelectedProfissional(profissional);
    setInactivateDialogOpen(true);
  };

  const handleActivateClick = (profissional: ProfissionalDTO) => {
    setSelectedProfissional(profissional);
    setActivateDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProfissional?.uuid) return;
    
    try {
      await profissionalService.deletar(selectedProfissional.uuid);
      setDeleteDialogOpen(false);
      toastSuccess('Profissional excluído com sucesso.');
      fetchProfissionais(); // Refresh list
    } catch (error) {
      console.error('Erro ao deletar profissional:', error);
      toastError('Erro ao deletar profissional. Verifique o console para mais detalhes.');
    }
  };

  const handleInactivate = async () => {
    if (!selectedProfissional?.uuid) return;
    
    try {
      await profissionalService.inativar(selectedProfissional.uuid);
      setInactivateDialogOpen(false);
      toastSuccess('Profissional inativado com sucesso.');
      fetchProfissionais(); // Refresh list
    } catch (error) {
      console.error('Erro ao inativar profissional:', error);
      toastError('Erro ao inativar profissional. Verifique o console para mais detalhes.');
    }
  };

  const handleActivate = async () => {
    if (!selectedProfissional?.uuid) return;

    try {
      await profissionalService.ativar(selectedProfissional.uuid);
      setActivateDialogOpen(false);
      toastSuccess('Profissional ativado com sucesso.');
      fetchProfissionais(); // Refresh list
    } catch (error) {
      console.error('Erro ao ativar profissional:', error);
      toastError('Erro ao ativar profissional. Verifique o console para mais detalhes.');
    }
  };

  if (loading) {
    return <TableSkeleton rows={rowsPerPage} />;
  }

  if (!profissionais || profissionais.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Nenhum profissional encontrado.
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ maxHeight: 440, WebkitOverflowScrolling: 'touch', overflowX: 'hidden' }}>
        <Table
          stickyHeader
          aria-label="Tabela de profissionais"
          sx={{
            '& .MuiTableCell-root': {
              paddingX: 1.5,
              paddingY: 1.25,
            },
            '& thead th': {
              backgroundColor: `${theme.palette.primary.main} !important`,
              color: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
              WebkitTextFillColor: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
              opacity: 1,
            },
            '& .MuiTableCell-head': {
              fontWeight: 600,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              paddingY: 1,
            },
            '& tbody td': {
              color: theme.palette.text.primary,
              WebkitTextFillColor: theme.palette.text.primary,
              opacity: 1,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              lineHeight: 1.4,
            },
            tableLayout: 'auto',
            width: '100%',
          }}
        >
          <TableHead>
            <TableRow>
                <TableCell>Nome</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profissionais.map((profissional) => {
              // Safely extract categoria string from object or primitive
              const getCategoriaDisplay = (cat: any): string => {
                if (!cat) return '-';
                if (typeof cat === 'string') return cat;
                if (typeof cat === 'object') {
                  return cat.descricao || cat.nome || cat.valor || String(cat.id || '');
                }
                return String(cat);
              };
              
              // The service normalizes categoria into categoria_id field
              const categoriaValue = (profissional as any).categoria || (profissional as any).categoria_id;
              
              return (
              <TableRow key={profissional.uuid} hover>
                <TableCell>{profissional.nome}</TableCell>
                <TableCell>{profissional.cpf}</TableCell>
                <TableCell>{getCategoriaDisplay(categoriaValue)}</TableCell>
                <TableCell>{profissional.telefone}</TableCell>
                <TableCell>
                  <Chip
                    label={profissional.ativo ? 'Ativo' : 'Inativo'}
                    color={profissional.ativo ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Tooltip title="Visualizar">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleView(profissional.uuid!)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    
                    {isAdmin && (
                      <>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(profissional.uuid!)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        
                        {profissional.ativo && (
                          <Tooltip title="Inativar">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleInactivateClick(profissional)}
                            >
                              <PersonOff />
                            </IconButton>
                          </Tooltip>
                        )}
                        {!profissional.ativo && (
                          <Tooltip title="Ativar">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleActivateClick(profissional)}
                            >
                              <PersonAdd />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Deletar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(profissional)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir o profissional ${selectedProfissional?.nome}? Esta ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteDialogOpen(false)}
      />

      {/* Inactivate Confirmation Dialog */}
      <ConfirmationDialog
        open={inactivateDialogOpen}
        title="Confirmar Inativação"
        message={`Tem certeza que deseja inativar o profissional ${selectedProfissional?.nome}?`}
        onConfirm={handleInactivate}
        onClose={() => setInactivateDialogOpen(false)}
      />
      {/* Activate Confirmation Dialog */}
      <ConfirmationDialog
        open={activateDialogOpen}
        title="Confirmar Ativação"
        message={`Tem certeza que deseja ativar o profissional ${selectedProfissional?.nome}?`}
        onConfirm={handleActivate}
        onClose={() => setActivateDialogOpen(false)}
      />
    </>
  );
};

export default TableProfissionais;
