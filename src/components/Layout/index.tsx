import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
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
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { CssBaseline, Divider } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { styled, useTheme, type Theme } from '@mui/material/styles'; 
import type { CSSObject } from '@mui/system';
import { useKeyboardShortcuts, type KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';
import KeyboardShortcutsHelp from '../KeyboardShortcutsHelp';

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
}>(({ theme, open }) => ({
    flexGrow: 1,
    minWidth: 0,
    padding: theme.spacing(2),
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginTop: theme.spacing(8),
    marginLeft: closedDrawerWidth, 
    ...(open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: drawerWidth,
    }),
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
    
    width: `calc(100% - ${closedDrawerWidth}px)`,
    marginLeft: closedDrawerWidth,

    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
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

const NavItem: React.FC<NavItemProps> = ({ to, primary, Icon, open, requiredRole, onToggleDrawer, navigate }) => {
    const { user } = useAuth();
    const location = useLocation(); 
    
    const isActive = location.pathname.startsWith(to) && to !== '/';
    const isRootActive = location.pathname === '/' && to === '/patients';
    const isCurrentActive = isActive || isRootActive;
    
    const handleNavigation = (event: React.MouseEvent) => {
        
        // 1. CLICAR NO ITEM ATIVO COM A SIDEBAR ABERTA -> SOMENTE FECHA A SIDEBAR (Continua ativo)
        if (open && isCurrentActive) {
            event.preventDefault(); 
            onToggleDrawer(); 
            return;
        }

        // 2. CLICAR NO ITEM ATIVO COM A SIDEBAR FECHADA -> ABRE A SIDEBAR E SAI DA TELA ATUAL
        if (isCurrentActive && !open) {
            event.preventDefault();
            onToggleDrawer(); 
            
            // Navega para a tela principal (desativa o item atual)
            const targetPath = to === '/patients' ? '/' : '/patients';
            navigate(targetPath); 
            return;
        }

        // 3. CLICAR EM UM ITEM INATIVO (NOVO) -> ABRE A SIDEBAR E DEIXA O LINK NAVEGAR (Mantém a sidebar aberta)
        if (!isCurrentActive && !open) {
            onToggleDrawer();
            // Permite o link navegar para a nova rota
        }
        
        // Se a sidebar já estiver aberta e clicamos em um novo item (Cenário 3 com open=true), o link navega.
    };


    if (requiredRole && user?.tipoUsuario !== requiredRole) {
        return null;
    }

    return (
        <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
                component={Link}
                to={to}
                onClick={handleNavigation}
                sx={{
                    minHeight: 48,
                    // CORREÇÃO: Garante que o ícone fique centralizado no modo fechado
                    justifyContent: open ? 'initial' : 'center', 
                    px: 2,
                    borderRadius: '8px', 
                    
                    backgroundColor: isCurrentActive ? activeBgColor : 'transparent',
                    
                    '&:hover': {
                        backgroundColor: isCurrentActive ? activeBgColor : 'rgba(0, 0, 0, 0.08)',
                    },
                    
                    margin: '4px 8px',
                    width: 'auto',
                }}
            >
                <ListItemIcon
                    sx={{
                        // CORREÇÃO: Removendo o minWidth excessivo e usando o padrão para centralizar
                        minWidth: closedDrawerWidth - 40, // 40px para garantir a centralização em 80px de largura
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: isCurrentActive ? activeTextColor : '#000000da', 
                    }}
                >
                    <Icon />
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
                                fontWeight: 'bold',
                            }
                        }
                    }}
                />
            </ListItemButton>
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

    const handleLogout = () => {
        setTimeout(() => {
            logout();
            navigate("/login", { replace: true });
        }, 1000)
    };

    // Definir atalhos de teclado globais
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

    // DADOS DOS ITENS DE NAVEGAÇÃO (Pacientes em 1º)
    const navItems = [
        { to: "/patients", primary: "Pacientes", Icon: GroupsIcon },
        { to: "/users", primary: "Usuários", Icon: PeopleAltIcon, requiredRole: 'ADMINISTRADOR' },
        { to: "/sessions", primary: "Sessões Ativas", Icon: HistoryIcon, requiredRole: 'ADMINISTRADOR' },
        { to: "/auditoria", primary: "Auditoria", Icon: GavelIcon, requiredRole: 'ADMINISTRADOR' },
    ];


    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            {/* Barra de cima */}
            <AppBar position="fixed" open={open}>
                <Toolbar>
                    
                    <Typography variant="h6" noWrap component="div" sx={{ marginLeft: '30px' }}>
                        SISTEMA DE GERENCIAMENTO DA CASA DO AMOR
                    </Typography>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Botão de Ajuda de Atalhos */}
                    <Tooltip title="Atalhos de teclado (?)">
                        <IconButton
                            color="inherit"
                            onClick={() => setShortcutsHelpOpen(true)}
                            aria-label="atalhos de teclado"
                            sx={{ mr: 1 }}
                        >
                            <KeyboardIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Botão Meu Perfil */}
                    <Tooltip title={user?.nome ? `Meu perfil — ${user.nome}` : 'Meu perfil'}>
                        <IconButton
                            color="inherit"
                            onClick={() => navigate('/profile')}
                            aria-label="perfil"
                            sx={{ mr: 1 }}
                        >
                            <AccountCircleIcon />
                        </IconButton>
                    </Tooltip>
                    <IconButton
                        color="inherit"
                        onClick={handleLogout}
                        aria-label="logout"
                        edge="end"
                    >
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            {/* Barra lateral - Usando o StyledDrawer */}
            <StyledDrawer
                variant="permanent" 
                open={open}
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
                    justifyContent: 'space-between', // Centraliza o logo e coloca a seta à direita
                    padding: theme.spacing(0, 2),
                }}>
                    {/* icone / Logo */}
                    <img src="logo2.png" alt="Icone Casa do Amor" style={{
                        width: open ? "80px" : "50px", 
                        transition: theme.transitions.create('width'),
                        margin: '5px 0',
                    }} />
                    
                    {/* NOVO: Seta de Fechar FIXA no topo do DrawerHeader */}
                    {open && (
                        <IconButton
                            color="inherit"
                            onClick={handleDrawerToggle}
                            sx={{
                                color: '#000000DA',
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

            <Main open={open}>
                <Outlet />
            </Main>

            {/* Modal de Ajuda de Atalhos */}
            <KeyboardShortcutsHelp
                open={shortcutsHelpOpen}
                onClose={() => setShortcutsHelpOpen(false)}
                shortcuts={shortcuts}
            />
        </Box>
    );
}