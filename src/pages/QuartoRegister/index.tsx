import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  Grid,
  Alert,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
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

const QuartoRegister = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tipos, setTipos] = useState<QuartoTipoOption[]>([]);
  const [alas, setAlas] = useState<QuartoAlaOption[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<QuartoFormData>({
    resolver: zodResolver(quartoSchema),
    defaultValues: {
      nome: '',
      tipo: '',
      ala: '',
      andar: '',
      capacidadeTotal: 1,
      ativo: true,
      emManutencao: false,
      permiteSexoOposto: true,
      observacoes: '',
    },
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const [tiposData, alasData] = await Promise.all([
          quartoService.listarTipos(),
          quartoService.listarAlas(),
        ]);
        setTipos(tiposData);
        setAlas(alasData);
      } catch (error) {
        console.error('Erro ao carregar opções:', error);
        toastError('Erro ao carregar opções de tipo e ala');
      } finally {
        setLoading(false);
      }
    };
    loadOptions();
  }, []);

  const onSubmit = async (data: QuartoFormData) => {
    try {
      setSubmitting(true);
      await quartoService.criar(data);
      toastSuccess('Quarto cadastrado com sucesso!');
      navigate('/quartos');
    } catch (error: any) {
      console.error('Erro ao cadastrar quarto:', error);
      const message = error?.response?.data?.message || 'Erro ao cadastrar quarto. Verifique os dados e tente novamente.';
      toastError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/quartos');
  };

  return (
    <AnimatedPage>
      <PageContainer>
        <Breadcrumbs
          items={[
            { label: 'Quartos', path: '/quartos' },
            { label: 'Cadastrar Quarto' },
          ]}
        />

        <PageHeader title="Cadastrar Quarto" subtitle="Preencha os dados do novo quarto" />

        <Paper sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Alert severity="info" sx={{ mb: 3 }}>
                Apenas administradores podem criar quartos. Preencha todos os campos obrigatórios.
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
                  {submitting ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </PageContainer>
    </AnimatedPage>
  );
};

export default QuartoRegister;
