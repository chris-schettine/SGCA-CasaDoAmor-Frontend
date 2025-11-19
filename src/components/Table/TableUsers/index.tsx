import EditIcon from "@mui/icons-material/Edit";
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckIcon from '@mui/icons-material/Check';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, IconButton, Menu, MenuItem, Box, useMediaQuery, useTheme } from "@mui/material"
import StandardTooltip from '../../StandardTooltip';
import { TableSkeleton } from '../../SuspenseWrapper';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import type { UserResponseDTO } from '../../../api/admin.dto';
import EmptyState from "../../EmptyState";
import ConfirmationDialog from "../../ConfirmationDialog";
import { useUsers, useToggleUserStatus } from '../../../hooks/useAdmin';
import MobileCard from '../MobileCard';

interface Column {
  id: 'name' | 'function' | 'email' | 'telephone' | 'actions';
  label: string;
  minWidth?: number;
  align?: 'center';
  headerAlign?: 'left' | 'center' | 'right';
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

interface TableUsersProps {
  searchText?: string;
}

const TableUsers = ({ searchText }: TableUsersProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchText || '');

  // Definir colunas responsivas
  const columns: readonly Column[] = [
    { id: 'name', label: 'Nome', minWidth: isMobile ? 120 : 170, headerAlign: 'left' },
    { id: 'function', label: 'Função', minWidth: 100, hideOnMobile: false, headerAlign: 'left' },
    { id: 'email', label: 'E-mail', minWidth: 170, hideOnTablet: true, headerAlign: 'left' },
    { id: 'telephone', label: 'Telefone', minWidth: 100, hideOnMobile: true, headerAlign: 'left' },
    { id: 'actions', label: 'Ações', minWidth: isMobile ? 80 : 100, align: 'center', headerAlign: 'center' },
  ].filter(col => {
    if (isMobile && col.hideOnMobile) return false;
    if (isTablet && col.hideOnTablet) return false;
    return true;
  }) as readonly Column[];

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<UserResponseDTO | null>(null);

  // 🚀 TanStack Query - substitui useState + useEffect
  const { data, isLoading } = useUsers({ page, size: rowsPerPage, searchText: debouncedSearch });
  const toggleStatusMutation = useToggleUserStatus();

  const rows = data?.content ?? [];

