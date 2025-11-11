import { useVirtualizer } from '@tanstack/react-virtual';
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
  height?: number;
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
        maxHeight: height,
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
          {/* Espaçador para altura total */}
          <TableRow>
            <TableCell
              colSpan={columns.length}
              sx={{
                height: virtualizer.getTotalSize(),
                padding: 0,
                border: 0,
                position: 'relative',
              }}
            >
              {/* Linhas virtualizadas */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
                }}
              >
                {virtualItems.map((virtualRow) => {
                  const row = data[virtualRow.index];
                  const rowId = getRowId ? getRowId(row) : virtualRow.index;

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
                          '&:hover': {
                            backgroundColor: 'action.hover',
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
      <TableContainer component={Paper} sx={{ height: 600 }}>
        <Box sx={{ p: 3, textAlign: 'center' }}>Carregando...</Box>
      </TableContainer>
    );
  }

  if (data.length === 0) {
    return (
      <TableContainer component={Paper} sx={{ height: 600 }}>
        <Box sx={{ p: 3, textAlign: 'center' }}>Nenhum registro encontrado</Box>
      </TableContainer>
    );
  }

  return (
    <VirtualizedTable
      data={data}
      columns={columns}
      rowHeight={53}
      height={600}
      onRowClick={onRowClick}
      getRowId={(row) => String(row.id ?? row.cpf)}
    />
  );
}
