import EditIcon from "@mui/icons-material/Edit";
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckIcon from '@mui/icons-material/Check';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, IconButton, Menu, MenuItem, Box, useMediaQuery, useTheme } from "@mui/material"
import StandardTooltip from '../../StandardTooltip';
import { useState, useEffect, useRef } from "react";
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
  maxWidth?: number;
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
  const isNarrowDesktop = useMediaQuery(theme.breakpoints.down('lg'));
  // Usa cards em tablet/mobile; desktops estreitos permanecem em tabela
  const useCardLayout = isTablet;
  const cellTextSx = {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordBreak: 'break-word' as const,
    lineHeight: 1.4,
  };
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState(searchText || '');

  // Definir colunas responsivas
  const columns: readonly Column[] = [
    { id: 'name', label: 'Nome', minWidth: isNarrowDesktop ? 120 : 140, maxWidth: isNarrowDesktop ? 200 : 260, headerAlign: 'left' },
    { id: 'function', label: 'Função', minWidth: isNarrowDesktop ? 95 : 110, maxWidth: isNarrowDesktop ? 180 : 200, hideOnMobile: false, headerAlign: 'left' },
    { id: 'email', label: 'E-mail', minWidth: isNarrowDesktop ? 160 : 180, maxWidth: isNarrowDesktop ? 260 : 300, hideOnTablet: true, headerAlign: 'left' },
    { id: 'telephone', label: 'Telefone', minWidth: isNarrowDesktop ? 90 : 100, maxWidth: isNarrowDesktop ? 140 : 160, hideOnMobile: true, headerAlign: 'left' },
    { id: 'actions', label: 'Ações', minWidth: isNarrowDesktop ? 90 : 100, maxWidth: isNarrowDesktop ? 120 : 140, align: 'center', headerAlign: 'center' },
  ].filter(col => {
    if (isMobile && col.hideOnMobile) return false;
    if (isTablet && col.hideOnTablet) return false;
    return true;
  }) as readonly Column[];

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<UserResponseDTO | null>(null);

  // 🚀 TanStack Query - substitui useState + useEffect
  const { data } = useUsers({ page, size: rowsPerPage, searchText: debouncedSearch });
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

  // Se detectarmos overflow horizontal na tabela, pedimos para fechar o drawer lateral para ganhar espaço
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const target = tableContainerRef.current;
    if (!target) return;

    const checkOverflow = () => {
      if (target.scrollWidth > target.clientWidth + 4) {
        window.dispatchEvent(new CustomEvent('sgca:close-drawer', { detail: { reason: 'table-overflow-users' } }));
      }
    };

    checkOverflow();
    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(target);
    window.addEventListener('resize', checkOverflow);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkOverflow);
    };
  }, []);

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
      <TableContainer
        ref={tableContainerRef}
        sx={{ 
          maxHeight: useCardLayout ? 'none' : 440,
          overflowX: useCardLayout ? 'visible' : 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {useCardLayout ? (
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
              '& .MuiTableCell-root': {
                paddingX: isNarrowDesktop ? 1 : 1.5,
                paddingY: isNarrowDesktop ? 0.75 : 1.25,
              },
              '& thead th': {
                backgroundColor: `${theme.palette.primary.main} !important`,
                color: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
                WebkitTextFillColor: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
                opacity: 1,
              },
              '& .MuiTableCell-head': {
                fontWeight: 600,
                whiteSpace: 'nowrap',
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
              tableLayout: 'fixed',
            }}
          >
            <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.headerAlign ?? column.align}
                  style={{ minWidth: column.minWidth, maxWidth: column.maxWidth }}
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
                          onClick={() => { setFilterTipo(''); setPage(0); handleCloseFilter(); }}
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
                  <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' }, textAlign: 'left', maxWidth: { md: 260, lg: 320 } }}>
                    <Box component="span" sx={cellTextSx} title={row.nome}>
                      {row.nome}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' }, textAlign: 'left', maxWidth: { md: 200, lg: 240 } }}>
                    <Box component="span" sx={cellTextSx} title={row.tipo}>
                      {row.tipo}
                    </Box>
                  </TableCell>
                  {!isTablet && (
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' }, textAlign: 'left', maxWidth: { md: 260, lg: 320 } }}>
                      <Box component="span" sx={cellTextSx} title={row.email}>
                        {row.email}
                      </Box>
                    </TableCell>
                  )}
                  {!isMobile && (
                    <TableCell sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' }, textAlign: 'left', maxWidth: { md: 200, lg: 260 } }}>
                      <Box component="span" sx={cellTextSx} title={row.telefone}>
                        {row.telefone}
                      </Box>
                    </TableCell>
                  )}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: isMobile ? 0.25 : 0.5, justifyContent: 'center', flexWrap: 'wrap', minWidth: 72 }}>
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
        rowsPerPageOptions={useCardLayout ? [10, 25] : [10, 25, 100]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={useCardLayout ? "Por página:" : "Linhas por página:"}
        labelDisplayedRows={({ from, to, count }) => 
          useCardLayout 
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
