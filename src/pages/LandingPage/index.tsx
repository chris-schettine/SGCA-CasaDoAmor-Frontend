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
    useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupsIcon from '@mui/icons-material/Groups';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LoginIcon from '@mui/icons-material/Login';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';

import Footer from '../../components/Footer';
import PartnerSection from '../../components/Partners';
import { toastSuccess } from '../../utils/toast';

const LandingPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const pixKey = "10241191000137";
    const pixBank = "Caixa Econômica Federal";

    const handleCopyPix = () => {
        navigator.clipboard.writeText(pixKey);
        toastSuccess("Chave Pix copiada para a área de transferência!");
    };

    const primaryBlue = theme.palette.primary.main;

    const heroStart = theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main;
    const heroMid = theme.palette.mode === 'dark' ? theme.palette.secondary.dark : theme.palette.secondary.main;
    const heroEnd = theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.default, 0.9)
        : alpha(theme.palette.secondary.light, 0.9);

    const logoSrc = theme.palette.mode === 'dark' ? '/logo3branco.png' : '/logo3.png';

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

            <Box component="nav" sx={{ bgcolor: theme.palette.background.paper, color: theme.palette.text.primary, boxShadow: 1, py: 1.5, position: 'sticky', top: 0, zIndex: 1100 }}>
                <Container maxWidth="lg">
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" gap={2}>
                            <Box
                                component="img"
                                src={logoSrc}
                                alt="Logo SGCA"
                                sx={{ height: 50, width: 'auto' }}
                            />
                            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
                                SGCA
                            </Typography>
                        </Stack>

                        <Button
                            variant="contained"
                            startIcon={<LoginIcon />}
                            onClick={() => navigate('/login')}
                            aria-label="Acessar área restrita do sistema"
                            sx={{
                                fontWeight: 600,
                                bgcolor: primaryBlue,
                                color: '#fff',
                                '&:hover': {
                                    bgcolor: theme.palette.primary.dark
                                },
                                boxShadow: `0 2px 8px ${alpha(primaryBlue, 0.3)}`
                            }}
                        >
                            Acessar Sistema
                        </Button>
                    </Stack>
                </Container>
            </Box>

            <Box sx={{
                background: `linear-gradient(135deg, ${heroStart} 0%, ${heroMid} 45%, ${heroEnd} 100%)`,
                color: theme.palette.getContrastText(heroStart),
                pt: { xs: 6, md: 10 },
                pb: { xs: 10, md: 16 },
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
                            color: theme.palette.common.white,
                            WebkitTextFillColor: theme.palette.common.white,
                        }}
                    >
                        Sistema de Gerenciamento da <Box component="span" sx={{ color: theme.palette.common.white, WebkitTextFillColor: theme.palette.common.white }}>Casa do Amor.</Box>
                    </Typography>

                    <Typography
                        component="h2"
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            mb: 1,
                            fontSize: { xs: '1.1rem', md: '1.5rem' },
                            lineHeight: 1.2,
                            color: theme.palette.common.white,
                            WebkitTextFillColor: theme.palette.common.white,
                        }}
                    >
                        Gestão humana para quem acolhe com amor.
                    </Typography>

                    <Typography variant="h6" sx={{
                        mb: 4,
                        fontWeight: 400,
                        color: theme.palette.common.white,
                        WebkitTextFillColor: theme.palette.common.white,
                        mx: 'auto',
                        maxWidth: '700px',
                        fontSize: '1.25rem'
                    }}>
                        Simplificando a administração para focar no que realmente importa: o bem‑estar dos pacientes em tratamento de câncer na Casa do Amor.
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/login')}
                            sx={{
                                bgcolor: theme.palette.mode === 'dark' ? '#fff' : primaryBlue,
                                color: theme.palette.mode === 'dark' ? primaryBlue : '#fff',
                                '&:hover': {
                                    bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.9) : theme.palette.primary.dark
                                },
                                fontWeight: 'bold',
                                px: 5,
                                py: 1.5,
                                fontSize: '1.1rem',
                                boxShadow: theme.palette.mode === 'dark'
                                    ? `0 4px 14px 0 ${alpha('#fff', 0.4)}`
                                    : `0 4px 14px 0 ${alpha(primaryBlue, 0.5)}`
                            }}
                        >
                            Acessar Sistema
                        </Button>

                        <Button
                            variant="outlined"
                            size="large"
                            sx={{
                                color: theme.palette.getContrastText(heroStart),
                                borderColor: alpha(theme.palette.getContrastText(heroStart), 0.5),
                                '&:hover': { borderColor: theme.palette.getContrastText(heroStart), bgcolor: alpha(theme.palette.getContrastText(heroStart), 0.08) },
                                px: 4
                            }}
                            onClick={() => navigate('/about')}
                        >
                            Sobre o Projeto
                        </Button>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 8, mt: 0, position: 'relative', zIndex: 2 }}>
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
                                <Box sx={{ mb: 2, p: 1.5, bgcolor: alpha(primaryBlue, 0.12), borderRadius: '50%', color: primaryBlue }} role="img" aria-label={`Ícone de ${feature.title}`}>
                                    {feature.icon}
                                </Box>
                                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
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

            <Container maxWidth="lg" sx={{ pb: 8, pt: 0 }}>
                <Card sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    overflow: 'visible',
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0 20px 40px rgba(0,0,0,0.4)'
                        : '0 20px 40px rgba(0,0,0,0.08)',
                    minHeight: { xs: 'auto', md: 200 }
                }}>

                    {/* Logo Casa do Amor - Left Side */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: { xs: 3, md: 4 },
                        borderRight: { md: `1px solid ${alpha(theme.palette.divider, 0.1)}` },
                        borderBottom: { xs: `1px solid ${alpha(theme.palette.divider, 0.1)}`, md: 'none' },
                        minWidth: { md: 220 }
                    }}>
                        <Box
                            component="img"
                            src={theme.palette.mode === 'dark' ? '/logo3branco.png' : '/casadoamor.png'}
                            alt="Logo Casa do Amor"
                            sx={{
                                maxWidth: { xs: 200, md: 240 },
                                height: 'auto'
                            }}
                        />
                    </Box>

                    {/* Main Content - Center */}
                    <Box sx={{ p: { xs: 3, md: 4 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                            <Box sx={{
                                p: 1,
                                borderRadius: '50%',
                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                color: 'secondary.main',
                                display: 'flex'
                            }}>
                                <VolunteerActivismIcon fontSize="medium" />
                            </Box>
                            <Typography variant="h5" fontWeight={800} color="text.primary" letterSpacing={-0.5}>
                                Ajude a manter a Casa do Amor
                            </Typography>
                        </Stack>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.95rem' }}>
                            A Casa do Amor depende de doações para garantir dignidade, conforto e cuidados essenciais aos pacientes em tratamento de câncer.
                            Sua contribuição via Pix ajuda a custear medicação, hospedagem, transporte e suporte emocional — fazendo diferença na jornada de quem enfrenta o câncer.
                        </Typography>
                    </Box>

                    {/* Pix Info and Institution - Right Side */}
                    <Box sx={{
                        background: theme.palette.mode === 'dark'
                            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.3)} 100%)`
                            : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${alpha(theme.palette.background.paper, 0.5)} 100%)`,
                        p: { xs: 3, md: 4 },
                        minWidth: { md: 320 },
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderLeft: { md: `1px solid ${alpha(theme.palette.divider, 0.05)}` },
                        borderTop: { xs: `1px solid ${alpha(theme.palette.divider, 0.05)}`, md: 'none' }
                    }}>
                        
                        {/* Pix Icon and Label */}
                        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                            <Box
                                component="img"
                                src="/icons/pix.svg"
                                alt="Pix"
                                sx={{ width: 28, height: 28 }}
                            />
                            <Typography variant="caption" color="primary" fontWeight="bold" sx={{ letterSpacing: 1.2 }}>
                                CHAVE PIX (CNPJ)
                            </Typography>
                        </Stack>

                        {/* Pix Key */}
                        <Box sx={{
                            py: 1.5,
                            px: 2.5,
                            bgcolor: theme.palette.background.paper,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            borderRadius: 2,
                            mb: 2,
                            textAlign: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                        }}>
                            <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.primary', letterSpacing: 0.5, fontSize: '1rem' }}>
                                {pixKey}
                            </Typography>
                        </Box>

                        {/* Copy Button */}
                        <Button
                            variant="contained"
                            size="medium"
                            startIcon={<ContentCopyIcon />}
                            onClick={handleCopyPix}
                            fullWidth
                            sx={{
                                bgcolor: theme.palette.primary.main,
                                color: '#fff',
                                fontWeight: 'bold',
                                borderRadius: 2,
                                py: 1.2,
                                fontSize: '0.95rem',
                                boxShadow: `0 4px 12px -2px ${alpha(theme.palette.primary.main, 0.5)}`,
                                transition: 'all 0.3s ease',
                                mb: 2,
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 6px 16px -2px ${alpha(theme.palette.primary.main, 0.6)}`,
                                    bgcolor: theme.palette.primary.dark
                                }
                            }}
                        >
                            Copiar Chave Pix
                        </Button>

                        {/* Institution Info */}
                        <Box sx={{ 
                            pt: 2, 
                            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            textAlign: 'center',
                            width: '100%'
                        }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1, opacity: 0.7, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                                Instituição
                            </Typography>
                            <Typography variant="body2" color="text.primary" fontWeight={600} sx={{ mb: 0.3 }}>
                                Associação Casa do Amor
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {pixBank}
                            </Typography>
                        </Box>
                    </Box>
                </Card>
            </Container>

            <PartnerSection />
            <Footer />
        </Box>
    );
};

export default LandingPage;