import { Box, Typography, Link, Grid } from '@mui/material';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 3,
                mt: 'auto', 
                backgroundColor: "#65ACD6",
                color: "#FFFFFF",
                borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                width: '100%',
                position: 'relative',
                zIndex: 1, 
            }}
        >
            <Grid 
                container 
                spacing={2} 
                justifyContent="space-between" 
                alignItems="center" 
                sx={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}
            >
               
                <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}>
                        SGCA — Casa do Amor
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                        © {new Date().getFullYear()} Sistema de Gerenciamento (v1.0.0)
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, opacity: 0.9 }}>
                        Desenvolvido por alunos de Ciência da Computação - UESB 
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 3, justifyContent: { xs: 'center', md: 'flex-end' } }}>
                        <Link 
                            href="#" 
                            color="inherit" 
                            underline="hover"
                            sx={{ 
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                '&:hover': { color: '#E3F2FD' },
                            }}
                        >
                            Sobre o Projeto
                        </Link>
                        <Link 
                            href="#" 
                            color="inherit" 
                            underline="hover"
                            sx={{ 
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                '&:hover': { color: '#E3F2FD' },
                            }}
                        >
                            Suporte Técnico
                        </Link>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Footer;