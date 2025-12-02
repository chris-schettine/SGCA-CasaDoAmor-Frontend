import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Add as AddIcon, HotelOutlined, CheckCircleOutline, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AnimatedPage } from '../../components/AnimatedPage';
import PageContainer from '../../components/PageContainer';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import TableHospedagens from '../../components/Table/TableHospedagens';
import { usePermissions } from '../../hooks/usePermissions';
import { quartoService } from '../../api/quarto.service';
import type { QuartoAlaOption } from '../../api/quarto.dto';
import { hospedagemService } from '../../api/hospedagem.service';

export default function Hospedagens() {
  const navigate = useNavigate();
  const { isAdmin } = usePermissions();

  // Search filters
  const [pacienteNome, setPacienteNome] = useState('');
  const [quartoNome, setQuartoNome] = useState('');
  const [alaFilter, setAlaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  // Stats
  const [statsAtivas, setStatsAtivas] = useState(0);
  const [statsVencidas, setStatsVencidas] = useState(0);

  // Alas for dropdown
  const [alas, setAlas] = useState<QuartoAlaOption[]>([]);

  // Refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Load alas for filter
    quartoService.listarAlas()
      .then(setAlas)
      .catch((err: any) => console.error('Error loading alas:', err));

    // Load quick stats
    hospedagemService.listarAtivas()
      .then((data: any) => setStatsAtivas(data.length))
      .catch((err: any) => console.error('Error loading active stays:', err));

    hospedagemService.listarVencidas()
      .then((data: any) => setStatsVencidas(data.length))
      .catch((err: any) => console.error('Error loading overdue stays:', err));
  }, [refreshKey]);

  const handleSearch = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleClearFilters = () => {
    setPacienteNome('');
    setQuartoNome('');
    setAlaFilter('');
    setStatusFilter('');
    setDataInicio('');
    setDataFim('');
    setRefreshKey(prev => prev + 1);
  };

  const handleNewHospedagem = () => {
    navigate('/hospedagens/cadastrar');
  };

  const actionButton = isAdmin ? (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddIcon />}
      onClick={handleNewHospedagem}
      sx={{
        color: 'white !important',
        WebkitTextFillColor: 'white !important',
      }}
    >
      Nova Hospedagem
    </Button>
  ) : undefined;

  return (
    <AnimatedPage>
      <PageContainer>
        <Breadcrumbs items={[{ label: 'Hospedagens' }]} />
        
        <PageHeader
          title="Hospedagens"
          subtitle="Gestão de hospedagens e ocupação de leitos"
          action={actionButton}
        />

          {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HotelOutlined color="primary" />
                <Box>
                  <Typography variant="h4">{statsAtivas}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hospedagens Ativas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning color="warning" />
                <Box>
                  <Typography variant="h4" color="warning.main">{statsVencidas}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Previsões Vencidas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleOutline color="success" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total de Registros
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Consulte a tabela abaixo
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

        {/* Filters */}
        <Paper sx={{ padding: 2, marginBottom: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Filtros de Busca</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Nome do Paciente"
              value={pacienteNome}
              onChange={(e) => setPacienteNome(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Nome do Quarto"
              value={quartoNome}
              onChange={(e) => setQuartoNome(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Ala"
              value={alaFilter}
              onChange={(e) => setAlaFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="">Todas</MenuItem>
              {alas.map((ala) => (
                <MenuItem key={ala.valor} value={ala.valor}>
                  {ala.descricao}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="ATIVA">Ativa</MenuItem>
              <MenuItem value="ENCERRADA">Encerrada</MenuItem>
              <MenuItem value="TRANSFERIDA">Transferida</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Data Início"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Data Fim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              sx={{
                height: '40px',
                color: 'white !important',
                WebkitTextFillColor: 'white !important',
              }}
            >
              Buscar
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClearFilters}
              sx={{ height: '40px' }}
            >
              Limpar Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

        {/* Table */}
        <TableHospedagens
          pacienteNome={pacienteNome}
          quartoNome={quartoNome}
          ala={alaFilter}
          status={statusFilter}
          dataInicio={dataInicio}
          dataFim={dataFim}
          refreshKey={refreshKey}
          onRefresh={() => setRefreshKey(prev => prev + 1)}
        />
      </PageContainer>
    </AnimatedPage>
  );
}
