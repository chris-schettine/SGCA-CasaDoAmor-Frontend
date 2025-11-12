import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { authService } from "../../api/auth.service";
import { Box, CircularProgress, Container, Typography, Alert, Button } from "@mui/material";
import { toastErrorCritical } from "../../utils/toast";
// (Estilos - pode reutilizar de outras páginas)
const BoxStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: '#f5f5f5',
};

const ContainerStyles = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  textAlign: 'center',
};

type Status = 'verifying' | 'success' | 'error';

const DEFAULT_ERROR_MESSAGE = 'Erro ao verificar. O token pode ser inválido ou ter expirado.';

const VerifyEmailPage = () => {
  const { token } = useParams<{ token: string }>(); // Pega o :token da URL
  const [status, setStatus] = useState<Status>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>(DEFAULT_ERROR_MESSAGE);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        const message = 'Token de verificação não encontrado.';
        setErrorMessage(message);
        toastErrorCritical(message);
        return;
      }

      try {
        // Chama o serviço que já existe
        await authService.verifyEmail({ token });
        setStatus('success');
      } catch (error: unknown) {
        console.error("Erro ao verificar email:", error);
        const message = isAxiosError(error)
          ? error.response?.data?.message ?? DEFAULT_ERROR_MESSAGE
          : DEFAULT_ERROR_MESSAGE;
        setErrorMessage(message);
        toastErrorCritical(message);
        setStatus('error');
      }
    };

    verifyToken();
  }, [token]); // Executa uma vez quando o 'token' for lido

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h5">Verificando seu e-mail...</Typography>
          </>
        );
      case 'success':
        return (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              E-mail verificado com sucesso!
            </Alert>
            <Typography variant="body1">
              Sua conta foi ativada. Você já pode fazer o login.
            </Typography>
            <Button 
              component={Link} 
              to="/login" 
              variant="contained" 
              sx={{ mt: 2 }}
            >
              Ir para o Login
            </Button>
          </>
        );
      case 'error':
        return (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
            <Button 
              component={Link} 
              to="/login" 
              variant="outlined" 
              sx={{ mt: 2 }}
            >
              Voltar para o Login
            </Button>
          </>
        );
    }
  };

  return (
    <Box sx={BoxStyles}>
      <Container sx={ContainerStyles}>
        {renderContent()}
      </Container>
    </Box>
  );
};

export default VerifyEmailPage;

// (Precisa adicionar 'Button' nas importações do MUI)
