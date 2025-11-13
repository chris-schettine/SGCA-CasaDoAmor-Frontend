import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Box, Typography } from '@mui/material';

interface LoadingBackdropProps {
  message?: string;
}

export default function LoadingBackdrop({ message = 'Carregando...' }: LoadingBackdropProps) {
  if (import.meta.env.DEV) console.log('[LoadingBackdrop] mounted', { message });

  return (
    <Backdrop
      sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
      open={true}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 2 
        }}
      >
        <CircularProgress color="inherit" aria-label={message} />
        <Typography 
          variant="h6" 
          component="p" 
          sx={{ 
            color: '#fff',
            fontWeight: 500,
            textAlign: 'center'
          }}
        >
          {message}
        </Typography>
      </Box>
    </Backdrop>
  );
}
