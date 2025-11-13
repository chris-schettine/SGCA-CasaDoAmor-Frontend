import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import { ConsentColors } from '../../consent/config/designTokens';

const BootstrapDialog = styled(Dialog)(({ theme }: { theme: Theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirmar', // Default text
  cancelButtonText = 'Cancelar',   // Default text
}) => {
  return (
    <BootstrapDialog
      onClose={onClose}
      aria-labelledby="confirmation-dialog-title"
      open={open}
      maxWidth="sm" // Ajuste o tamanho conforme necessário
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="confirmation-dialog-title">
        <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: ConsentColors.text.primary }}>
          {title}
        </Typography>
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme: Theme) => ({ // Use Theme para tipagem aqui também
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <Typography gutterBottom sx={{ fontSize: '0.9rem', lineHeight: 1.6, color: ConsentColors.text.secondary }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1.5 }}>
        <Button
          autoFocus
          onClick={onConfirm}
          variant="contained"
          color="primary"
          sx={{
            height: 44,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.9rem',
            backgroundColor: ConsentColors.primary.main,
            color: ConsentColors.primary.contrast,
            '&:hover': { backgroundColor: ConsentColors.primary.dark },
          }}
        >
          {confirmButtonText}
        </Button>
        <Button
          onClick={onClose}
          color="error"
          variant="outlined"
          sx={{
            height: 44,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.9rem',
          }}
        >
          {cancelButtonText}
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default ConfirmationDialog;