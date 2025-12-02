import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatedPage } from '../../components/AnimatedPage';
import PageContainer from '../../components/PageContainer';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/Breadcrumbs';
import { quartoSchema, type QuartoFormData } from '../../schemas/quartoSchema';
import { quartoService } from '../../api/quarto.service';
import { toastSuccess, toastError } from '../../utils/toast';
import type { QuartoTipoOption, QuartoAlaOption } from '../../api/quarto.dto';

const QuartoEdit = () => {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tipos, setTipos] = useState<QuartoTipoOption[]>([]);
  const [alas, setAlas] = useState<QuartoAlaOption[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuartoFormData>({
    resolver: zodResolver(quartoSchema),
  });

  useEffect(() => {
    const loadQuarto = async () => {
      if (!uuid) {
        toastError('UUID do quarto não fornecido');
        navigate('/quartos');
        return;
      }

      try {
        setLoading(true);
        const [quarto, tiposData, alasData] = await Promise.all([
          quartoService.buscarPorUuid(uuid),
          quartoService.listarTipos(),
          quartoService.listarAlas(),
        ]);
        setTipos(tiposData);
        setAlas(alasData);
        reset({
          nome: quarto.nome,
          tipo: quarto.tipo?.valor || '',
          ala: quarto.ala?.valor || '',
          andar: quarto.andar,
          capacidadeTotal: quarto.capacidadeTotal,
          ativo: quarto.ativo,
          emManutencao: quarto.emManutencao,
          permiteSexoOposto: quarto.permiteSexoOposto,
          observacoes: quarto.observacoes || '',
        });
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
  }, [uuid, navigate, reset]);

  const onSubmit = async (data: QuartoFormData) => {
    if (!uuid) return;

    try {
      setSubmitting(true);
      await quartoService.atualizar(uuid, data);
      toastSuccess('Quarto atualizado com sucesso!');
      navigate('/quartos');
    } catch (error: any) {
      console.error('Erro ao atualizar quarto:', error);
      const message = error?.response?.data?.message || 'Erro ao atualizar quarto. Verifique os dados e tente novamente.';
      toastError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/quartos');
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

  return (
    <AnimatedPage>
      <PageContainer>
        <Breadcrumbs
          items={[
            { label: 'Quartos', path: '/quartos' },
            { label: 'Editar Quarto' },
          ]}
        />

        <PageHeader title="Editar Quarto" subtitle="Atualize os dados do quarto" />

        <Paper sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Alert severity="info" sx={{ mb: 3 }}>
              Apenas administradores podem editar quartos. Atualize os campos necessários.
            </Alert>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="nome"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome do Quarto *"
                      fullWidth
                      error={!!errors.nome}
                      helperText={errors.nome?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="tipo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Tipo *"
                      fullWidth
                      error={!!errors.tipo}
                      helperText={errors.tipo?.message}
                    >
                      {tipos.map((tipo) => (
                        <MenuItem key={tipo.valor} value={tipo.valor}>
                          {tipo.descricao}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="ala"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Ala *"
                      fullWidth
                      error={!!errors.ala}
                      helperText={errors.ala?.message}
                    >
                      {alas.map((ala) => (
                        <MenuItem key={ala.valor} value={ala.valor}>
                          {ala.descricao}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="andar"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Andar *"
                      fullWidth
                      error={!!errors.andar}
                      helperText={errors.andar?.message || 'Ex: Térreo, 1º, 2º, etc.'}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="capacidadeTotal"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Capacidade Total *"
                      fullWidth
                      error={!!errors.capacidadeTotal}
                      helperText={errors.capacidadeTotal?.message || 'Número de leitos disponíveis'}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      inputProps={{ min: 1, max: 20 }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Controller
                    name="ativo"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label="Quarto Ativo"
                      />
                    )}
                  />
                  <Controller
                    name="emManutencao"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label="Em Manutenção"
                      />
                    )}
                  />
                  <Controller
                    name="permiteSexoOposto"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label="Permite Sexo Oposto"
                      />
                    )}
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="observacoes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Observações"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.observacoes}
                      helperText={errors.observacoes?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  color: '#FFFFFF !important',
                  WebkitTextFillColor: '#FFFFFF !important',
                  '& .MuiTypography-root': {
                    color: '#FFFFFF !important',
                    WebkitTextFillColor: '#FFFFFF !important',
                  },
                }}
              >
                {submitting ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </PageContainer>
    </AnimatedPage>
  );
};

export default QuartoEdit;
