import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hospedagemSaidaSchema } from '../../schemas/hospedagemSchema';
import type { HospedagemSaidaFormData } from '../../schemas/hospedagemSchema';
import type { HospedagemDTO } from '../../api/hospedagem.dto';
import { hospedagemService } from '../../api/hospedagem.service';

interface ExitModalProps {
  open: boolean;
  hospedagem: HospedagemDTO;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExitModal({ open, hospedagem, onClose, onSuccess }: ExitModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HospedagemSaidaFormData>({
    resolver: zodResolver(hospedagemSaidaSchema),
    defaultValues: {
      dataSaida: new Date().toISOString().split('T')[0],
      horaSaida: new Date().toTimeString().slice(0, 5),
      motivoSaida: '',
      observacoesSaida: '',
    },
  });

  const onSubmit = async (data: HospedagemSaidaFormData) => {
    setLoading(true);
    setError(null);
    try {
      await hospedagemService.registrarSaida(hospedagem.uuid, data);
      reset();
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar saída');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar Saída do Paciente</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Paciente:</strong> {hospedagem.pacienteNome}
            <br />
            <strong>Quarto:</strong> {hospedagem.quartoNome || 'Não especificado'}
            <br />
            <strong>Data de Entrada:</strong> {new Date(hospedagem.dataEntrada).toLocaleDateString('pt-BR')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="dataSaida"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Data de Saída"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dataSaida}
                      helperText={errors.dataSaida?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="horaSaida"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Hora de Saída"
                      type="time"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.horaSaida}
                      helperText={errors.horaSaida?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="motivoSaida"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Motivo da Saída *"
                      placeholder="Ex: Alta médica, Transferência, A pedido da família..."
                      error={!!errors.motivoSaida}
                      helperText={errors.motivoSaida?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="observacoesSaida"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Observações"
                      multiline
                      rows={4}
                      placeholder="Informações adicionais sobre a saída..."
                      error={!!errors.observacoesSaida}
                      helperText={errors.observacoesSaida?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{
            color: 'white !important',
            WebkitTextFillColor: 'white !important',
          }}
        >
          {loading ? 'Registrando...' : 'Registrar Saída'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
