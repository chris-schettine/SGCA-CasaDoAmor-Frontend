import React from 'react';
import { Box, Typography, Link, Grid, Stack, alpha } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
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
                py: { xs: 4, md: 3 },
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
                spacing={{ xs: 3, md: 4 }}
                sx={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}
                alignItems="flex-start"
            >
               
                {/* Coluna da Esquerda (Logo e Info) */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                        <Box 
                            component="img"
                            src="/logo3branco.png" 
                            alt="Logo Casa do Amor"
                            sx={{ 
                                height: 36,
                                width: 'auto',
                                filter: 'brightness(0) invert(1)' 
                            }}
                        />
                        <Typography 
                            variant="body2" 
                            color="inherit"
                            sx={{ 
                                fontWeight: 600, 
                                color: baseTextColor,
                                lineHeight: 1.3,
                                fontSize: '0.9rem'
                            }}
                        >
                            SGCA — Casa do Amor
                        </Typography>
                    </Stack>
                    
                    <Typography variant="caption" color="inherit" sx={{ color: mutedTextColor, maxWidth: '280px', mb: 1.5, fontSize: '0.8rem', lineHeight: 1.4, display: 'block' }}>
                        Apoio e acolhimento de pacientes em tratamento de câncer.
                    </Typography>

                    <Typography variant="caption" color="inherit" sx={{ color: mutedTextColor, fontSize: '0.7rem', opacity: 0.6, display: 'block' }}>
                        © {currentYear} Casa do Amor
                    </Typography>
                </Grid>

                {/* Colunas de Links - Compactadas em uma linha */}
                <Grid size={{ xs: 12, md: 9 }}>
                    <Grid 
                        container 
                        spacing={{ xs: 3, md: 4 }} 
                        justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                    >
                        
                        <Grid size={{ xs: 6, sm: 3, md: 2.5 }}>
                            <Stack alignItems="flex-start" spacing={0.5}>
                                <FooterTitle>Projeto</FooterTitle>
                                <FooterLink href="/about">Sobre</FooterLink>
                                <FooterLink href="/login">Acessar</FooterLink>
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 6, sm: 3, md: 2.5 }}>
                            <Stack alignItems="flex-start" spacing={0.5}>
                                <FooterTitle>Legal</FooterTitle>
                                <Box sx={{ mb: 0 }}>
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
                                <FooterLink href="/privacy-policy">Privacidade</FooterLink>
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Stack alignItems="flex-start" spacing={0.8}>
                                <FooterTitle>Contato</FooterTitle>
                                
                                <FooterLink href="https://www.instagram.com/casadoamorvca/" icon={<InstagramIcon sx={{ fontSize: 16 }} />} external>
                                    Instagram
                                </FooterLink>
                                <FooterLink href="tel:+557734219660" icon={<PhoneIcon sx={{ fontSize: 16 }} />}>
                                    (77) 3421-9660
                                </FooterLink>
                                <FooterLink href="https://wa.me/5577999463319" icon={<WhatsAppIcon sx={{ fontSize: 16 }} />} external>
                                    WhatsApp
                                </FooterLink>
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 12, md: 3 }}>
                            <Stack alignItems="flex-start" spacing={0.5}>
                                <FooterTitle>Localização</FooterTitle>
                                <Link
                                    href="https://maps.app.goo.gl/kLbx8omaLYNBxww9A?g_st=aw" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    color="inherit"
                                    underline="none"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start', 
                                        gap: 0.8,
                                        opacity: 0.7,
                                        fontSize: '0.85rem',
                                        lineHeight: 1.4, 
                                        transition: 'opacity 0.2s, color 0.2s',
                                        '&:hover': {
                                            opacity: 1,
                                            color: (theme) => theme.custom.brandColors.secondary[500],
                                        },
                                    }}
                                >
                                    <LocationOnIcon sx={{ fontSize: 16, mt: 0.1, flexShrink: 0 }} />
                                    <Box component="span" sx={{ fontSize: '0.8rem' }}>
                                        R. O, 30 - Boa Vista<br />
                                        Vitória da Conquista - BA<br />
                                        CEP 45055-315
                                    </Box>
                                </Link>
                            </Stack>
                        </Grid>

                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Footer;
