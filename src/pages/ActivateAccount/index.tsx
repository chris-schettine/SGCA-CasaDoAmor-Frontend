import { Box, Button, Container, TextField, Typography, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../api/auth.service";
import PasswordStrengthIndicator from "../../components/PasswordStrengthIndicator";
import { toastError, toastSuccess } from "../../utils/toast";


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

// Hook p n=...)
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


  
  // Pega o token da URL assim que a página carrega
  useEffect(() => {
    const urlToken = query.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      toastError("Token de ativação não encontrado na URL.");
    }
  }, [query]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      toastError("As novas senhas não coincidem.");
      return;
    }
    
    if (!token) {
      toastError("Token de ativação inválido.");
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
      
      toastSuccess("Conta ativada com sucesso! Você já pode fazer login com sua nova senha.");
      
      setTimeout(() => {
        navigate('/login'); // Redireciona para o login
      }, 3000);

    } catch (error: any) {
      console.error("Erro ao ativar conta:", error);
      const message = error.response?.data?.message || "Erro ao processar a ativação. O token pode estar expirado ou os dados incorretos.";
      toastError(message);
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
        
        <Box>
          <TextField
            label="Nova Senha"
            variant="outlined"
            fullWidth
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            type="password"
            required
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
          required
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || !token}
          fullWidth
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Ativar Conta"}
        </Button>
      </Container>
    </Box>
  );
};

export default ActivateAccountPage;