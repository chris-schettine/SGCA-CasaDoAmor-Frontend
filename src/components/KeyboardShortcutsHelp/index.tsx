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
            color: (theme) => theme.palette.grey[500],
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

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
          <Table size="small" aria-label="tabela de atalhos de teclado">
            <TableBody>
              {shortcuts.map((shortcut, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: '#f5f5f5' },
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
                        backgroundColor: '#f5f5f5',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
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
                backgroundColor: '#f5f5f5',
                border: '1px solid #ccc',
                borderRadius: '3px',
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
                backgroundColor: '#f5f5f5',
                border: '1px solid #ccc',
                borderRadius: '3px',
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
