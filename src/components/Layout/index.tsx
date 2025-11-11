import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import HistoryIcon from '@mui/icons-material/History';
import GroupsIcon from '@mui/icons-material/Groups';
import GavelIcon from '@mui/icons-material/Gavel';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { CssBaseline, Divider } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { styled, useTheme, type Theme } from '@mui/material/styles';
import type { CSSObject } from '@mui/system';
import KeyboardShortcutsHelp from '../KeyboardShortcutsHelp';
import { useAuth } from '../../hooks/useAuth';
import { useKeyboardShortcuts, type KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';

const drawerWidth = 280;
const closedDrawerWidth = 80;

const activeBgColor = '#09244B';
const activeTextColor = '#FFFFFF';

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

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }: any) => ({
        width: drawerWidth,
        flexShrink: 0,
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
    open?: boolean;
}>(({ theme }) => ({
    flexGrow: 1,
    minWidth: 0,
    padding: theme.spacing(1),
    marginTop: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(2),
        marginTop: theme.spacing(8),
    },
    [theme.breakpoints.up('md')]: {
        padding: theme.spacing(2),
    },
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<{
    open?: boolean;
}>(({ theme, open }) => ({
    backgroundColor: "#65ACD6",
    zIndex: theme.zIndex.drawer + 1,
    boxShadow: 'none',
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    // Mobile: full width
    width: '100%',
    marginLeft: 0,
    // Desktop: adapt to drawer
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
}));


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
    requiredRole?: string;
    onToggleDrawer: () => void;
    navigate: (path: string) => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, primary, Icon, open, requiredRole, onToggleDrawer}) => {
    const { user } = useAuth();
    const location = useLocation();
    const theme = useTheme();
    const navigate = useNavigate();
    
    const isActive = location.pathname.startsWith(to) && to !== '/';
    const isRootActive = (location.pathname === '/' && to === '/patients') || (location.pathname === '/profile' && to === '/profile');
    const isCurrentActive = isActive || isRootActive;
    
    const handleNavigation = (event: React.MouseEvent) => {
        event.preventDefault();
        
        // Mobile: sempre fecha o drawer e navega
        if (theme.breakpoints.values.md && window.innerWidth < theme.breakpoints.values.md) {
            navigate(to);
            onToggleDrawer();
            return;
        }
        
        // Desktop: comportamento original
        if (open && isCurrentActive) {
            onToggleDrawer();
            return;
        }

        if (!open && isCurrentActive) {
            onToggleDrawer();
            return;
        }

        if (!isCurrentActive && !open) {
            onToggleDrawer();
        }
        
        navigate(to);
    };


    if (requiredRole && user?.tipoUsuario !== requiredRole) {
        return null;
    }

    return (
        <ListItem disablePadding sx={{ display: 'block' }}>
            <Tooltip title={primary} placement="right" disableHoverListener={open}>
                <ListItemButton
                    onClick={handleNavigation}
                    sx={{
                        minHeight: 56, // Aumentado de 48px para melhor touch target no mobile
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                        py: 1.5, // Padding vertical aumentado
                        borderRadius: '8px',
                        
                        backgroundColor: isCurrentActive ? activeBgColor : 'transparent',
                        
                        '&:hover': {
                            backgroundColor: isCurrentActive ? activeBgColor : 'rgba(0, 0, 0, 0.08)',
                        },
                        
                        // Feedback tátil mobile aprimorado
                        '&:active': {
                            backgroundColor: isCurrentActive 
                                ? 'rgba(9, 36, 75, 0.9)' // Leve transparência quando ativo
                                : 'rgba(0, 0, 0, 0.15)',
                            transform: 'scale(0.98)',
                        },
                        
                        // Transição suave
                        transition: theme => theme.transitions.create(
                            ['background-color', 'transform'], 
                            {
                                duration: 150, // Mais rápido para feedback imediato
                            }
                        ),
                        
                        // Remove highlight azul no mobile
                        WebkitTapHighlightColor: 'transparent',
                        
                        margin: '4px 8px',
                        width: 'auto',
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: open ? 3 : 0,
                            justifyContent: 'center',
                            color: isCurrentActive ? activeTextColor : '#000000da',
                            // Ícones ligeiramente maiores no mobile para melhor visibilidade
                            fontSize: { xs: '1.5rem', md: '1.25rem' },
                        }}
                    >
                        <Icon sx={{ fontSize: 'inherit' }} />
                    </ListItemIcon>
                    <ListItemText
                        primary={primary}
                        sx={{
                            opacity: open ? 1 : 0,
                            width: '100%',
                            textAlign: 'left',
                            transition: theme => theme.transitions.create('opacity'),
                            overflow: 'hidden'
                        }}
                        slotProps={{
                            primary: {
                                sx: {
                                    color: isCurrentActive ? activeTextColor : '#000000da',
                                    fontWeight: isCurrentActive ? 700 : 600, // Mais contraste
                                    fontSize: { xs: '1rem', md: '0.938rem' }, // Ligeiramente maior no mobile
                                }
                            }
                        }}
                    />
                </ListItemButton>
            </Tooltip> 
        </ListItem>
    );
};


export default function Layout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [shortcutsHelpOpen, setShortcutsHelpOpen] = React.useState(false);

    const handleDrawerToggle = React.useCallback(() => {
        setOpen(prev => !prev);
    }, []);

    const handleLogout = async () => {
        try {
            await logout(); // ✅ Aguarda logout completar
            navigate("/login", { replace: true });
        } catch (error) {
            console.error('[Layout] Erro ao fazer logout:', error);
            navigate("/login", { replace: true }); // Redireciona mesmo com erro
        }
    };

    const shortcuts: KeyboardShortcut[] = React.useMemo(() => [
        {
            key: '?',
            handler: () => setShortcutsHelpOpen(true),
            description: 'Exibir ajuda de atalhos',
        },
        {
            key: 'k',
            ctrl: true,
            handler: () => setShortcutsHelpOpen(true),
            description: 'Exibir ajuda de atalhos',
        },
        {
            key: 'Escape',
            handler: () => setShortcutsHelpOpen(false),
            description: 'Fechar diálogos',
        },
        {
            key: 'p',
            ctrl: true,
            handler: () => navigate('/patients'),
            description: 'Ir para Pacientes',
        },
        {
            key: 'u',
            ctrl: true,
            handler: () => navigate('/users'),
            description: 'Ir para Profissionais',
        },
        {
            key: 'm',
            ctrl: true,
            handler: () => navigate('/my-profile'),
            description: 'Ir para Meu Perfil',
        },
    ], [navigate]);

    useKeyboardShortcuts(shortcuts);

    const { user } = useAuth();

    const navItems = [
        { to: "/patients", primary: "Pacientes", Icon: GroupsIcon },
        { to: "/companions", primary: "Acompanhantes", Icon: SupervisorAccountIcon },
        { to: "/users", primary: "Usuários", Icon: PeopleAltIcon, requiredRole: 'ADMINISTRADOR' },
        { to: "/sessions", primary: "Sessões Ativas", Icon: HistoryIcon, requiredRole: 'ADMINISTRADOR' },
        { to: "/auditoria", primary: "Auditoria", Icon: GavelIcon, requiredRole: 'ADMINISTRADOR' },
    ];


    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" open={open}>
                <Toolbar>
                    {/* Menu icon for mobile */}
                    <IconButton
                        color="inherit"
                        aria-label="abrir menu"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ 
                            mr: 2,
                            display: { xs: 'block', md: 'none' },
                            // Touch target mínimo de 48x48px (Material Design + Apple HIG)
                            minWidth: '48px',
                            minHeight: '48px',
                            // Feedback visual aprimorado
                            '&:active': {
                                transform: 'scale(0.95)',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            },
                            transition: 'transform 150ms ease-in-out',
                        }}
                    >
                        <MenuIcon sx={{ fontSize: '1.75rem' }} />
                    </IconButton>
                    
                    {/* Título clicável para voltar à home */}
                    <Typography 
                        variant="h6" 
                        noWrap 
                        component="div" 
                        onClick={() => navigate('/patients')}
                        sx={{ 
                            display: { xs: 'none', sm: 'block' },
                            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                            cursor: 'pointer',
                            userSelect: 'none', // Previne seleção de texto ao clicar
                            WebkitTapHighlightColor: 'transparent', // Remove highlight azul no mobile
                            padding: '8px 12px',
                            borderRadius: '4px',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                            '&:active': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                transform: 'scale(0.98)',
                            },
                            transition: 'all 150ms ease-in-out',
                        }}
                    >
                        SISTEMA DE GERENCIAMENTO DA CASA DO AMOR
                    </Typography>
                    
                    {/* Título mobile clicável */}
                    <Typography 
                        variant="h6" 
                        noWrap 
                        component="div" 
                        onClick={() => navigate('/patients')}
                        sx={{ 
                            display: { xs: 'block', sm: 'none' },
                            fontSize: '0.938rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            userSelect: 'none',
                            WebkitTapHighlightColor: 'transparent',
                            padding: '8px',
                            borderRadius: '4px',
                            '&:active': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                transform: 'scale(0.98)',
                            },
                            transition: 'all 150ms ease-in-out',
                        }}
                    >
                        SGCA
                    </Typography>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Atalhos de teclado - apenas desktop */}
                    <Tooltip title="Atalhos de teclado (?)">
                        <IconButton
                            color="inherit"
                            onClick={() => setShortcutsHelpOpen(true)}
                            aria-label="atalhos de teclado"
                            sx={{ 
                                mr: { xs: 0.5, sm: 1 },
                                display: { xs: 'none', sm: 'inline-flex' }, // Oculto no mobile para economizar espaço
                                minWidth: '48px',
                                minHeight: '48px',
                                '&:active': {
                                    transform: 'scale(0.95)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                },
                                transition: 'transform 150ms ease-in-out',
                            }}
                            size="small"
                        >
                            <KeyboardIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={user?.nome ? `Meu perfil — ${user.nome}` : 'Meu perfil'}>
                        <IconButton
                            color="inherit"
                            onClick={() => navigate('/profile')}
                            aria-label="perfil"
                            sx={{ 
                                mr: { xs: 0.5, sm: 1 },
                                minWidth: '48px',
                                minHeight: '48px',
                                '&:active': {
                                    transform: 'scale(0.95)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                },
                                transition: 'transform 150ms ease-in-out',
                            }}
                            size="small"
                        >
                            <AccountCircleIcon sx={{ fontSize: '1.5rem' }} />
                        </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Sair"> 
                        <IconButton
                            color="inherit"
                            onClick={handleLogout}
                            aria-label="logout"
                            edge="end"
                            sx={{
                                minWidth: '48px',
                                minHeight: '48px',
                                '&:active': {
                                    transform: 'scale(0.95)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                },
                                transition: 'transform 150ms ease-in-out',
                            }}
                            size="small"
                        >
                            <LogoutIcon sx={{ fontSize: '1.5rem' }} />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            {/* Mobile drawer (swipeable for better UX) */}
            <SwipeableDrawer
                variant="temporary"
                open={open}
                onClose={handleDrawerToggle}
                onOpen={handleDrawerToggle}
                disableBackdropTransition
                ModalProps={{
                    keepMounted: true, // Better mobile performance
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        backgroundColor: "#C5E4F2",
                        boxShadow: 'none',
                        border: 'none',
                        zIndex: (theme) => theme.zIndex.drawer + 2, // Acima do AppBar
                    },
                    '& .MuiBackdrop-root': {
                        zIndex: (theme) => theme.zIndex.drawer + 1, // Backdrop entre AppBar e Drawer
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Escurece o fundo
                    }
                }}
            >
                {/* Header do menu mobile - sem logo para economizar espaço vertical */}
                <DrawerHeader sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    padding: theme.spacing(1, 2),
                    minHeight: '56px', // Reduzido de 64px para economizar espaço
                    backgroundColor: '#65ACD6', // Mesma cor do AppBar para continuidade visual
                }}>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 600,
                            color: '#FFFFFF',
                            fontSize: '1rem',
                        }}
                    >
                        Menu
                    </Typography>
                    <IconButton
                        color="inherit"
                        aria-label="fechar menu"
                        onClick={handleDrawerToggle}
                        sx={{ 
                            color: '#FFFFFF',
                            flexShrink: 0,
                            minWidth: '48px',
                            minHeight: '48px',
                            // Feedback tátil
                            '&:active': {
                                transform: 'scale(0.95)',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                    >
                        <ChevronLeftIcon />
                    </IconButton>
                </DrawerHeader>

                <List sx={{ 
                    padding: '8px 0',
                    // Adiciona padding bottom para não cortar último item
                    paddingBottom: '16px',
                }}>
                    <Divider sx={{ maxWidth: '90%', margin: '0 auto 8px' }} />
                    {navItems.map((item) => (
                        <NavItem
                            key={item.to}
                            to={item.to}
                            primary={item.primary}
                            Icon={item.Icon}
                            open={true}
                            requiredRole={item.requiredRole}
                            onToggleDrawer={handleDrawerToggle}
                            navigate={navigate}
                        />
                    ))}
                </List>
            </SwipeableDrawer>

            {/* Desktop drawer (permanent) */}
            <StyledDrawer
                variant="permanent"
                open={open}
                sx={{
                    display: { xs: 'none', md: 'block' },
                }}
                PaperProps={{
                    sx: {
                        backgroundColor: "#C5E4F2",
                        boxShadow: 'none',
                        border: 'none',
                        width: open ? drawerWidth : closedDrawerWidth,
                        transition: theme => theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: open
                                ? theme.transitions.duration.enteringScreen
                                : theme.transitions.duration.leavingScreen,
                        }),
                        overflowX: 'hidden',
                    }
                }}
            >
                <DrawerHeader sx={{
                    display: 'flex',
                    justifyContent: open ? 'space-between' : 'center',
                    alignItems: 'center',
                    padding: theme.spacing(0, open ? 2 : 1),
                    minHeight: '64px',
                }}>
                    
                    <Box 
                        component="img" 
                        src="logo2.png" 
                        alt="Icone Casa do Amor" 
                        sx={{
                            width: open ? "80px" : "50px",
                            height: "auto",
                            objectFit: 'contain',
                            transition: theme.transitions.create('width'),
                            flexShrink: 0,
                        }} 
                    />
                    
                    {open && (
                        <IconButton
                            color="inherit"
                            aria-label="fechar drawer"
                            onClick={handleDrawerToggle}
                            sx={{
                                color: '#000000DA',
                                flexShrink: 0,
                            }}
                        >
                            <ChevronLeftIcon />
                        </IconButton>
                    )}
                </DrawerHeader>

                <List sx={{ padding: '0px' }}>
                    <Divider sx={{ maxWidth: '90%', margin: '0 auto' }} />

                    {navItems.map((item) => (
                        <NavItem
                            key={item.to}
                            to={item.to}
                            primary={item.primary}
                            Icon={item.Icon}
                            open={open}
                            requiredRole={item.requiredRole}
                            onToggleDrawer={handleDrawerToggle}
                            navigate={navigate}
                        />
                    ))}
                </List>
            </StyledDrawer>

            <Main>
                <Outlet />
            </Main>

            <KeyboardShortcutsHelp
                open={shortcutsHelpOpen}
                onClose={() => setShortcutsHelpOpen(false)}
                shortcuts={shortcuts}
            />
        </Box>
    );
}