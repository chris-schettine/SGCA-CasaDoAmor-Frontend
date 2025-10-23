import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, IconButton, Box, CircularProgress, Typography } from "@mui/material"
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { pacienteService } from "../../../api/paciente.service";
import type { PacienteDTO } from "../../../api/paciente.dto";
import { formatRG } from '../../../utils/formatters';

interface Column {
  id: 'nome' | 'cpf' | 'rg' | 'acoes';
  label: string;
  minWidth?: number;
  align?: 'center';
}

const columns: readonly Column[] = [
  { id: 'nome', label: 'Nome', minWidth: 170 },
  { id: 'cpf', label: 'CPF', minWidth: 170 },
  { id: 'rg', label: 'RG', minWidth: 150 },
  { id: 'acoes', label: 'Ações', minWidth: 170, align: 'center' },
]

interface TablePatientsProps {
  searchText?: string;
}

const TablePatients = ({ searchText }: TablePatientsProps) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [patients, setPatients] = useState<PacienteDTO[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const delay = 1000;
  const searchDebounce = 500;

  // Fetch data from the API when the component mounts
  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await pacienteService.listarPacientes(rowsPerPage, page * rowsPerPage, searchText);
        if (!mounted) return;
        setPatients(response.nodes);
        setTotalCount(response.totalCount);
        setError(null);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError("Não foi possível carregar os pacientes. Tente novamente mais tarde.");
      } finally {
        if (mounted) setLoading(false);
      }
    }, searchDebounce);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [page, rowsPerPage, searchText]);


  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }

  // Passar o paciente a partir do id 
  const handleViewMedicalRecords = (id: string) => {
    // find patient object to pass via state
    const patientObj = patients.find((p) => p.id === id);
    setTimeout(() => {
      navigate("/patient/information", {
        state: { patient: patientObj }
      });
    }, delay);
  }

  const handleEdit = (id: string) => {
    const patientObj = patients.find((p) => p.id === id);
    navigate(`/patient/edit/${id}`, { state: { patient: patientObj } });
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ marginLeft: 2 }}>Carregando pacientes...</Typography>
      </Box>
    );
  }

  if (error) {
    console.log(error);
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 2 }}>
      <TableContainer sx={{ maxHeight: 440 }} >
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth, backgroundColor: '#ccc' }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  Nenhum paciente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={patient.id}>
                      <TableCell>{patient.nome}</TableCell>
                      <TableCell>{patient.cpf}</TableCell>
                      <TableCell>{formatRG(patient.rg) || '—'}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary"
                        onClick={() => handleViewMedicalRecords(patient.id)}
                        aria-label="visualizar"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton color="success"
                        onClick={() => handleEdit(patient.id)}
                        aria-label="editar"
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  )
}

export default TablePatients;