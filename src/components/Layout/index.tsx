import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import GroupsIcon from '@mui/icons-material/Groups';
import LogoutIcon from '@mui/icons-material/Logout';
import { Outlet, useNavigate } from 'react-router-dom';
import { CssBaseline, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const drawerWidth = 280;

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
  display: !open ? 'flex' : 'block', // Centraliza só quando fechado
  justifyContent: !open ? 'center' : 'initial',
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{
  open?: boolean;
}>(({ theme, open }) => ({
  backgroundColor: "#65ACD6",
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    boxShadow: 'none', // Remove o box-shadow
    border: 'none', // Remove qualquer bordass
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

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    setTimeout(() => {
      logout();
      navigate("/login", { replace: true });
    }, 1000)
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* Barra de cima */}
      <AppBar position="fixed" open={open}>
        <Toolbar>

          {/* Botão para abrir a Drawer */}
          {!open && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                color: 'white',
                position: 'absolute', // Garante que os botões fiquem no mesmo local
                left: '20px', // Ajuste a posição horizontal
              }}
            >
              <MenuIcon />
            </IconButton>
          )}


          <Typography variant="h6" noWrap component="div" sx={{ marginLeft: '30px' }}>
            SISTEMA DE GERENCIAMENTO DA CASA DO AMOR
          </Typography>

          {/* Isto faz o botão de logout ficar à direita */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Botão de Logout */}
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
      {/* Barra lateral */}
      <Drawer
        sx={{
          width: open ? drawerWidth : 0,
          flexShrink: 0,
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 0,
            boxSizing: 'border-box',
            backgroundColor: "#C5E4F2",
            boxShadow: 'none',
            border: 'none',
            transition: theme => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            overflowX: 'hidden',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          {/* icone */}
          <img src="logo2.png" alt="Icone Casa do Amor" style={{
            margin: '5px auto 0', width: "80px",
          }} />

          {/* Botão para fechar a Drawer */}
          {open && (
            <IconButton
              onClick={handleDrawerClose}
              sx={{
                color: '#000000DA',
                position: 'absolute', // Garante que os botões fiquem no mesmo local
                right: '6px', // Ajuste a posição horizontal
              }}
            >
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          )}


        </DrawerHeader>

        <List sx={{
          padding: '0px',
        }}>
          <Divider sx={{
            maxWidth: '230px',
            margin: '0 auto',
          }} />
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/users"
              sx={{
                maxWidth: '280px',
                margin: '0 auto',
                padding: '8px 75px',
              }}
            >
              <ListItemIcon sx={{ color: '#000000da', minWidth: 0 }}>
                <PeopleAltIcon />
              </ListItemIcon>
              <ListItemText
                primary="Usuários"
                sx={{ textAlign: 'center' }}
                slotProps={{
                  primary: {
                    sx: { color: '#000000da', fontWeight: 'bold' }
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/patients"
              sx={{
                maxWidth: '280px',
                margin: '0 auto',
                padding: '8px 75px',
              }}
            >
              <ListItemIcon sx={{ color: '#000000da', minWidth: 0 }}>
                <GroupsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Pacientes"
                sx={{ textAlign: 'center' }}
                slotProps={{
                  primary: {
                    sx: { color: '#000000da', fontWeight: 'bold' }
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Main open={open}>
        <Outlet />
      </Main>
    </Box>
  );
}