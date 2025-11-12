import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment'; 
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Paper, TablePagination, IconButton, Box, CircularProgress, Typography, Tooltip, useMediaQuery, useTheme } from "@mui/material"
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatRG } from '../../../utils/formatters';
import EmptyState from "../../EmptyState";
import { usePatients } from "../../../hooks/usePatients";
import { VirtualizedTable, type Column } from "../../VirtualizedTable";
import MobileCard from "../MobileCard";
import type { PacienteDTO } from "../../../api/paciente.dto";

interface TablePatientsProps {
  searchText?: string;
}

type PatientRow = {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  _patientData: PacienteDTO;
};

type PatientColumn = Column<PatientRow> & { hidden?: boolean };

const TablePatients = ({ searchText }: TablePatientsProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 🚀 TanStack Query - substitui useState + useEffect
  const { data, isLoading, error } = usePatients(rowsPerPage, page * rowsPerPage, searchText);

  const patients: PacienteDTO[] = useMemo(
    () => data?.nodes ?? [],
    [data?.nodes]
  );
  const totalCount = data?.totalCount ?? 0;

  const delay = 1000;

  // 🚀 Configuração de colunas para tabela virtualizada (DEVE estar antes dos early returns)
  const virtualColumns = useMemo<PatientColumn[]>(() => {
    const allColumns: PatientColumn[] = [
      {
        field: 'nome' as const,
        headerName: 'Nome',
        width: isMobile ? 200 : 250,
      },
      {
        field: 'cpf' as const,
        headerName: 'CPF',
        width: 150,
        headerAlign: 'center' as const,
        align: 'center' as const,
        hidden: isMobile, // Oculta em mobile
      },
      {
        field: 'rg' as const,
        headerName: 'RG',
        width: 150,
        headerAlign: 'center' as const,
        align: 'center' as const,
        renderCell: (row) => formatRG(row.rg) || '—',
        hidden: isTablet, // Oculta em tablet e mobile
      },
      {
        field: 'acoes' as const,
        headerName: 'Ações',
        width: isMobile ? 120 : 170,
        headerAlign: 'center' as const,
        align: 'center' as const,
        renderCell: (row) => (
          <Box sx={{ 
            display: 'flex', 
            gap: isMobile ? 0.25 : 0.5, 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Tooltip title="Visualizar informações do paciente">
              <IconButton 
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewMedicalRecords(row.id, row._patientData);
                }}
                aria-label={`Visualizar informações de ${row.nome}`}
                size={isMobile ? "medium" : "small"}
              >
                <VisibilityIcon fontSize={isMobile ? "medium" : "small"} />
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
                size={isMobile ? "medium" : "small"}
              >
                <EditIcon fontSize={isMobile ? "medium" : "small"} />
              </IconButton>
            </Tooltip>

            {!isMobile && (
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
            )}
          </Box>
        ),
      },
    ];
    
    // Filtra colunas ocultas
    return allColumns.filter(col => !col.hidden);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, isTablet]);

  // Mapear pacientes (nested DTO) para linhas planas que a VirtualizedTable espera
  // Incluímos o objeto completo do paciente para evitar race conditions ao buscar depois
  const rows = useMemo<PatientRow[]>(() => patients.map((patient) => ({
    id: patient.id,
    nome: patient.dadoPessoal?.nome ?? '—',
    cpf: patient.dadoPessoal?.cpf ?? '—',
    rg: patient.dadoPessoal?.rg ?? '—',
    logradouro: patient.endereco?.logradouro ?? '—',
    numero: String(patient.endereco?.numero ?? '—'),
    bairro: patient.endereco?.bairro ?? '—',
    cidade: patient.endereco?.cidade ?? '—',
    estado: patient.endereco?.estado ?? '—',
    _patientData: patient,
  })), [patients]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  }

  const handleViewMedicalRecords = (id: string, patientData: PacienteDTO) => {
    console.log('[TablePatients handleViewMedicalRecords] id:', id);
    console.log('[TablePatients handleViewMedicalRecords] patientData:', patientData);
    
    setTimeout(() => {
      navigate("/patient/information", {
        state: { patientId: id, patient: patientData }
      });
    }, delay);
  }

  const handleEdit = (id: string, patientData: PacienteDTO) => {
    navigate(`/patient/edit/${id}`, { state: { patient: patientData } });
  }

  const handleReport = (id: string, patientData: PacienteDTO) => {
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
    <Paper sx={{ 
      width: '100%', 
      overflow: 'hidden', 
      marginTop: 2,
      boxShadow: { xs: 1, sm: 2 }
    }}>
      {/* Mobile: Cards | Desktop: Tabela Virtualizada */}
      {isMobile ? (
        <Box sx={{ p: 2 }}>
          {rows.map((row) => (
            <MobileCard
              key={row.id}
              title={row.nome}
              fields={[
                { label: 'CPF', value: row.cpf },
                { label: 'RG', value: formatRG(row.rg) || '—' },
              ]}
              actions={
                <>
                  <Tooltip title="Visualizar">
                    <IconButton 
                      color="primary"
                      onClick={() => handleViewMedicalRecords(row.id, row._patientData)}
                      size="medium"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton 
                      color="success"
                      onClick={() => handleEdit(row.id, row._patientData)}
                      size="medium"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </>
              }
            />
          ))}
        </Box>
      ) : (
        <VirtualizedTable
          data={rows}
          columns={virtualColumns}
          rowHeight={53}
          height={440}
          getRowId={(row) => row.id}
        />
      )}
      
      <TablePagination
        rowsPerPageOptions={isMobile ? [10, 25] : [10, 25, 100]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={isMobile ? "Por página:" : "Linhas por página:"}
        labelDisplayedRows={({ from, to, count }) => 
          isMobile 
            ? `${from}-${to} de ${count}`
            : `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
        sx={{
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          },
          '.MuiTablePagination-select': {
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          },
        }}
      />
    </Paper>
  )
}

export default TablePatients;