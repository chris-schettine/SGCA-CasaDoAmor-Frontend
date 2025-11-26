import * as React from 'react';
import Button, { type ButtonProps } from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import StandardDialog from '../StandardDialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';

const BootstrapDialog = styled(StandardDialog)(({ theme }: { theme: Theme }) => ({
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
  confirmButtonProps?: ButtonProps;
  dialogTitleId?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirmar', // Default text
  cancelButtonText = 'Cancelar',   // Default text
  confirmButtonProps,
  dialogTitleId = 'confirmation-dialog-title',
}) => {
  return (
    <BootstrapDialog
      onClose={onClose}
      aria-labelledby={dialogTitleId}
      open={open}
      maxWidth="sm" // Ajuste o tamanho conforme necessário
      fullWidth
      disableEnforceFocus={false}
    >
      <DialogTitle sx={{ m: 0, p: 2 }} id={dialogTitleId}>
        {title}
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
      <DialogContent dividers aria-live="polite">
        <Typography gutterBottom>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={onConfirm}
          variant="contained"
          color="primary"
          data-testid="dialog-confirm"
          {...confirmButtonProps}
        >
          {confirmButtonText}
        </Button>
        <Button onClick={onClose} color="error" variant="outlined" data-testid="dialog-cancel">
          {cancelButtonText}
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default ConfirmationDialog;
