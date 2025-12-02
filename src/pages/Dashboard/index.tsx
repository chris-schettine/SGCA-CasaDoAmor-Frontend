import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  useTheme,
  Tabs,
  Tab,
} from '@mui/material';
import {
  People,
  PersonOff,
  Category,
  Work,
  CalendarMonth,
  Home,
  HomeWork,
  TrendingUp,
  MeetingRoom,
  Hotel,
  BedroomParent,
  BedOutlined,
  Warning,
  ExitToApp,
  EventNote,
  CheckCircle,
  Cancel,
  Schedule,
  AccessTime,
  FamilyRestroom,
} from '@mui/icons-material';
import { AnimatedPage } from '../../components/AnimatedPage';
import PageContainer from '../../components/PageContainer';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import { profissionalService } from '../../api/profissional.service';
import type { ProfissionalDashboardStats } from '../../api/profissional.dto';
import { quartoService } from '../../api/quarto.service';
import type { QuartoStatsDTO } from '../../api/quarto.dto';
import { hospedagemService } from '../../api/hospedagem.service';
import type { HospedagemStatsDTO } from '../../api/hospedagem.dto';
import { agendamentoEstatisticasService } from '../../api/agendamentoEstatisticas.service';
import type { EstatisticasAgendamentoDTO } from '../../api/agendamentoEstatisticas.dto';
import { dashboardStatsService, type EstatisticasPacienteAcompanhanteDTO } from '../../api/dashboardStats.service';
import { toastError } from '../../utils/toast';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}