  // debounce searchText
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText || ''), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  // derive unique tipos from loaded rows for the filter options
  const tipos = Array.from(new Set(rows.map(r => r.tipo).filter(Boolean))).sort();

  // apply client-side filter by tipo
  const filteredRows = filterTipo ? rows.filter(r => r.tipo === filterTipo) : rows;
  const displayRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // filter menu state
  const [anchorElFilter, setAnchorElFilter] = useState<null | HTMLElement>(null);
  const openFilter = Boolean(anchorElFilter);
  const handleOpenFilter = (e: React.MouseEvent<HTMLElement>) => setAnchorElFilter(e.currentTarget);
  const handleCloseFilter = () => setAnchorElFilter(null);

  const handleToggleClick = (user: UserResponseDTO) => {
    setUserToToggle(user);
    setConfirmDialogOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!userToToggle) return;
    
    try {
      await toggleStatusMutation.mutateAsync(userToToggle.id);
    } catch (err) {
      console.error('Erro ao alternar status do usuário', err);
    } finally {
      setConfirmDialogOpen(false);
      setUserToToggle(null);
    }
  };

  const handleCancelToggle = () => {
    setConfirmDialogOpen(false);
    setUserToToggle(null);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }

  const handleEdit = (id: number) => {
    navigate(`/user/edit/${id}`);
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 2 }}>
      <TableContainer sx={{ 
        maxHeight: isMobile ? 'none' : 440,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch'
      }} >
        {isLoading ? (
          <TableSkeleton rows={10} />
        ) : isMobile ? (
          <Box sx={{ p: 2 }}>
            {displayRows.length === 0 ? (
              <EmptyState
                icon={<PersonAddIcon sx={{ fontSize: 80 }} />}
                title="Nenhum usuário encontrado"
                description={searchText || filterTipo ? "Tente ajustar os filtros de busca ou cadastre um novo usuário." : "Comece cadastrando o primeiro usuário do sistema."}
                actionLabel="Cadastrar Usuário"
                onAction={() => navigate('/user/register')}
              />
            ) : (
              displayRows.map((row) => (
                <MobileCard
                  key={row.id}
                  title={row.nome}
                  subtitle={row.tipo}
                  fields={[
                    { label: 'Email', value: row.email },
                    { label: 'Telefone', value: row.telefone },
                    { label: 'Status', value: row.ativo ? 'Ativo' : 'Inativo' },
                  ]}
                  actions={
                    <>
                      <StandardTooltip title="Editar dados do usuário">
                        <IconButton 
                          color="success"
                          onClick={() => handleEdit(row.id)}
                          aria-label={`Editar dados de ${row.nome}`}
                          size="medium"
                        >
                          <EditIcon />
                        </IconButton>
                      </StandardTooltip>
                      <StandardTooltip title={row.ativo ? 'Desativar usuário' : 'Ativar usuário'}>
                        <span>
                          <IconButton
                            color={row.ativo ? 'error' : 'success'}
                            onClick={() => handleToggleClick(row)}
                            aria-label={`${row.ativo ? 'Desativar' : 'Ativar'} ${row.nome}`}
                            disabled={toggleStatusMutation.isPending}
                            size="medium"
                          >
                            {row.ativo ? <BlockIcon /> : <CheckCircleIcon />}
                          </IconButton>
                        </span>
                      </StandardTooltip>
                    </>
                  }
                />
              ))
            )}
          </Box>
        ) : (
          <Table
            stickyHeader
            aria-label="Tabela de usuários"
            sx={{
              '& .MuiTableCell-head': {
                fontWeight: 600,
                whiteSpace: 'nowrap',
                paddingY: 1,
              },
            }}
          >
            <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.headerAlign ?? column.align}
                  style={{ minWidth: column.minWidth }}
                  sx={{ textAlign: column.headerAlign ?? column.align ?? 'left' }}
                >
                  {column.id === 'function' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ fontWeight: 600 }}>{column.label}</Box>
                      <StandardTooltip title="Filtrar por função">
                        <IconButton
                          size="small"
                          onClick={handleOpenFilter}
                          aria-label="filtrar-funcao"
                          sx={{ color: theme.palette.mode === 'light' ? theme.palette.common.white : undefined }}
                        >
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                      </StandardTooltip>

                      <Menu
                        anchorEl={anchorElFilter}
                        open={openFilter}
                        onClose={handleCloseFilter}
                        MenuListProps={{ 'aria-labelledby': 'filter-tipo' }}
                      >
                        <MenuItem
                            selected={filterTipo === ''}
                          >
                            Todos
                          </MenuItem>
                        {tipos.map((t) => (
                          <MenuItem
                            key={t}
                            selected={filterTipo === t}
                            onClick={() => { setFilterTipo(t); setPage(0); handleCloseFilter(); }}
                          >
                            {filterTipo === t && <CheckIcon fontSize="small" sx={{ mr: 1 }} />}
                            {t}
                          </MenuItem>
                        ))}
                      </Menu>
                    </Box>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ p: 0, border: 'none' }}>
                  <EmptyState
                    icon={<PersonAddIcon sx={{ fontSize: 80 }} />}
                    title="Nenhum usuário encontrado"
                    description={searchText || filterTipo ? "Tente ajustar os filtros de busca ou cadastre um novo usuário." : "Comece cadastrando o primeiro usuário do sistema."}
                    actionLabel="Cadastrar Usuário"
                    onAction={() => navigate('/user/register')}
                  />
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' }, textAlign: 'left' }}>{row.nome}</TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' }, textAlign: 'left' }}>{row.tipo}</TableCell>
                  {!isTablet && (
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' }, textAlign: 'left' }}>{row.email}</TableCell>
                  )}
                  {!isMobile && (
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' }, textAlign: 'left' }}>{row.telefone}</TableCell>
                  )}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: isMobile ? 0.25 : 0.5, justifyContent: 'center' }}>
                      <StandardTooltip title="Editar dados do usuário">
                        <IconButton 
                          color="success"
                          onClick={() => handleEdit(row.id)}
                          aria-label={`Editar dados de ${row.nome}`}
                          size={isMobile ? "medium" : "small"}
                        >
                          <EditIcon fontSize={isMobile ? "medium" : "small"} />
                        </IconButton>
                      </StandardTooltip>
                      {/* Toggle active/inactive button */}
                      <StandardTooltip title={row.ativo ? 'Desativar usuário' : 'Ativar usuário'}>
                        <span>
                          <IconButton
                            color={row.ativo ? 'error' : 'success'}
                            onClick={() => handleToggleClick(row)}
                            aria-label={`${row.ativo ? 'Desativar' : 'Ativar'} ${row.nome}`}
                            disabled={toggleStatusMutation.isPending}
                            size={isMobile ? "medium" : "small"}
                          >
                            {row.ativo ? <BlockIcon fontSize={isMobile ? "medium" : "small"} /> : <CheckCircleIcon fontSize={isMobile ? "medium" : "small"} />}
                          </IconButton>
                        </span>
                      </StandardTooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
        )}
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={isMobile ? [10, 25] : [10, 25, 100]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={isMobile ? "Por página:" : "Linhas por página:"}
        labelDisplayedRows={({ from, to, count }) => 
          isMobile 
            ? `${from}-${to} de ${count}`
            : `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
        sx={{
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          },
          '.MuiTablePagination-select': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          },
        }}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={handleCancelToggle}
        onConfirm={handleConfirmToggle}
        title={userToToggle?.ativo ? 'Desativar Usuário' : 'Ativar Usuário'}
        message={
          userToToggle?.ativo
            ? `Tem certeza que deseja desativar o usuário "${userToToggle?.nome}"? O usuário não poderá mais acessar o sistema.`
            : `Tem certeza que deseja ativar o usuário "${userToToggle?.nome}"? O usuário poderá acessar o sistema novamente.`
        }
        confirmButtonText={userToToggle?.ativo ? 'Desativar' : 'Ativar'}
        cancelButtonText="Cancelar"
      />
    </Paper>
  )
}

export default TableUsers;