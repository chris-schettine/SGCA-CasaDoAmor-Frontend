import React from 'react';
import {
  Box,
  Container,
  Typography,
  Divider,
  Stack,
  Button,
  useTheme,
  Paper,
  IconButton,
  alpha,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import Footer from '../../components/Footer';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import StorageIcon from '@mui/icons-material/Storage';
import ShareIcon from '@mui/icons-material/Share';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import CookieIcon from '@mui/icons-material/Cookie';
import UpdateIcon from '@mui/icons-material/Update';
import GavelIcon from '@mui/icons-material/Gavel';

const PrivacyPolicyPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const darkBlue = theme.custom.brandColors.secondary[500];

  const sections = [
    {
      icon: <StorageIcon />,
      title: '1. Dados coletados',
      color: theme.palette.primary.main,
      content: (
        <>
          <Typography variant="body2" paragraph>
            Podemos coletar os seguintes dados pessoais, dependendo do fluxo e do consentimento fornecido:
          </Typography>
          <Stack spacing={1}>
            <Chip label="Dados de identificação: nome, CPF, RG, data de nascimento, nome da mãe" size="small" sx={{ height: 'auto', py: 1, '& .MuiChip-label': { whiteSpace: 'normal' } }} />
            <Chip label="Contatos: telefone, e-mail, endereço (CEP, rua, número, bairro, cidade, estado)" size="small" sx={{ height: 'auto', py: 1, '& .MuiChip-label': { whiteSpace: 'normal' } }} />
            <Chip label="Dados médicos quando necessários ao prontuário: histórico clínico, medicação, alergias, observações" size="small" sx={{ height: 'auto', py: 1, '& .MuiChip-label': { whiteSpace: 'normal' } }} />
            <Chip label="Dados de autenticação: e-mail, hash de senha, tokens JWT e informações de 2FA" size="small" sx={{ height: 'auto', py: 1, '& .MuiChip-label': { whiteSpace: 'normal' } }} />
            <Chip label="Dados de uso e logs: registros de acesso, eventos de auditoria e métricas de uso" size="small" sx={{ height: 'auto', py: 1, '& .MuiChip-label': { whiteSpace: 'normal' } }} />
          </Stack>
        </>
      )
    },
    {
      icon: <VerifiedUserIcon />,
      title: '2. Finalidade do tratamento',
      color: theme.palette.success.main,
      content: (
        <>
          <Typography variant="body2" paragraph>
            Os dados são tratados para finalidades legítimas, como:
          </Typography>
          <ul style={{ marginLeft: '1rem' }}>
            <li>Prestar cuidados e registrar informações clínicas dos pacientes</li>
            <li>Gerenciar hospedagens, agendamentos e histórico de atendimentos</li>
            <li>Autenticação, autorização e segurança do sistema (incluindo 2FA)</li>
            <li>Comunicações administrativas e operacionais</li>
            <li>Cumprimento de obrigações legais e auditoria</li>
          </ul>
        </>
      )
    },
    {
      icon: <GavelIcon />,
      title: '3. Base legal',
      color: theme.palette.info.main,
      content: (
        <>
          <Typography variant="body2" paragraph>
            O tratamento dos dados pessoais se apoia em bases legais previstas na LGPD, principalmente:
          </Typography>
          <ul style={{ marginLeft: '1rem' }}>
            <li>Consentimento quando exigido (ex.: uso de dados sensíveis para fins médicos)</li>
            <li>Execução de contrato e obrigações legais (prestação de serviços de saúde e registros)</li>
            <li>Legítimo interesse quando aplicável (segurança, prevenção de fraudes, melhorias do serviço)</li>
          </ul>
        </>
      )
    },
    {
      icon: <ShareIcon />,
      title: '4. Compartilhamento e terceiros',
      color: theme.palette.warning.main,
      content: (
        <Typography variant="body2">
          Os dados podem ser compartilhados com prestadores de serviços e terceiros necessários à operação (ex.: provedor de
          hospedagem, serviços de e-mail, plataformas de pagamento e serviços de backup). Todos os terceiros são avaliados
          e contratados com cláusulas de proteção de dados compatíveis com a LGPD.
        </Typography>
      )
    },
    {
      icon: <AccessTimeIcon />,
      title: '5. Tempo de retenção',
      color: theme.palette.secondary.main,
      content: (
        <Typography variant="body2">
          Os dados pessoais serão mantidos pelo tempo necessário às finalidades descritas, ou enquanto existir obrigação legal
          de conservação. Dados relacionados a prontuários e atendimentos podem ter retenção estendida por exigência regulatória.
        </Typography>
      )
    },
    {
      icon: <ContactMailIcon />,
      title: '6. Direitos dos titulares',
      color: theme.palette.primary.main,
      content: (
        <Typography variant="body2">
          Os titulares têm direitos previstos na LGPD, tais como acesso, correção, eliminação, portabilidade, anonimização,
          oposição e revogação de consentimento. Para exercer seus direitos, entre em contato com o Encarregado pelo tratamento
          de dados no e-mail: <b>contato@casadoamor.org</b>.
        </Typography>
      )
    },
    {
      icon: <LockIcon />,
      title: '7. Segurança',
      color: theme.palette.success.main,
      content: (
        <Typography variant="body2">
          Adotamos medidas técnicas e administrativas razoáveis para proteger os dados pessoais contra acessos não autorizados,
          perda e divulgação. Isso inclui criptografia de tokens, controle de acesso por função, uso de HTTPS e logs de auditoria.
        </Typography>
      )
    },
    {
      icon: <CookieIcon />,
      title: '8. Cookies e tecnologias semelhantes',
      color: theme.palette.info.main,
      content: (
        <Typography variant="body2">
          Utilizamos cookies e armazenamento local para funcionalidades essenciais (sessão, preferências) e para melhorar a
          experiência. Você pode configurar suas preferências na interface de consentimento do aplicativo.
        </Typography>
      )
    },
    {
      icon: <UpdateIcon />,
      title: '9. Alterações nesta política',
      color: theme.palette.warning.main,
      content: (
        <Typography variant="body2">
          Esta política pode ser atualizada ao longo do tempo. Notificaremos mudanças relevantes por meio da aplicação e manteremos
          a versão datada para referência.
        </Typography>
      )
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: theme.palette.background.default }}>
      
      {/* Header com navegação */}
      <Box sx={{ bgcolor: theme.palette.background.paper, py: 2, boxShadow: 1 }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              onClick={() => navigate('/')}
              aria-label="voltar para o início"
              sx={{ color: darkBlue }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center' }} />

            <Box
              component="img"
              src="/logo3.png"
              alt="Logo SGCA"
              sx={{ height: 32, width: 'auto' }}
            />

            <Typography variant="h6" fontWeight="bold" sx={{ color: darkBlue }}>
              Política de Privacidade
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 6 }}>
        
        {/* Hero Section */}
        <Paper
          elevation={0}
          sx={{
            p: 5,
            mb: 6,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            borderRadius: 4,
            border: `2px solid ${theme.palette.divider}`,
            textAlign: 'center'
          }}
        >
          <SecurityIcon sx={{ fontSize: 60, color: darkBlue, mb: 2 }} />
          <Typography variant="h3" fontWeight="bold" gutterBottom color={darkBlue}>
            Política de Privacidade
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', lineHeight: 1.7 }}>
            Esta Política de Privacidade descreve como o Sistema de Gestão da Casa do Amor (SGCA) coleta, usa, armazena
            e protege os dados pessoais de pacientes, acompanhantes, profissionais e usuários do sistema. Nosso compromisso
            é respeitar a privacidade e atender aos requisitos da Lei Geral de Proteção de Dados (LGPD).
          </Typography>
        </Paper>

        {/* Seções de Privacidade em Cards */}
        <Stack spacing={3}>
          {sections.map((section, index) => (
            <Card
              key={index}
              elevation={2}
              sx={{
                borderRadius: 3,
                border: `2px solid ${alpha(section.color, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateX(8px)',
                  boxShadow: `0px 8px 24px ${alpha(section.color, 0.25)}`,
                  borderColor: section.color
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    sx={{
                      bgcolor: alpha(section.color, 0.1),
                      color: section.color,
                      p: 1.5,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {section.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color={section.color}>
                      {section.title}
                    </Typography>
                    {section.content}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* Seção de Contato destacada */}
        <Paper
          elevation={4}
          sx={{
            mt: 6,
            p: 4,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(darkBlue, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            border: `2px solid ${alpha(darkBlue, 0.3)}`,
            textAlign: 'center'
          }}
        >
          <ContactMailIcon sx={{ fontSize: 50, color: darkBlue, mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom color={darkBlue}>
            10. Contato
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
            Dúvidas sobre como tratamos dados pessoais ou pedidos relacionados à privacidade devem ser encaminhados para:
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 3 }}>
            <Chip
              icon={<ContactMailIcon />}
              label="casadoamoremconquista@gmail.com"
              variant="outlined"
              color="primary"
              sx={{ 
                fontSize: '1rem', 
                py: 3, 
                px: 2,
                borderWidth: 2,
                fontWeight: 600
              }}
            />
            <Button
              component={RouterLink}
              to="/consentimentos-lgpd"
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SecurityIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                px: 4,
                boxShadow: theme.custom.shadows.md,
                '&:hover': {
                  boxShadow: theme.custom.shadows.lg
                }
              }}
            >
              Gerenciar Consentimentos
            </Button>
          </Stack>
        </Paper>

        {/* Última atualização */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Última atualização: Dezembro de 2025
          </Typography>
        </Box>

      </Container>
      <Footer />
    </Box>
  );
};

export default PrivacyPolicyPage;
