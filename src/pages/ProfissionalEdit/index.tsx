import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Container, Paper, TextField, Button, Box, Typography, CircularProgress, Alert, Stack, Select, MenuItem, FormControl, InputLabel, Grid,
} from '@mui/material';
import MaskedTextField from '../../components/MaskedTextField';
import DisponibilidadeEditor from '../ProfissionalRegister/DisponibilidadeEditor';
import { profissionalSchemaNewWithConsent } from '../ProfissionalRegister/profissionalSchema';
import type { TipoVinculoDTO } from '../../api/profissional.dto';
import { profissionalService } from '../../api/profissional.service';
import { toastSuccess, toastError } from '../../utils/toast';

const ProfessionalEdit = () => {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [professional, setProfessional] = useState<any>(null);
  const [tiposVinculo, setTiposVinculo] = useState<TipoVinculoDTO[]>([]);
  const [loadingCEP, setLoadingCEP] = useState(false);

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(profissionalSchemaNewWithConsent),
  });

  const cepValue = watch('cep');

  useEffect(() => {
    const fetchData = async () => {
      if (!uuid) { navigate('/profissionais'); return; }
      try {
        setLoading(true);
        const [prof, vins] = await Promise.all([
          profissionalService.buscarPorUuid(uuid),
          profissionalService.listarTiposVinculo().catch(() => []),
        ]);
        setProfessional(prof);
        setTiposVinculo(vins?.filter((tipo: any) => tipo && tipo.id) || []);
        
        // Parse disponibilidade if it's a JSON string
        let parsedDisponibilidade = {};
        if (prof.disponibilidade) {
          try {
            parsedDisponibilidade = typeof prof.disponibilidade === 'string' 
              ? JSON.parse(prof.disponibilidade) 
              : prof.disponibilidade;
          } catch (e) {
            console.warn('Failed to parse disponibilidade:', e);
          }
        }
        
        // Ensure CPF is in the correct format XXX.XXX.XXX-XX
        const formatCPF = (cpf: string) => {
          if (!cpf) return '';
          const cleaned = cpf.replace(/\D/g, '');
          if (cleaned.length !== 11) return cpf;
          return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        };

        // Format CEP to XXXXX-XXX for form display
        const formatCEP = (cep?: string) => {
          if (!cep) return '';
          const cleaned = String(cep).replace(/\D/g, '');
          if (cleaned.length !== 8) return cep;
          return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
        };
        
        reset({
          nome_completo: prof.nome,
          cpf: formatCPF(prof.cpf),
          telefone: prof.telefone,
          email: prof.email,
          categoria_id: prof.categoria_id || '',
          area_atuacao: prof.areaAtuacao ?? prof.area_atuacao ?? '',
          especialidade: prof.especialidade,
          numero_registro: prof.numeroRegistro ?? prof.numero_registro ?? '',
          uf_registro: prof.ufRegistro ?? prof.uf_registro ?? '',
          data_admissao: prof.dataAdmissao ?? prof.data_admissao ?? '',
          carga_horaria: prof.cargaHoraria?.toString() ?? prof.carga_horaria?.toString() ?? '',
          cargo_funcao: prof.cargo ?? prof.cargo_funcao ?? '',
          departamento: prof.departamento,
          tipo_vinculo_id: prof.tipoVinculo?.id?.toString() ?? prof.tipo_vinculo_id?.toString() ?? '',
          // ensure cep is in masked format for validation
          cep: formatCEP(prof.endereco?.cep) || '',
          logradouro: prof.endereco?.logradouro || '',
          numero: prof.endereco?.numero?.toString() || '',
          bairro: prof.endereco?.bairro || '',
          cidade: prof.endereco?.cidade || '',
          estado: prof.endereco?.estado || '',
          complemento: prof.endereco?.complemento || '',
          observacoes: prof.observacoes || '',
          lgpd_consent: true,
          disponibilidade: parsedDisponibilidade,
        });
        } catch (err) {
        console.error('Error:', err);
        toastError('Erro ao carregar dados do profissional.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uuid, navigate, reset]);

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
              logradouro: data.logradouro || '', bairro: data.bairro || '', cidade: data.localidade || '',
              estado: data.uf || '', complemento: data.complemento || '',
            }));
          }
        } catch (err) {
          console.error('CEP error:', err);
        } finally {
          setLoadingCEP(false);
        }
      };
      fetchCEP();
    }
  }, [cepValue, reset]);

  const onSubmit = async (data: any) => {
    if (!uuid) return;
    try {
      setSaving(true);
      
      console.log('Form data before processing:', data);
      
      // Build update payload from existing professional, only overwrite with
      // non-empty form values. This prevents accidentally sending `null` for
      // read-only or unmodified required fields and overwriting DB values.
      const updateData: any = {};

      // Basic identity fields
      updateData.nome = data.nome_completo ?? professional.nome ?? professional.nome_completo;
      updateData.nome_completo = updateData.nome;
      updateData.cpf = data.cpf ?? professional.cpf;

      // Contact
      if (data.telefone) updateData.telefone = data.telefone;
      if (data.email) updateData.email = data.email;

      // Categoria / vínculo
      if (data.categoria_id) updateData.categoria_id = isNaN(Number(data.categoria_id)) ? data.categoria_id : parseInt(data.categoria_id);
      if (data.tipo_vinculo_id) updateData.tipo_vinculo_id = isNaN(Number(data.tipo_vinculo_id)) ? data.tipo_vinculo_id : parseInt(data.tipo_vinculo_id);

      // Professional fields - preserve existing values if form left them blank
      updateData.area_atuacao = data.area_atuacao ?? professional.area_atuacao ?? professional.areaAtuacao;
      updateData.areaAtuacao = updateData.area_atuacao;
      updateData.especialidade = data.especialidade ?? professional.especialidade;
      updateData.numero_registro = data.numero_registro ?? professional.numero_registro ?? professional.numeroRegistro;
      updateData.numeroRegistro = updateData.numero_registro;
      updateData.uf_registro = data.uf_registro ?? professional.uf_registro ?? professional.ufRegistro;
      updateData.ufRegistro = updateData.uf_registro;
      updateData.cargo_funcao = data.cargo_funcao ?? professional.cargo_funcao ?? professional.cargo;
      updateData.cargo = updateData.cargo_funcao;
      updateData.departamento = data.departamento ?? professional.departamento;

      // Dates and workload
      if (data.data_admissao) {
        updateData.data_admissao = data.data_admissao;
        updateData.dataAdmissao = data.data_admissao;
      } else if (professional.data_admissao) {
        updateData.data_admissao = professional.data_admissao;
        updateData.dataAdmissao = professional.data_admissao;
      }

      if (data.carga_horaria) {
        const ch = parseInt(data.carga_horaria);
        if (!isNaN(ch)) { updateData.carga_horaria = ch; updateData.cargaHoraria = ch; }
      } else if (professional.carga_horaria) {
        updateData.carga_horaria = professional.carga_horaria; updateData.cargaHoraria = professional.carga_horaria;
      }

      // Address: prefer form values, fallback to professional.endereco
      const enderecoFromProfessional = professional.endereco || {};
      const endereco: any = {};
      endereco.cep = data.cep ?? enderecoFromProfessional.cep;
      // Normalize CEP to digits-only before sending to backend
      if (endereco.cep) endereco.cep = String(endereco.cep).replace(/\D/g, '');
      endereco.logradouro = data.logradouro ?? enderecoFromProfessional.logradouro;
      endereco.numero = data.numero ?? enderecoFromProfessional.numero;
      endereco.bairro = data.bairro ?? enderecoFromProfessional.bairro;
      endereco.cidade = data.cidade ?? enderecoFromProfessional.cidade;
      endereco.estado = data.estado ?? enderecoFromProfessional.estado;
      endereco.complemento = data.complemento ?? enderecoFromProfessional.complemento ?? null;
      // Only include endereco if at least one field present
      if (Object.values(endereco).some(v => v !== undefined && v !== null && v !== '')) updateData.endereco = endereco;

      // Observações
      if (data.observacoes !== undefined) updateData.observacoes = data.observacoes || null;

      // Disponibilidade: prefer form, else keep existing
      if (data.disponibilidade && Object.keys(data.disponibilidade || {}).length > 0) {
        try { updateData.disponibilidade = JSON.stringify(data.disponibilidade); } catch { /* ignore */ }
      } else if (professional.disponibilidade) {
        updateData.disponibilidade = typeof professional.disponibilidade === 'string' ? professional.disponibilidade : JSON.stringify(professional.disponibilidade);
      }
      
      console.log('Payload to send:', updateData);
      
      await profissionalService.atualizar(uuid, updateData);
      toastSuccess('Profissional atualizado com sucesso.');
      navigate('/profissionais');
    } catch (err: any) {
      console.error('Error updating professional:', err);
      console.error('Error response:', err.response?.data);
      const message = err.response?.data?.message || err.response?.data?.details || 'Erro ao atualizar';
      toastError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Container>;
  }
  if (!professional) {
    return <Container maxWidth="md" sx={{ py: 4 }}><Alert severity="error">Não encontrado</Alert></Container>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>{professional.nome_completo}</Typography>
        
        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="bold">Erros de validação:</Typography>
            {Object.entries(errors).map(([key, value]: [string, any]) => (
              <Typography key={key} variant="caption" display="block">
                {key}: {value?.message || 'Campo inválido'}
              </Typography>
            ))}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log('Validation errors:', errors);
        })}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Dados Básicos</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="nome_completo" control={control} render={({ field }) => {
                    const { onChange: _onChange, ...rest } = field;
                    return <TextField {...rest} fullWidth label="Nome *" disabled inputProps={{ readOnly: true }} />;
                  }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="email" control={control} render={({ field }) => <TextField {...field} fullWidth type="email" label="Email *" />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="cpf" control={control} render={({ field }) => <MaskedTextField {...field} label="CPF *" mask="000.000.000-00" disabled />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="telefone" control={control} render={({ field }) => <MaskedTextField {...field} label="Telefone *" mask="(00) 00000-0000" />} />
                </Grid>
              </Grid>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Profissional</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Categoria *"
                    value={professional?.categoria?.descricao || professional?.categoria?.valor || 'Não informado'}
                    disabled
                    inputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="especialidade" control={control} render={({ field }) => <TextField {...field} fullWidth label="Especialidade *" />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="area_atuacao" control={control} render={({ field }) => <TextField {...field} fullWidth label="Área *" />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="numero_registro" control={control} render={({ field }) => {
                    const { onChange: _onChange, ...rest } = field;
                    return <TextField {...rest} fullWidth label="Registro *" disabled inputProps={{ readOnly: true }} />;
                  }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="uf_registro" control={control} render={({ field }) => {
                    const { onChange: _onChange, ...rest } = field;
                    return <TextField {...rest} fullWidth label="UF *" disabled inputProps={{ maxLength: 2, readOnly: true }} />;
                  }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="cargo_funcao" control={control} render={({ field }) => {
                    const { onChange: _onChange, ...rest } = field;
                    return <TextField {...rest} fullWidth label="Cargo *" disabled inputProps={{ readOnly: true }} />;
                  }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="departamento" control={control} render={({ field }) => <TextField {...field} fullWidth label="Departamento *" />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="carga_horaria" control={control} render={({ field }) => <TextField {...field} fullWidth type="number" label="Carga *" inputProps={{ min: 1, max: 44 }} />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="tipo_vinculo_id" control={control} render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Vínculo *</InputLabel>
                      <Select {...field} label="Vínculo *" value={field.value || ''}>
                        <MenuItem value="">Selecione</MenuItem>
                        {tiposVinculo.map(tipo => {
                          const tipoId = tipo.id?.toString() || '';
                          return tipoId ? <MenuItem key={tipoId} value={tipoId}>{tipo.nome}</MenuItem> : null;
                        })}
                      </Select>
                    </FormControl>
                  )} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Controller name="data_admissao" control={control} render={({ field }) => <TextField {...field} fullWidth type="date" label="Admissão *" InputLabelProps={{ shrink: true }} />} />
                </Grid>
              </Grid>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Endereço</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="cep" control={control} render={({ field }) => <MaskedTextField {...field} label="CEP *" mask="00000-000" disabled={loadingCEP} helperText={loadingCEP ? 'Buscando...' : ''} />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="logradouro" control={control} render={({ field }) => <TextField {...field} fullWidth label="Logradouro *" />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="numero" control={control} render={({ field }) => <TextField {...field} fullWidth label="Número *" />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="complemento" control={control} render={({ field }) => <TextField {...field} fullWidth label="Complemento" />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="bairro" control={control} render={({ field }) => <TextField {...field} fullWidth label="Bairro *" />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="cidade" control={control} render={({ field }) => <TextField {...field} fullWidth label="Cidade *" />} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Controller name="estado" control={control} render={({ field }) => <TextField {...field} fullWidth label="Estado *" inputProps={{ maxLength: 2 }} />} />
                </Grid>
              </Grid>
            </Box>
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
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Observações</Typography>
              <Controller name="observacoes" control={control} render={({ field }) => <TextField {...field} fullWidth multiline rows={4} label="Observações" />} />
            </Box>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => navigate('/profissionais')} disabled={saving}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={saving}>{saving ? <CircularProgress size={24} /> : 'Salvar'}</Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default ProfessionalEdit;
