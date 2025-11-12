import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import CustomCheckbox from "../../components/CustomCheckbox";
import Breadcrumbs from "../../components/Breadcrumbs";
import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import { toastWarn } from "../../utils/toast";

const MedicalRecordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientId, patientName, patient } = location.state || {};
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) {
      toastWarn("Você precisa selecionar o paciente");
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
  }, [patientId, navigate]);

  if (loading) {
    return <LoadingState message="Carregando prontuário médico..." />;
  }

  return (
    <Box sx={{ 
      display: "flex", 
      justifyContent: "center", 
      flexDirection: "column", 
      gap: "10px", 
      width: "90%", 
      minHeight: "56px", 
      margin: "24px auto" 
    }}>
      <Breadcrumbs items={[
        { label: 'Pacientes', path: '/patients' },
        { 
          label: patientName || 'Paciente', 
          path: '/patient/information',
          state: { patientId, patient }
        },
        { label: 'Prontuário Médico' }
      ]} />
      <PageHeader 
        title={`Prontuário médico do paciente ${patientName || 'NOME'}`}
        subtitle="Fatores de risco e condições clínicas"
      />

      <Typography component="h4" sx={{ fontSize: "16px", color: "#000", fontWeight: 600, m: 0, pt: "10px" }}>
        Lesão de pele:
      </Typography>
      <Box sx={{ display: "flex", width: "1000px", justifyContent: "space-between", m: 0 }}>
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <CustomCheckbox label="Alteração no nível de consciência" />
          <CustomCheckbox label="Déficit de mobilidade e atividade" />
          <CustomCheckbox label="Déficit nutricional" />
          <CustomCheckbox label="Pele úmida/molhada" />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <CustomCheckbox label="Facção/Cisalhamento" />
          <CustomCheckbox label="Limitação da mobilidade" />
          <CustomCheckbox label="Fora de risco" />
        </Box>
      </Box>

      <Typography component="h4" sx={{ fontSize: "16px", color: "#000", fontWeight: 600, m: 0, pt: "10px" }}>
        Flebite
      </Typography>
      <Box sx={{ display: "flex", width: "1000px", justifyContent: "space-between", m: 0 }}>
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <CustomCheckbox label="Criança/Idoso" />
          <CustomCheckbox label="Alteração do lugar da pele" />
          <CustomCheckbox label="Imunodepressão" />
          <CustomCheckbox label="Fragilidade capilar" />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <CustomCheckbox label="Uso de quimioterapia" />
          <CustomCheckbox label="Medicações hiperosmolares" />
          <CustomCheckbox label="Fora de risco" />
        </Box>
      </Box>

      <Typography component="h4" sx={{ fontSize: "16px", color: "#000", fontWeight: 600, m: 0, pt: "10px" }}>
        Queda
      </Typography>
      <Box sx={{ display: "flex", width: "1000px", justifyContent: "space-between", m: 0 }}>
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <CustomCheckbox label="Criança/Idoso/Gestante" />
          <CustomCheckbox label="Convulsões" />
          <CustomCheckbox label="Confusão mental/Delirium" />
          <CustomCheckbox label="Visão/audição diminuída" />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <CustomCheckbox label="Hipotensão postural" />
          <CustomCheckbox label="Uso de álcool/drogas" />
          <CustomCheckbox label="Fora de risco" />
        </Box>
      </Box>

      <Typography component="h4" sx={{ fontSize: "16px", color: "#000", fontWeight: 600, m: 0, pt: "10px" }}>
        SAE - Sistema de assistência de enfermagem
      </Typography>
      <Box sx={{ display: "flex", width: "1000px", justifyContent: "space-between", m: 0 }}>
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <CustomCheckbox label="Dor caracterizada por relato verbal devido a presença de tumores" />
          <CustomCheckbox label="Risco para integridade da pele prejudicada" />
          <CustomCheckbox label="Déficit no autocuidado para banho e higiene" />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <CustomCheckbox label="Náuseas e vômitos relacionados ao tratamento oncológico" />
          <CustomCheckbox label="Risco para infecção devido à imunossupressão" />
          <CustomCheckbox label="Ansiedade por incerteza relacionada a risco de morte" />
        </Box>
      </Box>

      <Typography component="h4" sx={{ fontSize: "16px", color: "#000", fontWeight: 600, m: 0, pt: "10px" }}>
        Histórico de saúde e doença
      </Typography>
      <Box sx={{ display: "flex", width: "1000px", justifyContent: "space-between", m: 0 }}>
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <CustomCheckbox label="Tabagismo" />
          <CustomCheckbox label="Neoplasia" />
          <CustomCheckbox label="Doença autoimune" />
          <CustomCheckbox label="Doença respiratória" />
          <CustomCheckbox label="Doença cardiovascular" />
          <CustomCheckbox label="Diabetes" />
          <CustomCheckbox label="Doença renal" />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <CustomCheckbox label="Dislipidemia" />
          <CustomCheckbox label="Etilismo" />
          <CustomCheckbox label="Hipertensão" />
          <CustomCheckbox label="Transfusão sanguínea" />
          <CustomCheckbox label="Virose na infância" />
          <CustomCheckbox label="Doenças infectocontagiosas" />
        </Box>
      
      </Box>
    </Box>
  );
};

export default MedicalRecordPage;
