import { Box, Button, Container, IconButton, InputAdornment, TextField, Typography, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { isAxiosError } from 'axios';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from "../../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../api/auth.service";
import { Link as RouterLink } from 'react-router-dom'; 
import { Link as MuiLink } from '@mui/material';
import { toastError, toastSuccess } from "../../utils/toast";
import { AnimatedPageScale } from "../../components/AnimatedPage";
import { useDesignTokens } from "../../design-tokens/utils";
import type { AuthSessionResponse } from "../../api/auth.dto";
import type { LoginResponse } from "../../api/auth.dto";
import type { UserType } from "../../contexts/AuthContext";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const tokens = useDesignTokens();
  
  interface LocationState {
    from?: { pathname: string };
  }
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cpfError, setCpfError] = useState('');

  // ✅ Redireciona para dashboard se já autenticado (evita mostrar tela de login)
  // PublicRoute também faz isso, mas este é um fallback adicional
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = locationState?.from?.pathname || '/patients';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, locationState]);

  
  // Mostrar e não mostrar senha
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  
  const handlerCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const onlyDigits = value.replace(/[^0-9]/g, '');

    setCpf(onlyDigits.slice(0, 11));
    
    // Validação em tempo real do CPF
    if (onlyDigits.length > 0 && onlyDigits.length < 11) {
      setCpfError('CPF deve ter 11 dígitos');
    } else {
      setCpfError('');
    }
  }



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response: LoginResponse = await authService.login(cpf, password);
      const { token } = response;
      const baseUser: UserType | undefined = response.user;

      const finalUser: UserType = {
        nome: response.nome ?? baseUser?.nome ?? '',
        email: response.email ?? baseUser?.email ?? '',
        cpf: response.cpf ?? baseUser?.cpf ?? '',
        roles: response.roles ?? baseUser?.roles ?? [],
        tipoUsuario: response.tipoUsuario ?? baseUser?.tipoUsuario ?? response.tipo,
      };

      // ✅ Salvar token ANTES de chamar /auth/me
      login(token, finalUser);

      // Aguardar sincronização do localStorage (persist middleware)
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
        // Atualizar com dados completos do /auth/me
        login(token, normalizedUser);
      } catch (err) {
        console.warn('[Login] Falha ao obter /auth/me após login - usando user retornado pelo login', err);
      }

      toastSuccess('Login realizado com sucesso!');
      
      // ✅ Redireciona imediatamente após login bem-sucedido
      // Usa locationState.from se disponível (tentativa de acesso a rota protegida)
      // Caso contrário, vai para dashboard principal (/patients)
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
    }
  };
  return (
    <AnimatedPageScale>
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh", 
        m: 0, 
        p: { xs: 2, sm: 3 }, 
        backgroundColor: theme.palette.mode === 'dark' 
          ? theme.palette.background.default 
          : tokens.brandColors.secondary[500],
        transition: 'background-color 0.3s ease',
      }}>
      <Container sx={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        maxWidth: { xs: "100%", sm: "450px" }, 
        width: "100%", 
        minHeight: { xs: "auto", sm: "500px" }, 
        padding: { xs: "1.5rem 1rem", sm: "2rem 1.5rem" }, 
        backgroundColor: theme.palette.background.paper, 
        borderRadius: `${tokens.borderRadius.base}px`, 
        boxShadow: theme.palette.mode === 'dark'
          ? '0 0 0 200px rgba(59, 95, 191, 0.15)'
          : '0 0 14px rgba(0, 0, 0, 0.15)',
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
      }}>
        <Box
          component="img"
          src="/logo3.png"
          alt="Logo Casa do Amor"
          sx={{ 
            width: { xs: "140px", sm: "180px" }, 
            maxHeight: 100, 
            objectFit: 'contain'
          }}
      />

        <Typography 
          variant="h5" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold', 
            mt: 1,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            textAlign: 'center'
          }}
        >
          Sistema de Gerenciamento da Casa do Amor
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.secondary', 
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
            sx={{ 
              "& .MuiInputBase-root": {
                height: { xs: 48, sm: 54 },
                borderRadius: 2,
              }
            }}
            required
            type="tel"
            autoComplete="username" 
            error={!!cpfError}
            helperText={cpfError || "Digite apenas números"}
            inputProps={{ 
              maxLength: 11,
              'aria-label': 'Digite seu CPF com 11 dígitos'
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
            sx={{ 
              "& .MuiInputBase-root": {
                height: { xs: 48, sm: 54 },
                borderRadius: 2,
              }
            }}
            autoComplete="current-password"
            inputProps={{
              'aria-label': 'Digite sua senha'
            }}
            slotProps={{
              input: {
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
              }
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
              textTransform: "none", // Remove uppercase para evitar sobreposição
              fontSize: { xs: '0.9375rem', sm: '1rem' },
              minHeight: { xs: '44px', sm: '48px' }, // WCAG 2.2 touch target
              letterSpacing: '0.02em',
              '&:focus-visible': {
                outline: `${tokens.focus.outlineWidth}px solid ${tokens.brandColors.primary[500]}`,
                outlineOffset: `${tokens.focus.outlineOffset}px`,
              },
              '&:hover': {
                backgroundColor: tokens.brandColors.primary[600],
              },
            }}
            type="submit"
            aria-label="Fazer login no sistema"
          >
            Entrar
          </Button>
        </Box>
        
        
         <Box sx={{ textAlign: 'center', marginTop: '1rem' }}>
          <MuiLink
            component={RouterLink}
            to="/forgot-password" 
            variant="body2"
            underline="hover"
            sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}
          >
            Esqueci minha senha
          </MuiLink>
        </Box>
      </Container>
    
      </Box>
    </AnimatedPageScale>
  )
};

export default Login;