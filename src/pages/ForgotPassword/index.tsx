import { Box, Button, Container, TextField, Typography, CircularProgress, useTheme, Paper, Stack } from "@mui/material";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/auth.service";
import { toastSuccessCritical, toastErrorCritical } from "../../utils/toast";


// inline styles removed in favor of theme tokens and responsive Paper

const ForgotPassword = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {

      await authService.forgotPassword({ email }); //
      
      toastSuccessCritical("Se este e-mail estiver cadastrado, um link de recuperação foi enviado.");
      
      setTimeout(() => {
        navigate('/login'); 
      }, 3000);

    } catch (error: unknown) {
      console.error("Erro ao solicitar recuperação:", error);
      const message = isAxiosError(error)
        ? error.response?.data?.message ?? "Erro ao processar a solicitação."
        : "Erro ao processar a solicitação.";
      toastErrorCritical(message);
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 8, bgcolor: theme.palette.background.default }}>
      <Container maxWidth="sm">
        <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 2, boxShadow: theme.custom.shadows.md, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: theme.palette.background.paper }}>
          <Stack alignItems="center" spacing={1}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700, textAlign: 'center' }}>Recuperar Senha</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Digite seu e-mail para enviarmos um link de recuperação.</Typography>
          </Stack>

          <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
          <Button type="submit" variant="contained" disabled={isLoading} fullWidth sx={{ mt: 1, py: 1.25 }}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Link'}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Button variant="text" size="small" onClick={() => navigate('/login')} sx={{ color: theme.palette.text.secondary }}>
              Voltar ao login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;