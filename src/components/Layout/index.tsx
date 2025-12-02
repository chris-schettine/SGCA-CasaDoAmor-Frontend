import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import HistoryIcon from '@mui/icons-material/History';
import GavelIcon from '@mui/icons-material/Gavel';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import HotelIcon from '@mui/icons-material/Hotel';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { CssBaseline, Divider } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { styled, useTheme, type Theme, alpha } from '@mui/material/styles';
import type { CSSObject } from '@mui/system';
import { useQueryClient } from '@tanstack/react-query';
import KeyboardShortcutsHelp from '../KeyboardShortcutsHelp';
import { useAuth } from '../../hooks/useAuth';
import { useKeyboardShortcuts, type KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';
import { useConsent } from '../../consent/hooks/useConsent';
import { useDesignTokens } from '../../design-tokens/utils';
import Footer from '../Footer';
import ThemeToggle from '../ThemeToggle';
import { pacienteService } from '../../api/paciente.service';
import { adminService } from '../../api/admin.service';
import { authService } from '../../api/auth.service';
import { OnboardingProvider, useOnboarding } from '../Onboarding/OnboardingProvider';

const drawerWidth = 280;
const closedDrawerWidth = 80;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: closedDrawerWidth,
});

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })<{
    open?: boolean;
}>(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    boxSizing: 'border-box',
    whiteSpace: 'nowrap',
    '& .MuiDrawer-paper': {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
    },
    ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
    }),
}));

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
    open?: boolean;
}>(() => ({
    flexGrow: 1,
    minWidth: 0,
    display: 'flex', 
    flexDirection: 'column',
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<MuiAppBarProps & { open?: boolean }>(({ theme, open }) => {
    const isDark = theme.palette.mode === 'dark';
    const darkBackground = 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(27, 42, 80, 0.95) 100%)';

    return {
        backgroundColor: isDark ? theme.palette.background.paper : theme.custom.brandColors.secondary[500],
        backgroundImage: isDark ? darkBackground : 'none',
        color: isDark ? theme.palette.getContrastText(theme.palette.background.paper) : '#FFFFFF',
        backdropFilter: isDark ? 'blur(6px)' : 'none',
        zIndex: theme.zIndex.drawer + 1,
        boxShadow: 'none',
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: '100%',
        marginLeft: 0,
        [theme.breakpoints.up('md')]: {
            width: open ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${closedDrawerWidth}px)`,
            marginLeft: open ? drawerWidth : closedDrawerWidth,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: open 
                    ? theme.transitions.duration.enteringScreen 
                    : theme.transitions.duration.leavingScreen,
            }),
        },
    };
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

interface NavItemProps {
    to: string;
    primary: string;
    Icon: React.ElementType;
    open: boolean;
    requiredRole?: string | string[];
    onToggleDrawer: () => void;
    navigate: (path: string) => void;
    onPrefetch?: (path: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, primary, Icon, open, requiredRole, onToggleDrawer, onPrefetch }) => {
    const { user } = useAuth();
    const location = useLocation();
    const theme = useTheme();
    const navigate = useNavigate();
    const tokens = useDesignTokens();
    
    const isActive = location.pathname.startsWith(to) && to !== '/';
    const isRootActive = (location.pathname === '/' && to === '/patients') || (location.pathname === '/profile' && to === '/profile');
    const isCurrentActive = isActive || isRootActive;
    
    const activeBgColor = theme.palette.mode === 'dark' ? theme.palette.primary.main : tokens.brandColors.primary[500];
    const activeTextColor = theme.palette.getContrastText(activeBgColor);
    const inactiveColor = theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.85) : alpha(theme.palette.text.primary, 0.85);
    
    const handleNavigation = (event: React.MouseEvent) => {
        event.preventDefault();
        // Close drawer only on mobile devices
        const isMobileView = theme.breakpoints.values.md && window.innerWidth < theme.breakpoints.values.md;
        if (isMobileView) {
            onToggleDrawer();
        }
        navigate(to);
    };

    // Check role-based access (supports single role string or array of roles)
    if (requiredRole) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!user?.tipoUsuario || !allowedRoles.includes(user.tipoUsuario)) {
            return null;
        }
    }

    const handlePrefetch = () => {
        onPrefetch?.(to);
    };

    return (
        <ListItem disablePadding sx={{ display: 'block' }}>
            <Tooltip title={primary} placement="right" disableHoverListener={open}>
                <ListItemButton
                    data-tour-id={to === '/patients' ? 'nav-patients' : undefined}
                    onClick={handleNavigation}
                    onMouseEnter={handlePrefetch}
                    onFocus={handlePrefetch}
                    sx={{
                        minHeight: 56,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        py: 1.5,
                        borderRadius: '8px',
                        backgroundColor: isCurrentActive ? activeBgColor : 'transparent',
                        color: isCurrentActive ? activeTextColor : inactiveColor,
                        '&:hover': { backgroundColor: isCurrentActive ? activeBgColor : theme.palette.action.hover },
                        '&:active': { backgroundColor: isCurrentActive ? alpha(activeBgColor, 0.9) : theme.palette.action.selected, transform: 'scale(0.98)' },
                        transition: (theme) => theme.transitions.create(['background-color', 'transform'], { duration: 150 }),
                        WebkitTapHighlightColor: 'transparent',
                        margin: '4px 8px',
                        width: 'auto',
                        '& .MuiListItemText-primary': {
                            color: isCurrentActive ? activeTextColor : inactiveColor,
                            WebkitTextFillColor: isCurrentActive ? activeTextColor : inactiveColor,
                            fontWeight: isCurrentActive ? 700 : 600,
                            fontSize: { xs: '1rem', md: '0.938rem' },
                        },
                        '& .MuiSvgIcon-root': {
                            color: isCurrentActive ? activeTextColor : inactiveColor,
                        },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 0, justifyContent: 'center', color: isCurrentActive ? activeTextColor : inactiveColor, fontSize: { xs: '1.5rem', md: '1.25rem' } }}>
                        <Icon sx={{ fontSize: 'inherit' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={primary}
                      sx={{ opacity: open ? 1 : 0, width: '100%', textAlign: 'left', transition: theme => theme.transitions.create('opacity'), overflow: 'hidden' }}
                      slotProps={{ primary: { sx: { color: isCurrentActive ? activeTextColor : inactiveColor, WebkitTextFillColor: isCurrentActive ? activeTextColor : inactiveColor, fontWeight: isCurrentActive ? 700 : 600, fontSize: { xs: '1rem', md: '0.938rem' } } } }}
                    />
                </ListItemButton>
            </Tooltip> 
        </ListItem>
    );
};

function LayoutShell() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const [open, setOpen] = React.useState(true);
    const [shortcutsHelpOpen, setShortcutsHelpOpen] = React.useState(false);
    const queryClient = useQueryClient();
    const { startTour } = useOnboarding();

    const prefetchNavTarget = React.useCallback(async (path: string) => {
        try {
            switch (path) {
                case '/patients': {
                    await Promise.all([
                        import('../../pages/Patients'),
                        queryClient.prefetchQuery({
                            queryKey: ['patients', 'prefetch', { page: 0 }],
                            queryFn: () => pacienteService.listarPacientes(20, 0),
                            staleTime: 60_000,
                        }),
                    ]);
                    break;
                }
                case '/users': {
                    await Promise.all([
                        import('../../pages/Users'),
                        queryClient.prefetchQuery({
                            queryKey: ['users', 'prefetch', { page: 0, size: 10 }],
                            queryFn: () => adminService.listUsers({ page: 0, size: 10 }),
                            staleTime: 60_000,
                        }),
                    ]);
                    break;
                }
                case '/sessions': {
                    await Promise.all([
                        import('../../pages/Sessions'),
                        queryClient.prefetchQuery({
                            queryKey: ['sessions', 'prefetch'],
                            queryFn: () => authService.listSessions(),
                            staleTime: 60_000,
                        }),
                    ]);
                    break;
                }
                case '/companions': {
                    await import('../../pages/Companions');
                    break;
                }
                case '/auditoria': {
                    await Promise.all([
                        import('../../pages/AuditLogPage'),
                        queryClient.prefetchQuery({
                            queryKey: ['audit', 'prefetch', 'sessions'],
                            queryFn: () => adminService.getAuditSessions(),
                            staleTime: 60_000,
                        }),
                    ]);
                    break;
                }
                case '/quartos': {
                    await Promise.all([
                        import('../../pages/Quartos'),
                        queryClient.prefetchQuery({
                            queryKey: ['quartos', 'prefetch', { page: 0 }],
                            queryFn: () => import('../../api/quarto.service').then(m => m.quartoService.listar({ page: 0, size: 20 })),
                            staleTime: 60_000,
                        }),
                    ]);
                    break;
                }
                case '/hospedagens': {
                    await Promise.all([
                        import('../../pages/Hospedagens'),
                        queryClient.prefetchQuery({
                            queryKey: ['hospedagens', 'prefetch', { page: 0 }],
                            queryFn: () => import('../../api/hospedagem.service').then(m => m.hospedagemService.listar({ page: 0, size: 20 })),
                            staleTime: 60_000,
                        }),
                    ]);
                    break;
                }
                default:
                    break;
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                console.debug('[Layout] Prefetch falhou para', path, error);
            }
        }
    }, [queryClient]);

    const handleDrawerToggle = React.useCallback(() => {
        setOpen(prev => !prev);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login", { replace: true });
        } catch (error) {
            console.error('[Layout] Erro ao fazer logout:', error);
            navigate("/login", { replace: true });
        }
    };

    const shortcuts: KeyboardShortcut[] = React.useMemo(() => [
        { key: '?', handler: () => setShortcutsHelpOpen(true), description: 'Exibir ajuda de atalhos' },
        { key: 'k', ctrl: true, handler: () => setShortcutsHelpOpen(true), description: 'Exibir ajuda de atalhos' },
        { key: 'Escape', handler: () => setShortcutsHelpOpen(false), description: 'Fechar diálogos' },
        { key: 'p', ctrl: true, handler: () => navigate('/patients'), description: 'Ir para Pacientes' },
        { key: 'u', ctrl: true, handler: () => navigate('/users'), description: 'Ir para Usuários Autorizados' },
        { key: 'm', ctrl: true, handler: () => navigate('/my-profile'), description: 'Ir para Meu Perfil' },
    ], [navigate]);

    const { dialogOpen } = useConsent();
    useKeyboardShortcuts(shortcuts, !dialogOpen);
    const { user } = useAuth();
    const navItems = [
        { to: "/patients", primary: "Pacientes", Icon: LocalHospitalIcon }, 
        { to: "/companions", primary: "Acompanhantes", Icon: AccessibilityNewIcon }, 
        { to: "/dashboard", primary: "Dashboard", Icon: DashboardIcon, requiredRole: ['ADMINISTRADOR', 'RECEPCIONISTA'] },
        { to: "/quartos", primary: "Quartos", Icon: MeetingRoomIcon, requiredRole: ['ADMINISTRADOR', 'RECEPCIONISTA', 'AUDITOR'] },
        { to: "/hospedagens", primary: "Hospedagens", Icon: HotelIcon, requiredRole: ['ADMINISTRADOR', 'RECEPCIONISTA'] },
        { to: "/agendamentos/pacientes", primary: "Agend. Pacientes", Icon: EventNoteIcon, requiredRole: ['ADMINISTRADOR', 'GERENTE', 'RECEPCIONISTA', 'MEDICO', 'ENFERMEIRO'] },
        { to: "/agendamentos/acompanhantes", primary: "Agend. Acompanhantes", Icon: EventAvailableIcon, requiredRole: ['ADMINISTRADOR', 'GERENTE', 'RECEPCIONISTA', 'MEDICO', 'ENFERMEIRO'] },
        { to: "/profissionais", primary: "Profissionais", Icon: MedicalServicesIcon }, 
        { to: "/users", primary: "Usuários", Icon: ManageAccountsIcon, requiredRole: 'ADMINISTRADOR' }, 
        { to: "/sessions", primary: "Sessões Ativas", Icon: HistoryIcon, requiredRole: 'ADMINISTRADOR' },
        { to: "/auditoria", primary: "Auditoria", Icon: GavelIcon, requiredRole: 'ADMINISTRADOR' },
    ];

    return (

        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <CssBaseline />
            <AppBar 
                position="fixed" 
                open={open}
                component="header"
                role="banner"
                aria-label="Cabeçalho principal"
            >
                 <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="abrir menu"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { xs: 'block', md: 'none' }, minWidth: '48px', minHeight: '48px', '&:active': { transform: 'scale(0.95)', backgroundColor: 'rgba(255, 255, 255, 0.2)' }, transition: 'transform 150ms ease-in-out' }}
                    >
                        <MenuIcon sx={{ fontSize: '1.75rem' }} />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" onClick={() => navigate('/patients')} sx={{ display: { xs: 'none', sm: 'block' }, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' }, cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', padding: '8px 12px', borderRadius: '4px', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, '&:active': { backgroundColor: 'rgba(255, 255, 255, 0.2)', transform: 'scale(0.98)' }, transition: 'all 150ms ease-in-out' }}>
                        SISTEMA DE GERENCIAMENTO DA CASA DO AMOR
                    </Typography>
                    <Typography variant="h6" noWrap component="div" onClick={() => navigate('/patients')} sx={{ display: { xs: 'block', sm: 'none' }, fontSize: '0.938rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent', padding: '8px', borderRadius: '4px', '&:active': { backgroundColor: 'rgba(255, 255, 255, 0.2)', transform: 'scale(0.98)' }, transition: 'all 150ms ease-in-out' }}>
                        SGCA
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    {/* CORREÇÃO FINAL: Sobrescrevendo o SVG interno para garantir a cor branca */}
                    <Box 
                        sx={{ 
                            // Mantemos o color para o contexto
                            color: theme.palette.common.white, 
                            // O seletor '& svg' é muito forte e garante que o ícone interno seja alvo
                            '& svg': { 
                                color: theme.palette.common.white, // Força cor para elementos que usam 'color'
                                fill: theme.palette.common.white, // Força fill para o SVG
                            },
                        }} 
                    >
                        <ThemeToggle />
                    </Box> 
                 
                    <Tooltip title="Atalhos de teclado (?)">
                        <IconButton
                          color="inherit"
                          onClick={() => setShortcutsHelpOpen(true)}
                          aria-label="atalhos de teclado"
                          data-tour-id="shortcut-help"
                          sx={{ mr: { xs: 0.5, sm: 1 }, display: { xs: 'none', sm: 'inline-flex' }, minWidth: '48px', minHeight: '48px', '&:active': { transform: 'scale(0.95)', backgroundColor: 'rgba(255, 255, 255, 0.2)' }, transition: 'transform 150ms ease-in-out' }}
                          size="small"
                        >
                            <KeyboardIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={user?.nome ? `Meu perfil — ${user.nome}` : 'Meu perfil'}>
                        <IconButton color="inherit" onClick={() => navigate('/profile')} aria-label="perfil" sx={{ mr: { xs: 0.5, sm: 1 }, minWidth: '48px', minHeight: '48px', '&:active': { transform: 'scale(0.95)', backgroundColor: 'rgba(255, 255, 255, 0.2)' }, transition: 'transform 150ms ease-in-out' }} size="small">
                            <AccountCircleIcon sx={{ fontSize: '1.5rem' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Sair"> 
                        <IconButton color="inherit" onClick={handleLogout} aria-label="logout" edge="end" sx={{ minWidth: '48px', minHeight: '48px', '&:active': { transform: 'scale(0.95)', backgroundColor: 'rgba(255, 255, 255, 0.2)' }, transition: 'transform 150ms ease-in-out' }} size="small">
                            <LogoutIcon sx={{ fontSize: '1.5rem' }} />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <SwipeableDrawer
                variant="temporary"
                open={open}
                onClose={handleDrawerToggle}
                onOpen={handleDrawerToggle}
                disableBackdropTransition
                disableScrollLock
                ModalProps={{ 
                    keepMounted: true,
                    role: 'navigation',
                    'aria-label': 'Menu de navegação móvel'
                }}
                sx={{ 
                    display: { xs: 'block', md: 'none' }, 
                    '& .MuiDrawer-paper': { 
                        width: drawerWidth, 
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? theme.palette.background.paper 
                          : theme.custom.brandColors.light[500], 
                        boxShadow: 'none', 
                        border: 'none', 
                        zIndex: (theme) => theme.zIndex.drawer + 2 
                    }, 
                    '& .MuiBackdrop-root': { 
                        zIndex: (theme) => theme.zIndex.drawer + 1, 
                        backgroundColor: theme.palette.mode === 'dark'
                          ? 'rgba(0, 0, 0, 0.7)'
                          : 'rgba(0, 0, 0, 0.5)' 
                    } 
                }}
            >
                <DrawerHeader sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    alignItems: 'center', 
                    padding: theme.spacing(1, 2), 
                    minHeight: '56px', 
                    backgroundColor: theme.custom.brandColors.secondary[500] 
                }}>
                    <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 600, color: theme.palette.common.white, fontSize: '1rem' }}>Menu</Typography>
                    <IconButton color="inherit" aria-label="fechar menu" onClick={handleDrawerToggle} sx={{ color: theme.palette.common.white, flexShrink: 0, minWidth: '48px', minHeight: '48px', '&:active': { transform: 'scale(0.95)', backgroundColor: alpha(theme.palette.common.white, 0.1) } }}>
                        <ChevronLeftIcon />
                    </IconButton>
                </DrawerHeader>
                <List sx={{ padding: '8px 0', paddingBottom: '16px' }}>
                    <Divider sx={{ maxWidth: '90%', margin: '0 auto' }} />
                    {navItems.map((item) => (<NavItem key={item.to} to={item.to} primary={item.primary} Icon={item.Icon} open={true} requiredRole={item.requiredRole} onToggleDrawer={handleDrawerToggle} navigate={navigate} onPrefetch={prefetchNavTarget} />))}
                </List>
            </SwipeableDrawer>


            <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', width: '100%' }}>
                
            <StyledDrawer
                    variant="permanent"
                    open={open}
                    sx={{ display: { xs: 'none', md: 'block' } }}
                    PaperProps={{ 
                        component: 'nav',
                        'aria-label': 'Navegação principal',
                        sx: { 
                            backgroundColor: (theme) => theme.palette.mode === 'dark'
                            ? theme.palette.background.paper
                            : theme.custom.brandColors.light[500], 
                            boxShadow: 'none', 
                            border: 'none',

                            position: 'relative', 
                            width: open ? drawerWidth : closedDrawerWidth, 
                            transition: theme => theme.transitions.create('width', { 
                                easing: theme.transitions.easing.sharp, 
                                duration: theme.transitions.duration.leavingScreen 
                            }), 
                            overflowX: 'hidden',
                            height: '100%'
                        } 
                    }}
                >
                   
                    <DrawerHeader sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        padding: theme.spacing(1, 0.5), 
                        minHeight: '64px',
                        gap: 0.5
                    }}>
                        
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            width: '100%',
                            padding: theme.spacing(0, 1)
                        }}>
                         
                            {(() => {
                                const logoSrc = theme.palette.mode === 'dark' ? '/logo3branco.png' : '/logo3.png';
                                return (
                                    <Box
                                        component="img"
                                        src={logoSrc}
                                        alt="Icone Casa do Amor"
                                        onClick={() => navigate('/patients')}
                                        sx={{
                                            width: open ? "120px" : "50px", 
                                            height: "auto",
                                            objectFit: 'contain',
                                            flexShrink: 0,
                                            display: { xs: 'none', sm: 'block' },
                                            cursor: 'pointer',
                                            transition: 'width 150ms ease-in-out',
                                            WebkitTapHighlightColor: 'transparent',
                                            '&:hover': { opacity: 0.8 },
                                            '&:active': { transform: 'scale(0.95)' },
                                        }}
                                    />
                                );
                            })()}
                        </Box>

                        <IconButton 
                            color="inherit" 
                            aria-label={open ? "fechar drawer" : "abrir drawer"}
                            onClick={handleDrawerToggle} 
                            sx={{ 
                                color: theme.palette.mode === 'dark' 
                                    ? theme.palette.text.primary 
                                    : theme.palette.text.primary, 
                                width: '100%',
                                minWidth: '48px',
                                minHeight: '48px',
                                borderRadius: '4px',
                                '&:hover': {
                                    backgroundColor: theme.palette.action.hover
                                }
                            }}
                        >
                            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    </DrawerHeader>
                    <List sx={{ padding: '0px' }}>
                        <Divider sx={{ maxWidth: '90%', margin: '0 auto' }} />
                        {navItems.map((item) => (<NavItem key={item.to} to={item.to} primary={item.primary} Icon={item.Icon} open={open} requiredRole={item.requiredRole} onToggleDrawer={handleDrawerToggle} navigate={navigate} onPrefetch={prefetchNavTarget} />))}
                    </List>
                </StyledDrawer>

                <Main open={open} sx={{ height: '100%', overflow: 'hidden', p: 0, m: 0 }}>
                
                    <DrawerHeader />

                    <Box 
                        component="main"
                        id="main-content"
                        role="main"
                        aria-label="Conteúdo principal"
                        sx={{ 
                            flexGrow: 1, 
                            overflowY: 'auto', 
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            height: '100%' 
                        }}
                    >
                        <Box component="div" sx={{ 
                            flexGrow: 1, 
                            p: 3, 
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}> 
                            <Outlet />
                        </Box>
                    </Box>
                </Main>

            </Box>

            <Box component="footer" sx={{ width: '100%', mt: 'auto', flexShrink: 0, zIndex: (theme) => theme.zIndex.drawer + 2 }}>
                <Footer />
            </Box>

            <KeyboardShortcutsHelp open={shortcutsHelpOpen} onClose={() => setShortcutsHelpOpen(false)} shortcuts={shortcuts} onStartTour={startTour} />
        </Box>
    );
}

export default function Layout() {
  return (
    <OnboardingProvider>
      <LayoutShell />
    </OnboardingProvider>
  );
}
