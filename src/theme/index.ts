import { createTheme } from '@mui/material/styles';

/**
 * Theme customizado para o Sistema de Gerenciamento Casa do Amor
 * 
 * Paleta de cores baseada na identidade visual da instituição
 * Tipografia e componentes padronizados para consistência em toda aplicação
 */
export const theme = createTheme({
  palette: {
    primary: {
      main: '#09244B', // Casa do Amor Blue (azul escuro institucional)
      light: '#0C2F58',
      dark: '#061830',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1976d2', // Material Blue
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#d32f2f', // Material Red
      light: '#ef5350',
      dark: '#c62828',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#ed6c02', // Material Orange
      light: '#ff9800',
      dark: '#e65100',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#0288d1', // Material Light Blue
      light: '#03a9f4',
      dark: '#01579b',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2e7d32', // Material Green
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
      disabled: '#999999',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem', // 32px
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#09244B',
    },
    h2: {
      fontSize: '1.75rem', // 28px
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#09244B',
    },
    h3: {
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#000000',
    },
    h4: {
      fontSize: '1.25rem', // 20px
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#000000',
    },
    h5: {
      fontSize: '1.125rem', // 18px
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#000000',
    },
    h6: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#000000',
    },
    body1: {
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.43,
    },
    button: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      textTransform: 'none', // Remove uppercase automático
    },
  },
  spacing: 8, // Base de 8px para todos os espaçamentos
  shape: {
    borderRadius: 8, // Border radius padrão
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Remove uppercase
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#09244B',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#09244B',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#09244B',
          color: '#FFFFFF',
          fontWeight: 600,
          fontSize: '0.875rem',
        },
        root: {
          padding: '16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: '#fafafa',
          },
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
        elevation1: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;
