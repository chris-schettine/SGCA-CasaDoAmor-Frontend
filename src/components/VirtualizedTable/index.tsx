import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
import { useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  type TableCellProps,
} from '@mui/material';

interface Column<T> {
  field: keyof T | string; // Permite campos customizados como 'acoes'
  headerName: string;
  width?: number;
  renderCell?: (row: T) => React.ReactNode;
  align?: TableCellProps['align'];
  headerAlign?: TableCellProps['align'];
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowHeight?: number;
  height?: number | string;
  getRowId?: (row: T) => string | number;
  onRowClick?: (row: T) => void;
}

export function VirtualizedTable<T extends Record<string, any>>({
  data,
  columns,
  rowHeight = 53,
  height = 600,
  getRowId,
  onRowClick,
}: VirtualizedTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5, // Renderiza 5 linhas extras acima e abaixo do viewport
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Calculate total width for horizontal scroll
  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0);

  return (
    <TableContainer 
      sx={{ 
        height: typeof height === 'number' ? height : 'auto',
        minHeight: 400,
        maxHeight: 'calc(100vh - 280px)',
        overflowX: 'auto',
        overflowY: 'auto',
        // Better mobile scroll behavior
        WebkitOverflowScrolling: 'touch',
      }} 
      ref={parentRef}
    >
      <Table 
        stickyHeader 
        aria-label="virtualized table"
        sx={{ 
          minWidth: { xs: totalWidth, md: 'auto' },
        }}
      >
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={String(column.field)}
                style={{ minWidth: column.width }}
                align={column.headerAlign || column.align || 'left'}
                sx={{
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {column.headerName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Spacer for full height */}
          <TableRow sx={{ backgroundColor: 'transparent !important' }}>
            <TableCell
              colSpan={columns.length}
              sx={{
                height: virtualizer.getTotalSize(),
                padding: 0,
                border: 0,
                position: 'relative',
                backgroundColor: 'transparent !important',
                '&::before': {
                  display: 'none',
                },
                '&::after': {
                  display: 'none',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
                }}
              >
                {virtualItems.map((virtualRow: VirtualItem) => {
                  const row = data[virtualRow.index];
                  const rowId = getRowId ? getRowId(row) : virtualRow.index;
                  const isOdd = virtualRow.index % 2 === 1;

                  return (
                    <Box
                      key={rowId}
                      sx={{
                        display: 'table',
                        width: '100%',
                        tableLayout: 'fixed',
                        height: rowHeight,
                      }}
                    >
                      <Box
                        component="div"
                        onClick={() => onRowClick?.(row)}
                        sx={{
                          display: 'table-row',
                          cursor: onRowClick ? 'pointer' : 'default',
                          backgroundColor: isOdd ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                          transition: 'background-color 0.15s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.08)',
                          },
                        }}
                      >
                        {columns.map((column) => (
                          <Box
                            key={String(column.field)}
                            component="div"
                            sx={{
                              display: 'table-cell',
                              width: column.width,
                              padding: '16px',
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              verticalAlign: 'middle',
                              textAlign: column.align || 'left',
                              backgroundColor: 'inherit',

                            }}
                          >
                            {column.renderCell
                              ? column.renderCell(row)
                              : String(row[column.field] ?? '')}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// Exemplo de uso otimizado para tabela de pacientes
interface VirtualizedPatientTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
}

export function VirtualizedPatientTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading,
  onRowClick,
}: VirtualizedPatientTableProps<T>) {
  if (isLoading) {
    return (
      <TableContainer component={Paper} sx={{ height: '100%', minHeight: 400 }}>
        <Box sx={{ p: 3, textAlign: 'center' }}>Carregando...</Box>
      </TableContainer>
    );
  }

  if (data.length === 0) {
    return (
      <TableContainer component={Paper} sx={{ height: '100%', minHeight: 400 }}>
        <Box sx={{ p: 3, textAlign: 'center' }}>Nenhum registro encontrado</Box>
      </TableContainer>
    );
  }

  return (
    <VirtualizedTable
      data={data}
      columns={columns}
      rowHeight={53}
      height="auto"
      onRowClick={onRowClick}
      getRowId={(row) => String(row.id ?? row.cpf)}
    />
  );
}
