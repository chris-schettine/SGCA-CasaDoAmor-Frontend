import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
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
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { adminService } from '../../api/admin.service';
import type { TentativaLoginDTO, AuditPerfisResponseDTO } from '../../api/admin.dto';

// --- 1. TIPAGEM E DADOS MOCKADOS ---

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

// --- 2. COMPONENTE PRINCIPAL ---

export const AuditLogPage = () => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  
  // Estados dos Filtros
  const [filterUsuario, setFilterUsuario] = useState('');
  const [filterTipoAcao, setFilterTipoAcao] = useState('');
  const [filterResultado, setFilterResultado] = useState('');

  // Simular carregamento inicial dos dados
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data: AuditPerfisResponseDTO = await adminService.getAuditPerfis();

        // Map backend 'tentativas' -> AuditLogEntry
        const tentativas: TentativaLoginDTO[] = data.relatorioLogins?.tentativas || [];
        const mapped: AuditLogEntry[] = tentativas.map((t) => ({
          id: t.id,
          dataHora: t.dataTentativa ? new Date(t.dataTentativa).toLocaleString() : '',
          usuario: t.usuario?.nome || (t.cpf ? `CPF: ${t.cpf}` : 'Anônimo'),
          tipoAcao: t.sucesso ? 'LOGIN' : 'FALHA_ACESSO',
          objetoAfetado: t.ipOrigem || t.userAgent || 'N/A',
          resultado: t.sucesso ? 'SUCESSO' : 'FALHA',
          motivoFalha: t.motivoFalha ?? null,
          ipOrigem: t.ipOrigem ?? null,
        }));

        if (!mounted) return;
        setLogs(mapped);
        setFilteredLogs(mapped);
      } catch (err) {
        console.error('Erro ao carregar auditoria:', err);
        // keep UI usable — mostrar vazio
        if (!mounted) return;
        setLogs([]);
        setFilteredLogs([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Lógica de Filtragem (Executada sempre que os filtros mudam)
  useEffect(() => {
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
    
    setFilteredLogs(result);
    setPage(0);
  }, [logs, filterUsuario, filterTipoAcao, filterResultado]);


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

    const escapeCell = (cell: any) => {
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ marginLeft: 2 }}>Carregando logs de auditoria...</Typography>
      </Box>
    );
  }

  const currentLogs = filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


  return (
    <Box sx={{ width: '100%', margin: '0 auto', maxWidth: '1200px', p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        📋 Logs de Auditoria do Sistema
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Filtros</Typography>
        
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

          {/* Filtro por Tipo de Ação - CORRIGIDO com InputLabel shrink */}
          <Box sx={{ width: { xs: '100%', sm: '33.333%' } }}>
            <FormControl fullWidth variant="outlined">
              {/* Força a label a se comportar como se o campo estivesse preenchido/focado */}
              <InputLabel shrink={filterTipoAcao !== ''}>Tipo de Ação</InputLabel>
              <Select
                value={filterTipoAcao}
                onChange={(e) => setFilterTipoAcao(e.target.value)}
                label="Tipo de Ação"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="LOGIN">Login</MenuItem>
                <MenuItem value="CRIACAO">Criação de Dado</MenuItem>
                <MenuItem value="ALTERACAO">Alteração de Dado</MenuItem>
                <MenuItem value="EXCLUSAO">Exclusão de Dado</MenuItem>
                <MenuItem value="FALHA_ACESSO">Falha de Acesso</MenuItem>
                <MenuItem value="PERMISSAO">Permissão Alterada</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Filtro por Resultado - CORRIGIDO com InputLabel shrink */}
          <Box sx={{ width: { xs: '100%', sm: '33.333%' } }}>
            <FormControl fullWidth variant="outlined">
              {/* Força a label a se comportar como se o campo estivesse preenchido/focado */}
              <InputLabel shrink={filterResultado !== ''}>Resultado</InputLabel>
              <Select
                value={filterResultado}
                onChange={(e) => setFilterResultado(e.target.value)}
                label="Resultado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="SUCESSO">Sucesso</MenuItem>
                <MenuItem value="FALHA">Falha</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Botão de Exportação */}
          <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={handleExport}
                disabled={filteredLogs.length === 0}
                sx={{ backgroundColor: '#09244B', '&:hover': { backgroundColor: '#0C2F58' } }}
              >
                Exportar ({filteredLogs.length})
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Tabela de Logs */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="logs de auditoria">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth, backgroundColor: '#eee', fontWeight: 'bold' }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    Nenhum log encontrado com os filtros aplicados.
                  </TableCell>
                </TableRow>
              ) : (
                currentLogs.map((log) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={log.id}>
                    {columns.map((column) => {
                      const value = log[column.id as keyof AuditLogEntry];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Paginação */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredLogs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Logs por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      </Paper>
    </Box>
  );
};

export default AuditLogPage;