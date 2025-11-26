import React, { Suspense, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme,
  Chip,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useSuspenseQuery } from '@tanstack/react-query';
import { adminService } from '../../api/admin.service';
import type { TentativaLoginDTO } from '../../api/admin.dto';
import LoadingState from '../../components/LoadingState';
import { TableSkeleton } from '../../components/SuspenseWrapper';
import PageHeader from '../../components/PageHeader';
import MobileCard from '../../components/Table/MobileCard';
import { auditKeys } from '../../api/queries';

interface AuditLogEntry {
  id: number;
  dataHora: string;
  usuario: string;
  tipoAcao: 'LOGIN' | 'CRIACAO' | 'ALTERACAO' | 'EXCLUSAO' | 'FALHA_ACESSO' | 'PERMISSAO';
  objetoAfetado: string;
  resultado: 'SUCESSO' | 'FALHA';
  motivoFalha?: string | null;
  ipOrigem?: string | null;
}

const columns = [
  { id: 'dataHora', label: 'Data/Hora', minWidth: 150 },
  { id: 'usuario', label: 'Usuário', minWidth: 100 },
  { id: 'tipoAcao', label: 'Ação', minWidth: 100 },
  { id: 'objetoAfetado', label: 'Objeto Afetado', minWidth: 200 },
  { id: 'resultado', label: 'Resultado', minWidth: 80, align: 'center' as const },
];

const AuditLogContent = () => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados dos Filtros
  const [filterUsuario, setFilterUsuario] = useState('');
  const [filterTipoAcao, setFilterTipoAcao] = useState('');
  const [filterResultado, setFilterResultado] = useState('');

  const { data } = useSuspenseQuery({
    queryKey: auditKeys.logins(),
    queryFn: () => adminService.getAuditPerfis(),
    staleTime: 1000 * 60 * 5,
  });

  const logs = useMemo<AuditLogEntry[]>(() => {
    const tentativas: TentativaLoginDTO[] = data.relatorioLogins?.tentativas || [];
    return tentativas.map((t) => ({
      id: t.id,
      dataHora: t.dataTentativa ? new Date(t.dataTentativa).toLocaleString() : '',
      usuario: t.usuario?.nome || (t.cpf ? `CPF: ${t.cpf}` : 'Anônimo'),
      tipoAcao: t.sucesso ? 'LOGIN' : 'FALHA_ACESSO',
      objetoAfetado: t.ipOrigem || t.userAgent || 'N/A',
      resultado: t.sucesso ? 'SUCESSO' : 'FALHA',
      motivoFalha: t.motivoFalha ?? null,
      ipOrigem: t.ipOrigem ?? null,
    }));
  }, [data]);

  const filteredLogs = useMemo(() => {
    let result = logs;
    if (filterUsuario) {
      result = result.filter(log => log.usuario.toLowerCase().includes(filterUsuario.toLowerCase()));
    }
    if (filterTipoAcao) {
      result = result.filter(log => log.tipoAcao === filterTipoAcao);
    }
    if (filterResultado) {
      result = result.filter(log => log.resultado === filterResultado);
    }
    return result;
  }, [logs, filterUsuario, filterTipoAcao, filterResultado]);

  const currentLogs = filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleExport = () => {
    if (!filteredLogs || filteredLogs.length === 0) return;

    const headers = ['DataHora', 'Usuario', 'TipoAcao', 'ObjetoAfetado', 'Resultado', 'MotivoFalha', 'IpOrigem'];

    const rows = filteredLogs.map((l) => [
      l.dataHora,
      l.usuario,
      l.tipoAcao,
      l.objetoAfetado,
      l.resultado,
      l.motivoFalha ?? '',
      l.ipOrigem ?? '',
    ]);

    const escapeCell = (cell: unknown) => {
      if (cell === null || cell === undefined) return '';
      const str = String(cell);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const csvContent = [headers, ...rows]
      .map((r) => r.map(escapeCell).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `auditoria_${today}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', p: 3, color: 'text.primary' }}>
      <Box sx={{ width: '100%', margin: '0 auto', maxWidth: '1200px', p: 3 }}>
        <PageHeader 
          title="📋 Logs de Auditoria do Sistema"
        />

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h2" gutterBottom>Filtros</Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-end' }}>

            {/* Filtro por Usuário */}
            <Box sx={{ width: { xs: '100%', sm: '33.333%' } }}>
              <TextField
                fullWidth
                label="Buscar por Usuário"
                value={filterUsuario}
                onChange={(e) => setFilterUsuario(e.target.value)}
                variant="outlined"
              />
            </Box>

            {/* Filtro por Tipo de Ação */}
            <Box sx={{ width: { xs: '100%', sm: '33.333%' } }}>
              <FormControl fullWidth>
                <InputLabel id="tipo-acao-label">Tipo de Ação</InputLabel>
                <Select
                  labelId="tipo-acao-label"
                  value={filterTipoAcao}
                  label="Tipo de Ação"
                  onChange={(e) => setFilterTipoAcao(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="LOGIN">Login</MenuItem>
                  <MenuItem value="FALHA_ACESSO">Falha de Acesso</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Filtro por Resultado */}
            <Box sx={{ width: { xs: '100%', sm: '33.333%' } }}>
              <FormControl fullWidth>
                <InputLabel id="resultado-label">Resultado</InputLabel>
                <Select
                  labelId="resultado-label"
                  value={filterResultado}
                  label="Resultado"
                  onChange={(e) => setFilterResultado(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="SUCESSO">Sucesso</MenuItem>
                  <MenuItem value="FALHA">Falha</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button variant="contained" color="primary" startIcon={<FileDownloadIcon />} onClick={handleExport}>
                Exportar CSV
              </Button>
              <Button variant="outlined" onClick={() => { setFilterUsuario(''); setFilterTipoAcao(''); setFilterResultado(''); }}>
                Limpar Filtros
              </Button>
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          {isTablet ? (
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {currentLogs.length === 0 ? (
                <Typography variant="body1">Nenhum registro encontrado.</Typography>
              ) : currentLogs.map((log) => (
                <MobileCard
                  key={log.id}
                  title={log.usuario}
                  subtitle={log.dataHora}
                  fields={[
                    { label: 'Ação', value: log.tipoAcao },
                    { label: 'Resultado', value: log.resultado },
                    { label: 'Objeto', value: log.objetoAfetado },
                    { label: 'IP Origem', value: log.ipOrigem || '—' },
                  ]}
                  actions={
                    <Chip
                      label={log.resultado}
                      color={log.resultado === 'SUCESSO' ? 'success' : 'error'}
                      size="small"
                    />
                  }
                />
              ))}
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="Tabela de Logs de Auditoria">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column.id} style={{ minWidth: column.minWidth }} align={column.align}>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center">
                        <Typography variant="body1">Nenhum registro encontrado.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : currentLogs.map((log) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={log.id}>
                      <TableCell>{log.dataHora}</TableCell>
                      <TableCell>{log.usuario}</TableCell>
                      <TableCell>{log.tipoAcao}</TableCell>
                      <TableCell>{log.objetoAfetado}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={log.resultado}
                          color={log.resultado === 'SUCESSO' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredLogs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </Box>
  );
};

const AuditLogPage = () => (
  <Suspense fallback={<TableSkeleton rows={8} />}>
    <AuditLogContent />
  </Suspense>
);

export default AuditLogPage;
