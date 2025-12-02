import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import type { HospedagemDTO } from '../../api/hospedagem.dto';
import type { QuartoDTO } from '../../api/quarto.dto';
import { hospedagemService } from '../../api/hospedagem.service';
import { quartoService } from '../../api/quarto.service';

interface TransferModalProps {
  open: boolean;
  hospedagem: HospedagemDTO;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransferModal({ open, hospedagem, onClose, onSuccess }: TransferModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quartosDisponiveis, setQuartosDisponiveis] = useState<QuartoDTO[]>([]);
  const [novoQuartoUuid, setNovoQuartoUuid] = useState('');

  useEffect(() => {
    if (open) {
      loadQuartosDisponiveis();
    }
  }, [open]);

  const loadQuartosDisponiveis = async () => {
    try {
      // Load available rooms (with capacity)
      const response = await quartoService.listar({ page: 0, size: 100, ativo: true });
      const available = response.content.filter(
        (q: QuartoDTO) => q.vagasDisponiveis > 0 && q.uuid !== hospedagem.quartoUuid
      );
      setQuartosDisponiveis(available);
    } catch (err) {
      console.error('Error loading available rooms:', err);
    }
  };

  const handleTransfer = async () => {
    if (!novoQuartoUuid) {
      setError('Por favor, selecione um quarto');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await hospedagemService.transferir(hospedagem.uuid, novoQuartoUuid);
      setNovoQuartoUuid('');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao transferir paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNovoQuartoUuid('');
      setError(null);
      onClose();
    }
  };

  const selectedRoom = quartosDisponiveis.find((q) => q.uuid === novoQuartoUuid);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transferir Paciente</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Paciente:</strong> {hospedagem.pacienteNome}
          </Typography>

          <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle2" gutterBottom>
              Quarto Atual:
            </Typography>
            <Typography variant="body2">
              {hospedagem.quartoNome || 'Não especificado'}
            </Typography>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            select
            fullWidth
            label="Novo Quarto *"
            value={novoQuartoUuid}
            onChange={(e) => setNovoQuartoUuid(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {quartosDisponiveis.length === 0 ? (
              <MenuItem disabled>Nenhum quarto disponível</MenuItem>
            ) : (
              quartosDisponiveis.map((quarto) => (
                <MenuItem key={quarto.uuid} value={quarto.uuid}>
                  {quarto.nome} ({quarto.tipo.descricao} - {quarto.ala.descricao}) - {quarto.vagasDisponiveis} vaga(s)
                </MenuItem>
              ))
            )}
          </TextField>

          {selectedRoom && (
            <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Typography variant="subtitle2" gutterBottom>
                Novo Quarto:
              </Typography>
              <Typography variant="body2">
                <strong>{selectedRoom.nome}</strong>
              </Typography>
              <Typography variant="caption">
                Tipo: {selectedRoom.tipo.descricao} | Ala: {selectedRoom.ala.descricao}
                <br />
                Capacidade: {selectedRoom.capacidadeOcupada + 1}/{selectedRoom.capacidadeTotal} após transferência
              </Typography>
            </Paper>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleTransfer}
          variant="contained"
          color="primary"
          disabled={loading || !novoQuartoUuid}
          sx={{
            color: 'white !important',
            WebkitTextFillColor: 'white !important',
          }}
        >
          {loading ? 'Transferindo...' : 'Confirmar Transferência'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
