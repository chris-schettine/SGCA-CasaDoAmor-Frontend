import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';

interface PatientBasicDTO {
  id: string;
  nome: string;

}

interface HistoryEvent {
  id: number;
  data: string;
  eventos: string[];
}

const mockPatientHistory: HistoryEvent[] = [
  {
    id: 1,
    data: '26/09/2004',
    eventos: [
      'Atendimento médico com o Dr. Esdras.',
      'Atendimento nutricional com Dra. Cleuza.',
    ],
  },
  {
    id: 2,
    data: '15/10/2004',
    eventos: [
      'Exame de sangue e raio-X realizado.',
      'Recebimento de nova medicação (antibiótico).',
      'Visita de assistente social.',
    ],
  },
  {
    id: 3,
    data: '22/06/2025',
    eventos: [
      'Atendimento com Dr. Pedro.',
      'Atendimento nutricional com Geovana.',
    ],
  },
];

const RelatoryPage = () => {
  const { id } = useParams<{ id: string }>(); 
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientBasicDTO | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);

  useEffect(() => {
    const patientState = location.state?.patient as PatientBasicDTO | undefined;
    if (patientState) {
      setPatient(patientState);
    } else {
      setPatient({ id: id || 'N/A', nome: 'Paciente Desconhecido (ID: ' + id + ')' });
    }

    const fetchHistory = setTimeout(() => {

      setHistory(mockPatientHistory);
      setLoading(false);
    }, 1000); 

    return () => clearTimeout(fetchHistory);
  }, [id, location.state]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ marginLeft: 2 }}>Carregando histórico...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '90%', margin: '24px auto', maxWidth: '1000px' }}>
      <Typography variant="h4" gutterBottom>
        🏥 Histórico Completo do Paciente
      </Typography>
      <Typography variant="h5" color="primary" sx={{ marginBottom: 3 }}>
        {patient?.nome || `Paciente ID: ${id}`}
      </Typography>

      {history.length === 0 ? (
        <Paper elevation={1} sx={{ padding: 3, marginTop: 3 }}>
          <Typography variant="body1">
            Nenhum registro de atendimento encontrado para este paciente.
          </Typography>
        </Paper>
      ) : (
        <List component={Paper} elevation={3} sx={{ padding: 2 }}>
          {history.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
                  🗓️ {item.data}
                </Typography>
                <List sx={{ width: '100%', ml: 2 }}>
                  {item.eventos.map((evento, idx) => (
                    <ListItem key={idx} disablePadding>
                      <ListItemText primary={`- ${evento}`} sx={{ margin: 0, padding: 0 }} />
                    </ListItem>
                  ))}
                </List>
              </ListItem>
              {index < history.length - 1 && <Divider component="li" sx={{ my: 2 }} />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default RelatoryPage;