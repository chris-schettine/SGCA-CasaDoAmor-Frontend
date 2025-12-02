import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Cancel as CancelIcon,
  AutoAwesome as AutoAwesomeIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import {
  StatusAgendamento,
  StatusAgendamentoLabels,
  StatusAgendamentoColors,
  TipoAtendimentoLabels,
  PrioridadeLabels,
} from '../../../api/agendamentoPaciente.dto';
import type { AgendamentoPacienteResponse } from '../../../api/agendamentoPaciente.dto';

interface TableAgendamentosPacientesProps {
  agendamentos: AgendamentoPacienteResponse[];
  loading?: boolean;
  onView?: (uuid: string) => void;
  onEdit?: (uuid: string) => void;
  onCancel?: (uuid: string) => void;
}

export default function TableAgendamentosPacientes({
  agendamentos,
  loading,
  onView,
  onEdit,
  onCancel,
}: TableAgendamentosPacientesProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (agendamentos.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Nenhum agendamento encontrado
        </Typography>
      </Paper>
    );
  }

  const paginatedAgendamentos = agendamentos.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Paciente</TableCell>
              <TableCell>Serviço</TableCell>
              <TableCell>Profissional</TableCell>
              <TableCell>Data/Hora</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Prioridade</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedAgendamentos.map((agendamento) => (
              <TableRow key={agendamento.uuid} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {agendamento.pacienteNome}
                    {agendamento.geradoAutomaticamente && (
                      <Tooltip title={`Gerado automaticamente: ${agendamento.motivoGeracaoAutomatica}`}>
                        <AutoAwesomeIcon fontSize="small" color="primary" />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{agendamento.tipoServicoNome}</TableCell>
                <TableCell>{agendamento.profissionalNome}</TableCell>
                <TableCell>
                  {new Date(agendamento.dataHoraInicio).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </TableCell>
                <TableCell>
                  {agendamento.tipoAtendimento
                    ? TipoAtendimentoLabels[agendamento.tipoAtendimento]
                    : '—'}
                </TableCell>
                <TableCell>
                  {agendamento.prioridade ? PrioridadeLabels[agendamento.prioridade] : '—'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={StatusAgendamentoLabels[agendamento.status as StatusAgendamento]}
                    color={StatusAgendamentoColors[agendamento.status as StatusAgendamento]}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" justifyContent="center" gap={0.5}>
                    {onView && (
                      <Tooltip title="Visualizar">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onView(agendamento.uuid)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {agendamento.status !== StatusAgendamento.CANCELADO &&
                      agendamento.status !== StatusAgendamento.CONCLUIDO && (
                        <>
                          {onEdit && (
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => onEdit(agendamento.uuid)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onCancel && (
                            <Tooltip title="Cancelar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => onCancel(agendamento.uuid)}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </>
                      )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={agendamentos.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />
    </Paper>
  );
}
