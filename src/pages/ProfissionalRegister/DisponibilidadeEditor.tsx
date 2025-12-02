import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import type { DisponibilidadeHorario, DiasSemanais } from './disponibilidade.utils';
import { DIAS_SEMANA } from './disponibilidade.utils';

interface DisponibilidadeEditorProps {
  value?: DisponibilidadeHorario;
  onChange: (value: DisponibilidadeHorario) => void;
}

const DisponibilidadeEditor = ({ value = {}, onChange }: DisponibilidadeEditorProps) => {
  const [selectedDays, setSelectedDays] = useState<Set<DiasSemanais>>(
    new Set(Object.keys(value) as DiasSemanais[])
  );
  const [horarios, setHorarios] = useState<Record<DiasSemanais, string[]>>(
    value as Record<DiasSemanais, string[]> || {}
  );
  const [newHorario, setNewHorario] = useState<Record<DiasSemanais, string>>({} as any);

  const toggleDay = (dia: DiasSemanais) => {
    const updated = new Set(selectedDays);
    if (updated.has(dia)) {
      updated.delete(dia);
      const updatedHorarios = { ...horarios };
      delete updatedHorarios[dia];
      setHorarios(updatedHorarios);
    } else {
      updated.add(dia);
      setHorarios({ ...horarios, [dia]: [] });
    }
    setSelectedDays(updated);
  };

  const addHorario = (dia: DiasSemanais) => {
    const tempo = newHorario[dia] || '';
    if (tempo && /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(tempo)) {
      const updated = { ...horarios, [dia]: [...(horarios[dia] || []), tempo] };
      setHorarios(updated);
      setNewHorario({ ...newHorario, [dia]: '' });
      onChange(updated);
    }
  };

  const removeHorario = (dia: DiasSemanais, index: number) => {
    const updated = { ...horarios };
    if (updated[dia]) {
      updated[dia] = updated[dia].filter((_, i) => i !== index);
      if (updated[dia].length === 0) {
        delete updated[dia];
      }
    }
    setHorarios(updated);
    onChange(updated);
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Disponibilidade (Horários e Dias)
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
          Selecione os dias e adicione os horários (formato: HH:MM-HH:MM, ex: 08:00-12:00)
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Dias da Semana:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {DIAS_SEMANA.map((dia: typeof DIAS_SEMANA[number]) => (
              <FormControlLabel
                key={dia.value}
                control={
                  <Checkbox
                    checked={selectedDays.has(dia.value)}
                    onChange={() => toggleDay(dia.value)}
                  />
                }
                label={dia.label}
              />
            ))}
          </Stack>
        </Box>

        {Array.from(selectedDays).map(dia => {
          const diaLabel = DIAS_SEMANA.find((d: typeof DIAS_SEMANA[number]) => d.value === dia)?.label;
          return (
            <Card key={dia} variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {diaLabel}
              </Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                {horarios[dia]?.map((horario, index) => (
                  <Stack key={index} direction="row" spacing={1} alignItems="center">
                    <Chip label={horario} />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeHorario(dia, index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  label="Horário (HH:MM-HH:MM)"
                  placeholder="08:00-12:00"
                  value={newHorario[dia] || ''}
                  onChange={e => setNewHorario({ ...newHorario, [dia]: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => addHorario(dia)}
                >
                  Adicionar
                </Button>
              </Stack>
            </Card>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default DisponibilidadeEditor;
