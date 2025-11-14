/**
 * Componente para alternar entre temas (Light/Dark)
 * 
 * Permite ao usuário escolher o tema preferido
 */

import React from 'react';
import { IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '../../contexts/ThemeContext';
import type { ThemeMode } from '../../design-tokens';

const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useThemeMode();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    handleClose();
  };

  const getIcon = () => {
    return mode === 'dark' ? <Brightness4Icon /> : <Brightness7Icon />;
  };

  const getLabel = () => {
    return mode === 'dark' ? 'Tema Escuro' : 'Tema Claro';
  };

  return (
    <>
      <Tooltip title={`Alterar tema (atual: ${getLabel()})`}>
        <IconButton
          onClick={handleClick}
          aria-label="alterar tema"
          aria-controls={open ? 'theme-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          size="small"
        >
          {getIcon()}
        </IconButton>
      </Tooltip>
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'theme-toggle-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={() => handleModeChange('light')} 
          selected={mode === 'light'}
        >
          <ListItemIcon>
            <Brightness7Icon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Claro</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleModeChange('dark')} 
          selected={mode === 'dark'}
        >
          <ListItemIcon>
            <Brightness4Icon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Escuro</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ThemeToggle;

