import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
} from '@mui/material';
import LoadingState from '../LoadingState';
import EmptyState from '../EmptyState';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, row: T) => React.ReactNode;
}

export interface Action<T> {
  icon: React.ReactNode;
  tooltip: string;
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

interface StandardTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  actions?: Action<T>[];
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  onRowClick?: (row: T) => void;
  getRowId?: (row: T) => string | number;
  stickyHeader?: boolean;
}

function StandardTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
  emptyDescription = 'Não há dados disponíveis no momento.',
  actions,
  rowsPerPageOptions = [10, 25, 50],
  defaultRowsPerPage = 10,
  onRowClick,
  getRowId,
  stickyHeader = true,
}: StandardTableProps<T>) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(defaultRowsPerPage);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return <LoadingState type="section" />;
  }

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <EmptyState title={emptyMessage} description={emptyDescription} />
      </Paper>
    );
  }

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader={stickyHeader} aria-label="tabela de dados">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
              {actions && actions.length > 0 && (
                <TableCell align="center" style={{ minWidth: 120 }}>
                  Ações
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => {
              const rowId = getRowId ? getRowId(row) : index;
              return (
                <TableRow
                  hover
                  key={rowId}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:nth-of-type(odd)': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  {columns.map((column) => {
                    const value = (row as any)[column.id];
                    return (
                      <TableCell key={String(column.id)} align={column.align || 'left'}>
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                  {actions && actions.length > 0 && (
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {actions.map((action, actionIndex) => {
                          const isDisabled = action.disabled ? action.disabled(row) : false;
                          return (
                            <Tooltip key={actionIndex} title={action.tooltip}>
                              <span>
                                <IconButton
                                  size="small"
                                  color={action.color || 'primary'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.onClick(row);
                                  }}
                                  disabled={isDisabled}
                                  aria-label={action.tooltip}
                                >
                                  {action.icon}
                                </IconButton>
                              </span>
                            </Tooltip>
                          );
                        })}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
      />
    </Paper>
  );
}

export default StandardTable;
