import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Paper, TablePagination, IconButton, Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { PatientListSkeleton } from '../../SuspenseWrapper';
import StandardTooltip from '../../StandardTooltip';
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatRG } from '../../../utils/formatters';
import EmptyState from "../../EmptyState";
import { useAcompanhantes } from "../../../hooks/useAcompanhantes";
import { VirtualizedTable, type Column } from "../../VirtualizedTable";
import MobileCard from '../MobileCard';
import type { AcompanhanteDTO } from "../../../api/acompanhante.dto";

interface TableCompanionsProps {
  searchText?: string;
}

type CompanionRow = {
  id: string;
  nome: string;
  cpf: string;
  rg: string;
  pacienteNome: string;
  parentesco: string;
  _companionData: AcompanhanteDTO;
};

type CompanionColumn = Column<CompanionRow> & { hidden?: boolean };

const TableCompanions = ({ searchText }: TableCompanionsProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // TanStack Query - busca acompanhantes
  const { data, isLoading, error } = useAcompanhantes(rowsPerPage, page * rowsPerPage, searchText);

  const companions: AcompanhanteDTO[] = useMemo(
    () => data?.nodes ?? [],
    [data?.nodes]
  );
  const totalCount = data?.totalCount ?? 0;

  const delay = 1000;

  // Configuração de colunas para tabela virtualizada
  const virtualColumns = useMemo<CompanionColumn[]>(() => {
    const allColumns: CompanionColumn[] = [
      {
        field: 'nome' as const,
        headerName: 'Nome',
        width: isMobile ? 180 : 250,
      },
      {
        field: 'cpf' as const,
        headerName: 'CPF',
        width: 150,
        hidden: isMobile,
      },
      {
        field: 'rg' as const,
        headerName: 'RG',
        width: 150,
        renderCell: (row) => formatRG(row.rg) || '—',
        hidden: isTablet,
      },
      {
        field: 'pacienteNome' as const,
        headerName: 'Paciente',
        width: isMobile ? 150 : 200,
      },
      {
        field: 'parentesco' as const,
        headerName: 'Parentesco',
        width: 120,
        hidden: isMobile,
      },
      {
        field: 'acoes' as const,
        headerName: 'Ações',
        width: isMobile ? 100 : 120,
        align: 'center' as const,
        headerAlign: 'center' as const,
        renderCell: (row) => (
          <Box sx={{ 
            display: 'flex', 
            gap: isMobile ? 0.25 : 0.5, 
            justifyContent: 'center' 
          }}>
            <StandardTooltip title="Visualizar informações do acompanhante">
              <IconButton 
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleView(row.id, row._companionData);
                }}
                aria-label={`Visualizar informações de ${row.nome}`}
                size={isMobile ? "medium" : "small"}
              >
                <VisibilityIcon fontSize={isMobile ? "medium" : "small"} />
              </IconButton>
            </StandardTooltip>
            
            <StandardTooltip title="Editar dados do acompanhante">
              <IconButton 
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(row.id, row._companionData);
                }}
                aria-label={`Editar dados de ${row.nome}`}
                size={isMobile ? "medium" : "small"}
              >
                <EditIcon fontSize={isMobile ? "medium" : "small"} />
              </IconButton>
            </StandardTooltip>
          </Box>
        ),
      },
    ];
    
    return allColumns.filter(col => !col.hidden);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, isTablet]);

  // Mapear acompanhantes para linhas planas
  const rows = useMemo<CompanionRow[]>(() => companions.map((companion) => ({
    id: companion.id,
    nome: companion.dadoPessoal?.nome ?? '—',
    cpf: companion.dadoPessoal?.cpf ?? '—',
    rg: companion.dadoPessoal?.rg ?? '—',
    pacienteNome: companion.pacienteNome ?? '—',
    parentesco: companion.parentesco ?? '—',
    _companionData: companion,
  })), [companions]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleView = (_id: string, companionData: AcompanhanteDTO) => {
    setTimeout(() => {
      navigate("/companion/information", {
        state: { acompanhante: companionData }
      });
    }, delay);
  };

  const handleEdit = (id: string, companionData: AcompanhanteDTO) => {
    navigate(`/companion/edit/${id}`, { state: { acompanhante: companionData } });
  };

  if (isLoading) {
    return <PatientListSkeleton />;
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography color="error" variant="h6">
          {error instanceof Error ? error.message : 'Erro ao carregar acompanhantes'}
        </Typography>
      </Box>
    );
  }

  if (companions.length === 0) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 2 }}>
        <EmptyState
          icon={<PersonAddIcon sx={{ fontSize: 80 }} />}
          title="Nenhum acompanhante encontrado"
          description={searchText ? "Tente usar outros termos de busca." : "Os acompanhantes cadastrados aparecerão aqui."}
          actionLabel="Voltar para Pacientes"
          onAction={() => navigate('/patients')}
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
                { label: 'Parentesco', value: row.parentesco || '—' },
                { label: 'CPF', value: row.cpf },
                { label: 'RG', value: formatRG(row.rg) || '—' },
              ]}
              actions={
                <>
                  <StandardTooltip title="Visualizar">
                    <IconButton 
                      color="primary"
                      onClick={() => handleView(row.id, row._companionData)}
                      size="medium"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </StandardTooltip>
                  <StandardTooltip title="Editar">
                    <IconButton 
                      color="success"
                      onClick={() => handleEdit(row.id, row._companionData)}
                      size="medium"
                    >
                      <EditIcon />
                    </IconButton>
                  </StandardTooltip>
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
};

export default TableCompanions;
