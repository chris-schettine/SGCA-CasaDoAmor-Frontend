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
  const state = location.state as { patientId?: string; patient?: PacienteDTO } | null;
  const patientId = state?.patientId;
  const passedPatient = state?.patient;
  const delay = 3000;

  console.log('[PatientInformation] Component mounted/updated');
  console.log('[PatientInformation] location.state:', location.state);
  console.log('[PatientInformation] patientId:', patientId);
  console.log('[PatientInformation] passedPatient:', passedPatient);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<PacienteDTO | null>(passedPatient || null);

  console.log('[PatientInformation] patient state:', patient);

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

  // Buscar dados do paciente
  useEffect(() => {
    console.log('[PatientInformation useEffect] Starting...');
    console.log('[PatientInformation useEffect] passedPatient:', passedPatient);
    console.log('[PatientInformation useEffect] patient:', patient);
    console.log('[PatientInformation useEffect] patientId:', patientId);

    // Se já temos o paciente inicialmente (passado via state), não fazer nada
    if (passedPatient && patient) {
      console.log('[PatientInformation useEffect] Already have patient, returning early');
      return;
    }

    // Se não há patientId nem paciente passado, redirecionar
    if (!patientId && !passedPatient) {
      console.log('[PatientInformation useEffect] No patientId and no passedPatient, redirecting...');
      showSnackbar("Você precisa selecionar o paciente", "warning");
      setTimeout(() => {
        navigate("/patients");
      }, delay);
      return;
    }

    // Se o paciente foi passado diretamente mas ainda não foi setado, usar ele
    if (passedPatient && !patient) {
      console.log('[PatientInformation useEffect] Setting patient from passedPatient:', passedPatient);
      setPatient(passedPatient as PacienteDTO);
      return;
    }

    // Buscar paciente por ID
    if (patientId && !patient) {
      console.log('[PatientInformation useEffect] Fetching patient by ID:', patientId);
      const fetchPatient = async () => {
        try {
          setLoading(true);
          console.log('[PatientInformation fetchPatient] Calling listarPacientes with searchText:', patientId);
          // Fallback: buscar por listagem usando searchText = id
          const response = await pacienteService.listarPacientes(10, 0, patientId as string);
          console.log('[PatientInformation fetchPatient] Response:', response);
          if (response.nodes.length > 0) {
            console.log('[PatientInformation fetchPatient] Patient found:', response.nodes[0]);
            setPatient(response.nodes[0]);
          } else {
            console.log('[PatientInformation fetchPatient] Patient not found in response');
            showSnackbar('Paciente não encontrado', 'warning');
            setTimeout(() => {
              navigate("/patients");
            }, delay);
          }
          setLoading(false);
        } catch (error) {
          console.error('[PatientInformation fetchPatient] Error:', error);
          showSnackbar("Erro ao buscar dados do paciente", "error");
          setLoading(false);
          setTimeout(() => {
            navigate("/patients");
          }, delay);
        }
      };

      fetchPatient();
    }
  }, [patientId, passedPatient, patient, navigate, showSnackbar]);

  const handleNavigate = (record: string) => {
    navigate(`/patient/information/${record}`, {
      state: { 
        patientId,
        patientName: patient?.dadoPessoal?.nome,
        patient
      }
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
        { label: patient?.dadoPessoal?.nome || 'Carregando...' }
      ]} />
      {patient && (
        <>
          <Typography component="h1" sx={{ fontSize: "24px", color: "#000", fontWeight: 600, m: 0 }}>
            {patient.dadoPessoal?.nome}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px' }}>
              <Typography component="p" sx={{ m: 0 }}><strong>Data de nascimento:</strong> {formatISOToDDMMYYYY(patient.dadoPessoal?.dataNascimento) || 'Dado não encontrado'}</Typography>
              <Typography component="p" sx={{ m: 0 }}><strong>Naturalidade:</strong> {patient.dadoPessoal?.naturalidade ?? 'Dado não encontrado'}</Typography>
              <Typography component="p" sx={{ m: 0 }}><strong>Telefone:</strong> {patient.dadoPessoal?.telefone ? patient.dadoPessoal.telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3') : 'Dado não encontrado'}</Typography>
              <Typography component="p" sx={{ m: 0 }}><strong>Estado Civil:</strong> {patient.dadoPessoal?.estadoCivil ?? 'Dado não encontrado'}</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px' }}>
              <Typography component="p" sx={{ m: 0 }}> <strong>Endereço:</strong> {patient.endereco?.logradouro ?? 'Dado não encontrado'}, n° {patient.endereco?.numero ?? 'Dado não encontrado'}</Typography>
              <Typography component="p" sx={{ m: 0 }}><strong>Bairro:</strong> {patient.endereco?.bairro ?? 'Dado não encontrado'}</Typography>
              <Typography component="p" sx={{ m: 0 }}><strong>Cidade:</strong> {patient.endereco?.cidade ?? 'Dado não encontrado'} - {patient.endereco?.estado ?? 'Dado não encontrado'}</Typography>
              <Typography component="p" sx={{ m: 0 }}><strong>CEP:</strong> {patient.endereco?.cep ?? 'Dado não encontrado'}</Typography>
              <Typography component="p" sx={{ m: 0 }}><strong>Complemento:</strong> {patient.endereco?.complemento ?? 'Dado não encontrado'}</Typography>
            </Box>
          </Box>

          {/* Contatos de emergência */}
          <Box>
            <Typography component="h2" sx={{ fontSize: 18, fontWeight: 600 }}>Contatos de Emergência</Typography>
            {patient.contatosDeEmergencia && patient.contatosDeEmergencia.length > 0 ? (
              patient.contatosDeEmergencia.map((c, idx) => (
                <Box key={idx} sx={{ mt: 1 }}>
                  <Typography><strong>Nome:</strong> {c.nome}</Typography>
                  <Typography><strong>Telefone:</strong> {c.telefone}</Typography>
                  <Typography><strong>Email:</strong> {c.email}</Typography>
                </Box>
              ))
            ) : (
              <Typography sx={{ mt: 1 }}>Nenhum contato de emergência registrado.</Typography>
            )}
          </Box>

          {/* Dados clínicos (pode haver múltiplos registros) */}
          <Box>
            <Typography component="h2" sx={{ fontSize: 18, fontWeight: 600, mt: 2 }}>Dados Clínicos</Typography>
            {patient.dadosClinicos && patient.dadosClinicos.length > 0 ? (
              patient.dadosClinicos.map((dc, idx) => (
                <Box key={idx} sx={{ mt: 1, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                  <Typography><strong>Diagnóstico:</strong> {dc.diagnostico ?? '—'}</Typography>
                  <Typography><strong>Tratamento:</strong> {dc.tratamento ?? '—'} {dc.tratamento === 'OUTRO' && dc.tratamentoOutroDescricao ? `- ${dc.tratamentoOutroDescricao}` : ''}</Typography>
                  <Typography><strong>Tipo sanguíneo:</strong> {dc.tipoSanguineo ?? '—'}</Typography>
                  <Typography><strong>Usa sonda:</strong> {dc.usaSonda ? 'Sim' : 'Não'}</Typography>
                  {dc.usaSonda && (
                    <Typography><strong>Tipo sonda vesical:</strong> {dc.tipoSondaVesical ?? '—'}</Typography>
                  )}
                  <Typography><strong>Usa curativo:</strong> {dc.usaCurativo ? 'Sim' : 'Não'}</Typography>
                  <Typography><strong>Oxigenoterapia:</strong> {dc.usaOxigenoterapia ? 'Sim' : 'Não'}</Typography>
                </Box>
              ))
            ) : (
              <Typography sx={{ mt: 1 }}>Nenhum dado clínico registrado.</Typography>
            )}
          </Box>

          {/* Informação Hospitalar */}
          <Box>
            <Typography component="h2" sx={{ fontSize: 18, fontWeight: 600, mt: 2 }}>Informação Hospitalar</Typography>
            {patient.informacaoHospitalar ? (
              <Box sx={{ mt: 1 }}>
                <Typography><strong>Hospital referência:</strong> {patient.informacaoHospitalar.nomeHospitalReferencia ?? '—'}</Typography>
                <Typography><strong>Médico responsável:</strong> {patient.informacaoHospitalar.medicoResponsavel ?? '—'}</Typography>
                <Typography><strong>Setor/ala:</strong> {patient.informacaoHospitalar.setorAla ?? '—'}</Typography>
                <Typography><strong>Data internação:</strong> {patient.informacaoHospitalar.dataInternacao ? formatISOToDDMMYYYY(patient.informacaoHospitalar.dataInternacao) : '—'}</Typography>
              </Box>
            ) : (
              <Typography sx={{ mt: 1 }}>Nenhuma informação hospitalar registrada.</Typography>
            )}
          </Box>

          {/* Dado social */}
          <Box>
            <Typography component="h2" sx={{ fontSize: 18, fontWeight: 600, mt: 2 }}>Dado Social</Typography>
            {patient.dadoSocial ? (
              <Box sx={{ mt: 1 }}>
                <Typography><strong>Renda familiar:</strong> {patient.dadoSocial.rendaFamiliar != null ? `R$ ${patient.dadoSocial.rendaFamiliar}` : '—'}</Typography>
                <Typography><strong>Composição familiar:</strong> {patient.dadoSocial.composicaoFamiliar ?? '—'}</Typography>
                <Typography><strong>Situação moradia:</strong> {patient.dadoSocial.situacaoMoradia ?? '—'}</Typography>
                <Typography><strong>Necessidades especiais:</strong> {patient.dadoSocial.necessidadesEspeciais ?? '—'}</Typography>
              </Box>
            ) : (
              <Typography sx={{ mt: 1 }}>Nenhum dado social registrado.</Typography>
            )}
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
