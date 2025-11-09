import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment'; 
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Paper, TablePagination, IconButton, Box, CircularProgress, Typography, Tooltip } from "@mui/material"
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatRG } from '../../../utils/formatters';
import EmptyState from "../../EmptyState";
import { usePatients } from "../../../hooks/usePatients";
import { VirtualizedTable } from "../../VirtualizedTable";

interface TablePatientsProps {
  searchText?: string;
}

const TablePatients = ({ searchText }: TablePatientsProps) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 🚀 TanStack Query - substitui useState + useEffect
  const { data, isLoading, error } = usePatients(rowsPerPage, page * rowsPerPage, searchText);
  
  const patients = data?.nodes ?? [];
  const totalCount = data?.totalCount ?? 0;

  const delay = 1000;

  // 🚀 Configuração de colunas para tabela virtualizada (DEVE estar antes dos early returns)
  const virtualColumns = useMemo(() => [
    {
      field: 'nome' as const,
      headerName: 'Nome',
      width: 250,
    },
    {
      field: 'cpf' as const,
      headerName: 'CPF',
      width: 150,
      headerAlign: 'center' as const,
      align: 'center' as const,
    },
    {
      field: 'rg' as const,
      headerName: 'RG',
      width: 150,
      headerAlign: 'center' as const,
      align: 'center' as const,
      renderCell: (row: any) => formatRG(row.rg) || '—',
    },
    {
      field: 'acoes' as const,
      headerName: 'Ações',
      width: 170,
      headerAlign: 'center' as const,
      align: 'center' as const,
      renderCell: (row: any) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="Visualizar informações do paciente">
            <IconButton 
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleViewMedicalRecords(row.id, row._patientData);
              }}
              aria-label={`Visualizar informações de ${row.nome}`}
              size="small"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Editar dados do paciente">
            <IconButton 
              color="success"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row.id, row._patientData);
              }}
              aria-label={`Editar dados de ${row.nome}`}
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Gerar relatório do paciente">
            <IconButton 
              color="secondary" 
              onClick={(e) => {
                e.stopPropagation();
                handleReport(row.id, row._patientData);
              }}
              aria-label={`Gerar relatório de ${row.nome}`}
              size="small"
            >
              <AssignmentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  // Mapear pacientes (nested DTO) para linhas planas que a VirtualizedTable espera
  // Incluímos o objeto completo do paciente para evitar race conditions ao buscar depois
  const rows = useMemo(() => patients.map((p: any) => ({
    id: p.id,
    nome: p.dadoPessoal?.nome ?? '—',
    cpf: p.dadoPessoal?.cpf ?? '—',
    rg: p.dadoPessoal?.rg ?? '—',
    logradouro: p.endereco?.logradouro ?? '—',
    numero: p.endereco?.numero ?? '—',
    bairro: p.endereco?.bairro ?? '—',
    cidade: p.endereco?.cidade ?? '—',
    estado: p.endereco?.estado ?? '—',
    _patientData: p, // Armazenar o objeto completo do paciente
  })), [patients]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }

  const handleViewMedicalRecords = (id: string, patientData: any) => {
    console.log('[TablePatients handleViewMedicalRecords] id:', id);
    console.log('[TablePatients handleViewMedicalRecords] patientData:', patientData);
    
    setTimeout(() => {
      navigate("/patient/information", {
        state: { patientId: id, patient: patientData }
      });
    }, delay);
  }

  const handleEdit = (id: string, patientData: any) => {
    navigate(`/patient/edit/${id}`, { state: { patient: patientData } });
  }

  const handleReport = (id: string, patientData: any) => {
    navigate(`/patient/report/${id}`, { state: { patient: patientData } });
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ marginLeft: 2 }}>Carregando pacientes...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography color="error" variant="h6">
          {error instanceof Error ? error.message : 'Erro ao carregar pacientes'}
        </Typography>
      </Box>
    );
  }

  if (patients.length === 0) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 2 }}>
        <EmptyState
          icon={<PersonAddIcon sx={{ fontSize: 80 }} />}
          title="Nenhum paciente encontrado"
          description={searchText ? "Tente usar outros termos de busca ou cadastre um novo paciente." : "Comece cadastrando o primeiro paciente do sistema."}
          actionLabel="Cadastrar Paciente"
          onAction={() => navigate('/patient/register')}
        />
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 2 }}>
      {/* 🚀 Tabela Virtualizada - renderiza apenas linhas visíveis */}
      <VirtualizedTable
        data={rows}
        columns={virtualColumns}
        rowHeight={53}
        height={440}
        getRowId={(row) => row.id}
      />
      
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