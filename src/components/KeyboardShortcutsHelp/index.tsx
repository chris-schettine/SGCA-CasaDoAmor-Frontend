import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import type { KeyboardShortcut } from '../../hooks/useKeyboardShortcuts';
import { formatShortcut } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

const KeyboardShortcutsHelp = ({ open, onClose, shortcuts }: KeyboardShortcutsHelpProps) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const borderColor = isDark ? 'rgba(148, 163, 184, 0.4)' : '#e0e0e0';
  const hoverBg = isDark ? 'rgba(148, 163, 184, 0.12)' : '#f5f5f5';
  const keyBg = isDark ? 'rgba(15, 23, 42, 0.7)' : '#f5f5f5';
  const keyBorder = isDark ? 'rgba(148, 163, 184, 0.5)' : '#ccc';
  const keyColor = isDark ? theme.palette.text.primary : 'inherit';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="keyboard-shortcuts-dialog-title"
    >
      <DialogTitle
        id="keyboard-shortcuts-dialog-title"
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <KeyboardIcon />
        <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
          Atalhos de Teclado
        </Typography>
        <IconButton
          aria-label="fechar"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.text.secondary,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {isMac
              ? 'Use ⌘ (Command) em vez de Ctrl no macOS'
              : 'Use Ctrl para ativar os atalhos'}
          </Typography>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${borderColor}` }}>
          <Table size="small" aria-label="tabela de atalhos de teclado">
            <TableBody>
              {shortcuts.map((shortcut, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: hoverBg },
                  }}
                >
                  <TableCell sx={{ width: '40%' }}>
                    <Typography variant="body2" fontWeight={500}>
                      {shortcut.description || 'Sem descrição'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      component="kbd"
                      sx={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        backgroundColor: keyBg,
                        border: `1px solid ${keyBorder}`,
                        borderRadius: '4px',
                        boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.1)',
                        color: keyColor,
                      }}
                    >
                      {formatShortcut(shortcut)}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Pressione{' '}
            <Box
              component="kbd"
              sx={{
                padding: '2px 6px',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                backgroundColor: keyBg,
                border: `1px solid ${keyBorder}`,
                borderRadius: '3px',
                color: keyColor,
              }}
            >
              ?
            </Box>
            {' '}ou{' '}
            <Box
              component="kbd"
              sx={{
                padding: '2px 6px',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                backgroundColor: keyBg,
                border: `1px solid ${keyBorder}`,
                borderRadius: '3px',
                color: keyColor,
              }}
            >
              {isMac ? '⌘' : 'Ctrl'}+K
            </Box>
            {' '}para abrir este painel novamente
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;
