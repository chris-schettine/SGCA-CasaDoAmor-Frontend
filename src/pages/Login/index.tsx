import { Box, TextField, Button, Typography, useTheme, alpha, Link as MuiLink, IconButton, InputAdornment, Container, CircularProgress, GlobalStyles } from "@mui/material";
import { useState, useEffect } from "react";
import { isAxiosError } from 'axios';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from "../../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../api/auth.service";
import { Link as RouterLink } from 'react-router-dom'; 
import { toastError, toastSuccess } from "../../utils/toast";
import { AnimatedPageScale } from "../../components/AnimatedPage";
import { useDesignTokens } from "../../design-tokens/utils";
import type { AuthSessionResponse } from "../../api/auth.dto";
import type { LoginResponse } from "../../api/auth.dto";
import type { UserType } from "../../contexts/AuthContext";


const formatCpf = (value: string) => {
    const cleanedValue = value.replace(/\D/g, '').substring(0, 11);
    
    if (cleanedValue.length <= 3) return cleanedValue;
    if (cleanedValue.length <= 6) return `${cleanedValue.substring(0, 3)}.${cleanedValue.substring(3)}`;
    if (cleanedValue.length <= 9) return `${cleanedValue.substring(0, 3)}.${cleanedValue.substring(3, 6)}.${cleanedValue.substring(6)}`;
    return `${cleanedValue.substring(0, 3)}.${cleanedValue.substring(3, 6)}.${cleanedValue.substring(6, 9)}-${cleanedValue.substring(9, 11)}`;
};



