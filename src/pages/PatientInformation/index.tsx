import { Alert, Button, CircularProgress, Snackbar, type AlertColor, type SnackbarCloseReason, Box, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { pacienteService } from "../../api/paciente.service";
import type { PacienteDTO } from "../../api/paciente.dto";
import { formatISOToDDMMYYYY } from '../../utils/formatters';
import Breadcrumbs from "../../components/Breadcrumbs";

const PatientInformation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId, patient: passedPatient } = location.state || {};
  const delay = 3000;

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<PacienteDTO | null>(null);

  const showSnackbar = useCallback((message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleSnackbarClose = (reason: SnackbarCloseReason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Se acessar direto sem patientId nem paciente passado
  useEffect(() => {
    if (!patientId && !passedPatient) {
      showSnackbar("Você precisa selecionar o paciente", "warning");
      setTimeout(() => {
        navigate("/patients");
      }, delay);
    }
  }, [patientId, passedPatient, navigate, showSnackbar]);

  // Buscar dados do paciente
  useEffect(() => {
    if (passedPatient) {
      setPatient(passedPatient as PacienteDTO);
      return;
    }

    if (patientId) {
      const fetchPatient = async () => {
        try {
          setLoading(true);
          // Fallback: buscar por listagem usando searchText = id
          const response = await pacienteService.listarPacientes(10, 0, patientId as string);
          if (response.nodes.length > 0) {
            setPatient(response.nodes[0]);
          } else {
            showSnackbar('Paciente não encontrado', 'warning');
          }
          setLoading(false);
        } catch (error) {
          console.error(error);
          showSnackbar("Erro ao buscar dados do paciente", "error");
          setLoading(false);
        }
      };

      fetchPatient();
    }
  }, [patientId, passedPatient, showSnackbar]);

  const handleNavigate = (record: string) => {
    navigate(`/patient/information/${record}`, {
      state: { patientId }
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: "flex", 
      justifyContent: "center", 
      flexDirection: "column", 
      gap: "16px", 
      width: "90%", 
      minHeight: "56px", 
      margin: "24px auto" 
    }}>
      <Breadcrumbs items={[
        { label: 'Pacientes', path: '/patients' },
        { label: patient?.nome || 'Carregando...' }
      ]} />
      {patient && (
        <>
          <Typography component="h1" sx={{ fontSize: "24px", color: "#000", fontWeight: 600, m: 0 }}>
            {patient.nome}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px' }}>
            <Typography component="p" sx={{ m: 0 }}><strong>Data de nascimento:</strong> {formatISOToDDMMYYYY(patient.dataNascimento) || 'Dado não encontrado'}</Typography>
            <Typography component="p" sx={{ m: 0 }}><strong>Naturalidade:</strong> {patient.naturalidade ?? 'Dado não encontrado'}</Typography>
            <Typography component="p" sx={{ m: 0 }}><strong>Telefone:</strong> {patient.telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3') ?? 'Dado não encontrado'}</Typography>
            <Typography component="p" sx={{ m: 0 }}> <strong>Endereço:</strong> {patient.logradouro ?? 'Dado não encontrado'}, n° {patient.numero ?? 'Dado não encontrado'}</Typography>
            <Typography component="p" sx={{ m: 0 }}><strong>Bairro:</strong> {patient.bairro ?? 'Dado não encontrado'}</Typography>
            <Typography component="p" sx={{ m: 0 }}><strong>Cidade:</strong> {patient.cidade ?? 'Dado não encontrado'} - {patient.estado ?? 'Dado não encontrado'}</Typography>
            <Typography component="p" sx={{ m: 0 }}><strong>CEP:</strong> {patient.cep ?? 'Dado não encontrado'}</Typography>
            <Typography component="p" sx={{ m: 0 }}><strong>Complemento:</strong> {patient.complemento ?? 'Dado não encontrado'}</Typography>
          </Box>
        </>
      )}

      <Typography component="h1" sx={{ fontSize: "24px", color: "#000", fontWeight: 600, m: 0 }}>
        Prontuários
      </Typography>
      <Box sx={{ display: "flex", width: "100%", gap: "10px" }}>
        <Button
          sx={{ 
            backgroundColor: '#09244B', 
            color: '#fff', 
            width: '200px', 
            '&:hover': { backgroundColor: '#0C2F58' } 
          }}
          onClick={() => handleNavigate("medical-record")}
        >
          Médico
        </Button>
        <Button
          sx={{ 
            backgroundColor: '#09244B', 
            color: '#fff', 
            width: '200px', 
            '&:hover': { backgroundColor: '#0C2F58' } 
          }}
          onClick={() => handleNavigate("nursing-record")}
        >
          Enfermagem
        </Button>
        <Button
          sx={{ 
            backgroundColor: '#09244B', 
            color: '#fff', 
            width: '200px', 
            '&:hover': { backgroundColor: '#0C2F58' } 
          }}
          onClick={() => handleNavigate("nutrition-record")}
        >
          Nutrição
        </Button>
        <Button
          sx={{ 
            backgroundColor: '#09244B', 
            color: '#fff', 
            width: '200px', 
            '&:hover': { backgroundColor: '#0C2F58' } 
          }}
          onClick={() => handleNavigate("psychology-record")}
        >
          Psicologia
        </Button>
      </Box>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={(_, reason) => handleSnackbarClose(reason as SnackbarCloseReason)}
      >
        <Alert
          onClose={() => handleSnackbarClose("clickaway")}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientInformation;
