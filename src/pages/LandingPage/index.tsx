import { 
    Box, 
    Button, 
    Container, 
    Typography, 
    Grid, 
    Card, 
    CardContent, 
    Stack,
    alpha,
    useTheme
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
    const theme = useTheme(); 

    const primaryBlue = theme.palette.secondary.main;
    // Use a branded blue for the landing page header and text
    const darkBlue = theme.custom.brandColors.secondary[500];

    // Darker gradient colors for the landing background
    const bgStartColor = theme.custom.brandColors.secondary[700];
    const bgEndColor = theme.custom.brandColors.dark[600];

   
    const features = [
        {
            title: "Cadastro Ágil",
            description: "Reduza o tempo de admissão em 50% com histórico centralizado.",
            icon: <FavoriteIcon fontSize="large" />
        },
        {
            title: "Dados Blindados",
            description: "Criptografia de ponta e conformidade total com a LGPD garantida.",
            icon: <SecurityIcon fontSize="large" />
        },
        {
            title: "Voluntários e Equipe",
            description: "Equipes otimizadas. Controle total de escalas e especialidades.",
            icon: <GroupsIcon fontSize="large" />
        },
        {
            title: "Agenda Inteligente",
            description: "Zero choques de horário e controle integrado de consultas.",
            icon: <EventNoteIcon fontSize="large" />
        }
    ];

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: theme.palette.background.default }}>

            <Box component="nav" sx={{ bgcolor: theme.palette.background.paper, boxShadow: 1, py: 1.5, position: 'sticky', top: 0, zIndex: 1100 }}> 
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
                            variant="text" 
                            startIcon={<LoginIcon />}
                            onClick={() => navigate('/login')}
                            aria-label="Acessar área restrita do sistema"
                            sx={{ 
                                fontWeight: 600,
                                color: darkBlue, 
                                '&:hover': { bgcolor: alpha(primaryBlue, 0.08) } 
                            }}
                        >
                            Acessar Sistema
                        </Button>
                    </Stack>
                </Container>
            </Box>

         
                <Box sx={{ 
                background: `linear-gradient(135deg, ${bgStartColor} 0%, ${alpha(bgEndColor, 0.95)} 100%)`, 
                color: theme.palette.common.white, 
                pt: { xs: 6, md: 10 }, 
                pb: { xs: 8, md: 12 },
                px: 3, 
                textAlign: 'center', 
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Container maxWidth="md">
                    
                    <Typography 
                        component="h1" 
                        variant="h2" 
                        sx={{ 
                            fontWeight: 800, 
                            mt: 1,
                            mb: 2, 
                            fontSize: { xs: '2.2rem', md: '3.5rem' },
                            lineHeight: 1.2,
                            color: theme.palette.common.white
                        }}
                    >
                        Sistema de Gerenciamento da <Box component="span" sx={{ color: primaryBlue }}>Casa do Amor.</Box>
                    </Typography>

                   
                    <Typography 
                        component="h2" 
                        variant="h5"  
                        sx={{ 
                            fontWeight: 600, 
                            mb: 1, 
                            fontSize: { xs: '1.1rem', md: '1.5rem' }, 
                            lineHeight: 1.2,
                            color: theme.palette.common.white
                        }}
                    >
                        Gestão humana para quem acolhe com amor.
                    </Typography>
                    
                 
                    <Typography variant="h6" sx={{ 
                        mb: 4, 
                        fontWeight: 400, 
                            color: theme.custom.neutralColors[300],
                        mx: 'auto', 
                        maxWidth: '700px',
                        fontSize: '1.25rem'
                    }}>
                        Simplificando a administração para focar no que realmente importa: o bem-estar dos pacientes na Casa do Amor.
                    </Typography>
                    
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                        <Button 
                            variant="contained" 
                            size="large"
                            onClick={() => navigate('/login')}
                            aria-label="Acessar o sistema agora"
                            sx={{ 
                                bgcolor: primaryBlue, 
                                '&:hover': { bgcolor: theme.palette.secondary.dark },
                                fontWeight: 'bold',
                                px: 5,
                                py: 1.5,
                                fontSize: '1.1rem',
                                boxShadow: `0 4px 14px 0 ${alpha(theme.palette.secondary.main, 0.5)}`
                            }}
                        >
                            Acessar Sistema
                        </Button>
                        
                        <Button 
                            variant="outlined" 
                            size="large"
                            aria-label="Saber mais sobre o projeto"
                            sx={{ 
                                color: theme.palette.common.white, 
                                borderColor: alpha(theme.palette.common.white, 0.5),
                                '&:hover': { borderColor: theme.palette.common.white, bgcolor: alpha(theme.palette.common.white, 0.08) },
                                px: 4
                            }}
                            onClick={() => navigate('/about')} 
                        >
                            Sobre o Projeto
                        </Button>
                    </Stack>
                </Container>
            </Box>

           
            <Container maxWidth="lg" sx={{ py: 6, flexGrow: 1, mt: -4, position: 'relative', zIndex: 2 }}>
                <Grid container spacing={3}> 
                    {features.map((feature, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                            <Card 
                                component="article" 
                                sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    textAlign: 'center',
                                    p: 3, 
                                    borderRadius: 3,
                                    boxShadow: theme.custom.shadows.xl,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, 
                                    transition: 'all 0.3s ease-in-out',
                                    '&:hover': { 
                                        transform: 'translateY(-8px)', 
                                        boxShadow: theme.custom.shadows['xl'] || '0px 15px 35px rgba(0, 0, 0, 0.2)', 
                                        borderColor: alpha(primaryBlue, 0.5) 
                                    }
                                }}
                            >
                                <Box sx={{ mb: 2, p: 1.5, bgcolor: theme.custom.brandColors.secondary[50], borderRadius: '50%', color: primaryBlue }} role="img" aria-label={`Ícone de ${feature.title}`}>
                                    {feature.icon}
                                </Box>
                                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, color: darkBlue }}>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
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