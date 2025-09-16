import { Alert, Box, Button, Container, IconButton, InputAdornment, Snackbar, TextField } from "@mui/material";
import { BoxStyles, ButtonStyles, ContainerLoginStyles, imgStyles, TextFieldStyles } from "./styles";
import { useState } from "react";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from "../../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { loginApi } from "../../api/api";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
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

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token } = await loginApi({ username, roles: [] }, password);
      login(token, { username, roles: [] });
      showSnackbar("Login realizado com sucesso!", "success");
      const from = location.state?.from?.pathname || "/";
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 2000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        showSnackbar(error.message, "error");
      } else {
        showSnackbar("Ocorreu um erro desconhecido.", "error");
      }
    }
  };

  return (
    <Box css={BoxStyles}>
      <Container css={ContainerLoginStyles}>
        <img
          src="logo1.png"
          alt="Logo Casa do Amor"
          css={imgStyles}
        />

        {/* Campo de Username */}
        <TextField
          label="Nome"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          css={TextFieldStyles} // Passa o tema para a função de estilo
        />

        {/* Campo de Password */}
        <TextField
          label="Senha"
          variant="outlined"
          fullWidth
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          onClick={handleSubmit}
        >
          Login
        </Button>
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