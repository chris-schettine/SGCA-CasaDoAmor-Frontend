import React from 'react';
import { Box, Typography, Link, Grid, Stack } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';


const FooterLink = ({ children, href, icon }: { children: React.ReactNode; href: string; icon?: React.ReactNode }) => (
    <Link
        href={href}
        color="inherit"
        underline="none"
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            opacity: 0.7,
            fontSize: '0.9rem',
            marginBottom: 1,
            transition: '0.2s',
            '&:hover': {
                opacity: 1,
                color: '#65ACD6', 
                transform: 'translateX(5px)', 
            },
        }}
    >
        {icon}
        {children}
    </Link>
);


const FooterTitle = ({ children }: { children: React.ReactNode }) => (
    <Typography
        variant="subtitle1"
        sx={{
            fontWeight: 'bold',
            mb: 2,
            color: '#FFFFFF',
        }}
    >
        {children}
    </Typography>
);

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                
                backgroundColor: "#0D2E4D", 
                color: "#FFFFFF",
                py: 6, 
                px: 3,
                mt: 'auto',
                width: '100%',
                zIndex: 1,
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}
        >
            <Grid 
                container 
                spacing={4} 
                sx={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}
            >
               
                <Grid size={{ xs: 12, md: 5 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' } }}>
                        <Box 
                            component="img"
                            src="/casadoamor.png" 
                            alt="Logo Casa do Amor"
                            sx={{ 
                                height: 60, 
                                width: 'auto', 
                                mb: 2,
                                filter: 'brightness(0) invert(1)' 
                            }}
                        />
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontWeight: 'bold', 
                                color: '#FFFFFF', 
                                mb: 1 
                            }}
                        >
                            SGCA — Casa do Amor
                        </Typography>
                        
                        <Typography variant="body2" sx={{ opacity: 0.5, maxWidth: '300px', textAlign: { xs: 'center', md: 'left' }, mb: 3 }}>
                            Sistema de Gerenciamento para apoio e acolhimento de pacientes em tratamento.
                        </Typography>

                        <Typography variant="caption" sx={{ opacity: 0.4 }}>
                            © {currentYear} — Todos os direitos reservados.
                        </Typography>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>
                    <Grid container spacing={4} justifyContent={{ xs: 'center', md: 'flex-end' }}>
                        
                   
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Stack alignItems={{ xs: 'center', md: 'flex-start' }}>
                                <FooterTitle>SGCA</FooterTitle>
                                <FooterLink href="#">Documentação</FooterLink>
                                <FooterLink href="/patients">Home</FooterLink>
                                <FooterLink href="#">Landing Page (Em breve)</FooterLink>
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Stack alignItems={{ xs: 'center', md: 'flex-start' }}>
                                <FooterTitle>Contato</FooterTitle>
                                <FooterLink href="https://instagram.com" icon={<InstagramIcon fontSize="small" />}>
                                    Instagram
                                </FooterLink>
                                <FooterLink href="202210325@uesb.edu.br" icon={<EmailIcon fontSize="small" />}>
                                    Email
                                </FooterLink>
                                <FooterLink href="https://wa.me/5577998627311" icon={<WhatsAppIcon fontSize="small" />}>
                                    WhatsApp
                                </FooterLink>
                            </Stack>
                        </Grid>

                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Footer;