const LoginContent = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const tokens = useDesignTokens();
  const isDark = theme.palette.mode === 'dark';
  const backgroundGradient = isDark
    ? `linear-gradient(135deg,
        ${tokens.brandColors.primary[700]} 0%,
        ${tokens.brandColors.secondary[700]} 45%,
        ${alpha(tokens.brandColors.dark[500], 0.85)} 100%)`
    : `linear-gradient(135deg,
        ${tokens.brandColors.primary[500]} 0%,
        ${tokens.brandColors.secondary[400]} 45%,
        ${alpha(tokens.brandColors.light[200], 0.9)} 100%)`;
  const backgroundFallback = isDark ? tokens.brandColors.dark[700] : tokens.brandColors.primary[500];
  
  interface LocationState {
    from?: { pathname: string };
  }
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cpfError, setCpfError] = useState('');
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = locationState?.from?.pathname || '/patients';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, locationState]);


  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  

  const handlerCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatCpf(rawValue);
    const onlyDigits = rawValue.replace(/\D/g, '');

    setCpf(formattedValue);
    
    if (onlyDigits.length > 0 && onlyDigits.length < 11) {
      setCpfError('CPF deve ter 11 dígitos');
    } else {
      setCpfError('');
    }
  }


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); 
    
    const rawCpf = cpf.replace(/\D/g, ''); 
    
    if (rawCpf.length !== 11) {
        setCpfError('CPF deve ter 11 dígitos');
        setLoading(false);
        return;
    }

    try {
      const response: LoginResponse = await authService.login(rawCpf, password);
      const { token } = response;
      const baseUser: UserType | undefined = response.user;

      const finalUser: UserType = {
        nome: response.nome ?? baseUser?.nome ?? '',
        email: response.email ?? baseUser?.email ?? '',
        cpf: response.cpf ?? baseUser?.cpf ?? '',
        roles: response.roles ?? baseUser?.roles ?? [],
        tipoUsuario: response.tipoUsuario ?? baseUser?.tipoUsuario ?? response.tipo,
      };

      login(token, finalUser);

      await new Promise((resolve) => setTimeout(resolve, 100));

      try {
        const raw: AuthSessionResponse = await authService.getActiveSession();
        const normalizedUser: UserType = {
          nome: raw.nome ?? raw.user?.nome ?? finalUser.nome,
          email: raw.email ?? raw.user?.email ?? finalUser.email,
          cpf: raw.cpf ?? raw.user?.cpf ?? finalUser.cpf,
          roles: Array.isArray(raw.perfis)
            ? raw.perfis
                .map((perfil) => perfil?.nome)
                .filter((roleName): roleName is string => Boolean(roleName))
            : raw.roles ?? raw.user?.roles ?? finalUser.roles,
          tipoUsuario: raw.tipo ?? raw.tipoUsuario ?? raw.user?.tipoUsuario ?? finalUser.tipoUsuario,
        };

        login(token, normalizedUser);
      } catch (err) {
        console.warn('[Login] Falha ao obter /auth/me após login - usando user retornado pelo login', err);
      }

      toastSuccess('Login realizado com sucesso!');
      
      const redirectTo = locationState?.from?.pathname || '/patients';
      navigate(redirectTo, { replace: true });
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const errorMessage = typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : 'Erro desconhecido';
        toastError(errorMessage);
      } else if (error instanceof Error) {
        toastError(error.message);
      } else {
        toastError('Erro desconhecido');
      }
    } finally {
        setLoading(false); 
    }
  };
  return (
      <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', p: 0, color: 'text.primary' }}>
        <AnimatedPageScale>
      <GlobalStyles styles={{
        html: { background: 'transparent' },
        body: { background: 'transparent' },
        '#root': { background: 'transparent' },
      }} />
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage: backgroundGradient,
          backgroundColor: backgroundFallback,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          pointerEvents: 'none',
        }}
      />
      <Box sx={{ 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        m: 0, 
        p: { xs: 1, sm: 2 }, 
        position: 'relative',
        overflow: 'hidden',
        background: 'transparent',
        color: theme.palette.text.primary,
        WebkitTextFillColor: theme.palette.text.primary,
        transition: 'background-color 0.3s ease',
        flexDirection: 'column', 
      }}>
      <Container sx={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        maxWidth: { xs: "100%", sm: "450px" }, 
        width: "100%", 
        minHeight: "auto",
        padding: { xs: "1.25rem 1rem", sm: "1.5rem 1.25rem" }, 
        backgroundColor: theme.palette.background.paper, 
        borderRadius: `${tokens.borderRadius.base}px`, 
        boxShadow: theme.palette.mode === 'dark'
          ? '0 12px 32px rgba(0, 0, 0, 0.45)'
          : '0 12px 40px rgba(0, 0, 0, 0.2)',
        borderTop: `4px solid ${tokens.brandColors.primary[500]}`, 
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
        position: 'relative',
        zIndex: 1,
      }}>
        <Box
          component="img"
          src="/logo3.png"
          alt="Logo Casa do Amor"
          sx={{ 
            width: { xs: "140px", sm: "180px" }, 
            maxHeight: 100, 
            objectFit: 'contain',

            marginBottom: theme.spacing(1) 
          }}
      />

        <Typography 
          variant="h5" 
          component="h1" 
          sx={{ 
            fontWeight: 700, 
            mt: 0.5, 
            mb: 1.5, 
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            textAlign: 'center',
            color: theme.palette.text.primary,
            WebkitTextFillColor: theme.palette.text.primary,
          }}
        >
          Sistema de Gerenciamento da Casa do Amor
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: theme.palette.text.primary,
            WebkitTextFillColor: theme.palette.text.primary,
            mb: 2,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            textAlign: 'center'
          }}
        >
          Por favor, faça login para continuar.
        </Typography>

        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '1rem',
            width: '100%',
            maxWidth: '300px'
          }}
        >
          
          <TextField
            label="CPF"
            variant="outlined"
            value={cpf} 
            onChange={handlerCpfChange}
            fullWidth
            required
            type="tel" 
            autoComplete="username"
            error={!!cpfError}
            helperText={cpfError || "Formato: 000.000.000-00"} 
            FormHelperTextProps={{
              sx: {
                color: theme.palette.text.primary,
                WebkitTextFillColor: theme.palette.text.primary,
                opacity: 1,
              },
            }}
            inputProps={{ 
              maxLength: 14, 
              'aria-label': 'Digite seu CPF com 11 dígitos'
            }}
            InputLabelProps={{
              sx: {
                color: theme.palette.text.primary,
                WebkitTextFillColor: theme.palette.text.primary,
                opacity: 1,
                '&.Mui-focused': { color: theme.palette.text.primary },
              },
            }}
            sx={{ 
              "& .MuiInputBase-root": {
                height: { xs: 48, sm: 54 },
                borderRadius: 2,
                color: theme.palette.text.primary,
                WebkitTextFillColor: theme.palette.text.primary,
                opacity: 1,
              }
            }}
          />

          <TextField
            label="Senha"
            variant="outlined"
            fullWidth
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            inputProps={{
              'aria-label': 'Digite sua senha'
            }}
            InputLabelProps={{
              sx: {
                color: theme.palette.text.primary,
                WebkitTextFillColor: theme.palette.text.primary,
                opacity: 1,
                '&.Mui-focused': { color: theme.palette.text.primary },
              },
            }}
            sx={{ 
              "& .MuiInputBase-root": {
                height: { xs: 48, sm: 54 },
                borderRadius: 2,
                color: theme.palette.text.primary,
                WebkitTextFillColor: theme.palette.text.primary,
                opacity: 1,
              }
            }}
            InputProps={{ 
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ 
              mt: 2.5, 
              py: { xs: 1.25, sm: 1.5 }, 
              px: 3,
              fontWeight: 600, 
              textTransform: "none", 
              fontSize: { xs: '0.9375rem', sm: '1rem' },
              minHeight: { xs: '44px', sm: '48px' },
              letterSpacing: '0.02em',
              color: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
              WebkitTextFillColor: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
              backgroundColor: `${theme.palette.primary.main} !important`,
              opacity: 1,
              '&:focus-visible': {
                outline: `${tokens.focus.outlineWidth}px solid ${tokens.brandColors.primary[500]}`,
                outlineOffset: `${tokens.focus.outlineOffset}px`,
              },
              '&:hover': {
                backgroundColor: `${theme.palette.primary.dark} !important`,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
              },
            }}
            type="submit"
            aria-label="Fazer login no sistema"
            data-testid="btn-login"
            disabled={loading} 
          >

            {loading ? <CircularProgress size={24} color="inherit" /> : <span style={{ color: theme.palette.getContrastText(theme.palette.primary.main), WebkitTextFillColor: theme.palette.getContrastText(theme.palette.primary.main), fontWeight: 600 }}>Entrar</span>}
          </Button>
        </Box>
        
        
         <Box sx={{ textAlign: 'center', marginTop: '1rem' }}>
          <MuiLink
            component={RouterLink}
            to="/forgot-password" 
            variant="body2"
            underline="hover"
            sx={{ 
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                color: tokens.brandColors.primary[500], 
                fontWeight: 500,
                padding: '8px 0', 
                display: 'inline-block' 
            }}
          >
            Esqueci minha senha
          </MuiLink>
        </Box>
      </Container>
    
      <Box sx={{ 
        mt: 4, 
        textAlign: 'center', 
        color: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.7) : alpha(theme.palette.common.black, 0.65),
        position: 'absolute',
        bottom: 10,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
      }}>
        {/* IMPLEMENTAÇÃO: Segurança (Link de Privacidade) */}
        <MuiLink
            component={RouterLink}
            to="/privacy-policy" 
            variant="caption"
            underline="hover"
            sx={{ 
                color: 'inherit',
                fontWeight: 500,
                fontSize: '0.75rem',
                padding: '4px 8px',
                display: 'inline-block'
            }}
          >
            Política de Privacidade
          </MuiLink>
        <Typography variant="caption">
            © {new Date().getFullYear()} Sistema de Gerenciamento da Casa do Amor | UESB
        </Typography>
      </Box>
      </Box>

        </AnimatedPageScale>
      </Box>
  )
};

const Login = () => (
  <LoginContent />
);

export default Login;
