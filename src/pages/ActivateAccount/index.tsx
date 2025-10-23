import { Alert, Box, Button, Container, Snackbar, TextField, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../api/auth.service";


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

// Hook para ler parâmetros de busca (ex: ?token=...)
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ActivateAccountPage = () => {
  const navigate = useNavigate();
  const query = useQuery();
  
  const [token, setToken] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [senhaTemporaria, setSenhaTemporaria] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  // Pega o token da URL assim que a página carrega
  useEffect(() => {
    const urlToken = query.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      showSnackbar("Token de ativação não encontrado na URL.", "error");
    }
  }, [query]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      showSnackbar("As novas senhas não coincidem.", "error");
      return;
    }
    
    if (!token) {
      showSnackbar("Token de ativação inválido.", "error");
      return;
    }

    setIsLoading(true);
    
    try {
      // Chama o serviço correto
      await authService.activateAccount({
        token,
        email,
        senhaTemporaria,
        novaSenha,
        confirmarSenha,
      });
      
      showSnackbar("Conta ativada com sucesso! Você já pode fazer login com sua nova senha.", "success");
      
      setTimeout(() => {
        navigate('/login'); // Redireciona para o login
      }, 3000);

    } catch (error: any) {
      console.error("Erro ao ativar conta:", error);
      const message = error.response?.data?.message || "Erro ao processar a ativação. O token pode estar expirado ou os dados incorretos.";
      showSnackbar(message, "error");
      setIsLoading(false);
    }
  };

  return (
    <Box sx={BoxStyles}>
      <Container sx={ContainerFormStyles} component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" component="h1" sx={{ textAlign: 'center' }}>
          Ativar Conta e Definir Senha
        </Typography>

        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        
        <TextField
          label="Senha Temporária (do email)"
          variant="outlined"
          fullWidth
          value={senhaTemporaria}
          onChange={(e) => setSenhaTemporaria(e.target.value)}
          type="password"
          required
        />
        
        <TextField
          label="Nova Senha"
          variant="outlined"
          fullWidth
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          type="password"
          required
        />
        
        <TextField
          label="Confirmar Nova Senha"
          variant="outlined"
          fullWidth
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          type="password"
          required
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || !token}
          fullWidth
        >
          {isLoading ? "Ativando..." : "Ativar Conta"}
        </Button>
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

export default ActivateAccountPage;