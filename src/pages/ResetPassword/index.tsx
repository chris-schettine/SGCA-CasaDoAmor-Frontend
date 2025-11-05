import { Alert, Box, Button, Container, Snackbar, TextField, Typography, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../api/auth.service";
import PasswordStrengthIndicator from "../../components/PasswordStrengthIndicator";

const BoxStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: '#f5f5f5',
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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const query = useQuery(); 

  const [token, setToken] = useState<string | null>(null);

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };


  useEffect(() => {
    const urlToken = query.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      showSnackbar("Token de redefinição inválido ou ausente na URL.", "error");
    }
  }, [query]); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      showSnackbar("As senhas não coincidem.", "error");
      return;
    }

    if (!token) {
      showSnackbar("Token de redefinição inválido ou ausente.", "error");
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.resetPassword({ token, novaSenha }); 
      
      showSnackbar("Senha redefinida com sucesso! Você já pode fazer login.", "success");
      
      setTimeout(() => {
        navigate('/login'); 
      }, 3000);

    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      const message = error.response?.data?.message || "Erro ao processar a solicitação. O token pode estar expirado.";
      showSnackbar(message, "error");
      setIsLoading(false);
    }
  };

  return (
    <Box sx={BoxStyles}>
      <Container sx={ContainerFormStyles}>
        <Typography variant="h5" component="h1" sx={{ textAlign: 'center' }}>
          Redefinir Senha
        </Typography>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Digite sua nova senha.
        </Typography>

        <Box>
          <TextField
            label="Nova Senha"
            variant="outlined"
            fullWidth
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            type="password"
          />
          <PasswordStrengthIndicator password={novaSenha} />
        </Box>

        <TextField
          label="Confirmar Nova Senha"
          variant="outlined"
          fullWidth
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          type="password"
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          
          disabled={isLoading || !token} 
          fullWidth
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Salvar Nova Senha"}
        </Button>
      </Container>
      
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

export default ResetPasswordPage;