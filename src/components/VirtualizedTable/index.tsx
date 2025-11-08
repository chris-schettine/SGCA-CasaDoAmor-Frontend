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
} from '@mui/material';

interface Column<T> {
  field: keyof T | string; // Permite campos customizados como 'acoes'
  headerName: string;
  width?: number;
  renderCell?: (row: T) => React.ReactNode;
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

  return (
    <TableContainer component={Paper} sx={{ height, overflow: 'auto' }} ref={parentRef}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={String(column.field)}
                sx={{
                  width: column.width,
                  fontWeight: 600,
                  backgroundColor: 'background.paper',
                  zIndex: 2,
                }}
              >
                {column.headerName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Spacer para manter altura total correta */}
          {virtualItems.length > 0 && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                sx={{
                  height: virtualizer.getTotalSize(),
                  padding: 0,
                  position: 'relative',
                }}
              >
                {/* Container absoluto para linhas virtualizadas */}
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
                      <Table key={rowId} sx={{ tableLayout: 'fixed' }}>
                        <TableBody>
                          <TableRow
                            hover
                            onClick={() => onRowClick?.(row)}
                            sx={{
                              cursor: onRowClick ? 'pointer' : 'default',
                              height: rowHeight,
                            }}
                          >
                            {columns.map((column) => (
                              <TableCell
                                key={String(column.field)}
                                sx={{ width: column.width }}
                              >
                                {column.renderCell
                                  ? column.renderCell(row)
                                  : String(row[column.field] ?? '')}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    );
                  })}
                </Box>
              </TableCell>
            </TableRow>
          )}
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
