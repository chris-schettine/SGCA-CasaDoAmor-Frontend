import { stylesContainer, stylesDivCheckbox, SubtitleStyles, TitleStyles, typeStyles } from "./styles";
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Alert, Snackbar, CircularProgress, type AlertColor, type SnackbarCloseReason } from "@mui/material";
import CustomCheckbox from "../../components/CustomCheckbox";

const MedicalRecordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientId } = location.state || {};

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");
  const [loading, setLoading] = useState(true);

  const showSnackbar = useCallback((message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleSnackbarClose = (
    reason: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (!patientId) {
      showSnackbar("Você precisa selecionar o paciente", "warning");
      setTimeout(() => {
        navigate("/patients");
      }, 2000)
    } else {
      // Simular requisição
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [patientId, navigate, showSnackbar]);

  if (loading) {
    return (
      <div css={stylesContainer} style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh"
      }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div css={stylesContainer}>
      <h1 css={TitleStyles}>Prontuário médico do paciente NOME</h1>

      <h2 css={SubtitleStyles}>Fatores de riscos</h2>

      <h4 css={typeStyles}>Lesão de pele:</h4>
      <div style={{ display: "flex", width: "1000px", justifyContent: "space-between", margin: 0 }}>
        <div css={stylesDivCheckbox}>
          <CustomCheckbox label="Alteração no nível de consciência" />
          <CustomCheckbox label="Déficit de mobilidade e atividade" />
          <CustomCheckbox label="Déficit nutricional" />
          <CustomCheckbox label="Pele úmida/molhada" />
        </div>

        <div css={stylesDivCheckbox}>
          <CustomCheckbox label="Facção/Cisalhamento" />
          <CustomCheckbox label="Limitação da mobilidade" />
          <CustomCheckbox label="Fora de risco" />
        </div>
      </div>

      <h4 css={typeStyles}>Flebite</h4>
      <div style={{ display: "flex", width: "1000px", justifyContent: "space-between", margin: 0 }}>
        <div css={stylesDivCheckbox}>
          <CustomCheckbox label="Criança/Idoso" />
          <CustomCheckbox label="Alteração do lugar da pele" />
          <CustomCheckbox label="Imunodepressão" />
          <CustomCheckbox label="Fragilidade capilar" />
        </div>

        <div css={stylesDivCheckbox}>
          <CustomCheckbox label="Uso de quimioterapia" />
          <CustomCheckbox label="Medicações hiperosmolares" />
          <CustomCheckbox label="Fora de risco" />
        </div>
      </div>

      <h4 css={typeStyles}>Queda</h4>
      <div style={{ display: "flex", width: "1000px", justifyContent: "space-between", margin: 0 }}>
        <div css={stylesDivCheckbox}>
          <CustomCheckbox label="Criança/Idoso/Gestante" />
          <CustomCheckbox label="Convulsões" />
          <CustomCheckbox label="Confusão mental/Delirium" />
          <CustomCheckbox label="Visão/audição diminuída" />
        </div>

        <div css={stylesDivCheckbox}>
          <CustomCheckbox label="Hipotensão postural" />
          <CustomCheckbox label="Uso de álcool/drogas" />
          <CustomCheckbox label="Fora de risco" />
        </div>
      </div>

      <h4 css={typeStyles}>SAE - Sistema de assistência de enfermagem</h4>
      <div style={{ display: "flex", width: "1000px", justifyContent: "space-between", margin: 0 }}>
        <div css={stylesDivCheckbox}>
          <CustomCheckbox label="Dor caracterizada por relato verbal devido a presença de tumores" />
          <CustomCheckbox label="Risco para integridade da pele prejudicada" />
          <CustomCheckbox label="Déficit no autocuidado para banho e higiene" />
        </div>

        <div css={stylesDivCheckbox}>
          <CustomCheckbox label="Náuseas e vômitos relacionados ao tratamento oncológico" />
          <CustomCheckbox label="Risco para infecção devido à imunossupressão" />
          <CustomCheckbox label="Ansiedade por incerteza relacionada a risco de morte" />
        </div>
      </div>

      <h4 css={typeStyles}>Histórico de saúde e doença</h4>
      <div style={{ display: "flex", width: "1000px", justifyContent: "space-between", margin: 0 }}>
        <div css={stylesDivCheckbox}>
          <CustomCheckbox label="Tabagismo" />
          <CustomCheckbox label="Neoplasia" />
          <CustomCheckbox label="Doença autoimune" />
          <CustomCheckbox label="Doença respiratória" />
          <CustomCheckbox label="Doença cardiovascular" />
          <CustomCheckbox label="Diabetes" />
          <CustomCheckbox label="Doença renal" />
        </div>

        <div css={stylesDivCheckbox}>
          <CustomCheckbox label="Dislipidemia" />
          <CustomCheckbox label="Etilismo" />
          <CustomCheckbox label="Hipertensão" />
          <CustomCheckbox label="Transfusão sanguínea" />
          <CustomCheckbox label="Virose na infância" />
          <CustomCheckbox label="Doenças infectocontagiosas" />
        </div>
        {/* Outros: _____ */}
      </div>

      {/* Snackbar Component */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={(_, reason) => handleSnackbarClose(reason as SnackbarCloseReason)}
      >
        <Alert
          onClose={() => handleSnackbarClose('clickaway')}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MedicalRecordPage;
