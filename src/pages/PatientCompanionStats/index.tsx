import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  alpha,
  useTheme,
  Paper,
} from '@mui/material';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import KitchenIcon from '@mui/icons-material/Kitchen';
import {
  dashboardStatsService,
  type EstatisticasPacienteAcompanhanteDTO,
} from '../../api/dashboardStats.service';
import { MetricCard } from '../../components/Dashboard/MetricCard';
import { StatCard } from '../../components/Dashboard/StatCard';

const CHART_COLORS = ['#1976d2', '#9c27b0', '#f57c00', '#388e3c', '#d32f2f', '#0288d1'];

const PatientCompanionStats = () => {
  const theme = useTheme();
  const [statistics, setStatistics] = useState<EstatisticasPacienteAcompanhanteDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const data = await dashboardStatsService.getDashboardStatistics();
        setStatistics(data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao carregar estatísticas');
        console.error('Erro ao buscar estatísticas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!statistics) return null;

  // Prepare data for charts
  const statusData = [
    { name: 'Em Tratamento', value: statistics.pacientesEmTratamento },
    { name: 'Curados', value: statistics.pacientesCurados },
    { name: 'Em Observação', value: statistics.pacientesEmObservacao },
    { name: 'Falecidos', value: statistics.pacientesFalecidos },
  ];

  const parentescoData = Object.entries(statistics.acompanhantesPorParentesco)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const registrosMensaisData = statistics.registrosPacientesPorMes.map((registro) => ({
    mes: registro.mesNome.substring(0, 3),
    pacientes: registro.totalRegistros,
    acompanhantes:
      statistics.registrosAcompanhantesPorMes.find(
        (r) => r.mes === registro.mes && r.ano === registro.ano
      )?.totalRegistros || 0,
  }));

  const topCidadesData = statistics.topCidadesComMaisPacientes.slice(0, 5);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Estatísticas de Pacientes e Acompanhantes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Última atualização: {new Date(statistics.dataHoraConsulta).toLocaleString('pt-BR')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {statistics.periodoAnalisado}
        </Typography>
      </Box>

      {/* Main Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Total de Pacientes"
            value={statistics.totalPacientes}
            subtitle={`${statistics.pacientesAtivos} ativos (${statistics.taxaPacientesAtivos.toFixed(1)}%)`}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Total de Acompanhantes"
            value={statistics.totalAcompanhantes}
            subtitle={`${statistics.acompanhantesAtivos} ativos (${statistics.taxaAcompanhantesAtivos.toFixed(1)}%)`}
            icon={<GroupIcon />}
            color="secondary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Registros Hoje"
            value={statistics.pacientesRegistradosHoje + statistics.acompanhantesRegistradosHoje}
            subtitle={`${statistics.pacientesRegistradosHoje} pacientes, ${statistics.acompanhantesRegistradosHoje} acompanhantes`}
            icon={<TrendingUpIcon />}
            color="success"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Média Acompanhantes"
            value={statistics.mediaAcompanhantesPorPaciente.toFixed(2)}
            subtitle="Por paciente"
            icon={<FamilyRestroomIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Status and Parentesco Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Pacientes por Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Pacientes por Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Acompanhantes por Parentesco */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Acompanhantes por Parentesco
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={parentescoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Trends */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Registros Mensais (Últimos 12 Meses)
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={registrosMensaisData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="pacientes"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    name="Pacientes"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="acompanhantes"
                    stroke={theme.palette.secondary.main}
                    strokeWidth={2}
                    name="Acompanhantes"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Clinical Data and Kitchen Assistance */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Clinical Data */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                <LocalHospitalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Dados Clínicos
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <StatCard label="Com Dados Clínicos" value={statistics.pacientesComDadosClinicos} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <StatCard label="Com Sonda" value={statistics.pacientesComSonda} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <StatCard label="Com Curativo" value={statistics.pacientesComCurativo} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <StatCard
                    label="Taxa Cobertura"
                    value={`${statistics.taxaPacientesComDadosClinicos.toFixed(1)}%`}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Kitchen Assistance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                <KitchenIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Ajuda na Cozinha
              </Typography>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h2" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                  {statistics.percentualAjudamCozinha.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {statistics.acompanhantesPodemAjudarCozinha} de {statistics.totalAcompanhantes} acompanhantes
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Podem Ajudar', value: statistics.acompanhantesPodemAjudarCozinha },
                      { name: 'Não Podem', value: statistics.acompanhantesNaoPodemAjudarCozinha },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    <Cell fill={theme.palette.success.main} />
                    <Cell fill={alpha(theme.palette.text.secondary, 0.2)} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Cities */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Top 5 Cidades com Mais Pacientes
              </Typography>
              <Grid container spacing={2}>
                {topCidadesData.map((cidade, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {index + 1}. {cidade.cidade}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {cidade.totalPacientes}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cidade.percentualTotal.toFixed(1)}% do total
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PatientCompanionStats;
