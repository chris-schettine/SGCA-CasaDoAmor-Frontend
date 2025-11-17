import { 
    Box, 
    Button, 
    Container, 
    Typography, 
    Grid, 
    Card, 
    CardContent, 
    Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupsIcon from '@mui/icons-material/Groups';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LoginIcon from '@mui/icons-material/Login';
import Footer from '../../components/Footer'; 

const LandingPage = () => {
    const navigate = useNavigate();

    const primaryBlue = "#65ACD6";
    const darkBlue = "#0D2E4D";

    const features = [
        {
            title: "Gestão de Assistidos",
            description: "Cadastro detalhado de pacientes e acompanhantes, com histórico médico, social e hospedagem centralizados.",
            icon: <FavoriteIcon fontSize="large" sx={{ color: primaryBlue }} />
        },
        {
            title: "Segurança & LGPD",
            description: "Conformidade total com a Lei Geral de Proteção de Dados. Criptografia de ponta e controle de acesso rigoroso.",
            icon: <SecurityIcon fontSize="large" sx={{ color: primaryBlue }} />
        },
        {
            title: "Voluntários e Equipe",
            description: "Organização completa do quadro de funcionários e voluntários, incluindo especialidades e disponibilidade.",
            icon: <GroupsIcon fontSize="large" sx={{ color: primaryBlue }} />
        },
        {
            title: "Agenda e Atividades",
            description: "Controle de consultas médicas, terapias e atividades em grupo para garantir o melhor atendimento.",
            icon: <EventNoteIcon fontSize="large" sx={{ color: primaryBlue }} />
        }
    ];

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8F9FA' }}>
            
           
            <Box sx={{ bgcolor: '#fff', boxShadow: 1, py: 1.5 }}> 
                <Container maxWidth="lg">
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" gap={2}>
                           
                            <Box 
                                component="img" 
                                src="/logo3.png" 
                                alt="Logo SGCA"
                                sx={{ height: 50, width: 'auto' }} 
                            />
                          
                            <Typography variant="h6" sx={{ color: darkBlue, fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
                                SGCA
                            </Typography>
                        </Stack>
                        <Button 
                            variant="contained" 
                            startIcon={<LoginIcon />}
                            onClick={() => navigate('/login')}
                            sx={{ 
                                bgcolor: primaryBlue, 
                                '&:hover': { bgcolor: '#5697c1' },
                                textTransform: 'none',
                                fontWeight: 'bold',
                                borderRadius: 2
                            }}
                        >
                            Acessar Sistema
                        </Button>
                    </Stack>
                </Container>
            </Box>

         
            <Box sx={{ 
              
                background: `linear-gradient(135deg, ${darkBlue} 0%, #164E78 100%)`, 
                color: '#fff', 
                py: { xs: 6, md: 10 }, 
                textAlign: 'center', 
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Container maxWidth="md">
                    
                    <Typography variant="overline" sx={{ color: '#90CAF9', fontWeight: 'bold', letterSpacing: 2 }}>
                        SISTEMA DE GERENCIAMENTO
                    </Typography>
                    
                    <Typography variant="h2" sx={{ 
                        fontWeight: 800, 
                        mt: 1,
                        mb: 2, 
                        fontSize: { xs: '2.2rem', md: '3.5rem' },
                        lineHeight: 1.2,
                        color: '#FFFFFF'
                    }}>
                        Cuidando de quem <Box component="span" sx={{ color: primaryBlue }}>Cuida.</Box>
                    </Typography>
                    
                    <Typography variant="h6" sx={{ 
                        mb: 4, 
                        fontWeight: 400, 
                        color: '#E0E0E0',
                        mx: 'auto', 
                        maxWidth: '600px'
                    }}>
                        A plataforma oficial da Casa do Amor para otimizar operações, garantir a segurança dos dados e focar no acolhimento aos pacientes.
                    </Typography>
                    
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                        <Button 
                            variant="contained" 
                            size="large"
                            onClick={() => navigate('/login')}
                            sx={{ 
                                bgcolor: primaryBlue, 
                                '&:hover': { bgcolor: '#5697c1' },
                                fontWeight: 'bold',
                                px: 5,
                                py: 1.5,
                                fontSize: '1.1rem'
                            }}
                        >
                            Entrar no Sistema
                        </Button>
                        
                        <Button 
                            variant="outlined" 
                            size="large"
                            sx={{ 
                                color: '#fff', 
                                borderColor: 'rgba(255,255,255,0.5)',
                                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
                                px: 4
                            }}
                            onClick={() => navigate('/about')} 
                        >
                            Sobre o Projeto
                        </Button>
                    </Stack>
                </Container>
            </Box>

           
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, flexGrow: 1 }}>
                <Grid container spacing={3}> 
                    {features.map((feature, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                            <Card sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                textAlign: 'center',
                                p: 2,
                                borderRadius: 3,
                                boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
                                '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.3s' }
                            }}>
                                <Box sx={{ mb: 2, p: 1.5, bgcolor: '#E3F2FD', borderRadius: '50%', color: primaryBlue }}>
                                    {feature.icon}
                                </Box>
                                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: darkBlue }}>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            <Footer />
        </Box>
    );
};

export default LandingPage;