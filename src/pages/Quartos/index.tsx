import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
} from '@mui/material';
import {  
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { QuartoAlaOption, QuartoTipoOption } from '../../api/quarto.dto';
import { AnimatedPage } from '../../components/AnimatedPage';
import PageContainer from '../../components/PageContainer';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import { TableSkeleton } from '../../components/SuspenseWrapper';
import TableQuartos from '../../components/Table/TableQuartos';
import { usePermissions } from '../../hooks/usePermissions';
import { quartoService } from '../../api/quarto.service';
import { toastError } from '../../utils/toast';

const Quartos = () => {
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();
  
  const [searchText, setSearchText] = useState('');
  const [filterAla, setFilterAla] = useState<string>('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [alas, setAlas] = useState<QuartoAlaOption[]>([]);
  const [tipos, setTipos] = useState<QuartoTipoOption[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [tiposData, alasData] = await Promise.all([
          quartoService.listarTipos(),
          quartoService.listarAlas(),
        ]);
        setTipos(tiposData);
        setAlas(alasData);
      } catch (error) {
        console.error('Erro ao carregar opções:', error);
        toastError('Erro ao carregar opções de filtros');
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleFilterAlaChange = (event: SelectChangeEvent) => {
    setFilterAla(event.target.value);
  };

  const handleFilterTipoChange = (event: SelectChangeEvent) => {
    setFilterTipo(event.target.value);
  };

  const handleFilterStatusChange = (event: SelectChangeEvent) => {
    setFilterStatus(event.target.value);
  };

  const handleCreateQuarto = () => {
    navigate('/quartos/cadastrar');
  };

  if (loading) {
    return (
      <AnimatedPage>
        <PageContainer>
          <TableSkeleton rows={10} />
        </PageContainer>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <PageContainer>
        <Breadcrumbs items={[{ label: 'Quartos' }]} />
        
        <PageHeader
          title="Quartos"
          subtitle="Gestão de quartos e leitos"
          action={
            isAdmin ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateQuarto}
                sx={{
                  color: '#FFFFFF !important',
                  WebkitTextFillColor: '#FFFFFF !important',
                  '& .MuiButton-startIcon': {
                    color: '#FFFFFF !important',
                  },
                  '& .MuiTypography-root': {
                    color: '#FFFFFF !important',
                    WebkitTextFillColor: '#FFFFFF !important',
                  },
                }}
              >
                Novo Quarto
              </Button>
            ) : undefined
          }
        />

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Buscar por número do quarto..."
              value={searchText}
              onChange={handleSearchChange}
              size="small"
              sx={{ flex: '1 1 300px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Ala</InputLabel>
              <Select
                value={filterAla}
                onChange={handleFilterAlaChange}
                label="Ala"
              >
                <MenuItem value="">Todas</MenuItem>
                {alas.map(ala => (
                  <MenuItem key={ala.valor} value={ala.valor}>{ala.descricao}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filterTipo}
                onChange={handleFilterTipoChange}
                label="Tipo"
              >
                <MenuItem value="">Todos</MenuItem>
                {tipos.map(tipo => (
                  <MenuItem key={tipo.valor} value={tipo.valor}>{tipo.descricao}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={handleFilterStatusChange}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="manutencao">Em Manutenção</MenuItem>
                <MenuItem value="inativo">Inativo</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        <TableQuartos
          searchText={searchText}
          filterAla={filterAla}
          filterTipo={filterTipo}
          filterStatus={filterStatus}
        />
      </PageContainer>
    </AnimatedPage>
  );
};

export default Quartos;
