import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import MaskedTextField from '../../components/MaskedTextField';
import DisponibilidadeEditor from './DisponibilidadeEditor';
import { profissionalSchemaNewWithConsent } from './profissionalSchema';
import type {
  CategoriaDTO,
  TipoVinculoDTO,
} from '../../api/profissional.dto';
import { profissionalService } from '../../api/profissional.service';
import { toastSuccess, toastError } from '../../utils/toast';

const ProfissionalRegister = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoriaDTO[]>([]);
  const [tiposVinculo, setTiposVinculo] = useState<TipoVinculoDTO[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [loadingCEP, setLoadingCEP] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<any>({
    resolver: zodResolver(profissionalSchemaNewWithConsent),
    defaultValues: {
      nome_completo: '',
      cpf: '',
      telefone: '',
      email: '',
      categoria_id: '',
      area_atuacao: '',
      especialidade: '',
      numero_registro: '',
      uf_registro: '',
      data_admissao: '',
      carga_horaria: '20',
      cargo_funcao: '',
      departamento: '',
      tipo_vinculo_id: '',
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      complemento: '',
      observacoes: '',
      lgpd_consent: false,
      disponibilidade: {},
    },
  });

  const cepValue = watch('cep');

  // Fetch categories and tipos vinculo on mount
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setLoadingDropdowns(true);
        const [cats, vins] = await Promise.all([
          profissionalService.listarCategorias().catch(err => {
            console.warn('Failed to fetch categories, using empty array:', err);
            return [];
          }),
          profissionalService.listarTiposVinculo().catch(err => {
            console.warn('Failed to fetch tipos vinculo, using empty array:', err);
            return [];
          }),
        ]);
  // categories and tiposVinculo fetched

        // Normalize categories: backend may return { id, nome } or { valor, descricao }
        const categoriesArray: any[] = Array.isArray(cats) ? cats : [];
        const normalizedCategories = categoriesArray.map((c: any) => ({
          // keep id if present, otherwise fall back to valor (string code)
          id: c.id ?? c.valor ?? c.codigo ?? null,
          // display name: prefer nome, then descricao, then valor
          nome: c.nome ?? c.descricao ?? c.valor ?? '',
        }));

        // Normalize tiposVinculo similarly
        const tiposArray: any[] = Array.isArray(vins) ? vins : [];
        const normalizedTipos = tiposArray.map((t: any) => ({
          id: t.id ?? t.valor ?? null,
          nome: t.nome ?? t.descricao ?? t.valor ?? '',
        }));

  // normalized dropdowns ready

        setCategories(normalizedCategories.filter((cat: any) => cat && cat.id !== null));
        setTiposVinculo(normalizedTipos.filter((tipo: any) => tipo && tipo.id !== null));
        
        if ((!cats || cats.length === 0) && (!vins || vins.length === 0)) {
          const msg = 'Aviso: Categorias e tipos de vínculo não disponíveis. Entre em contato com o administrador.';
          toastError(msg);
        }
      } catch (err) {
        console.error('Error fetching dropdowns:', err);
        const msg = 'Erro ao carregar categorias e tipos de vínculo';
        toastError(msg);
      } finally {
        setLoadingDropdowns(false);
      }
    };

    fetchDropdowns();
  }, []);

  // Fetch address from ViaCEP
  useEffect(() => {
    if (cepValue && cepValue.replace(/\D/g, '').length === 8) {
      const fetchCEP = async () => {
        try {
          setLoadingCEP(true);
          const response = await fetch(`https://viacep.com.br/ws/${cepValue.replace(/\D/g, '')}/json/`);
          const data = await response.json();

          if (!data.erro) {
            reset((formValues: any) => ({
              ...formValues,
              logradouro: data.logradouro || '',
              bairro: data.bairro || '',
              cidade: data.localidade || '',
              estado: data.uf || '',
              complemento: data.complemento || '',
            }));
          }
        } catch (err) {
          console.error('Error fetching CEP:', err);
        } finally {
          setLoadingCEP(false);
        }
      };

      fetchCEP();
    }
  }, [cepValue, reset]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      // Resolve category and tipo_vinculo to canonical ids when possible. Some backends
      // expect numeric/UUID ids while the Select may store a code/value string.
      const resolveId = (value: any, list: any[]) => {
        if (value === null || value === undefined) return null;
        const str = String(value);
        // If it's purely numeric or obvious id-like, return as-is
        if (/^[0-9a-fA-F-]{1,}$/.test(str) && /\d/.test(str)) {
          return str;
        }
        // Try to find by exact id match
        let found = list.find((l: any) => String(l.id) === str);
        if (found) return String(found.id);
        // Try to match by name (case-insensitive)
        found = list.find((l: any) => (l.nome || '').toString().toLowerCase() === str.toLowerCase());
        if (found) return String(found.id);
        // Fallback: return original string
        return str;
      };

      const resolvedCategoriaId = resolveId(data.categoria_id, categories as any[]);
      const resolvedTipoVinculoId = resolveId(data.tipo_vinculo_id, tiposVinculo as any[]);

      if (import.meta.env.DEV) {
        console.log('Resolved categoria_id ->', resolvedCategoriaId, 'from', data.categoria_id);
        console.log('Resolved tipo_vinculo_id ->', resolvedTipoVinculoId, 'from', data.tipo_vinculo_id);
      }

      const profissionalData: any = {
        nome_completo: data.nome_completo,
        // some backends expect the plain `nome` property instead of `nome_completo`
        nome: data.nome_completo,
        cpf: data.cpf ? data.cpf.replace(/\D/g, '') : data.cpf,
        telefone: data.telefone,
        email: data.email,
        categoria_id: resolvedCategoriaId,
        area_atuacao: data.area_atuacao,
        especialidade: data.especialidade,
        numero_registro: data.numero_registro,
        uf_registro: data.uf_registro,
        data_admissao: data.data_admissao,
        carga_horaria: data.carga_horaria ? Number(data.carga_horaria) : null,
        cargo_funcao: data.cargo_funcao,
        departamento: data.departamento,
        tipo_vinculo_id: resolvedTipoVinculoId,
        endereco: {
          cep: data.cep,
          logradouro: data.logradouro,
          numero: data.numero ? (isNaN(Number(data.numero)) ? data.numero : Number(data.numero)) : undefined,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          complemento: data.complemento || null,
        },
        observacoes: data.observacoes || null,
        disponibilidade: Object.keys(data.disponibilidade || {}).length > 0 ? data.disponibilidade : null,
      };

      // Backend expects disponibilidade as a JSON string (not an object) in current API.
      if (profissionalData.disponibilidade && typeof profissionalData.disponibilidade !== 'string') {
        profissionalData.disponibilidade = JSON.stringify(profissionalData.disponibilidade);
      }

      // Normalize CEP to digits only (some backends expect this)
      if (profissionalData.endereco && profissionalData.endereco.cep) {
        profissionalData.endereco.cep = String(profissionalData.endereco.cep).replace(/\D/g, '');
      }

      // If tipo_vinculo_id is numeric string, convert to number (backend may expect numeric id)
      if (profissionalData.tipo_vinculo_id && typeof profissionalData.tipo_vinculo_id === 'string' && /^\d+$/.test(profissionalData.tipo_vinculo_id)) {
        profissionalData.tipo_vinculo_id = Number(profissionalData.tipo_vinculo_id);
      }

      // Some backends expect `categoria` as an enum string (e.g. "MEDICO"); others
      // expect a relation object { id: ... }. Use a heuristic to pick the correct shape:
      // - If resolvedCategoriaId looks like an enum/code (contains letters, uppercase),
      //   send `categoria` as that string.
      // - Otherwise send a relation object { id: ... } so JPA can associate it.
      if (resolvedCategoriaId) {
        const isEnumLike = typeof resolvedCategoriaId === 'string' && /[A-Za-z]/.test(resolvedCategoriaId) && !/^[0-9a-fA-F]{8,}$/.test(resolvedCategoriaId);
        if (isEnumLike) {
          profissionalData.categoria = resolvedCategoriaId;
          if (import.meta.env.DEV) console.log('Sending categoria as enum string:', profissionalData.categoria);
        } else {
          profissionalData.categoria = { id: resolvedCategoriaId };
          if (import.meta.env.DEV) console.log('Sending categoria as relation object:', profissionalData.categoria);
        }
        // keep categoria_id for backward compatibility unless backend requires its removal
      }
      // Ensure we send camelCase variants as well, since backend appears to
      // accept camelCase keys (e.g. cargaHoraria, tipoVinculoId, numeroRegistro)
      const payloadToSend = {
        ...profissionalData,
        // camelCase aliases for backend compatibility
        areaAtuacao: profissionalData.area_atuacao,
        cargaHoraria: profissionalData.carga_horaria,
        cargo: profissionalData.cargo_funcao,
        numeroRegistro: profissionalData.numero_registro,
        ufRegistro: profissionalData.uf_registro,
        dataAdmissao: profissionalData.data_admissao,
        tipoVinculoId: profissionalData.tipo_vinculo_id,
      };

      // DEBUG: log payload before sending to help diagnose server 500s
      if (import.meta.env.DEV) {
        console.log('Payload antes do envio (profissional):', JSON.stringify(payloadToSend, null, 2));
      }

      await profissionalService.criar(payloadToSend);
      toastSuccess('Profissional registrado com sucesso.');
      navigate('/profissionais');
    } catch (err) {
      const axError = err as AxiosError;
      // DEBUG: print detailed error payload from backend (if any)
      if (import.meta.env.DEV) {
        console.error('Erro ao criar profissional - status:', axError.response?.status);
        console.error('Erro ao criar profissional - response data:', axError.response?.data);
        console.error('Erro completo:', axError.toJSON ? axError.toJSON() : axError);
      }

      const msg = (axError.response?.data as any)?.message || 'Erro ao registrar profissional. Tente novamente.';
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingDropdowns) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Registrar Profissional
        </Typography>

        

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* Basic Information Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Informações Básicas
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="nome_completo"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Nome Completo *"
                        error={!!errors.nome_completo}
                        helperText={(errors.nome_completo as any)?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="email"
                        label="Email *"
                        error={!!errors.email}
                        helperText={(errors.email as any)?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="cpf"
                    control={control}
                    render={({ field }) => (
                      <MaskedTextField
                        {...field}
                        label="CPF *"
                        mask="000.000.000-00"
                        error={!!errors.cpf}
                        helperText={(errors.cpf as any)?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="telefone"
                    control={control}
                    render={({ field }) => (
                      <MaskedTextField
                        {...field}
                        label="Telefone *"
                        mask="(00) 00000-0000"
                        error={!!errors.telefone}
                        helperText={(errors.telefone as any)?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Professional Information Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Informações Profissionais
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="categoria_id"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.categoria_id}>
                        <InputLabel>Categoria *</InputLabel>
                        <Select
                          {...field}
                          label="Categoria *"
                          value={field.value || ''}
                        >
                          <MenuItem value="">Selecione</MenuItem>
                          {categories.map(cat => {
                            const catId = cat.id?.toString() || '';
                            if (!catId) return null;
                            return (
                              <MenuItem key={catId} value={catId}>
                                {cat.nome}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    )}
                  />
                  {errors.categoria_id && (
                    <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                      {(errors.categoria_id as any)?.message}
                    </Typography>
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="especialidade"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Especialidade *"
                        error={!!errors.especialidade}
                        helperText={(errors.especialidade as any)?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="area_atuacao"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Área de Atuação *"
                        error={!!errors.area_atuacao}
                        helperText={(errors.area_atuacao as any)?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="numero_registro"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Número do Registro *"
                        error={!!errors.numero_registro}
                        helperText={(errors.numero_registro as any)?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="uf_registro"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="UF do Registro *"
                        placeholder="SP"
                        inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
                        error={!!errors.uf_registro}
                        helperText={(errors.uf_registro as any)?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="cargo_funcao"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Cargo/Função *"
                        error={!!errors.cargo_funcao}
                        helperText={(errors.cargo_funcao as any)?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="departamento"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Departamento *"
                        error={!!errors.departamento}
                        helperText={(errors.departamento as any)?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="carga_horaria"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Carga Horária (1-44h) *"
                        inputProps={{ min: 1, max: 44 }}
                        error={!!errors.carga_horaria}
                        helperText={(errors.carga_horaria as any)?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="tipo_vinculo_id"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.tipo_vinculo_id}>
                        <InputLabel>Tipo de Vínculo *</InputLabel>
                        <Select
                          {...field}
                          label="Tipo de Vínculo *"
                          value={field.value || ''}
                        >
                          <MenuItem value="">Selecione</MenuItem>
                          {tiposVinculo.map(tipo => {
                            const tipoId = tipo.id?.toString() || '';
                            if (!tipoId) return null;
                            return (
                              <MenuItem key={tipoId} value={tipoId}>
                                {tipo.nome}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    )}
                  />
                  {errors.tipo_vinculo_id && (
                    <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                      {(errors.tipo_vinculo_id as any)?.message}
                    </Typography>
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="data_admissao"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="date"
                        label="Data de Admissão *"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.data_admissao}
                        helperText={(errors.data_admissao as any)?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Address Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Endereço
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="cep"
                    control={control}
                    render={({ field }) => (
                      <MaskedTextField
                        {...field}
                        label="CEP *"
                        mask="00000-000"
                        error={!!errors.cep}
                        helperText={(errors.cep as any)?.message || (loadingCEP ? 'Buscando...' : '')}
                        disabled={loadingCEP}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="logradouro"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Logradouro *"
                        error={!!errors.logradouro}
                        helperText={(errors.logradouro as any)?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="numero"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Número *"
                        error={!!errors.numero}
                        helperText={(errors.numero as any)?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="complemento"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Complemento"
                        error={!!errors.complemento}
                        helperText={(errors.complemento as any)?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="bairro"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Bairro *"
                        error={!!errors.bairro}
                        helperText={(errors.bairro as any)?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="cidade"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Cidade *"
                        error={!!errors.cidade}
                        helperText={(errors.cidade as any)?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="estado"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Estado *"
                        placeholder="SP"
                        inputProps={{ maxLength: 2, style: { textTransform: 'uppercase' } }}
                        error={!!errors.estado}
                        helperText={(errors.estado as any)?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Availability Section */}
            <Controller
              name="disponibilidade"
              control={control}
              render={({ field }) => (
                <DisponibilidadeEditor
                  value={field.value || {}}
                  onChange={field.onChange}
                />
              )}
            />

            {/* Additional Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Informações Adicionais
              </Typography>
              <Controller
                name="observacoes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Observações"
                    placeholder="Observações adicionais sobre o profissional"
                    error={!!errors.observacoes}
                    helperText={(errors.observacoes as any)?.message}
                  />
                )}
              />
            </Box>

            {/* LGPD Consent */}
            <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Controller
                name="lgpd_consent"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Concordo com a política de privacidade e tratamento de dados pessoais (LGPD) *"
                  />
                )}
              />
              {errors.lgpd_consent && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                  {(errors.lgpd_consent as any)?.message}
                </Typography>
              )}
            </Box>

            {/* Actions */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/profissionais')}
                disabled={isSubmitting || loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Registrar'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default ProfissionalRegister;
