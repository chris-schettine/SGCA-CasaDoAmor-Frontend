import { useState, useEffect } from 'react';
import {
  Box,
  Avatar,
  Button,
  Paper,
  Typography,
  Chip,
  Divider,
  Stack,
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, ArrowBack } from '@mui/icons-material';
import PageHeader from '../../components/PageHeader';
import PageContainer from '../../components/PageContainer';
import { AnimatedPage } from '../../components/AnimatedPage';
import Breadcrumbs from '../../components/Breadcrumbs';
import LoadingBackdrop from '../../components/LoadingBackdrop';
import { profissionalService } from '../../api/profissional.service';
import type { ProfissionalDTO } from '../../api/profissional.dto';
import { formatCPF, formatPhone } from '../../utils/formatters';
import { usePermissions } from '../../hooks/usePermissions';
import { toastError } from '../../utils/toast';

interface InfoRowProps {
  label: string;
  value: string | undefined;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography variant="body1">{value || 'Não informado'}</Typography>
  </Box>
);

const ProfissionalInformation = () => {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const { isAdmin } = usePermissions();
    const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [profissional, setProfissional] = useState<ProfissionalDTO | null>(null);

  // Helper to safely extract string from object or primitive
  const safeString = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      return val.descricao || val.valor || val.nome || String(val.id || '');
    }
    return String(val);
  };

  useEffect(() => {
    const loadProfissional = async () => {
      if (!uuid) {
        navigate('/profissionais');
        return;
      }

      setLoading(true);
      try {
        const data = await profissionalService.buscarPorUuid(uuid);
        setProfissional(data);
      } catch (error) {
        console.error('Erro ao carregar profissional:', error);
        toastError('Erro ao carregar dados do profissional.');
        navigate('/profissionais');
      } finally {
        setLoading(false);
      }
    };

    loadProfissional();
  }, [uuid, navigate]);

  if (loading || !profissional) {
    return <LoadingBackdrop message="Carregando dados..." />;
  }

  const formatCep = (cep?: string) => {
    if (!cep) return undefined;
    const cleanCep = cep.replace(/\D/g, '');
    return cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const parseDisponibilidade = (disp: any) => {
    if (!disp) return 'Não informado';
    try {
      const obj = typeof disp === 'string' ? JSON.parse(disp) : disp;
      return obj;
    } catch (e) {
      return String(disp);
    }
  };

  const dayName = (key: string) => {
    const k = (key || '').toString().toLowerCase();
    const map: Record<string, string> = {
      segunda: 'Segunda-feira',
      terca: 'Terça-feira',
      terça: 'Terça-feira',
      quarta: 'Quarta-feira',
      quinta: 'Quinta-feira',
      sexta: 'Sexta-feira',
      sabado: 'Sábado',
      sábado: 'Sábado',
      domingo: 'Domingo',
    };
    return map[k] ?? key;
  };

  const getInitials = (fullName?: string) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleEdit = () => {
    navigate(`/profissional/edit/${uuid}`);
  };

  const handleBack = () => {
    navigate('/profissionais');
  };

  return (
    <AnimatedPage>
      <PageContainer>
        <Breadcrumbs
          items={[
            { label: 'Profissionais', path: '/profissionais' },
            { label: profissional.nome },
          ]}
        />

        <PageHeader
          title={(profissional as any).nome ?? (profissional as any).nome_completo}
          action={
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleBack}
              >
                Voltar
              </Button>
              {isAdmin && (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={handleEdit}
                  sx={{
                    backgroundColor: `${theme.palette.primary.main} !important`,
                    color: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
                    WebkitTextFillColor: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
                    '&:hover': { backgroundColor: `${theme.palette.primary.dark} !important` },
                    '&:focus-visible': { outline: `3px solid ${theme.palette.primary.light}`, outlineOffset: '2px' },
                  }}
                >
                  Editar
                </Button>
              )}
            </Stack>
          }
        />

        <Paper sx={{ p: 3, mt: 2 }}>
          {/* Header summary */}
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 3 }}>
            <Avatar
              src={(profissional as any).fotoUrl}
              alt={(profissional as any).nome ?? (profissional as any).nome_completo}
              sx={{ width: 96, height: 96, fontSize: 28, bgcolor: 'primary.light' }}
            >
              {getInitials((profissional as any).nome ?? (profissional as any).nome_completo)}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
                {(profissional as any).nome ?? (profissional as any).nome_completo}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Chip label={safeString((profissional as any).categoria || (profissional as any).categoria_id) || 'Não informado'} size="small" color="info" />
                {((profissional as any).tipoVinculo ?? (profissional as any).tipo_vinculo) && (
                  <Chip
                    label={safeString((profissional as any).tipoVinculo || (profissional as any).tipo_vinculo) || 'Não informado'}
                    size="small"
                    color="secondary"
                  />
                )}
              </Stack>

              <Typography variant="body2" color="text.secondary">
                Cadastrado por: {(profissional as any).createdBy?.nome ?? (profissional as any).created_by?.nome ?? '—'}
                {((profissional as any).createdAt ?? (profissional as any).created_at) ? ` • ${new Date((profissional as any).createdAt ?? (profissional as any).created_at).toLocaleString('pt-BR')}` : ''}
              </Typography>
            </Box>

            <Box>
              <Chip
                label={(profissional as any).ativo ? 'Ativo' : 'Inativo'}
                color={(profissional as any).ativo ? 'success' : 'default'}
                size="medium"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Box>

          {/* Dados Pessoais */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" gutterBottom>
              Dados Pessoais
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Box sx={{ width: { xs: '100%', md: '50%' }, pb: 2 }}>
                <InfoRow label="Nome Completo" value={(profissional as any).nome ?? (profissional as any).nome_completo} />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '25%' }, pb: 2 }}>
                <InfoRow
                  label="CPF"
                  value={profissional.cpf ? formatCPF(profissional.cpf) : undefined}
                />
              </Box>
            </Grid>
          </Paper>

          <Divider sx={{ my: 3 }} />

          {/* Dados Profissionais */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" gutterBottom>
              Dados Profissionais
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Box sx={{ width: { xs: '100%', md: '33.3333%' }, pb: 2 }}>
                <InfoRow label="Registro Profissional" value={(profissional as any).numeroRegistro ?? (profissional as any).numero_registro} />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '33.3333%' }, pb: 2 }}>
                <InfoRow label="UF Registro" value={(profissional as any).ufRegistro ?? (profissional as any).uf_registro} />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '33.3333%' }, pb: 2 }}>
                <InfoRow label="Especialidade" value={(profissional as any).especialidade} />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '33.3333%' }, pb: 2 }}>
                <InfoRow label="Área de atuação" value={(profissional as any).areaAtuacao ?? (profissional as any).area_atuacao} />
              </Box>
            </Grid>
          </Paper>

          <Divider sx={{ my: 3 }} />

          {/* Contato */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" gutterBottom>
              Contato
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Box sx={{ width: { xs: '100%', md: '50%' }, pb: 2 }}>
                <InfoRow
                  label="Telefone"
                  value={(profissional as any).telefone ? formatPhone((profissional as any).telefone) : undefined}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '50%' }, pb: 2 }}>
                <InfoRow label="E-mail" value={profissional.email} />
              </Box>
            </Grid>
          </Paper>

          <Divider sx={{ my: 3 }} />

          {/* Endereço */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" gutterBottom>
              Endereço
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Box sx={{ width: { xs: '100%', md: '25%' }, pb: 2 }}>
                <InfoRow
                  label="CEP"
                  value={profissional.endereco?.cep ? formatCep(profissional.endereco.cep) : undefined}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '58.3333%' }, pb: 2 }}>
                <InfoRow label="Logradouro" value={profissional.endereco?.logradouro} />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '16.6667%' }, pb: 2 }}>
                <InfoRow label="Número" value={profissional.endereco?.numero ? String(profissional.endereco.numero) : undefined} />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '33.3333%' }, pb: 2 }}>
                <InfoRow label="Complemento" value={profissional.endereco?.complemento} />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '33.3333%' }, pb: 2 }}>
                <InfoRow label="Bairro" value={profissional.endereco?.bairro} />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '25%' }, pb: 2 }}>
                <InfoRow label="Cidade" value={profissional.endereco?.cidade} />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '8.3333%' }, pb: 2 }}>
                <InfoRow label="UF" value={profissional.endereco?.estado} />
              </Box>
            </Grid>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 1 }}>
            {/* Additional Professional Details */}
            <Typography variant="h6" gutterBottom>
              Detalhes Profissionais
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Box sx={{ width: { xs: '100%', md: '33.3333%' }, pb: 2 }}>
                <InfoRow label="Cargo/Função" value={(profissional as any).cargo ?? (profissional as any).cargo_funcao} />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '33.3333%' }, pb: 2 }}>
                <InfoRow label="Carga Horária" value={((profissional as any).cargaHoraria ?? (profissional as any).carga_horaria) ? String((profissional as any).cargaHoraria ?? (profissional as any).carga_horaria) + 'h' : undefined} />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '33.3333%' }, pb: 2 }}>
                <InfoRow label="Tipo de Vínculo" value={(profissional as any).tipoVinculo?.descricao ?? (profissional as any).tipoVinculo?.valor ?? (profissional as any).tipo_vinculo?.nome ?? undefined} />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '33.3333%' }, pb: 2 }}>
                <InfoRow label="Data de Admissão" value={(profissional as any).dataAdmissao ?? (profissional as any).data_admissao ? new Date((profissional as any).dataAdmissao ?? (profissional as any).data_admissao).toLocaleDateString('pt-BR') : undefined} />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '33.3333%' }, pb: 2 }}>
                <InfoRow label="Departamento" value={(profissional as any).departamento} />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '33.3333%' }, pb: 2 }}>
                <InfoRow label="Tipo de Contrato" value={(profissional as any).tipoContrato ?? (profissional as any).tipo_contrato} />
              </Box>
            </Grid>
          </Paper>

          <Divider sx={{ my: 3 }} />

          {/* Disponibilidade */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" gutterBottom>
              Disponibilidade
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {(() => {
              const raw = (profissional as any).disponibilidade ?? (profissional as any).disponibilidade_json ?? (profissional as any).disponibilidadeRaw;
              const parsed = parseDisponibilidade(raw);
              if (!parsed || typeof parsed === 'string') {
                return <Typography color="text.secondary">{String(parsed ?? 'Sem disponibilidade informada')}</Typography>;
              }

              return (
                <Grid container spacing={2}>
                  {(() => {
                    const weekOrder = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
                    const normalize = (s: string) => String(s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]/g, '');
                    const keys = Object.keys(parsed || {});
                    return weekOrder.map((dayKey) => {
                      const found = keys.find(k => normalize(k) === dayKey);
                      const intervals = found ? parsed[found] : [];
                      return (
                        <Box key={String(found ?? dayKey)} sx={{ width: { xs: '100%', md: '50%' }, pb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{dayName(found ?? dayKey)}</Typography>
                          {(!intervals || intervals.length === 0) ? (
                            <Typography color="text.secondary">Sem atendimento</Typography>
                          ) : (
                            intervals.map((it: any, idx: number) => {
                              if (typeof it === 'string') {
                                const parts = it.split('-');
                                const start = parts[0] ?? it;
                                const end = parts[1] ?? '';
                                return <Typography key={idx}>{start} - {end}</Typography>;
                              }
                              if (it && (it.start || it.end)) {
                                return <Typography key={idx}>{it.start ?? ''} - {it.end ?? ''}</Typography>;
                              }
                              return <Typography key={idx}>{String(it)}</Typography>;
                            })
                          )}
                        </Box>
                      );
                    });
                  })()}
                </Grid>
              );
            })()}
          </Paper>

          <Divider sx={{ my: 3 }} />

          {/* Timestamps */}
          <Typography variant="h6" gutterBottom>
            Informações do Sistema
          </Typography>
          <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              {((profissional as any).createdAt ?? (profissional as any).created_at) && (
                <Box sx={{ width: { xs: '100%', md: '50%' }, pb: 2 }}>
                  <InfoRow
                    label="Data de Cadastro"
                    value={new Date((profissional as any).createdAt ?? (profissional as any).created_at).toLocaleString('pt-BR')}
                  />
                </Box>
              )}
              {((profissional as any).updatedAt ?? (profissional as any).updated_at) && (
                <Box sx={{ width: { xs: '100%', md: '50%' }, pb: 2 }}>
                  <InfoRow
                    label="Última Atualização"
                    value={new Date((profissional as any).updatedAt ?? (profissional as any).updated_at).toLocaleString('pt-BR')}
                  />
                </Box>
              )}
            </Grid>
        </Paper>
      </PageContainer>
    </AnimatedPage>
  );
};

export default ProfissionalInformation;
