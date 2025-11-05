import { Alert, Button, CircularProgress, css, Snackbar, type AlertColor, type SnackbarCloseReason } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { recordStyles, stylesContainer, TitleStyles } from "./styles";
import { useCallback, useEffect, useState } from "react";
import { pacienteService } from "../../api/paciente.service";
import type { PacienteDTO } from "../../api/paciente.dto";
import { formatISOToDDMMYYYY } from '../../utils/formatters';
import Breadcrumbs from "../../components/Breadcrumbs";

const btnStyles = css({
  backgroundColor: '#09244B',
  color: '#fff',
  width: '200px',
  '&:hover': {
    backgroundColor: '#0C2F58'
  }
})

const pStyles = css({
  margin: '0px',

})

const pContainer = css({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: '16px'
})

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
      <div css={stylesContainer} style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div css={stylesContainer}>
      <Breadcrumbs items={[
        { label: 'Pacientes', path: '/patients' },
        { label: patient?.nome || 'Carregando...' }
      ]} />
      {patient && (
        <>
          <h1 css={TitleStyles}>{patient.nome}</h1>
          <div css={pContainer}>
            <p css={pStyles}><strong>Data de nascimento:</strong> {formatISOToDDMMYYYY(patient.dataNascimento) || 'Dado não encontrado'}</p>
            <p css={pStyles}><strong>Naturalidade:</strong> {patient.naturalidade ?? 'Dado não encontrado'}</p>
            <p css={pStyles}><strong>Telefone:</strong> {patient.telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3') ?? 'Dado não encontrado'}</p>
            <p css={pStyles}> <strong>Endereço:</strong> {patient.logradouro ?? 'Dado não encontrado'}, n° {patient.numero ?? 'Dado não encontrado'}</p>
            <p css={pStyles}><strong>Bairro:</strong> {patient.bairro ?? 'Dado não encontrado'}</p>
            <p css={pStyles}><strong>Cidade:</strong> {patient.cidade ?? 'Dado não encontrado'} - {patient.estado ?? 'Dado não encontrado'}</p>
            <p css={pStyles}><strong>CEP:</strong> {patient.cep ?? 'Dado não encontrado'}</p>
            <p css={pStyles}><strong>Complemento:</strong> {patient.complemento ?? 'Dado não encontrado'}</p>
          </div>
        </>
      )}

      <h1 css={TitleStyles}>Prontuários</h1>
      <div css={recordStyles}>
        <Button
          css={btnStyles}
          onClick={() => handleNavigate("medical-record")}
        >
          Médico
        </Button>
        <Button
          css={btnStyles}
          onClick={() => handleNavigate("nursing-record")}
        >
          Enfermagem
        </Button>
        <Button
          css={btnStyles}
          onClick={() => handleNavigate("nutrition-record")}
        >
          Nutrição
        </Button>
        <Button
          css={btnStyles}
          onClick={() => handleNavigate("psychology-record")}
        >
          Psicologia
        </Button>
      </div>

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
    </div>
  );
};

export default PatientInformation;