const StatCard = ({ title, value, icon, color = 'primary.main', subtitle }: StatCardProps) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${color}15`,
              color: color,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

interface CategoryListProps {
  title: string;
  items: Array<{ label: string; count: number; codigo?: string }>;
  icon: React.ReactNode;
}

const CategoryList = ({ title, items, icon }: CategoryListProps) => {
  const theme = useTheme();
  
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: `${theme.palette.primary.main}15`,
            color: theme.palette.primary.main,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </Box>
      
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Nenhum dado disponível
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {items.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'background.default',
                '&:hover': {
                  bgcolor: `${theme.palette.primary.main}08`,
                },
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                {item.label || item.codigo || 'Não informado'}
              </Typography>
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 36,
                  height: 28,
                  px: 1.25,
                  backgroundColor: theme.palette.primary.dark,
                  borderRadius: '999px',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  // Force white text to override global MuiTypography rule
                  color: '#FFFFFF !important',
                  WebkitTextFillColor: '#FFFFFF !important',
                  textShadow: 'none !important',
                  lineHeight: 1,
                }}
              >
                {item.count}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProfissionalDashboardStats | null>(null);
  const [quartoStats, setQuartoStats] = useState<QuartoStatsDTO | null>(null);
  const [hospedagemStats, setHospedagemStats] = useState<HospedagemStatsDTO | null>(null);
  const [agendamentoStats, setAgendamentoStats] = useState<EstatisticasAgendamentoDTO | null>(null);
  const [pacienteStats, setPacienteStats] = useState<EstatisticasPacienteAcompanhanteDTO | null>(null);
  const [tabErrors, setTabErrors] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Clear error for current tab
        setTabErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[tabValue];
          return newErrors;
        });
        
        if (tabValue === 0) {
          const data = await profissionalService.obterEstatisticasDashboard();
          setStats(data);
        } else if (tabValue === 1) {
          const data = await quartoService.obterEstatisticas();
          setQuartoStats(data);
        } else if (tabValue === 2) {
          const data = await hospedagemService.obterEstatisticas();
          setHospedagemStats(data);
        } else if (tabValue === 3) {
          const data = await agendamentoEstatisticasService.obterEstatisticas();
          setAgendamentoStats(data);
        } else if (tabValue === 4) {
          const data = await dashboardStatsService.getDashboardStatistics();
          setPacienteStats(data);
        }
      } catch (err: any) {
        console.error('Erro ao carregar estatísticas:', err);
        
        // Provide more specific error messages based on tab and error type
        let message = 'Erro ao carregar estatísticas do dashboard.';
        
        if (err.response?.status === 500 && tabValue === 3) {
          message = 'O endpoint de estatísticas de agendamentos ainda não está disponível no backend ou está com problemas. Verifique se o backend foi atualizado com a versão mais recente.';
        } else if (err.response?.data?.message) {
          message = err.response.data.message;
        } else if (err.response?.status === 404) {
          message = 'Endpoint de estatísticas não encontrado. Verifique se o backend está atualizado.';
        }
        
        // Store error for this specific tab
        setTabErrors(prev => ({ ...prev, [tabValue]: message }));
        toastError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [tabValue]);

  if (loading) {
    return (
      <AnimatedPage>
        <PageContainer>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '60vh',
            }}
          >
            <CircularProgress />
          </Box>
        </PageContainer>
      </AnimatedPage>
    );
  }

  // Remove global error display - we'll show errors per tab instead

  // Convert topAreasAtuacao object to array for display
  const topAreasArray = stats ? Object.entries(stats.topAreasAtuacao || {}).map(([label, count]) => ({
    label,
    count,
  })) : [];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <AnimatedPage>
      <PageContainer>
        <Breadcrumbs items={[{ label: 'Dashboard' }]} />
        
        <PageHeader
          title="Dashboard"
          subtitle="Visão geral das estatísticas e métricas do sistema"
        />

        {/* Tabs */}
        <Paper sx={{ mt: 2, mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="dashboard tabs"
            sx={{
              '& .MuiTab-root': {
                color: theme.palette.text.primary,
              },
              '& .Mui-selected': {
                color: `${theme.palette.primary.main} !important`,
              },
            }}
          >
            <Tab icon={<People />} label="Profissionais" iconPosition="start" />
            <Tab icon={<MeetingRoom />} label="Quartos" iconPosition="start" />
            <Tab icon={<Hotel />} label="Hospedagens" iconPosition="start" />
            <Tab icon={<EventNote />} label="Agendamentos" iconPosition="start" />
            <Tab icon={<FamilyRestroom />} label="Pacientes & Acompanhantes" iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Profissionais Tab */}
        {tabValue === 0 && stats && (
          <>
            {/* Main Stats Grid */}
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
            mt: 1,
          }}
        >
          <StatCard
            title="Profissionais Ativos"
            value={stats.totalProfissionaisAtivos}
            icon={<People />}
            color={theme.palette.success.main}
          />
          
          <StatCard
            title="Profissionais Inativos"
            value={stats.totalProfissionaisInativos}
            icon={<PersonOff />}
            color={theme.palette.warning.main}
          />
          
          <StatCard
            title="Admitidos (30 dias)"
            value={stats.admitidosUltimos30Dias}
            icon={<CalendarMonth />}
            color={theme.palette.info.main}
            subtitle="Últimos 30 dias"
          />
          
          <StatCard
            title="Com Endereço"
            value={stats.comEnderecoCadastrado}
            icon={<Home />}
            color={theme.palette.primary.main}
          />
        </Box>

        {/* Secondary Stats */}
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
            mt: 2,
          }}
        >
          <StatCard
            title="Sem Endereço"
            value={stats.semEnderecoCadastrado}
            icon={<HomeWork />}
            color={theme.palette.error.main}
          />
        </Box>

        {/* Category Breakdowns */}
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: 3,
            mt: 2,
          }}
        >
          <CategoryList
            title="Por Categoria"
            items={stats.porCategoria}
            icon={<Category />}
          />
          
          <CategoryList
            title="Por Tipo de Vínculo"
            items={stats.porTipoVinculo.map(tv => ({
              label: tv.nome,
              count: tv.count,
              codigo: tv.codigo,
            }))}
            icon={<Work />}
          />
        </Box>

        {/* Top Areas */}
        {topAreasArray.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <CategoryList
              title="Top Áreas de Atuação"
              items={topAreasArray}
              icon={<TrendingUp />}
            />
          </Box>
        )}
          </>
        )}

        {/* Quartos Tab */}
        {tabValue === 1 && quartoStats && (
          <>
            {/* Main Quartos Stats */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 3,
                mt: 1,
              }}
            >
              <StatCard
                title="Capacidade Total"
                value={quartoStats.capacidadeTotal}
                icon={<Hotel />}
                color={theme.palette.primary.main}
                subtitle={`${quartoStats.vagasDisponiveis} vagas disponíveis`}
              />
              
              <StatCard
                title="Ocupação"
                value={`${quartoStats.percentualOcupacao.toFixed(1)}%`}
                icon={<BedOutlined />}
                color={theme.palette.info.main}
                subtitle={`${quartoStats.ocupacaoTotal} ocupados`}
              />
              
              <StatCard
                title="Total de Quartos"
                value={quartoStats.totalQuartos}
                icon={<MeetingRoom />}
                color={theme.palette.success.main}
                subtitle={`${quartoStats.quartosAtivos} ativos`}
              />
              
              <StatCard
                title="Quartos Vagos"
                value={quartoStats.quartosVazios}
                icon={<BedroomParent />}
                color={theme.palette.warning.main}
                subtitle="Disponíveis para admissão"
              />
            </Box>

            {/* Secondary Stats */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
                mt: 2,
              }}
            >
              <StatCard
                title="Quartos Inativos"
                value={quartoStats.quartosInativos}
                icon={<PersonOff />}
                color={theme.palette.error.main}
              />
              
              <StatCard
                title="Em Manutenção"
                value={quartoStats.quartosEmManutencao}
                icon={<Work />}
                color={theme.palette.warning.main}
              />
              
              <StatCard
                title="Quartos Lotados"
                value={quartoStats.quartosLotados}
                icon={<TrendingUp />}
                color={theme.palette.error.main}
              />
            </Box>

            {/* Tipo de Quarto Stats */}
            <Box sx={{ mt: 2 }}>
              <CategoryList
                title="Por Tipo de Quarto"
                items={[
                  { label: 'Individual', count: quartoStats.quartosIndividuais },
                  { label: 'Compartilhado', count: quartoStats.quartosCompartilhados },
                  { label: 'Isolamento', count: quartoStats.quartosIsolamento },
                  { label: 'Permitem Sexo Oposto', count: quartoStats.quartosPermitemSexoOposto },
                ]}
                icon={<Category />}
              />
            </Box>

            {/* Stats por Ala */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
                mt: 2,
              }}
            >
              {/* Ala Feminina */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Ala Feminina
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Capacidade</Typography>
                    <Typography variant="h5" fontWeight="bold">{quartoStats.alaFeminina.capacidadeTotal}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Ocupação</Typography>
                    <Typography variant="body1">{quartoStats.alaFeminina.percentualOcupacao.toFixed(1)}% ({quartoStats.alaFeminina.ocupacaoTotal}/{quartoStats.alaFeminina.capacidadeTotal})</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Quartos</Typography>
                    <Typography variant="body1">{quartoStats.alaFeminina.totalQuartos} ({quartoStats.alaFeminina.quartosAtivos} ativos)</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Typography variant="body2">
                      {quartoStats.alaFeminina.quartosVazios} vazios, {quartoStats.alaFeminina.quartosParcialmenteOcupados} parciais, {quartoStats.alaFeminina.quartosLotados} lotados
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Ala Masculina */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Ala Masculina
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Capacidade</Typography>
                    <Typography variant="h5" fontWeight="bold">{quartoStats.alaMasculina.capacidadeTotal}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Ocupação</Typography>
                    <Typography variant="body1">{quartoStats.alaMasculina.percentualOcupacao.toFixed(1)}% ({quartoStats.alaMasculina.ocupacaoTotal}/{quartoStats.alaMasculina.capacidadeTotal})</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Quartos</Typography>
                    <Typography variant="body1">{quartoStats.alaMasculina.totalQuartos} ({quartoStats.alaMasculina.quartosAtivos} ativos)</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Typography variant="body2">
                      {quartoStats.alaMasculina.quartosVazios} vazios, {quartoStats.alaMasculina.quartosParcialmenteOcupados} parciais, {quartoStats.alaMasculina.quartosLotados} lotados
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Ala Mista */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Ala Mista
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Capacidade</Typography>
                    <Typography variant="h5" fontWeight="bold">{quartoStats.alaMista.capacidadeTotal}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Ocupação</Typography>
                    <Typography variant="body1">{quartoStats.alaMista.percentualOcupacao.toFixed(1)}% ({quartoStats.alaMista.ocupacaoTotal}/{quartoStats.alaMista.capacidadeTotal})</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Quartos</Typography>
                    <Typography variant="body1">{quartoStats.alaMista.totalQuartos} ({quartoStats.alaMista.quartosAtivos} ativos)</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Typography variant="body2">
                      {quartoStats.alaMista.quartosVazios} vazios, {quartoStats.alaMista.quartosParcialmenteOcupados} parciais, {quartoStats.alaMista.quartosLotados} lotados
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </>
        )}

        {/* Hospedagens Tab */}
        {tabValue === 2 && hospedagemStats && (
          <>
            {/* Primary Stats - Hospedagens */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 3,
                mt: 1,
              }}
            >
              <StatCard
                title="Hospedagens Ativas"
                value={hospedagemStats.totalHospedagensAtivas}
                icon={<Hotel />}
                color={theme.palette.success.main}
              />

              <StatCard
                title="Hospedagens (Mês Atual)"
                value={hospedagemStats.totalHospedagensMesAtual}
                icon={<CalendarMonth />}
                color={theme.palette.info.main}
                subtitle={`Mês anterior: ${hospedagemStats.totalHospedagensMesAnterior}`}
              />

              <StatCard
                title="Encerradas (30d)"
                value={hospedagemStats.totalHospedagensEncerradasUltimos30Dias}
                icon={<People />}
                color={theme.palette.primary.main}
              />

              <StatCard
                title="Previsão Vencida"
                value={hospedagemStats.totalHospedagensPreviaoVencida}
                icon={<Warning />}
                color={theme.palette.warning.main}
              />
            </Box>

            {/* Secondary Stats - Tempo Médio */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
                mt: 2,
              }}
            >
              <StatCard
                title="Média de Permanência"
                value={`${hospedagemStats.mediaDiasPermanencia} dias`}
                icon={<CalendarMonth />}
                color={theme.palette.info.main}
                subtitle={hospedagemStats.tempoMedioPermanencia}
              />

              <StatCard
                title="Crescimento Mensal"
                value={`${hospedagemStats.crescimentoMesAtual > 0 ? '+' : ''}${hospedagemStats.crescimentoMesAtual}%`}
                icon={<TrendingUp />}
                color={hospedagemStats.crescimentoMesAtual >= 0 ? theme.palette.success.main : theme.palette.error.main}
              />

              <StatCard
                title="Pacientes Ativos"
                value={hospedagemStats.totalPacientesAtivos}
                icon={<People />}
                color={theme.palette.primary.main}
                subtitle={`Total: ${hospedagemStats.totalPacientes}`}
              />
            </Box>

            {/* Quartos Stats */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 3,
                mt: 2,
              }}
            >
              <StatCard
                title="Leitos Disponíveis"
                value={hospedagemStats.totalLeitosDisponiveis}
                icon={<BedOutlined />}
                color={theme.palette.success.main}
                subtitle={`Vagos: ${hospedagemStats.totalLeitosVagos}`}
              />

              <StatCard
                title="Leitos Ocupados"
                value={hospedagemStats.totalLeitosOcupados}
                icon={<Hotel />}
                color={theme.palette.error.main}
              />

              <StatCard
                title="Taxa Ocupação Global"
                value={`${hospedagemStats.taxaOcupacaoGlobal.toFixed(1)}%`}
                icon={<TrendingUp />}
                color={theme.palette.info.main}
              />

              <StatCard
                title="Quartos Ativos"
                value={hospedagemStats.totalQuartosAtivos}
                icon={<MeetingRoom />}
                color={theme.palette.primary.main}
                subtitle={`Total: ${hospedagemStats.totalQuartos}`}
              />
            </Box>

            {/* Additional Quartos Stats */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
                mt: 2,
              }}
            >
              <StatCard
                title="Quartos em Manutenção"
                value={hospedagemStats.totalQuartosEmManutencao}
                icon={<Work />}
                color={theme.palette.warning.main}
              />

              <StatCard
                title="Pacientes Hospedados"
                value={hospedagemStats.totalPacientesHospedados}
                icon={<People />}
                color={theme.palette.primary.main}
              />

              <StatCard
                title="Novos Pacientes (Mês)"
                value={hospedagemStats.totalNovosPacientesMesAtual}
                icon={<People />}
                color={theme.palette.success.main}
              />
            </Box>

            {/* Agendamentos Stats */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
                mt: 2,
              }}
            >
              <StatCard
                title="Agendamentos Hoje"
                value={hospedagemStats.totalAgendamentosHoje}
                icon={<CalendarMonth />}
                color={theme.palette.info.main}
              />

              <StatCard
                title="Agendamentos (Semana)"
                value={hospedagemStats.totalAgendamentosSemana}
                icon={<CalendarMonth />}
                color={theme.palette.primary.main}
              />

              <StatCard
                title="Agendamentos Pendentes"
                value={hospedagemStats.totalAgendamentosPendentes}
                icon={<CalendarMonth />}
                color={theme.palette.warning.main}
              />
            </Box>

            {/* Previsão de Saídas */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
                mt: 2,
              }}
            >
              <StatCard
                title="Saídas Previstas Hoje"
                value={hospedagemStats.previsaoSaidasHoje}
                icon={<ExitToApp />}
                color={theme.palette.info.main}
              />

              <StatCard
                title="Saídas Previstas (7d)"
                value={hospedagemStats.previsaoSaidasProximos7Dias}
                icon={<ExitToApp />}
                color={theme.palette.primary.main}
              />

              <StatCard
                title="Saídas Previstas (30d)"
                value={hospedagemStats.previsaoSaidasProximos30Dias}
                icon={<ExitToApp />}
                color={theme.palette.success.main}
              />
            </Box>

            {/* Occupation by wing */}
            <Box sx={{ mt: 2 }}>
              <CategoryList
                title="Ocupação por Ala"
                items={Object.values(hospedagemStats.ocupacaoPorAla).map(a => ({ 
                  label: `${a.ala} (${a.taxaOcupacao.toFixed(1)}%)`, 
                  count: a.leitosOcupados 
                }))}
                icon={<MeetingRoom />}
              />
            </Box>

            {/* Recent entries/exits and top rooms */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mt: 2 }}>
              <CategoryList
                title="Últimas Entradas"
                items={hospedagemStats.ultimasEntradas.slice(0, 5).map(e => ({ 
                  label: `${e.nomePaciente} — ${e.nomeQuarto}`, 
                  count: 1 
                }))}
                icon={<CalendarMonth />}
              />

              <CategoryList
                title="Últimas Saídas"
                items={hospedagemStats.ultimasSaidas.slice(0, 5).map(e => ({ 
                  label: `${e.nomePaciente} — ${e.nomeQuarto}`, 
                  count: 1 
                }))}
                icon={<CalendarMonth />}
              />

              <CategoryList
                title="Quartos com Maior Ocupação"
                items={hospedagemStats.quartosComMaiorOcupacao.slice(0, 5).map(q => ({ 
                  label: `${q.nome} (${q.taxaOcupacao.toFixed(0)}%)`, 
                  count: q.capacidadeOcupada 
                }))}
                icon={<BedroomParent />}
              />
            </Box>

            {/* Monthly trend */}
            {hospedagemStats.hospedagensPorMes && hospedagemStats.hospedagensPorMes.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <CategoryList
                  title="Hospedagens por Mês"
                  items={hospedagemStats.hospedagensPorMes.map(m => ({ 
                    label: `${m.nomeMes} ${m.ano} (↑${m.totalEntradas} ↓${m.totalSaidas})`, 
                    count: m.total 
                  }))}
                  icon={<TrendingUp />}
                />
              </Box>
            )}
          </>
        )}

        {/* Agendamentos Tab */}
        {tabValue === 3 && (
          <>
            {/* Show error if tab failed to load */}
            {tabErrors[3] && (
              <Alert severity="warning" sx={{ mt: 1, mb: 3 }}>
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  Estatísticas de Agendamentos Indisponíveis
                </Typography>
                <Typography variant="body2">
                  {tabErrors[3]}
                </Typography>
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  Enquanto isso, você pode acessar as páginas de Agendamentos de Pacientes e Agendamentos de Acompanhantes no menu lateral para gerenciar os agendamentos individualmente.
                </Typography>
              </Alert>
            )}
            
            {/* Show stats if loaded successfully */}
            {agendamentoStats && (
              <>
            {/* Primary Stats - General */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 3,
                mt: 1,
              }}
            >
              <StatCard
                title="Hoje"
                value={agendamentoStats.totalAgendamentosHoje}
                icon={<CalendarMonth />}
                color={theme.palette.info.main}
              />

              <StatCard
                title="Esta Semana"
                value={agendamentoStats.totalAgendamentosSemana}
                icon={<EventNote />}
                color={theme.palette.success.main}
              />

              <StatCard
                title="Este Mês"
                value={agendamentoStats.totalAgendamentosMes}
                icon={<TrendingUp />}
                color={theme.palette.primary.main}
              />

              <StatCard
                title="Pendentes Confirmação"
                value={agendamentoStats.agendamentosPendentesConfirmacao}
                icon={<Schedule />}
                color={theme.palette.warning.main}
              />
            </Box>

            {/* Status Distribution */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
                mt: 2,
              }}
            >
              <StatCard
                title="Agendados"
                value={agendamentoStats.agendamentosAgendados}
                icon={<Schedule />}
                color={theme.palette.warning.main}
              />

              <StatCard
                title="Confirmados"
                value={agendamentoStats.agendamentosConfirmados}
                icon={<CheckCircle />}
                color={theme.palette.success.main}
              />

              <StatCard
                title="Em Atendimento"
                value={agendamentoStats.agendamentosEmAtendimento}
                icon={<AccessTime />}
                color={theme.palette.info.main}
              />
            </Box>

            {/* Completed, Cancelled, No-Show */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
                mt: 2,
              }}
            >
              <StatCard
                title="Concluídos"
                value={agendamentoStats.agendamentosConcluidos}
                icon={<CheckCircle />}
                color={theme.palette.success.main}
              />

              <StatCard
                title="Cancelados"
                value={agendamentoStats.agendamentosCancelados}
                icon={<Cancel />}
                color={theme.palette.error.main}
              />

              <StatCard
                title="Não Compareceram"
                value={agendamentoStats.agendamentosNaoCompareceram}
                icon={<PersonOff />}
                color={theme.palette.error.main}
              />
            </Box>

            {/* Performance Metrics */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 3,
                mt: 2,
              }}
            >
              <StatCard
                title="Taxa de Comparecimento"
                value={`${agendamentoStats.taxaComparecimento.toFixed(1)}%`}
                icon={<CheckCircle />}
                color={agendamentoStats.taxaComparecimento >= 90 ? theme.palette.success.main : theme.palette.warning.main}
              />

              <StatCard
                title="Taxa de Não Comparecimento"
                value={`${agendamentoStats.taxaNaoComparecimento.toFixed(1)}%`}
                icon={<PersonOff />}
                color={agendamentoStats.taxaNaoComparecimento <= 10 ? theme.palette.success.main : theme.palette.error.main}
              />

              <StatCard
                title="Taxa de Cancelamento"
                value={`${agendamentoStats.taxaCancelamento.toFixed(1)}%`}
                icon={<Cancel />}
                color={agendamentoStats.taxaCancelamento <= 15 ? theme.palette.success.main : theme.palette.error.main}
              />

              <StatCard
                title="Duração Média"
                value={`${agendamentoStats.duracaoMediaMinutos.toFixed(0)} min`}
                icon={<AccessTime />}
                color={theme.palette.info.main}
              />
            </Box>

            {/* Type Classification */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
                mt: 2,
              }}
            >
              <StatCard
                title="Pacientes"
                value={agendamentoStats.agendamentosPacientes}
                icon={<People />}
                color={theme.palette.primary.main}
              />

              <StatCard
                title="Acompanhantes"
                value={agendamentoStats.agendamentosAcompanhantes}
                icon={<People />}
                color={theme.palette.info.main}
              />

              <StatCard
                title="Automáticos"
                value={agendamentoStats.agendamentosAutomaticos}
                icon={<Schedule />}
                color={theme.palette.success.main}
                subtitle="Gerados pelo sistema"
              />
            </Box>

            {/* Priority Distribution */}
            <Box sx={{ mt: 2 }}>
              <CategoryList
                title="Por Prioridade"
                items={[
                  { label: 'Urgente', count: agendamentoStats.agendamentosUrgentes },
                  { label: 'Alta', count: agendamentoStats.agendamentosAltaPrioridade },
                  { label: 'Normal', count: agendamentoStats.agendamentosNormalPrioridade },
                  { label: 'Baixa', count: agendamentoStats.agendamentosBaixaPrioridade },
                ]}
                icon={<Warning />}
              />
            </Box>

            {/* Appointment Type Distribution */}
            <Box sx={{ mt: 2 }}>
              <CategoryList
                title="Por Tipo de Atendimento"
                items={[
                  { label: 'Primeira Vez', count: agendamentoStats.agendamentosPrimeiraVez },
                  { label: 'Retorno', count: agendamentoStats.agendamentosRetorno },
                  { label: 'Emergencial', count: agendamentoStats.agendamentosEmergenciais },
                  { label: 'Rotina', count: agendamentoStats.agendamentosRotina },
                  { label: 'Triagem', count: agendamentoStats.agendamentosTriagem },
                ]}
                icon={<Category />}
              />
            </Box>

            {/* Top Professionals */}
            {agendamentoStats.topProfissionaisPorAgendamentos.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: `${theme.palette.primary.main}15`,
                        color: theme.palette.primary.main,
                        mr: 2,
                      }}
                    >
                      <TrendingUp />
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      Top Profissionais por Agendamentos
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {agendamentoStats.topProfissionaisPorAgendamentos.slice(0, 5).map((prof, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: 'background.default',
                          '&:hover': {
                            bgcolor: `${theme.palette.primary.main}08`,
                          },
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {prof.profissionalNome}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {prof.especialidade} • {prof.agendamentosConcluidos} concluídos • {prof.taxaConclusao.toFixed(1)}% conclusão
                          </Typography>
                        </Box>
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 36,
                            height: 28,
                            px: 1.25,
                            backgroundColor: theme.palette.primary.dark,
                            borderRadius: '999px',
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            color: '#FFFFFF !important',
                            WebkitTextFillColor: '#FFFFFF !important',
                            textShadow: 'none !important',
                            lineHeight: 1,
                          }}
                        >
                          {prof.totalAgendamentos}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Box>
            )}

            {/* Top Services */}
            {agendamentoStats.topServicosMaisSolicitados.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <CategoryList
                  title="Serviços Mais Solicitados"
                  items={agendamentoStats.topServicosMaisSolicitados.slice(0, 10).map(s => ({
                    label: `${s.servicoNome} (${s.percentualTotal.toFixed(1)}%)`,
                    count: s.totalAgendamentos,
                  }))}
                  icon={<Work />}
                />
              </Box>
            )}

            {/* Weekly Distribution */}
            <Box sx={{ mt: 2 }}>
              <CategoryList
                title="Distribuição por Dia da Semana"
                items={[
                  { label: 'Segunda-feira', count: agendamentoStats.agendamentosPorDiaSemana['segunda-feira'] },
                  { label: 'Terça-feira', count: agendamentoStats.agendamentosPorDiaSemana['terça-feira'] },
                  { label: 'Quarta-feira', count: agendamentoStats.agendamentosPorDiaSemana['quarta-feira'] },
                  { label: 'Quinta-feira', count: agendamentoStats.agendamentosPorDiaSemana['quinta-feira'] },
                  { label: 'Sexta-feira', count: agendamentoStats.agendamentosPorDiaSemana['sexta-feira'] },
                  { label: 'Sábado', count: agendamentoStats.agendamentosPorDiaSemana['sábado'] },
                  { label: 'Domingo', count: agendamentoStats.agendamentosPorDiaSemana['domingo'] },
                ]}
                icon={<CalendarMonth />}
              />
            </Box>

            {/* Hourly Distribution - Show peak hours */}
            <Box sx={{ mt: 2 }}>
              <CategoryList
                title="Horários de Pico (Top 8)"
                items={
                  Object.entries(agendamentoStats.agendamentosPorHora)
                    .map(([hour, count]) => ({
                      label: `${hour}:00`,
                      count: count as number,
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 8)
                }
                icon={<AccessTime />}
              />
            </Box>
              </>
            )}
          </>
        )}

        {/* Pacientes & Acompanhantes Tab */}
        {tabValue === 4 && (
          <>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
              </Box>
            )}

            {!loading && tabErrors[4] && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {tabErrors[4]}
              </Alert>
            )}

            {!loading && !tabErrors[4] && pacienteStats && (
              <>
                {/* Main Stats Grid */}
                <Box 
                  sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { 
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(4, 1fr)'
                    }, 
                    gap: 3,
                    mb: 3 
                  }}
                >
                  <StatCard
                    title="Total de Pacientes"
                    value={pacienteStats.totalPacientes}
                    icon={<People />}
                    color={theme.palette.primary.main}
                    subtitle={`${pacienteStats.pacientesAtivos} ativos`}
                  />
                  <StatCard
                    title="Total de Acompanhantes"
                    value={pacienteStats.totalAcompanhantes}
                    icon={<FamilyRestroom />}
                    color={theme.palette.secondary.main}
                    subtitle={`${pacienteStats.acompanhantesAtivos} ativos`}
                  />
                  <StatCard
                    title="Registros Hoje"
                    value={pacienteStats.pacientesRegistradosHoje + pacienteStats.acompanhantesRegistradosHoje}
                    icon={<TrendingUp />}
                    color={theme.palette.success.main}
                    subtitle={`${pacienteStats.pacientesRegistradosHoje} pac., ${pacienteStats.acompanhantesRegistradosHoje} acomp.`}
                  />
                  <StatCard
                    title="Média Acompanhantes"
                    value={pacienteStats.mediaAcompanhantesPorPaciente.toFixed(2)}
                    icon={<People />}
                    color={theme.palette.info.main}
                    subtitle="Por paciente"
                  />
                </Box>

                {/* Status Distribution */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
                  <CategoryList
                    title="Pacientes por Status"
                    items={[
                      { label: 'Em Tratamento', count: pacienteStats.pacientesEmTratamento },
                      { label: 'Curados', count: pacienteStats.pacientesCurados },
                      { label: 'Em Observação', count: pacienteStats.pacientesEmObservacao },
                      { label: 'Falecidos', count: pacienteStats.pacientesFalecidos },
                    ]}
                    icon={<Category />}
                  />
                  <CategoryList
                    title="Acompanhantes por Parentesco (Top 5)"
                    items={Object.entries(pacienteStats.acompanhantesPorParentesco || {})
                      .map(([label, count]) => ({ label, count: count as number }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5)}
                    icon={<FamilyRestroom />}
                  />
                </Box>

                {/* Clinical Data */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
                  <StatCard
                    title="Com Dados Clínicos"
                    value={pacienteStats.pacientesComDadosClinicos}
                    icon={<Work />}
                    color={theme.palette.success.main}
                    subtitle={`${pacienteStats.taxaPacientesComDadosClinicos.toFixed(1)}% do total`}
                  />
                  <StatCard
                    title="Com Sonda"
                    value={pacienteStats.pacientesComSonda}
                    icon={<Work />}
                    color={theme.palette.warning.main}
                  />
                  <StatCard
                    title="Com Curativo"
                    value={pacienteStats.pacientesComCurativo}
                    icon={<Work />}
                    color={theme.palette.info.main}
                  />
                </Box>

                {/* Geographic Distribution */}
                <Box sx={{ mt: 3 }}>
                  <CategoryList
                    title="Top 5 Cidades"
                    items={(pacienteStats.topCidadesComMaisPacientes || []).slice(0, 5).map((cidade: { cidade: string; totalPacientes: number }) => ({
                      label: cidade.cidade,
                      count: cidade.totalPacientes,
                    }))}
                    icon={<Home />}
                  />
                </Box>
              </>
            )}
          </>
        )}
      </PageContainer>
    </AnimatedPage>
  );
};

export default Dashboard;
