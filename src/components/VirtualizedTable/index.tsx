import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual';
import { useRef, type ReactNode, type KeyboardEvent } from 'react';
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
  useTheme,
} from '@mui/material';

export type TableRowData = Record<string, unknown>;

type ColumnField<T extends TableRowData> = keyof T | (string & {});

export interface Column<T extends TableRowData> {
  field: ColumnField<T>; // Permite campos customizados como 'acoes'
  headerName: string;
  width?: number;
  renderCell?: (row: T) => ReactNode;
  align?: TableCellProps['align'];
  headerAlign?: TableCellProps['align'];
  /**
   * Forneça um rótulo curto para leitores de tela quando o headerName for visual apenas (ex: abreviações)
   */
  ariaLabel?: string;
}

interface VirtualizedTableProps<T extends TableRowData> {
  data: T[];
  columns: Column<T>[];
  rowHeight?: number;
  height?: number | string;
  getRowId?: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  ariaLabel?: string;
}

export function VirtualizedTable<T extends TableRowData>({
  data,
  columns,
  rowHeight = 53,
  height = 600,
  getRowId,
  onRowClick,
  ariaLabel,
}: VirtualizedTableProps<T>) {
  const theme = useTheme();
  const parentRef = useRef<HTMLDivElement>(null);

  const getVirtualRowKey = (index: number) => {
    const row = data[index];
    return getRowId ? getRowId(row) : index;
  };

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5, // Renderiza 5 linhas extras acima e abaixo do viewport
    getItemKey: getVirtualRowKey,
    measureElement: (element) => element?.getBoundingClientRect().height ?? rowHeight,
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
        scrollbarGutter: 'stable both-edges',
        overscrollBehavior: 'contain',
        // Better mobile scroll behavior
        WebkitOverflowScrolling: 'touch',
      }} 
      tabIndex={0}
      ref={parentRef}
    >
      <Table 
        stickyHeader 
        aria-label={ariaLabel ?? 'Tabela de dados'}
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
                component="th"
                scope="col"
                align={column.headerAlign || column.align || 'left'}
                aria-label={column.ariaLabel}
                sx={{
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  backgroundColor: `${theme.palette.primary.main} !important`,
                  color: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
                  WebkitTextFillColor: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
                  opacity: 1,
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
              {virtualItems.length > 0 && (
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
                    if (!row) return null;

                    const rowId = getVirtualRowKey(virtualRow.index);
                    const isOdd = virtualRow.index % 2 === 1;

                    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
                      if (!onRowClick) return;
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onRowClick(row);
                      }
                    };

                    return (
                      <Box
                        key={rowId}
                        ref={virtualizer.measureElement}
                        data-index={virtualRow.index}
                        sx={{
                          display: 'table',
                          width: '100%',
                          tableLayout: 'fixed',
                          minHeight: rowHeight,
                        }}
                      >
                        <Box
                          component="div"
                          tabIndex={onRowClick ? 0 : -1}
                          onClick={() => onRowClick?.(row)}
                          onKeyDown={handleKeyDown}
                          sx={{
                            display: 'table-row',
                            cursor: onRowClick ? 'pointer' : 'default',
                            backgroundColor: isOdd ? (theme) => theme.palette.action.hover : 'transparent',
                            transition: 'background-color 0.15s ease',
                            '&:hover': {
                              backgroundColor: (theme) => theme.palette.action.selected,
                            },
                          }}
                        >
                          {columns.map((column) => {
                            const defaultValue = (() => {
                              if (column.renderCell) {
                                return column.renderCell(row);
                              }

                              if (typeof column.field === 'string' && column.field in row) {
                                return String(row[column.field as keyof T] ?? '');
                              }

                              return '';
                            })();

                            return (
                              <Box
                                key={String(column.field)}
                                component="div"
                              // use data attributes for indexing to avoid invalid ARIA attributes on a plain div
                              data-colindex={columns.indexOf(column) + 1}
                                sx={{
                                  display: 'table-cell',
                                  width: column.width,
                                  padding: '16px',
                                  borderBottom: '1px solid',
                                  borderColor: 'divider',
                                  verticalAlign: 'middle',
                                  textAlign: column.align || 'left',
                                  backgroundColor: 'inherit',
                                  color: theme.palette.text.primary,
                                  WebkitTextFillColor: theme.palette.text.primary,
                                  opacity: 1,

                                }}
                              >
                                {defaultValue}
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// Exemplo de uso otimizado para tabela de pacientes
interface VirtualizedPatientTableProps<T extends TableRowData & {
  id?: string | number;
  cpf?: string | number;
}> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
}

export function VirtualizedPatientTable<T extends TableRowData & {
  id?: string | number;
  cpf?: string | number;
}>({
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
