import React from 'react';
import { Box, Typography, Link, Grid, Stack, useTheme, alpha } from '@mui/material';
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
            fontSize: '0.85rem', // Leve redução na fonte
            marginBottom: 0.5,    // Reduzi margem entre links
            transition: 'opacity 0.2s, color 0.2s',
            '@media (prefers-reduced-motion: reduce)': {
                transition: 'none',
                '&:hover': { transform: 'none' },
            },
            '&:hover': {
                opacity: 1,
                color: (theme) => theme.custom.brandColors.secondary[500],
            },
            '@media (min-width: 600px)': {
                '&:hover': { transform: 'translateX(3px)' }, // Movimento mais sutil
            },
        }}
    >
        {icon}
        {children}
    </Link>
);

const FooterTitle = ({ children }: { children: React.ReactNode }) => (
    <Typography
        variant="subtitle2" // Mudei de subtitle1 para 2 (levemente menor)
        sx={{
            fontWeight: 'bold',
            mb: 1.5, // Reduzi de 2 para 1.5
            color: 'inherit',
            textTransform: 'uppercase', // Ajuda na hierarquia visual em tamanho menor
            fontSize: '0.9rem'
        }}
    >
        {children}
    </Typography>
);

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const tokens = useDesignTokens();

    const baseTextColor = '#ffffff';
    const mutedTextColor = 'rgba(255,255,255,0.8)';

    return (
        <Box
            component="footer"
            role="contentinfo"
            aria-label="Rodapé do site"
            sx={{
                        backgroundColor: tokens.brandColors.primary[500],
                        color: baseTextColor,
            py: 3, // ALTERAÇÃO PRINCIPAL: Reduzido de {xs:4, md:6} para 3
            px: 3,
            mt: 'auto',
            width: '100%',
            zIndex: 1,
                borderTop: `1px solid ${alpha('#ffffff', 0.05)}`,
                '& .MuiTypography-root': {
                    color: baseTextColor,
                    WebkitTextFillColor: baseTextColor,
                    opacity: 1,
                },
            }}
        >
            <Grid 
                container 
                spacing={2} // ALTERAÇÃO: Reduzido espaçamento geral de 4 para 2
                sx={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}
                alignItems="flex-start" // Alinha tudo ao topo
            >
               
                {/* Coluna da Esquerda (Logo e Info) */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start', 
                        textAlign: 'left' 
                    }}>
                        <Box 
                            component="img"
                            src="/logo3branco.png" 
                            alt="Logo Casa do Amor"
                            sx={{ 
                                height: 40, // Reduzido para ficar mais compacto
                                width: 'auto', 
                                mb: 1.5,
                                filter: 'brightness(0) invert(1)' 
                            }}
                        />
                        <Typography 
                            variant="subtitle1" 
                            color="inherit"
                            sx={{ 
                                fontWeight: 'bold', 
                                color: baseTextColor, 
                                mb: 0.5,
                                lineHeight: 1.2
                            }}
                        >
                            SGCA — Casa do Amor
                        </Typography>
                        
                        <Typography variant="body2" color="inherit" sx={{ color: mutedTextColor, maxWidth: '300px', mb: 2, fontSize: '0.85rem' }}>
                            Apoio e acolhimento de pacientes em tratamento.
                        </Typography>

                        <Typography variant="caption" color="inherit" sx={{ color: mutedTextColor, fontSize: '0.75rem' }}>
                            © {currentYear} — Todos os direitos reservados.
                        </Typography>
                    </Box>
                </Grid>

                {/* Coluna da Direita (Links) */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Grid 
                        container 
                        spacing={2} 
                        justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                    >
                        
                        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                            <Stack alignItems="flex-start">
                                <FooterTitle>SGCA</FooterTitle>
                                <FooterLink href="/about">Documentação</FooterLink>
                                <FooterLink href="/patients">Home</FooterLink>
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                            <Stack alignItems="flex-start">
                                <FooterTitle>Privacidade</FooterTitle>
                                <Box 
                                    sx={{ 
                                        mb: 0.5,
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        width: '100%'
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
                                            fontSize: '0.85rem',
                                            marginBottom: 0.5,
                                            alignItems: 'center',
                                            gap: 1,
                                            textDecoration: 'none',
                                            transition: 'opacity 0.2s, color 0.2s, transform 0.2s', 
                                            '&:hover': {
                                                opacity: 1,
                                                color: (theme) => theme.custom.brandColors.secondary[500],
                                            },
                                            '@media (min-width: 600px)': {
                                                '&:hover': { transform: 'translateX(3px)' },
                                            },
                                        }}
                                    />
                                </Box>
                                <FooterLink href="/privacy-policy">Política</FooterLink>
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                            <Stack alignItems="flex-start">
                                <FooterTitle>Contato</FooterTitle>
                                <FooterLink href="https://instagram.com" icon={<InstagramIcon sx={{ fontSize: 18 }} />} external>
                                    Instagram
                                </FooterLink>
                                <FooterLink href="mailto:202210325@uesb.edu.br" icon={<EmailIcon sx={{ fontSize: 18 }} />}>
                                    Email
                                </FooterLink>
                                <FooterLink href="https://wa.me/5577998627311" icon={<WhatsAppIcon sx={{ fontSize: 18 }} />} external>
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
