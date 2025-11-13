import { Button, Box, Typography, Card, CardContent, Chip, Pagination } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { pacienteService } from "../../api/paciente.service";
import type { PacienteDTO } from "../../api/paciente.dto";
import { formatISOToDDMMYYYY } from '../../utils/formatters';
import Breadcrumbs from "../../components/Breadcrumbs";
import { useAcompanhantesPorPaciente } from "../../hooks/useAcompanhantes";
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import { toastError, toastWarn } from "../../utils/toast";
import LoadingState from '../../components/LoadingState';
import { CardSkeleton } from '../../components/SuspenseWrapper';

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

  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<PacienteDTO | null>(passedPatient || null);
  
  // Paginação de acompanhantes
  const [acompanhantesPage, setAcompanhantesPage] = useState(1);
  const acompanhantesLimit = 10;

  // Buscar acompanhantes do paciente com paginação
  const { 
    data: acompanhantesData, 
    isLoading: isLoadingAcompanhantes 
  } = useAcompanhantesPorPaciente(
    patient?.id, 
    acompanhantesLimit, 
    (acompanhantesPage - 1) * acompanhantesLimit
  );

  console.log('[PatientInformation] patient state:', patient);

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
      toastWarn("Você precisa selecionar o paciente");
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
            toastWarn('Paciente não encontrado');
            setTimeout(() => {
              navigate("/patients");
            }, delay);
          }
          setLoading(false);
        } catch (error) {
          console.error('[PatientInformation fetchPatient] Error:', error);
          toastError("Erro ao buscar dados do paciente");
          setLoading(false);
          setTimeout(() => {
            navigate("/patients");
          }, delay);
        }
      };

      fetchPatient();
    }
  }, [patientId, passedPatient, patient, navigate]);

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
    return <LoadingState message="Carregando paciente..." />;
  }

  return (
    <Box sx={{ 
      display: "flex", 
      justifyContent: "center", 
      flexDirection: "column", 
      gap: { xs: "12px", sm: "16px" }, 
      width: { xs: '100%', sm: '95%', md: '90%' }, 
      minHeight: "56px", 
      margin: { xs: "16px auto", sm: "24px auto" },
      px: { xs: 2, sm: 3 }
    }}>
      <Breadcrumbs items={[
        { label: 'Pacientes', path: '/patients' },
        { label: patient?.dadoPessoal?.nome || 'Carregando...' }
      ]} />
      {patient && (
        <>
          <Typography component="h1" sx={{ fontSize: { xs: "20px", sm: "24px" }, color: "#000", fontWeight: 600, m: 0 }}>
            {patient.dadoPessoal?.nome}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: '8px', sm: '12px' } }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: { xs: '12px', sm: '16px' } }}>
              <Typography component="p" sx={{ m: 0, fontSize: { xs: '14px', sm: '16px' } }}><strong>Data de nascimento:</strong> {formatISOToDDMMYYYY(patient.dadoPessoal?.dataNascimento) || 'Dado não encontrado'}</Typography>
              <Typography component="p" sx={{ m: 0, fontSize: { xs: '14px', sm: '16px' } }}><strong>Naturalidade:</strong> {patient.dadoPessoal?.naturalidade ?? 'Dado não encontrado'}</Typography>
              <Typography component="p" sx={{ m: 0, fontSize: { xs: '14px', sm: '16px' } }}><strong>Telefone:</strong> {patient.dadoPessoal?.telefone ? patient.dadoPessoal.telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3') : 'Dado não encontrado'}</Typography>
              <Typography component="p" sx={{ m: 0, fontSize: { xs: '14px', sm: '16px' } }}><strong>Estado Civil:</strong> {patient.dadoPessoal?.estadoCivil ?? 'Dado não encontrado'}</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: { xs: '12px', sm: '16px' } }}>
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

          {/* Acompanhantes */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography component="h2" sx={{ fontSize: 18, fontWeight: 600 }}>
                Acompanhantes {acompanhantesData?.totalCount ? `(${acompanhantesData.totalCount})` : ''}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="small"
                onClick={() => navigate('/patient/companion/register', { 
                  state: { 
                    patientId: patient.id, 
                    patientName: patient.dadoPessoal?.nome 
                  } 
                })}
                sx={{ backgroundColor: '#09244B', '&:hover': { backgroundColor: '#0C2F58' } }}
              >
                Adicionar Acompanhante
              </Button>
            </Box>

            {isLoadingAcompanhantes ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CardSkeleton />
              </Box>
            ) : acompanhantesData && acompanhantesData.nodes.length > 0 ? (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {acompanhantesData.nodes.map((acompanhante) => (
                    <Card key={acompanhante.id} sx={{ boxShadow: 1 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <PersonIcon color="primary" />
                              <Typography variant="h6" component="h3" sx={{ fontSize: 16, fontWeight: 600 }}>
                                {acompanhante.dadoPessoal?.nome}
                              </Typography>
                              <Chip 
                                label={acompanhante.parentesco} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                              {!acompanhante.ativo && (
                                <Chip label="Inativo" size="small" color="error" />
                              )}
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                              <Typography variant="body2">
                                <strong>CPF:</strong> {acompanhante.dadoPessoal?.cpf || '—'}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Telefone:</strong> {acompanhante.dadoPessoal?.telefone || '—'}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Profissão:</strong> {acompanhante.dadoPessoal?.profissao || '—'}
                              </Typography>
                            </Box>

                            {acompanhante.endereco && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                <strong>Endereço:</strong> {acompanhante.endereco.logradouro}, {acompanhante.endereco.numero} - {acompanhante.endereco.bairro}, {acompanhante.endereco.cidade}/{acompanhante.endereco.estado}
                              </Typography>
                            )}

                            <Typography variant="body2" sx={{ mt: 1 }}>
                              <strong>Pode ajudar na cozinha:</strong> {acompanhante.podeAjudarNaCozinha ? 'Sim' : 'Não'}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => navigate(`/companion/edit/${acompanhante.id}`, { 
                                state: { acompanhante } 
                              })}
                            >
                              Editar
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                {/* Paginação */}
                {acompanhantesData.totalCount > acompanhantesLimit && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={Math.ceil(acompanhantesData.totalCount / acompanhantesLimit)}
                      page={acompanhantesPage}
                      onChange={(_event, value) => setAcompanhantesPage(value)}
                      color="primary"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </>
            ) : (
              <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                Nenhum acompanhante cadastrado para este paciente.
              </Typography>
            )}
          </Box>
        </>
      )}

      <Typography component="h1" sx={{ fontSize: { xs: "20px", sm: "24px" }, color: "#000", fontWeight: 600, m: 0, mt: 3 }}>
        Prontuários
      </Typography>
      <Box sx={{ 
        display: "flex", 
        flexDirection: { xs: 'column', sm: 'row' },
        width: "100%", 
        gap: { xs: "8px", sm: "10px" }
      }}>
        <Button
          sx={{ 
            backgroundColor: '#09244B', 
            color: '#fff', 
            width: { xs: '100%', sm: '200px' }, 
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
            width: { xs: '100%', sm: '200px' }, 
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
            width: { xs: '100%', sm: '200px' }, 
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
    </Box>
  );
};

export default PatientInformation;
