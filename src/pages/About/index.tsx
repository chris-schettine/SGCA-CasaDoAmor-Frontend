import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Button,
    Chip,
    Stack,
    Divider,
    Avatar,
    IconButton,
    Card,
    CardContent,
    useTheme,
    alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DescriptionIcon from '@mui/icons-material/Description';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupsIcon from '@mui/icons-material/Groups';
import Footer from '../../components/Footer';

// Função para gerar cores dinâmicas para Avatares 
const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
};

const developers = [
    { name: "Maísa Soares Dos Santos Lopes", role: "Orientadora", github: "#", linkedin: "https://www.linkedin.com/in/ma%C3%ADsa-soares-dos-santos-lopes-201192303/", photo: "maisa.png" },
    { name: "Christian Rocha", role: "Scrum Master", github: "https://github.com/chris-schettine", linkedin: "#", photo: "" },
    { name: "Cauê Rodrigue de Aguiar", role: "Frontend, Cloud e Testes", github: "https://github.com/CauAguiar", linkedin: "https://www.linkedin.com/in/cauaguiar/", photo: "caue.jpeg" },
    { name: "Edson Araujo", role: "Backend", github: "https://github.com/edsonaraujobr", linkedin: "https://www.linkedin.com/in/edsonaraujobr/", photo: "edson.jpeg" },
    { name: "João Henrique Silva Pinto", role: "Fullstack", github: "https://github.com/henriksson666", linkedin: "https://www.linkedin.com/in/joao-henrique-silva-pinto-0a539748/", photo: "" },
    { name: "Luís Eduardo", role: "Frontend", github: "https://github.com/Aleff0", linkedin: "#", photo: "" },
    { name: "Matheus Lopes", role: "Frontend", github: "https://github.com/teteulopes", linkedin: "#", photo: "matheus.jpeg" },
    { name: "Pedro Lucca", role: "Frontend", github: "https://github.com/pedroluccabr", linkedin: "#", photo: "" },
];

const AboutPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const darkBlue = theme.custom.brandColors.secondary[500];

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: theme.palette.background.default }}>

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
                            Sobre o Projeto
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ flexGrow: 1, py: 6 }}>

                <Grid container spacing={6}>

                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom color={darkBlue}>
                            Tecnologia a favor do acolhimento
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', color: theme.palette.text.primary, lineHeight: 1.8 }}>
                            O Sistema de Gerenciamento da Casa do Amor (SGCA) foi desenvolvido com um propósito claro:
                            otimizar a rotina administrativa da instituição para que o foco principal permaneça
                            onde realmente importa: <b>o cuidado com os pacientes.</b>
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: theme.palette.text.primary, lineHeight: 1.8 }}>
                            Este projeto é fruto do trabalho de alunos de Ciência da Computação
                            da Universidade Estadual do Sudoeste da Bahia - UESB, realizado durante o semestre 2025.2
                            na disciplina Desenvolvimento de Software, sob orientação da Profa. Dra Maísa Soares dos Santos Lopes.
                        </Typography>


                        <Paper
                            elevation={1}
                            sx={{
                                p: 3,
                                mt: 4,
                                bgcolor: alpha(theme.palette.background.paper, 0.9),
                                borderRadius: 3,
                                border: `1px solid ${theme.palette.divider}`,
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0px 8px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                                    borderColor: theme.palette.primary.main
                                }
                            }}
                        >
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="text.secondary" sx={{ letterSpacing: 1 }}>
                                TECNOLOGIAS UTILIZADAS
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                <Chip
                                    label="React"
                                    avatar={<Avatar src="/icons/react.svg" alt="React" sx={{ width: 28, height: 28 }} />}
                                    color="primary"
                                    variant="outlined"
                                    size="medium"
                                    role="presentation"
                                    sx={{ py: 0.5, px: 1.25, borderRadius: 3 }}
                                />
                                <Chip
                                    label="TypeScript"
                                    avatar={<Avatar src="/icons/typescript.svg" alt="TypeScript" sx={{ width: 28, height: 28 }} />}
                                    color="primary"
                                    variant="outlined"
                                    size="medium"
                                    role="presentation"
                                    sx={{ py: 0.5, px: 1.25, borderRadius: 3 }}
                                />
                                <Chip
                                    label="Java"
                                    avatar={<Avatar src="/icons/java.svg" alt="Java" sx={{ width: 28, height: 28 }} />}
                                    color="primary"
                                    variant="outlined"
                                    size="medium"
                                    role="presentation"
                                    sx={{ py: 0.5, px: 1.25, borderRadius: 3 }}
                                />
                                <Chip
                                    label="Spring Boot"
                                    avatar={<Avatar src="/icons/springboot.svg" alt="Spring Boot" sx={{ width: 28, height: 28 }} />}
                                    color="primary"
                                    variant="outlined"
                                    size="medium"
                                    role="presentation"
                                    sx={{ py: 0.5, px: 1.25, borderRadius: 3 }}
                                />
                                <Chip
                                    label="MySQL"
                                    avatar={<Avatar src="/icons/mysql.svg" alt="MySQL" sx={{ width: 28, height: 28 }} />}
                                    color="primary"
                                    variant="outlined"
                                    size="medium"
                                    role="presentation"
                                    sx={{ py: 0.5, px: 1.25, borderRadius: 3 }}
                                />
                                <Chip
                                    label="Docker"
                                    avatar={<Avatar src="/icons/docker.svg" alt="Docker" sx={{ width: 28, height: 28 }} />}
                                    color="primary"
                                    variant="outlined"
                                    size="medium"
                                    role="presentation"
                                    sx={{ py: 0.5, px: 1.25, borderRadius: 3 }}
                                />
                                <Chip
                                    label="Material UI"
                                    avatar={<Avatar src="/icons/mui.svg" alt="MUI" sx={{ width: 28, height: 28 }} />}
                                    color="primary"
                                    variant="outlined"
                                    size="medium"
                                    role="presentation"
                                    sx={{ py: 0.5, px: 1.25, borderRadius: 3 }}
                                />
                            </Stack>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={4} sx={{ p: 3, borderRadius: 4, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }}>
                            <Stack spacing={2}>
                                <Typography variant="h6" fontWeight="bold" color={darkBlue}>
                                    Documentação Técnica
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Acesso completo à arquitetura e requisitos para fins acadêmicos e de auditoria.
                                </Typography>

                                <Divider sx={{ my: 1 }} />

                                <Button
                                    variant="outlined"
                                    startIcon={<DescriptionIcon />}
                                    href="/requisitos.pdf"
                                    target="_blank"
                                    fullWidth
                                    color="primary"
                                    sx={{ textTransform: 'none', fontWeight: 'bold' }}
                                >
                                    Baixar PDF de Requisitos
                                </Button>

                                <Box sx={{ pt: 2 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                        REPOSITÓRIOS (CÓDIGO FONTE)
                                    </Typography>
                                </Box>

                                <Stack spacing={1}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<GitHubIcon />}
                                        href="https://github.com/chris-schettine/SGCA-CasaDoAmor-Frontend"
                                        target="_blank"
                                        fullWidth
                                        color="secondary"
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Frontend (React)
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={<GitHubIcon />}
                                        href="https://github.com/chris-schettine/SGCA-CasaDoAmor-Backend"
                                        target="_blank"
                                        fullWidth
                                        color="secondary"
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Backend (Java/Spring)
                                    </Button>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ my: 8, display: 'flex', alignItems: 'center' }}>
                    <Divider sx={{ flexGrow: 1 }} />
                    <Box sx={{ color: darkBlue, mx: 2, fontSize: '1.8rem' }}>
                        <GroupsIcon fontSize="inherit" aria-label="Seção de Equipe" />
                    </Box>
                    <Divider sx={{ flexGrow: 1 }} />
                </Box>

                <Box>
                    <Typography variant="h4" fontWeight="bold" align="center" color={darkBlue} gutterBottom>
                        Quem faz acontecer
                    </Typography>
                    <Typography variant="body1" align="center" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto', mb: 6 }}>
                        Equipe de discentes de Ciência da Computação responsável pela arquitetura,
                        design e implementação do SGCA.
                    </Typography>

                    <Grid container spacing={4} justifyContent="center">
                        {developers.map((dev, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                <Card sx={{
                                    height: '100%',
                                    textAlign: 'center',
                                    borderRadius: 3,
                                    boxShadow: theme.custom.shadows.md,
                                    border: '1px solid transparent',
                                    transition: '0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: theme.custom.shadows.xl,
                                        borderColor: theme.palette.primary.main
                                    }
                                }}>
                                    <CardContent sx={{ pt: 4 }}>
                                        <Avatar
                                            title={dev.name}
                                            src={dev.photo}
                                            alt={dev.name}
                                            sx={{
                                                width: 90,
                                                height: 90,
                                                mx: 'auto',
                                                mb: 2,

                                                bgcolor: dev.photo ? undefined : stringToColor(dev.name),
                                                color: dev.photo ? undefined : theme.palette.getContrastText(stringToColor(dev.name)),
                                                fontSize: '1.75rem'
                                            }}
                                        >
                                            {dev.name.charAt(0)}
                                        </Avatar>
                                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem' }}>
                                            {dev.name}
                                        </Typography>
                                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
                                            {dev.role}
                                        </Typography>

                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            {dev.github !== "#" && (
                                                <IconButton size="small" href={dev.github} target="_blank" color="primary" aria-label={`GitHub de ${dev.name}`}>
                                                    <GitHubIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            {dev.linkedin !== "#" && (
                                                <IconButton size="small" href={dev.linkedin} target="_blank" color="primary" aria-label={`LinkedIn de ${dev.name}`}>
                                                    <LinkedInIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                <Box sx={{ mt: 10, p: 4, bgcolor: alpha(theme.palette.primary.light, 0.2), borderRadius: 4, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color={darkBlue} gutterBottom>
                        Legado e Continuidade
                    </Typography>
                    <Typography variant="body2" color={theme.palette.text.primary} sx={{ maxWidth: '800px', mx: 'auto', fontStyle: 'italic' }}>
                        "O projeto do SGCA avança hoje graças às contribuições de muitas mãos.
                        Agradecemos especialmente à turma do semestre anterior (2024.2) pelo trabalho seminal que iniciou essa jornada.
                        Honramos esse legado inicial ao dar continuidade aos esforços em prol da Casa do Amor,
                        reforçando que cada etapa é vital para o todo."
                    </Typography>
                </Box>

            </Container>

            <Footer />
        </Box>
    );
};

export default AboutPage;