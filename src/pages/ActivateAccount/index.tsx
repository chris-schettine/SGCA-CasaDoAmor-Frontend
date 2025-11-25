import { Box, Button, Container, TextField, Typography, CircularProgress, useTheme, Paper, Stack } from "@mui/material";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../api/auth.service";
import PasswordStrengthIndicator from "../../components/PasswordStrengthIndicator";
import { toastError, toastSuccess } from "../../utils/toast";
import { isAxiosError } from "axios";


// Styles moved into the component to use theme tokens

// Hook p n=...)
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ActivateAccountContent = () => {
  const navigate = useNavigate();
  const theme = useTheme();
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

    } catch (error: unknown) {
      console.error("Erro ao ativar conta:", error);
      const message = isAxiosError(error)
        ? error.response?.data?.message ?? "Erro ao processar a ativação. O token pode estar expirado ou os dados incorretos."
        : "Erro ao processar a ativação. O token pode estar expirado ou os dados incorretos.";
      toastError(message);
      setIsLoading(false);
    }
  };

  return (
      <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', p: 3, color: 'text.primary' }}>
        <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 8,
        bgcolor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 2,
            boxShadow: theme.custom.shadows.md,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Stack alignItems="center" spacing={1}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700, textAlign: 'center' }}>
              Ativar Conta
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Crie sua senha e ative seu acesso ao sistema da Casa do Amor.
            </Typography>
          </Stack>

        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          required
        />
        
        <TextField
          label="Senha Temporária (do email)"
          variant="outlined"
          fullWidth
          value={senhaTemporaria}
          onChange={(e) => setSenhaTemporaria(e.target.value)}
          type="password"
          autoComplete="current-password"
          required
        />
        
        <Box sx={{ position: 'relative' }}>
          <TextField
            label="Nova Senha"
            variant="outlined"
            fullWidth
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            type="password"
            autoComplete="new-password"
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
          autoComplete="new-password"
          required
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || !token}
          fullWidth
          sx={{
            mt: 1,
            py: 1.25,
            '&:focus-visible': {
              outline: (theme) => `3px solid ${theme.palette.primary.light}`,
              outlineOffset: '2px',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Ativar Conta"}
        </Button>

          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={() => navigate('/login')}
              size="small"
              sx={{ color: theme.palette.text.secondary }}
            >
              Já tem conta? Fazer login
            </Button>
          </Box>
        </Paper>
      </Container>
        </Box>
      </Box>
  );
};

const ActivateAccountPage = () => (
    <ActivateAccountContent />
);

export default ActivateAccountPage;
