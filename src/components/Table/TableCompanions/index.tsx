import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Paper, TablePagination, IconButton, Box, CircularProgress, Typography, Tooltip } from "@mui/material";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatRG } from '../../../utils/formatters';
import EmptyState from "../../EmptyState";
import { useAcompanhantes } from "../../../hooks/useAcompanhantes";
import { VirtualizedTable } from "../../VirtualizedTable";

interface TableCompanionsProps {
  searchText?: string;
}

const TableCompanions = ({ searchText }: TableCompanionsProps) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // TanStack Query - busca acompanhantes
  const { data, isLoading, error } = useAcompanhantes(rowsPerPage, page * rowsPerPage, searchText);
  
  const companions = data?.nodes ?? [];
  const totalCount = data?.totalCount ?? 0;

  const delay = 1000;

  // Configuração de colunas para tabela virtualizada
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
    },
    {
      field: 'rg' as const,
      headerName: 'RG',
      width: 150,
      renderCell: (row: any) => formatRG(row.rg) || '—',
    },
    {
      field: 'pacienteNome' as const,
      headerName: 'Paciente',
      width: 200,
    },
    {
      field: 'parentesco' as const,
      headerName: 'Parentesco',
      width: 120,
    },
    {
      field: 'acoes' as const,
      headerName: 'Ações',
      width: 120,
      renderCell: (row: any) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title="Visualizar informações do acompanhante">
            <IconButton 
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleView(row.id, row._companionData);
              }}
              aria-label={`Visualizar informações de ${row.nome}`}
              size="small"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Editar dados do acompanhante">
            <IconButton 
              color="success"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row.id, row._companionData);
              }}
              aria-label={`Editar dados de ${row.nome}`}
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  // Mapear acompanhantes para linhas planas
  const rows = useMemo(() => companions.map((c: any) => ({
    id: c.id,
    nome: c.dadoPessoal?.nome ?? '—',
    cpf: c.dadoPessoal?.cpf ?? '—',
    rg: c.dadoPessoal?.rg ?? '—',
    pacienteNome: c.pacienteNome ?? '—',
    parentesco: c.parentesco ?? '—',
    _companionData: c, // Armazenar o objeto completo do acompanhante
  })), [companions]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleView = (_id: string, companionData: any) => {
    setTimeout(() => {
      navigate("/companion/information", {
        state: { acompanhante: companionData }
      });
    }, delay);
  };

  const handleEdit = (id: string, companionData: any) => {
    navigate(`/companion/edit/${id}`, { state: { acompanhante: companionData } });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ marginLeft: 2 }}>Carregando acompanhantes...</Typography>
      </Box>
    );
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
    <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: 2 }}>
      {/* Tabela Virtualizada */}
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
  );
};

export default TableCompanions;
