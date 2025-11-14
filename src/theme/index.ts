import { createTheme } from '@mui/material/styles';

/**
 * Theme customizado para o Sistema de Gerenciamento Casa do Amor
 * 
 * Paleta de cores baseada na identidade visual da instituição
 * Tipografia e componentes padronizados para consistência em toda aplicação
 * Design responsivo mobile-first
 */
export const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,      // mobile portrait
      sm: 600,    // mobile landscape / tablet portrait
      md: 900,    // tablet landscape
      lg: 1200,   // desktop
      xl: 1536,   // large desktop
    },
  },
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
      fontSize: '1.75rem', // 28px mobile
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#09244B',
      '@media (min-width:600px)': {
        fontSize: '2rem', // 32px tablet+
      },
    },
    h2: {
      fontSize: '1.5rem', // 24px mobile
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#09244B',
      '@media (min-width:600px)': {
        fontSize: '1.75rem', // 28px tablet+
      },
    },
    h3: {
      fontSize: '1.25rem', // 20px mobile
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#000000',
      '@media (min-width:600px)': {
        fontSize: '1.5rem', // 24px tablet+
      },
    },
    h4: {
      fontSize: '1.125rem', // 18px mobile
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#000000',
      '@media (min-width:600px)': {
        fontSize: '1.25rem', // 20px tablet+
      },
    },
    h5: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#000000',
      '@media (min-width:600px)': {
        fontSize: '1.125rem', // 18px tablet+
      },
    },
    h6: {
      fontSize: '0.875rem', // 14px mobile
      fontWeight: 500,
      lineHeight: 1.5,
      color: '#000000',
      '@media (min-width:600px)': {
        fontSize: '1rem', // 16px tablet+
      },
    },
    body1: {
      fontSize: '0.875rem', // 14px mobile
      fontWeight: 400,
      lineHeight: 1.5,
      '@media (min-width:600px)': {
        fontSize: '1rem', // 16px tablet+
      },
    },
    body2: {
      fontSize: '0.8125rem', // 13px mobile
      fontWeight: 400,
      lineHeight: 1.43,
      '@media (min-width:600px)': {
        fontSize: '0.875rem', // 14px tablet+
      },
    },
    button: {
      fontSize: '0.8125rem', // 13px mobile
      fontWeight: 500,
      textTransform: 'none', // Remove uppercase automático
      '@media (min-width:600px)': {
        fontSize: '0.875rem', // 14px tablet+
      },
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
          padding: '8px 16px',
          fontSize: '0.8125rem',
          fontWeight: 500,
          boxShadow: 'none',
          minWidth: 'auto',
          '@media (min-width:600px)': {
            padding: '10px 24px',
            fontSize: '0.875rem',
          },
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '0.75rem',
          '@media (min-width:600px)': {
            padding: '8px 16px',
            fontSize: '0.8125rem',
          },
        },
        sizeLarge: {
          padding: '10px 20px',
          fontSize: '0.875rem',
          '@media (min-width:600px)': {
            padding: '12px 28px',
            fontSize: '0.9375rem',
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
          fontSize: '0.75rem',
          padding: '12px 8px',
          '@media (min-width:600px)': {
            fontSize: '0.875rem',
            padding: '16px',
          },
        },
        root: {
          padding: '12px 8px',
          fontSize: '0.8125rem',
          '@media (min-width:600px)': {
            padding: '16px',
            fontSize: '0.875rem',
          },
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
    // Melhorias de acessibilidade (WCAG 2.2 AA)
    MuiButtonBase: {
      styleOverrides: {
        root: {
          // Garante tamanho mínimo de toque (24x24px conforme WCAG 2.2)
          minHeight: '44px',
          minWidth: '44px',
          // Melhora indicador de foco
          '&:focus-visible': {
            outline: '3px solid #09244B',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          // Garante tamanho mínimo de toque mesmo para ícones
          minWidth: '44px',
          minHeight: '44px',
          '&:focus-visible': {
            outline: '3px solid #09244B',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '3px solid #09244B',
            outlineOffset: '2px',
            borderRadius: '2px',
          },
        },
      },
    },
    // Respeita preferência de movimento reduzido
    MuiCssBaseline: {
      styleOverrides: {
        '@global': {
          '@media (prefers-reduced-motion: reduce)': {
            '*': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
            },
          },
        },
      },
    },
  },
});

export default theme;
