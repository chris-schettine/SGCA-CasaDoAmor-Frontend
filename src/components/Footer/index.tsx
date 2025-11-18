import React from 'react';
import { Box, Typography, Link, Grid, Stack, useTheme } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { ConsentManageLink } from '../../consent/components/ConsentManageLink/ConsentManageLink';
import { useDesignTokens } from '../../design-tokens/utils';

const FooterLink = ({ children, href, icon, external }: { children: React.ReactNode; href: string; icon?: React.ReactNode; external?: boolean }) => (
    <Link
        href={href}
        color="inherit"
        underline="none"
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        aria-label={external ? `${children} (abre em nova aba)` : undefined}
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            opacity: 0.7,
            fontSize: '0.9rem',
            marginBottom: 1,
            transition: 'opacity 0.2s, color 0.2s',
            '@media (prefers-reduced-motion: reduce)': {
                transition: 'none',
                '&:hover': {
                    transform: 'none',
                },
            },
            '&:hover': {
                opacity: 1,
                color: (theme) => theme.custom.brandColors.secondary[500],
            },
            '@media (min-width: 600px)': {
                '&:hover': {
                    transform: 'translateX(5px)',
                },
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
    const theme = useTheme();
    const tokens = useDesignTokens();

    return (
        <Box
            component="footer"
            role="contentinfo"
            aria-label="Rodapé do site"
            sx={{
                backgroundColor: theme.palette.mode === 'dark'
                  ? theme.palette.background.default
                  : tokens.brandColors.dark[500], 
                color: theme.palette.mode === 'dark'
                  ? theme.palette.text.primary
                  : "#FFFFFF",
                py: { xs: 4, md: 6 }, 
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
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start', 
                        textAlign: 'left' 
                    }}>
                        <Box 
                            component="img"
                            src="/casadoamor.png" 
                            alt="Logo Casa do Amor"
                            sx={{ 
                                height: { xs: 50, md: 60 }, 
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
                        
                        <Typography variant="body2" sx={{ opacity: 0.5, maxWidth: '300px', mb: 3 }}>
                            Sistema de Gerenciamento para apoio e acolhimento de pacientes em tratamento.
                        </Typography>

                        <Typography variant="caption" sx={{ opacity: 0.4 }}>
                            © {currentYear} — Todos os direitos reservados.
                        </Typography>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>
                    <Grid 
                        container 
                        spacing={4} 
                        justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                    >
                        
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Stack alignItems="flex-start">
                                <FooterTitle>SGCA</FooterTitle>
                                <FooterLink href="/about">Documentação</FooterLink>
                                <FooterLink href="/patients">Home</FooterLink>
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Stack alignItems="flex-start">
                                <FooterTitle>Privacidade</FooterTitle>
                                <Box 
                                    sx={{ 
                                        mb: 1,
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        width: '100%',
                                        '& > *': {
                                            opacity: 0.7,
                                            fontSize: '0.9rem',
                                            transition: '0.2s',
                                            '&:hover': {
                                                opacity: 1,
                                                color: (theme) => theme.custom.brandColors.secondary[500],
                                            }
                                        }
                                    }}
                                >
                                    <ConsentManageLink
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'flex-start',
                                            width: '100%',
                                            textAlign: 'left',
                                            color: 'inherit',
                                            opacity: 0.7,
                                            fontSize: '0.9rem',
                                            marginBottom: 1,
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    />
                                </Box>
                                <FooterLink href="/privacy-policy">Política de Privacidade</FooterLink>
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Stack alignItems="flex-start">
                                <FooterTitle>Contato</FooterTitle>
                                <FooterLink href="https://instagram.com" icon={<InstagramIcon fontSize="small" />} external>
                                    Instagram
                                </FooterLink>
                                <FooterLink href="mailto:202210325@uesb.edu.br" icon={<EmailIcon fontSize="small" />}>
                                    Email
                                </FooterLink>
                                <FooterLink href="https://wa.me/5577998627311" icon={<WhatsAppIcon fontSize="small" />} external>
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