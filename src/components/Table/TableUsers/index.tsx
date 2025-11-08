import EditIcon from "@mui/icons-material/Edit";
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckIcon from '@mui/icons-material/Check';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, IconButton, CircularProgress, Menu, MenuItem, Box, Tooltip } from "@mui/material"
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../api/admin.service';
import type { PageUserResponseDTO, UserResponseDTO } from '../../../api/admin.dto';
import EmptyState from "../../EmptyState";
import ConfirmationDialog from "../../ConfirmationDialog";

interface Column {
  id: 'name' | 'function' | 'email' | 'telephone' | 'actions';
  label: string;
  minWidth?: number;
  align?: 'center';
}

const columns: readonly Column[] = [
  { id: 'name', label: 'Nome', minWidth: 170 },
  { id: 'function', label: 'Função', minWidth: 100 },
  { id: 'email', label: 'E-mail', minWidth: 170 },
  { id: 'telephone', label: 'Telefone', minWidth: 100 },
  { id: 'actions', label: 'Ações', minWidth: 100, align: 'center' },
]

// we intentionally store full UserResponseDTO objects in state, no small Row type needed

interface TableUsersProps {
  searchText?: string;
}

const TableUsers = ({ searchText }: TableUsersProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // keep the full DTOs from the backend so other properties are available if needed
  const [rows, setRows] = useState<UserResponseDTO[]>([]);
  const [toggling, setToggling] = useState<Record<number, boolean>>({});
  
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchText || '');

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<UserResponseDTO | null>(null);

  // debounce searchText
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText || ''), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const pageable = { page, size: rowsPerPage, searchText: debouncedSearch };
  const res: PageUserResponseDTO = await adminService.listUsers(pageable);
  // store the full user DTOs; rendering below will read the fields it needs
  setRows(res.content || []);
      } catch (err) {
        console.error('Erro ao buscar usuários', err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [page, rowsPerPage, debouncedSearch]);

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

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }

  const navigate = useNavigate();
  const handleEdit = (id: number) => {
    navigate(`/user/edit/${id}`);
  }

  const handleToggleClick = (user: UserResponseDTO) => {
    setUserToToggle(user);
    setConfirmDialogOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!userToToggle) return;
    
    try {
      setToggling((s) => ({ ...s, [userToToggle.id]: true }));
      await adminService.toggleUserStatus(userToToggle.id);
      // update local state optimistically
      setRows((prev) => prev.map(r => r.id === userToToggle.id ? { ...r, ativo: !r.ativo } : r));
    } catch (err) {
      console.error('Erro ao alternar status do usuário', err);
    } finally {
      setToggling((s) => ({ ...s, [userToToggle.id]: false }));
      setConfirmDialogOpen(false);
      setUserToToggle(null);
    }
  };

  const handleCancelToggle = () => {
    setConfirmDialogOpen(false);
    setUserToToggle(null);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 2 }}>
      <TableContainer sx={{ maxHeight: 440 }} >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
            <CircularProgress />
          </div>
        ) : (
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth, backgroundColor: '#ccc' }}
                >
                  {column.id === 'function' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box component="span" sx={{ fontWeight: 600 }}>{column.label}</Box>
                      <Tooltip title="Filtrar por função">
                        <IconButton size="small" onClick={handleOpenFilter} aria-label="filtrar-funcao">
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Menu
                        anchorEl={anchorElFilter}
                        open={openFilter}
                        onClose={handleCloseFilter}
                        MenuListProps={{ 'aria-labelledby': 'filter-tipo' }}
                      >
                        <MenuItem
                          selected={filterTipo === ''}
                          onClick={() => { setFilterTipo(''); setPage(0); handleCloseFilter(); }}
                        >
                          {filterTipo === '' && <CheckIcon fontSize="small" sx={{ mr: 1 }} />}
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
                <TableRow key={row.id}>
                  <TableCell>{row.nome}</TableCell>
                  <TableCell>{row.tipo}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.telefone}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar dados do usuário">
                      <IconButton 
                        color="success"
                        onClick={() => handleEdit(row.id)}
                        aria-label={`Editar dados de ${row.nome}`}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {/* Toggle active/inactive button */}
                    <Tooltip title={row.ativo ? 'Desativar usuário' : 'Ativar usuário'}>
                      <span>
                        <IconButton
                          color={row.ativo ? 'error' : 'success'}
                          onClick={() => handleToggleClick(row)}
                          aria-label={`${row.ativo ? 'Desativar' : 'Ativar'} ${row.nome}`}
                          disabled={!!toggling[row.id]}
                        >
                          {row.ativo ? <BlockIcon /> : <CheckCircleIcon />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
        )}
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
  count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
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