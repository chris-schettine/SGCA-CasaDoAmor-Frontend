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
    CardContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; 
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import Footer from '../../components/Footer';

const developers = [
    { name: "Christian Rocha", role: "Scrum Master", github: "https://github.com/chris-schettine", linkedin: "#", photo: "" },
    { name: "Cauê Rodrigues", role: "Testes", github: "https://github.com/CauAguiar", linkedin: "#", photo: "caue.jpeg" },
    { name: "Edson Araujo", role: "Backend", github: "https://github.com/edsonaraujobr", linkedin: "#", photo: "" },
    { name: "João Henrique", role: "Backend", github: "https://github.com/henriksson666", linkedin: "#", photo: "" },
    { name: "Luís Eduardo", role: "Frontend", github: "https://github.com/Aleff0", linkedin: "#", photo: "" },
    { name: "Matheus Lopes", role: "Frontend", github: "https://github.com/teteulopes", linkedin: "#", photo: "matheus.jpeg" },
    { name: "Pedro Lucca", role: "Frontend", github: "https://github.com/pedroluccabr", linkedin: "#", photo: "" },
];

const AboutPage = () => {
    const navigate = useNavigate(); 

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8F9FA' }}>
            
            <Box sx={{ bgcolor: '#fff', py: 2, boxShadow: 1 }}>
                <Container maxWidth="lg">
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <IconButton 
                            onClick={() => navigate('/')} 
                            aria-label="voltar para o início"
                            sx={{ color: '#0D2E4D' }}
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

                        <Typography variant="h6" color="primary" fontWeight="bold">
                            Sobre o Projeto
                        </Typography>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ flexGrow: 1, py: 6 }}>
                
                <Grid container spacing={6}>
                    
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom color="#0D2E4D">
                            Tecnologia a favor do acolhimento
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', color: '#444', lineHeight: 1.8 }}>
                            O Sistema de Gerenciamento da Casa do Amor (SGCA) foi desenvolvido com um propósito claro: 
                            otimizar a rotina administrativa da instituição para que o foco principal permaneça 
                            onde realmente importa: <b>o cuidado com os pacientes.</b>
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: '#444', lineHeight: 1.8 }}>
                            Este projeto é fruto do trabalho de alunos de Ciência da Computação 
                            da Universidade Estadual do Sudoeste da Bahia - UESB, realizado durante o semestre 2025.2
                            na disciplina Desenvolvimento de Software, sob orientação da prof. Dra Maísa Soares dos Santos Lopes.
                        </Typography>

                        <Box sx={{ mt: 4 }}>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="text.secondary" sx={{ letterSpacing: 1 }}>
                                TECNOLOGIAS UTILIZADAS
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                <Chip label="React + TypeScript" icon={<CodeIcon />} color="primary" variant="outlined" />
                                <Chip label="Java Spring Boot" icon={<CodeIcon />} color="primary" variant="outlined" />
                                <Chip label="MySQL" icon={<CodeIcon />} color="primary" variant="outlined" />
                                <Chip label="Docker" icon={<CodeIcon />} color="primary" variant="outlined" />
                                <Chip label="Material UI" icon={<CodeIcon />} color="primary" variant="outlined" />
                            </Stack>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
                            <Stack spacing={2}>
                                <Typography variant="h6" fontWeight="bold" color="#0D2E4D">
                                    Documentação Técnica
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Acesso completo à arquitetura e requisitos para fins acadêmicos e de auditoria.
                                </Typography>
                                
                                <Divider sx={{ my: 1 }} />

                                <Button 
                                    variant="contained" 
                                    startIcon={<DescriptionIcon />}
                                    href="/requisitos.pdf" 
                                    target="_blank" 
                                    fullWidth
                                    sx={{ bgcolor: '#0D2E4D', textTransform: 'none', fontWeight: 'bold' }}
                                >
                                    Baixar PDF de Requisitos
                                </Button>

                                <Box sx={{ pt: 2 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                        REPOSITÓRIOS (CÓDIGO FONTE)
                                    </Typography>
                                </Box>

                                <Button 
                                    variant="outlined" 
                                    startIcon={<CodeIcon />}
                                    href="https://github.com/seu-usuario/seu-repo-frontend" 
                                    target="_blank"
                                    fullWidth
                                    sx={{ textTransform: 'none' }}
                                >
                                    Frontend (React)
                                </Button>

                                <Button 
                                    variant="outlined" 
                                    startIcon={<CodeIcon />} 
                                    href="https://github.com/seu-usuario/seu-repo-backend" 
                                    target="_blank"
                                    fullWidth
                                    sx={{ textTransform: 'none' }}
                                >
                                    Backend (Java/Spring)
                                </Button>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 8 }} />

                <Box>
                    <Typography variant="h4" fontWeight="bold" align="center" color="#0D2E4D" gutterBottom>
                        Quem faz acontecer
                    </Typography>
                    <Typography variant="body1" align="center" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto', mb: 6 }}>
                        Equipe de discentes de Ciência da Computação responsável pela arquitetura, 
                        design e implementação do SGCA.
                    </Typography>

                    <Grid container spacing={3} justifyContent="center">
                        {developers.map((dev, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                                <Card sx={{ 
                                    height: '100%', 
                                    textAlign: 'center', 
                                    borderRadius: 3,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    transition: '0.3s',
                                    '&:hover': { transform: 'translateY(-5px)' }
                                }}>
                                    <CardContent sx={{ pt: 4 }}>
                                        <Avatar 
                                            src={dev.photo} 
                                            alt={dev.name}
                                            sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: '#E3F2FD', color: '#1565C0', fontSize: '1.5rem' }}
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
                                                <IconButton size="small" href={dev.github} target="_blank" color="primary">
                                                    <GitHubIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                            {dev.linkedin !== "#" && (
                                                <IconButton size="small" href={dev.linkedin} target="_blank" color="primary">
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

                <Box sx={{ mt: 10, p: 4, bgcolor: '#E3F2FD', borderRadius: 4, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="#0D2E4D" gutterBottom>
                        Legado e Continuidade
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', fontStyle: 'italic' }}>
                        "Agradecemos imensamente à turma do semestre anterior que iniciou os estudos e a base conceitual deste projeto. 
                        O desenvolvimento de software é uma construção coletiva e contínua, e o SGCA é resultado dessa união de esforços 
                        em prol da Casa do Amor."
                    </Typography>
                </Box>

            </Container>

            <Footer />
        </Box>
    );
};

export default AboutPage;