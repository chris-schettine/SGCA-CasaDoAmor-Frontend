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
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// --- 1. TIPAGEM E DADOS MOCKADOS ---

interface AuditLogEntry {
  id: number;
  dataHora: string;
  usuario: string;
  tipoAcao: 'LOGIN' | 'CRIACAO' | 'ALTERACAO' | 'EXCLUSAO' | 'FALHA_ACESSO' | 'PERMISSAO';
  objetoAfetado: string;
  resultado: 'SUCESSO' | 'FALHA';
}

const mockLogs: AuditLogEntry[] = [
  { id: 1, dataHora: '2025-10-30 09:00:00', usuario: 'admin.pedro', tipoAcao: 'LOGIN', objetoAfetado: 'N/A', resultado: 'SUCESSO' },
  { id: 2, dataHora: '2025-10-30 09:15:22', usuario: 'admin.pedro', tipoAcao: 'CRIACAO', objetoAfetado: 'Paciente ID: 456', resultado: 'SUCESSO' },
  { id: 3, dataHora: '2025-10-30 10:45:00', usuario: 'user.joao', tipoAcao: 'FALHA_ACESSO', objetoAfetado: 'Login', resultado: 'FALHA' },
  { id: 4, dataHora: '2025-10-30 11:30:00', usuario: 'admin.pedro', tipoAcao: 'ALTERACAO', objetoAfetado: 'Permissão User: 101', resultado: 'SUCESSO' },
  { id: 5, dataHora: '2025-11-01 14:00:00', usuario: 'manager.ana', tipoAcao: 'EXCLUSAO', objetoAfetado: 'Relatório Mensal', resultado: 'SUCESSO' },
  { id: 6, dataHora: '2025-11-01 14:05:00', usuario: 'user.joao', tipoAcao: 'LOGIN', objetoAfetado: 'N/A', resultado: 'SUCESSO' },
  { id: 7, dataHora: '2025-11-01 14:10:00', usuario: 'manager.ana', tipoAcao: 'ALTERACAO', objetoAfetado: 'Configuração do Sistema', resultado: 'FALHA' },
  { id: 8, dataHora: '2025-11-02 08:30:00', usuario: 'admin.pedro', tipoAcao: 'PERMISSAO', objetoAfetado: 'Grupo: Auditores', resultado: 'SUCESSO' },
  { id: 9, dataHora: '2025-11-02 09:00:00', usuario: 'user.joao', tipoAcao: 'CRIACAO', objetoAfetado: 'Usuário: 999', resultado: 'FALHA' },
];

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
    const timer = setTimeout(() => {
      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
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
    console.log(`Exportando ${filteredLogs.length} logs para CSV/PDF...`, filteredLogs);
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
        
        <Grid container spacing={3} alignItems="flex-end">
          
          {/* Filtro por Usuário */}
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Buscar por Usuário"
              value={filterUsuario}
              onChange={(e) => setFilterUsuario(e.target.value)}
              variant="outlined"
            />
          </Grid>
          
          {/* Filtro por Tipo de Ação - CORRIGIDO com InputLabel shrink */}
          <Grid item xs={12} sm={4}>
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
          </Grid>

          {/* Filtro por Resultado - CORRIGIDO com InputLabel shrink */}
          <Grid item xs={12} sm={4}>
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
          </Grid>

          {/* Botão de Exportação */}
          <Grid item xs={12}>
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
          </Grid>
        </Grid>
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