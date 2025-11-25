import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  icon = <InboxIcon sx={{ fontSize: 80 }} />, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
        color: 'text.primary',
      }}
    >
      <Box
        sx={{
          color: 'action.disabled',
          mb: 2,
        }}
      >
        {icon}
      </Box>
      
      <Typography 
        variant="h6" 
        component="h2" 
        sx={{ 
          mb: 1,
          color: 'text.primary',
          fontWeight: 500,
        }}
      >
        {title}
      </Typography>
      
      {description && (
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 3,
            maxWidth: 400,
            color: 'text.primary',
          }}
        >
          {description}
        </Typography>
      )}
      
      {actionLabel && onAction && (
        <Button 
          variant="contained" 
          onClick={onAction}
          sx={{
            textTransform: 'none',
            px: 3,
            backgroundColor: (theme) => `${theme.palette.primary.main} !important`,
            color: (theme) => `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
            WebkitTextFillColor: (theme) => `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
            '&:hover': {
              backgroundColor: (theme) => `${theme.palette.primary.dark} !important`,
            },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
