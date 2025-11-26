import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Paper, TablePagination, IconButton, Box, Typography, useMediaQuery, useTheme, CircularProgress } from "@mui/material";
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
  const isNarrowDesktop = useMediaQuery(theme.breakpoints.down('lg'));
  const isVeryTight = useMediaQuery('(max-width:1024px)');
  // Esconde colunas progressivamente: Parentesco some em telas estreitas; RG só some se Parentesco já está escondida
  const hideParentesco = isMobile || isTablet || isNarrowDesktop;
  const hideRg = hideParentesco && (isMobile || isTablet || isVeryTight);
  const useCardLayout = isTablet;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

  // TanStack Query - busca acompanhantes
  const { data, isLoading, error } = useAcompanhantes(rowsPerPage, page * rowsPerPage, searchText);

  const companions: AcompanhanteDTO[] = useMemo(
    () => data?.nodes ?? [],
    [data?.nodes]
  );
  const totalCount = data?.totalCount ?? 0;

  // Configuração de colunas para tabela virtualizada
  const virtualColumns = useMemo<CompanionColumn[]>(() => {
    const allColumns: CompanionColumn[] = [
      {
        field: 'nome' as const,
        headerName: 'Nome',
        width: isMobile ? 180 : (isNarrowDesktop ? 220 : 250),
      },
      {
        field: 'cpf' as const,
        headerName: 'CPF',
        width: isNarrowDesktop ? 130 : 150,
        headerAlign: 'left' as const,
        align: 'left' as const,
        hidden: isMobile,
      },
      {
        field: 'rg' as const,
        headerName: 'RG',
        width: isNarrowDesktop ? 110 : 140,
        headerAlign: 'left' as const,
        align: 'left' as const,
        renderCell: (row) => formatRG(row.rg) || '—',
        // Esconde RG depois de Parentesco quando o espaço continua apertado
        hidden: hideRg,
      },
      {
        field: 'pacienteNome' as const,
        headerName: 'Paciente',
        width: isMobile ? 150 : (isNarrowDesktop ? 170 : 200),
        headerAlign: 'left' as const,
        align: 'left' as const,
      },
      {
        field: 'parentesco' as const,
        headerName: 'Parentesco',
        width: isNarrowDesktop ? 110 : 120,
        headerAlign: 'left' as const,
        align: 'left' as const,
        hidden: hideParentesco,
      },
      {
        field: 'acoes' as const,
        headerName: 'Ações',
        width: isMobile ? 100 : (isNarrowDesktop ? 110 : 120),
        align: 'center' as const,
        headerAlign: 'center' as const,
        renderCell: (row) => (
          <Box sx={{ 
            display: 'flex', 
            gap: isMobile ? 0.25 : 0.5, 
            justifyContent: 'center' 
          }}>
            {navigatingId === row.id ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CircularProgress size={18} />
                <Typography variant="caption">Abrindo...</Typography>
              </Box>
            ) : (
              <>
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
              </>
            )}
          </Box>
        ),
      },
    ];
    
    return allColumns.filter(col => !col.hidden) as CompanionColumn[];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, isTablet, isNarrowDesktop, isVeryTight, hideParentesco, hideRg]);

  // Garante hooks estáveis: mapeia colunas de ações fora do JSX condicional
  const tableColumns = useMemo<CompanionColumn[]>(() => virtualColumns.map(col => col.field === 'acoes' ? {
    ...col,
    renderCell: (row: CompanionRow) => (
      navigatingId === row.id ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 0.5 }}>
          <CircularProgress size={18} />
          <Typography variant="caption">Abrindo...</Typography>
        </Box>
      ) : (col.renderCell ? col.renderCell(row) : null)
    )
  } : col), [virtualColumns, navigatingId]);

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

  const handleView = (id: string, companionData: AcompanhanteDTO) => {
    setNavigatingId(id);
    navigate("/companion/information", {
      state: { acompanhante: companionData }
    });
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
      {/* Mobile/Tablet: Cards | Desktop: Tabela Virtualizada */}
      {useCardLayout ? (
        <Box sx={{ p: 2 }}>
          {rows.map((row) => (
            <MobileCard
              key={row.id}
              title={row.nome}
              fields={[
                { label: 'Paciente', value: row.pacienteNome || '—' },
                { label: 'Parentesco', value: row.parentesco || '—' },
                { label: 'CPF', value: row.cpf },
                { label: 'RG', value: formatRG(row.rg) || '—' },
              ]}
              actions={
                navigatingId === row.id ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Abrindo ficha...</Typography>
                  </Box>
                ) : (
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
                )
              }
            />
          ))}
        </Box>
      ) : (
        <VirtualizedTable
          data={rows}
          columns={tableColumns}
          rowHeight={60}
          height={440}
          getRowId={(row) => row.id}
          ariaLabel="Tabela de acompanhantes"
        />
      )}
      
      <TablePagination
        rowsPerPageOptions={useCardLayout ? [10, 25] : [10, 25, 100]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={useCardLayout ? "Por página:" : "Linhas por página:"}
        labelDisplayedRows={({ from, to, count }) => 
          useCardLayout 
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
