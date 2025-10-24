import { Alert, Box, Button, Container, Snackbar, TextField, Typography, CircularProgress, Link as MuiLink, type AlertColor, type SnackbarCloseReason } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../api/auth.service";
import { useAuth } from "../../hooks/useAuth";

// --- Estilos Básicos ---
const BoxStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: '#f5f5f5', // Ou sua cor de fundo padrão
};

const ContainerFormStyles = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
  width: { xs: '90%', sm: '400px' },
};
// --- Fim dos Estilos ---

// Hook para ler parâmetros de busca (ex: ?token=...)
function useQuery() {
  return new URLSearchParams(useLocation().search);
}


const LoginVerify2FAPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Função do AuthContext
  
  const [cpf, setCpf] = useState<string | null>(null);
  const [codigo, setCodigo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // --- Estados e Funções do Snackbar ---
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

  const showSnackbar = useCallback((message: string, severity: AlertColor) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event, 
    reason?: SnackbarCloseReason 
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };
 
  useEffect(() => {
    const cpfSalvo = sessionStorage.getItem('cpfFor2FA');
    if (cpfSalvo) {
      setCpf(cpfSalvo);
    } else {
      
      showSnackbar("Erro: CPF não encontrado para verificação 2FA. Retornando ao login.", "error");
      setTimeout(() => navigate('/login'), 2000); 
    }
  }, [navigate, showSnackbar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpf) return;
    setIsLoading(true);

    try {
     
      const resp = await authService.verify2FA({ cpf, codigo });

      
      const token = resp.token;
      
     const user = {
        nome: resp.user?.nome || '', 
        email: resp.user?.email || '', 
        cpf: cpf || '', 
        roles: resp.user?.roles || [], 
        tipoUsuario: resp.user?.tipoUsuario || undefined, 
     };

   
      sessionStorage.removeItem('cpfFor2FA');

     
      login(token, user); 
      
      showSnackbar("Código verificado com sucesso!", "success");
      
      setTimeout(() => navigate('/'), 1500);

    } catch (error: any) {
      console.error("Erro ao verificar 2FA:", error);
      const message = error.response?.data?.message || "Código inválido ou expirado.";
      showSnackbar(message, "error");
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!cpf) return; 
    setResendLoading(true);
    try {
        await authService.resend2FA(); //
        showSnackbar("Novo código enviado para seu e-mail.", "success");
    } catch (error: any) {
        console.error("Erro ao reenviar código:", error);
        const message = error.response?.data?.message || "Erro ao reenviar código.";
        showSnackbar(message, "error");
    } finally {
        setResendLoading(false);
    }
};

  return (
    <Box sx={BoxStyles}>
      <Container sx={ContainerFormStyles} component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" component="h1" sx={{ textAlign: 'center' }}>
          Verificação de Dois Fatores
        </Typography>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Digite o código de 6 dígitos enviado para seu e-mail.
        </Typography>

        <TextField
          label="Código de 6 dígitos"
          variant="outlined"
          fullWidth
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))} // Permite apenas números, max 6
          inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
          required
          error={codigo.length > 0 && codigo.length < 6}
          helperText={codigo.length > 0 && codigo.length < 6 ? 'Código deve ter 6 dígitos' : ''}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || !cpf || codigo.length !== 6}
          fullWidth
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Verificar Código"}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 1 }}>
            <MuiLink component="button" type="button" onClick={handleResendCode} disabled={resendLoading || !cpf} variant="body2">
                {resendLoading ? 'Reenviando...' : 'Reenviar código'}
            </MuiLink>
        </Box>
      </Container>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginVerify2FAPage;