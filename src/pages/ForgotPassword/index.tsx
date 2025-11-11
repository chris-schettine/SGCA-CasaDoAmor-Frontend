import { Box, Button, Container, TextField, Typography, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/auth.service";
import { toastSuccessCritical, toastErrorCritical } from "../../utils/toast";


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

const ForgotPassword = () => {
  const navigate = useNavigate();
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

    } catch (error: any) {
      console.error("Erro ao solicitar recuperação:", error);
      const message = error.response?.data?.message || "Erro ao processar a solicitação.";
      toastErrorCritical(message);
      setIsLoading(false);
    }
  };

  return (
    <Box sx={BoxStyles}>
      <Container sx={ContainerFormStyles}>
        <Typography variant="h5" component="h1" sx={{ textAlign: 'center' }}>
          Recuperar Senha
        </Typography>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Digite seu e-mail para enviarmos um link de recuperação.
        </Typography>

        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Enviar Link"}
        </Button>
      </Container>
    </Box>
  );
};

export default ForgotPassword;