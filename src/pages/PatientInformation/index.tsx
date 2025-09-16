import { Alert, Button, CircularProgress, css, Snackbar, type AlertColor, type SnackbarCloseReason } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { recordStyles, stylesContainer, TitleStyles } from "./styles";
import { useCallback, useEffect, useState } from "react";
import { apiGateway } from "../../api/api.gateway";

interface Endereco {
  bairro: string | null;
  cep: string | null;
  cidade: string | null;
  complemento: string | null;
  endereco: string | null;
  estado: string | null;
  numero: number | null;
}

interface PatientData {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  endereco: Endereco;
  naturalidade: string;
  profissao: string;
  rg: string;
  telefone: string;
}

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
  const { patientId } = location.state || {};
  const delay = 3000;

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<PatientData | null>(null);

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

  // Se acessar direto sem patientId
  useEffect(() => {
    if (!patientId) {
      showSnackbar("Você precisa selecionar o paciente", "warning");
      setTimeout(() => {
        navigate("/patients");
      }, delay);
    }
  }, [patientId, navigate, showSnackbar]);

  // Buscar dados do paciente
  useEffect(() => {
    if (patientId) {
      const fetchPatient = async () => {
        try {
          setLoading(true);
          // Aqui seria seu fetch real:
          const response = await apiGateway.getPessoaFisicaById(patientId);

          console.log("yes", response.data)
          // setPatient(response.data);

          // Simulação de fetch com delay
          setTimeout(() => {
            setPatient(response.data);
            setLoading(false);
          }, 1500);
        } catch (error) {
          console.error(error);
          showSnackbar("Erro ao buscar dados do paciente", "error");
          setLoading(false);
        }
      };

      fetchPatient();
    }
  }, [patientId, showSnackbar]);

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
      {patient && (
        <>
          <h1 css={TitleStyles}>{patient.nome}</h1>
          <div css={pContainer}>
            <p css={pStyles}><strong>CPF:</strong> {patient.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') ?? 'Dado não encontrado'}</p>
            <p css={pStyles}><strong>Data de nascimento:</strong> {patient.dataNascimento.split('-').join('/') ?? 'Dado não encontrado'}</p>
            <p css={pStyles}><strong>E-mail:</strong> {patient.email ?? 'Dado não encontrado'}</p>
            <p css={pStyles}><strong>Naturalidade:</strong> {patient.naturalidade ?? 'Dado não encontrado'}</p>
            <p css={pStyles}><strong>Profissão: </strong>{patient.profissao ?? 'Dado não encontrado'}</p>
            <p css={pStyles}><strong>RG:</strong> {patient.rg.replace(/^(\d{2})(\d{3})(\d{3})(\d{1})$/, '$1.$2.$3-$4') ?? 'Dado não encontrado'}</p>
            <p css={pStyles}><strong>Telefone:</strong> {patient.telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3') ?? 'Dado não encontrado'}</p>
            <p css={pStyles}> <strong>Endereço:</strong> {patient.endereco.endereco ?? 'Dado não encontrado'}, n° {patient.endereco.numero ?? 'Dado não encontrado'}</p>
            <p css={pStyles}><strong>Bairro:</strong> {patient.endereco.bairro ?? 'Dado não encontrado'}</p>
            <p css={pStyles}><strong>Cidade:</strong> {patient.endereco.cidade ?? 'Dado não encontrado'} - {patient.endereco.estado ?? 'Dado não encontrado'}</p>
            <p css={pStyles}><strong>CEP:</strong> {patient.endereco.cep ?? 'Dado não encontrado'}</p>
            <p css={pStyles}><strong>Complemento:</strong> {patient.endereco.complemento ?? 'Dado não encontrado'}</p>
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
