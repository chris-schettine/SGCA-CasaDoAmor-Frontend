import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit as EditIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { AnimatedPage } from '../../components/AnimatedPage';
import PageContainer from '../../components/PageContainer';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import { quartoService } from '../../api/quarto.service';
import type { QuartoDTO } from '../../api/quarto.dto';
import { usePermissions } from '../../hooks/usePermissions';
import { toastError } from '../../utils/toast';

const QuartoInformation = () => {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const { isAdmin } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [quarto, setQuarto] = useState<QuartoDTO | null>(null);

  useEffect(() => {
    const loadQuarto = async () => {
      if (!uuid) {
        toastError('UUID do quarto não fornecido');
        navigate('/quartos');
        return;
      }

      try {
        setLoading(true);
        const data = await quartoService.buscarPorUuid(uuid);
        setQuarto(data);
      } catch (error: any) {
        console.error('Erro ao carregar quarto:', error);
        const message = error?.response?.data?.message || 'Erro ao carregar dados do quarto';
        toastError(message);
        navigate('/quartos');
      } finally {
        setLoading(false);
      }
    };

    loadQuarto();
  }, [uuid, navigate]);

  const handleEdit = () => {
    navigate(`/quartos/${uuid}/editar`);
  };

  const handleBack = () => {
    navigate('/quartos');
  };

  const getStatusChip = (quarto: QuartoDTO) => {
    if (!quarto.ativo) {
      return <Chip label="Inativo" size="medium" color="default" />;
    }
    if (quarto.emManutencao) {
      return <Chip label="Manutenção" size="medium" color="warning" />;
    }
    return <Chip label="Ativo" size="medium" color="success" />;
  };

  if (loading) {
    return (
      <AnimatedPage>
        <PageContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
          </Box>
        </PageContainer>
      </AnimatedPage>
    );
  }

  if (!quarto) {
    return null;
  }

  return (
    <AnimatedPage>
      <PageContainer>
        <Breadcrumbs
          items={[
            { label: 'Quartos', path: '/quartos' },
            { label: quarto.nome },
          ]}
        />

        <PageHeader
          title={quarto.nome}
          subtitle={`Ala ${quarto.ala.descricao} - ${quarto.tipo.descricao}`}
          action={
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
              >
                Voltar
              </Button>
              {isAdmin && quarto.ativo && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                >
                  Editar
                </Button>
              )}
            </Box>
          }
        />

        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">Informações do Quarto</Typography>
            {getStatusChip(quarto)}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Nome
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {quarto.nome}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Código
              </Typography>
              <Typography variant="body1" fontWeight="medium" sx={{ wordBreak: 'break-all' }}>
                {quarto.codigo || quarto.uuid}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Ala
              </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {quarto.ala.descricao}
                </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Tipo
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {quarto.tipo.descricao}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Andar
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {quarto.andar}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Capacidade Total
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {quarto.capacidadeTotal} leitos
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Ocupação
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {quarto.capacidadeOcupada} / {quarto.capacidadeTotal}
                <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  ({quarto.vagasDisponiveis} {quarto.vagasDisponiveis === 1 ? 'vaga' : 'vagas'})
                </Typography>
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {quarto.ativo && (
                    <Chip label="Ativo" color="success" size="small" />
                  )}
                  {quarto.emManutencao && (
                    <Chip label="Em Manutenção" color="warning" size="small" />
                  )}
                  {quarto.permiteSexoOposto && (
                    <Chip label="Sexo Oposto" color="info" size="small" />
                  )}
                </Box>
              </Box>
            </Grid>

            {quarto.observacoes && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">
                  Observações
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {quarto.observacoes}
                </Typography>
              </Grid>
            )}

            {(quarto.createdAt || quarto.created_at) && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Cadastrado em
                </Typography>
                <Typography variant="body2">
                  {new Date(quarto.createdAt || quarto.created_at!).toLocaleString('pt-BR')}
                  {quarto.createdByNome && (
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      por {quarto.createdByNome}
                    </Typography>
                  )}
                </Typography>
              </Grid>
            )}

            {(quarto.updatedAt || quarto.updated_at) && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Última atualização
                </Typography>
                <Typography variant="body2">
                  {new Date(quarto.updatedAt || quarto.updated_at!).toLocaleString('pt-BR')}
                  {quarto.updatedByNome && (
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      por {quarto.updatedByNome}
                    </Typography>
                  )}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </PageContainer>
    </AnimatedPage>
  );
};

export default QuartoInformation;
