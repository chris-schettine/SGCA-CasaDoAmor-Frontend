import { Box, Container, Typography, Grid, Paper, Button, Chip, Stack, Divider } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import Footer from '../../components/Footer';

const AboutPage = () => {
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8F9FA' }}>
            
            <Box sx={{ bgcolor: '#fff', py: 3, boxShadow: 1 }}>
                <Container maxWidth="lg">
                    <Typography variant="h5" color="primary" fontWeight="bold">
                        SGCA — Sobre o Projeto
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ flexGrow: 1, py: 6 }}>
                <Grid container spacing={4}>
                    
                   
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom color="#0D2E4D">
                            Tecnologia a favor do acolhimento
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', color: '#444' }}>
                            O Sistema de Gerenciamento da Casa do Amor (SGCA) foi desenvolvido com um propósito claro: 
                            otimizar a rotina administrativa da instituição para que o foco principal permaneça 
                            onde realmente importa: 
                            o cuidado com os pacientes.
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ color: '#444' }}>
                            Este projeto é fruto do trabalho de alunos de Ciência da Computação 
                            da Universidade Estadual do Sudoeste da Bahia - UESB, realizado durante o semestre 2025.2
                            na disciplina Desenvolvimento de Software 
                            e orientados pela prof. Dra Maísa Soares dos Santos Lopes, unindo rigor técnico 
                            com responsabilidade social. O sistema centraliza prontuários, gerencia voluntários 
                            e garante 
                            a segurança dos dados sensíveis em total conformidade com a LGPD.
                        </Typography>

                        <Box sx={{ mt: 4 }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Tecnologias Utilizadas
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
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, bgcolor: '#fff' }}>
                            <Stack spacing={2}>
                                <Typography variant="h6" fontWeight="bold" color="#0D2E4D">
                                    Documentação Técnica
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Para desenvolvedores, professores e auditores, disponibilizamos a documentação completa e os repositórios de código.
                                </Typography>
                                
                                <Divider />

                                <Button 
                                    variant="contained" 
                                    startIcon={<DescriptionIcon />}
                                    href="/requisitos.pdf" 
                                    target="_blank" 
                                    fullWidth
                                    sx={{ bgcolor: '#0D2E4D', mb: 1 }}
                                >
                                    Baixar PDF de Requisitos
                                </Button>

                                <Divider>
                                    <Typography variant="caption" color="text.secondary">
                                        CÓDIGO FONTE
                                    </Typography>
                                </Divider>

                               
                                <Button 
                                    variant="outlined" 
                                    startIcon={<CodeIcon />}
                                    
                                    href="https://github.com/chris-schettine/SGCA-CasaDoAmor-Frontend" 
                                    target="_blank"
                                    fullWidth
                                >
                                    Repositório Frontend
                                </Button>

                               
                                <Button 
                                    variant="outlined" 
                                    startIcon={<CodeIcon />} 
                                    href="https://github.com/chris-schettine/SGCA-CasaDoAmor-Backend" 
                                    target="_blank"
                                    fullWidth
                                >
                                    Repositório Backend
                                </Button>

                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            <Footer />
        </Box>
    );
};

export default AboutPage;