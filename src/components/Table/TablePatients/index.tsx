import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, IconButton, Box, CircularProgress, Typography } from "@mui/material"
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGateway } from "../../../api/api.gateway";

interface Patient {
    id: number;
    nome: string;
    cpf: string;
    nomeDaMae: string;
}

interface Column {
    id: 'nome' | 'cpf' | 'nome-da-mae' | 'acoes';
    label: string;
    minWidth?: number;
    align?: 'center';
}

const columns: readonly Column[] = [
    { id: 'nome', label: 'Nome', minWidth: 170 },
    { id: 'cpf', label: 'CPF', minWidth: 170 },
    { id: 'nome-da-mae', label: 'Nome da mãe', minWidth: 170 },
    { id: 'acoes', label: 'Ações', minWidth: 170, align: 'center' },
]

const TablePatients = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const delay = 1000;

    // Fetch data from the API when the component mounts
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setLoading(true);
                const response = await apiGateway.getAllPessoaFisica(); // Call your API method]
                console.log("Response: ", response)
                setPatients(response.data); // Assuming the list of patients is in response.data
                setError(null); // Clear any previous errors
            } catch (err) {
                console.error("Error fetching patients:", err);
                setError("Não foi possível carregar os pacientes. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []); // Empty dependency array means this effect runs once when the component mounts


    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    }

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    }

    // Passar o paciente a partir do id 
    const handleViewMedicalRecords = (id: number) => {
        console.log('Visualizar ID: ', id);
        setTimeout(() => {
            navigate("/patient/information", {
                state: { patientId: id }
            });
        }, delay);
    }

    const handleEdit = (id: number) => {
        console.log('Editar ID: ', id);
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
                            patients
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((patient) => (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={patient.id}>
                                        <TableCell>{patient.nome}</TableCell>
                                        <TableCell>{patient.cpf}</TableCell>
                                        <TableCell>{patient.nomeDaMae}</TableCell>
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
                count={patients.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    )
}

export default TablePatients;