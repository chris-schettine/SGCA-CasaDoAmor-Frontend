import { Alert, Box, Button, Container, IconButton, InputAdornment, Snackbar, TextField } from "@mui/material";
import { BoxStyles, ButtonStyles, ContainerLoginStyles, imgStyles, TextFieldStyles } from "./styles";
import { useState } from "react";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from "../../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../api/auth.service";
import { Link as RouterLink } from 'react-router-dom'; 
import { Link as MuiLink } from '@mui/material'; 

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');


  // Mostrar e não mostrar senha
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSnackbarClose = (reason: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handlerCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const onlyDigits = value.replace(/[^0-9]/g, '');

    setCpf(onlyDigits.slice(0, 11));
  }

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
   

    // backend returns an object like:
    // { token, tipo, email, nome, tipoUsuario, expiresIn }
    const resp = await authService.login(cpf, password);

    // Se o backend informar que 2FA é necessário, redirecionamos para a tela de verificação.
    // Ex: { requires2FA: true }
    if (resp?.requires2FA) {
      sessionStorage.setItem('cpfFor2FA', cpf.replace(/\D/g, ''));
      showSnackbar('Código 2FA enviado — verifique seu e-mail.', 'info');
      navigate('/login/verify-2fa');
      return;
    }

    const token = resp.token;
    const user = {
      nome: resp.nome || resp.user?.nome || '',
      email: resp.email || resp.user?.email || '',
      cpf: resp.cpf || resp.user?.cpf || '',
      roles: resp.roles || resp.user?.roles || [],
      tipoUsuario: resp.tipoUsuario || resp.user?.tipoUsuario || resp.tipo || undefined,
    };

    login(token, user);

    showSnackbar('Login realizado com sucesso!', 'success');
    const from = location.state?.from?.pathname || '/';
    setTimeout(() => {
      navigate(from, { replace: true });
    }, 2000);

  } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erro desconhecido";
      const status = error.response?.status;

      // (AJUSTE "Código 2FA necessário" para a mensagem exata do backend)
      if (status === 401 && errorMessage.includes("Código 2FA necessário")) { 
        
        // Salva o CPF limpo para a próxima tela usar
        sessionStorage.setItem('cpfFor2FA', cpf.replace(/\D/g, '')); 
        
        // Redireciona para a tela de verificação
        navigate('/login/verify-2fa'); 
        
      } else {
        // Se for outro erro (ex: senha errada), mostra a mensagem
        showSnackbar(errorMessage, "error");
      }
    }
  };
  return (
    <Box css={BoxStyles}>
      <Container css={ContainerLoginStyles} component="form" onSubmit={handleSubmit}>
        <img
          src="logo1.png"
          alt="Logo Casa do Amor"
          css={imgStyles}
        />

        {/* Campo de Username */}
        <TextField
          label="CPF"
          variant="outlined"
          value={cpf}
          //onChange={(e) => setCpf(e.target.value)}
          onChange={handlerCpfChange}
          css={TextFieldStyles}
          required
          type="tel"
        />

        {/* Campo de Password */}
        <TextField
          label="Senha"
          variant="outlined"
          fullWidth
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          css={TextFieldStyles}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
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
          css={ButtonStyles}
          type="submit"
          onClick={handleSubmit}
        >
          Login
        </Button>
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

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={(_, reason) => handleSnackbarClose(reason as string)}
      >
        <Alert
          onClose={() => handleSnackbarClose('clickaway')}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
};

export default Login;