import { Box, Button, Container, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { useState } from "react";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from "../../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../api/auth.service";
import { Link as RouterLink } from 'react-router-dom'; 
import { Link as MuiLink } from '@mui/material';
import { toastError, toastSuccess } from "../../utils/toast";
import { AnimatedPageScale } from "../../components/AnimatedPage";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cpfError, setCpfError] = useState('');

  
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



  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
   

  // { token, tipo, email, nome, tipoUsuario, expiresIn }
  const resp = await authService.login(cpf, password);
  const token = resp.token;
    let finalUser = {
      nome: resp.nome || resp.user?.nome || '',
      email: resp.email || resp.user?.email || '',
      cpf: resp.cpf || resp.user?.cpf || '',
      roles: resp.roles || resp.user?.roles || [],
      tipoUsuario: resp.tipoUsuario || resp.user?.tipoUsuario || resp.tipo || undefined,
    };

    try {
      const raw: any = await authService.getActiveSession();
      const normalizedUser = {
        nome: raw.nome || raw.user?.nome || finalUser.nome,
        email: raw.email || raw.user?.email || finalUser.email,
        cpf: raw.cpf || raw.user?.cpf || finalUser.cpf,
        roles: (raw.perfis && Array.isArray(raw.perfis)) ? raw.perfis.map((p: any) => p.nome) : (raw.roles || raw.user?.roles || finalUser.roles),
        tipoUsuario: raw.tipo || raw.tipoUsuario || raw.user?.tipoUsuario || finalUser.tipoUsuario,
      };
      finalUser = normalizedUser;
    } catch (err) {
      console.warn('[Login] Falha ao obter /auth/me após login - usando user retornado pelo login', err);
    }

    login(token, finalUser);

    toastSuccess('Login realizado com sucesso!');
    const from = location.state?.from?.pathname || '/';
    setTimeout(() => {
      navigate(from, { replace: true });
    }, 2000);

  } catch (error: any) {
    const  errorMessage = error.response?.data?.message || 'Erro desconhecido';
    toastError(errorMessage);
  }
  };
  return (
    <AnimatedPageScale>
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100vh", 
        m: 0, 
        p: 0, 
        backgroundColor: "#65ACD6" 
      }}>
      <Container sx={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        maxWidth: "450px", 
        width: "90%", 
        minHeight: "500px", 
        padding: "2rem 1.5rem", 
        backgroundColor: "#fff", 
        borderRadius: "8px", 
        boxShadow: "0 0 14px rgba(0, 0, 0, 0.45)" 
      }}>
        <Box
          component="img"
          src="logo1.png"
          alt="Logo Casa do Amor"
          sx={{ width: "180px", mb: 0.5 }}
        />

        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mt: 1 }}>
          Sistema de Gerenciamento da Casa do Amor
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
          Por favor, faça login para continuar.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          
          <TextField
            label="CPF"
            variant="outlined"
            value={cpf}
            onChange={handlerCpfChange}
            sx={{ 
              width: "300px", 
              height: "50px", 
              m: "10px",
              "& .MuiInputBase-root": {
                height: 54,
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
              width: "300px", 
              height: "50px", 
              m: "10px",
              "& .MuiInputBase-root": {
                height: 54,
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
            sx={{ 
              width: "300px", 
              mt: "20px", 
              p: "0.75rem", 
              fontWeight: "bold", 
              textTransform: "uppercase",
              '&:focus-visible': {
                outline: '3px solid #90caf9',
                outlineOffset: '2px',
              }
            }}
            type="submit"
            aria-label="Fazer login no sistema"
          >
            Login
          </Button>
        </Box>
        
        
         <Box sx={{ textAlign: 'center', marginTop: '1rem' }}>
          <MuiLink
            component={RouterLink}
            to="/forgot-password" 
            variant="body2"
            underline="hover"
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