import { Button, Box, Typography, Card, CardContent, Chip } from "@mui/material";
import { CardSkeleton } from '../../components/SuspenseWrapper';
import { useLocation, useNavigate } from "react-router-dom";
import type { AcompanhanteDTO } from "../../api/acompanhante.dto";
import { formatISOToDDMMYYYY } from '../../utils/formatters';
import Breadcrumbs from "../../components/Breadcrumbs";
import EditIcon from '@mui/icons-material/Edit';
import { toastWarn } from "../../utils/toast";

const CompanionInformation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { acompanhante?: AcompanhanteDTO } | null;
  const acompanhante = state?.acompanhante;

  // Se não há acompanhante, redirecionar
  if (!acompanhante) {
    toastWarn("Acompanhante não encontrado");
    setTimeout(() => {
      navigate("/companions");
    }, 2000);
    return <CardSkeleton />;
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
        { label: 'Acompanhantes', path: '/companions' },
        { label: acompanhante.dadoPessoal?.nome || 'Carregando...' }
      ]} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography component="h1" sx={{ fontSize: "24px", color: 'text.primary', fontWeight: 600, m: 0 }}>
          {acompanhante.dadoPessoal?.nome}
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/companion/edit/${acompanhante.id}`, { state: { acompanhante } })}
        >
          Editar
        </Button>
      </Box>

      {/* Dados Pessoais */}
      <Card>
        <CardContent>
          <Typography component="h2" sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
            Dados Pessoais
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px' }}>
              <Typography component="p" sx={{ m: 0 }}>
                <strong>Nome da mãe:</strong> {acompanhante.dadoPessoal?.nomeMae || 'Não informado'}
              </Typography>
              <Typography component="p" sx={{ m: 0 }}>
                <strong>Data de nascimento:</strong> {formatISOToDDMMYYYY(acompanhante.dadoPessoal?.dataNascimento) || 'Não informado'}
              </Typography>
              <Typography component="p" sx={{ m: 0 }}>
                <strong>CPF:</strong> {acompanhante.dadoPessoal?.cpf?.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') || 'Não informado'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px' }}>
              <Typography component="p" sx={{ m: 0 }}>
                <strong>RG:</strong> {acompanhante.dadoPessoal?.rg || 'Não informado'}
              </Typography>
              <Typography component="p" sx={{ m: 0 }}>
                <strong>Naturalidade:</strong> {acompanhante.dadoPessoal?.naturalidade || 'Não informado'}
              </Typography>
              <Typography component="p" sx={{ m: 0 }}>
                <strong>Profissão:</strong> {acompanhante.dadoPessoal?.profissao || 'Não informado'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px' }}>
              <Typography component="p" sx={{ m: 0 }}>
                <strong>Telefone:</strong> {acompanhante.dadoPessoal?.telefone?.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3') || 'Não informado'}
              </Typography>
              <Typography component="p" sx={{ m: 0 }}>
                <strong>Estado Civil:</strong> {acompanhante.dadoPessoal?.estadoCivil || 'Não informado'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardContent>
          <Typography component="h2" sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
            Endereço
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px' }}>
              <Typography component="p" sx={{ m: 0 }}>
                <strong>Logradouro:</strong> {acompanhante.endereco?.logradouro || 'Não informado'}
              </Typography>
              <Typography component="p" sx={{ m: 0 }}>
                <strong>Número:</strong> {acompanhante.endereco?.numero || 'Não informado'}
              </Typography>
              <Typography component="p" sx={{ m: 0 }}>
                <strong>Complemento:</strong> {acompanhante.endereco?.complemento || 'Não informado'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16px' }}>
              <Typography component="p" sx={{ m: 0 }}>
                <strong>Bairro:</strong> {acompanhante.endereco?.bairro || 'Não informado'}
              </Typography>
              <Typography component="p" sx={{ m: 0 }}>
                <strong>Cidade:</strong> {acompanhante.endereco?.cidade || 'Não informado'}
              </Typography>
              <Typography component="p" sx={{ m: 0 }}>
                <strong>Estado:</strong> {acompanhante.endereco?.estado || 'Não informado'}
              </Typography>
              <Typography component="p" sx={{ m: 0 }}>
                <strong>CEP:</strong> {acompanhante.endereco?.cep || 'Não informado'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Informações do Acompanhamento */}
      <Card>
        <CardContent>
          <Typography component="h2" sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
            Informações do Acompanhamento
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Typography component="p" sx={{ m: 0 }}>
              <strong>Paciente:</strong> {acompanhante.pacienteNome || 'Não informado'}
            </Typography>
            <Typography component="p" sx={{ m: 0 }}>
              <strong>Parentesco:</strong> {acompanhante.parentesco || 'Não informado'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="p" sx={{ m: 0 }}>
                <strong>Pode ajudar na cozinha:</strong>
              </Typography>
              <Chip 
                label={acompanhante.podeAjudarNaCozinha ? 'Sim' : 'Não'} 
                color={acompanhante.podeAjudarNaCozinha ? 'success' : 'default'}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography component="p" sx={{ m: 0 }}>
                <strong>Status:</strong>
              </Typography>
              <Chip 
                label={acompanhante.ativo ? 'Ativo' : 'Inativo'} 
                color={acompanhante.ativo ? 'success' : 'error'}
                size="small"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CompanionInformation;
