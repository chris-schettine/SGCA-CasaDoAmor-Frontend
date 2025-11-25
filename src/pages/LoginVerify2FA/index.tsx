import { Box, Button, Container, TextField, Typography, CircularProgress, Link as MuiLink } from "@mui/material";
import { isAxiosError } from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/auth.service";
import { useAuth } from "../../hooks/useAuth";
import { toastError, toastSuccess } from "../../utils/toast";
import type { UserType } from "../../stores/useAuthStore";

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
// (removed unused useQuery helper)

const LoginVerify2FAPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Função do AuthContext
  
  const [cpf, setCpf] = useState<string | null>(null);
  const [codigo, setCodigo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
 
  useEffect(() => {
    const cpfSalvo = sessionStorage.getItem('cpfFor2FA');
    if (cpfSalvo) {
      setCpf(cpfSalvo);
    } else {
      
      toastError("Erro: CPF não encontrado para verificação 2FA. Retornando ao login.");
      setTimeout(() => navigate('/login'), 2000); 
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!cpf) return;
    setIsLoading(true);
    setCodeError(null);

    try {
     
      const resp = await authService.verify2FA({ cpf, codigo });

      
      const token = resp.token;

      // Temporarily store the token so subsequent requests (e.g. /auth/me) include it
      try {
        localStorage.setItem('authToken', token);
      } catch (e) {
        console.warn('[LoginVerify2FA] Não foi possível salvar token temporariamente no localStorage', e);
      }

      // Try to fetch the full user profile (with roles) from /auth/me to ensure we have
      // correct permissions immediately after 2FA. If this fails, fall back to using
      // the user object returned in the verify2FA response.
      let finalUser: UserType = {
        nome: resp.user?.nome ?? '',
        email: resp.user?.email ?? '',
        cpf: cpf ?? resp.user?.cpf ?? '',
        roles: resp.user?.roles ?? [],
        tipoUsuario: resp.user?.tipoUsuario,
        uuid: resp.user?.uuid,
      };

      try {
        const raw = await authService.getActiveSession();
        // Normalize shape similar to AuthContext normalization
        const rolesFromPerfis = Array.isArray(raw.perfis)
          ? raw.perfis
              .map((perfil) => perfil?.nome)
              .filter((roleName): roleName is string => Boolean(roleName))
          : undefined;

        const normalizedUser: UserType = {
          nome: raw.nome ?? raw.user?.nome ?? finalUser.nome,
          email: raw.email ?? raw.user?.email ?? finalUser.email,
          cpf: raw.cpf ?? raw.user?.cpf ?? finalUser.cpf,
          roles: rolesFromPerfis ?? raw.roles ?? raw.user?.roles ?? finalUser.roles,
          tipoUsuario: raw.tipo ?? raw.tipoUsuario ?? raw.user?.tipoUsuario ?? finalUser.tipoUsuario,
          uuid: raw.uuid ?? raw.user?.uuid ?? finalUser.uuid,
        };

        finalUser = normalizedUser;
      } catch (err) {
        console.warn('[LoginVerify2FA] Falha ao obter /auth/me após 2FA - usando user retornado pelo verify2FA', err);
      }

      sessionStorage.removeItem('cpfFor2FA');

      // Call login with the token and the (preferably) full user object
      login(token, finalUser);

      toastSuccess('Código verificado com sucesso!');
      setTimeout(() => navigate('/'), 1500);

    } catch (error: unknown) {
      console.error("Erro ao verificar 2FA:", error);
      if (isAxiosError(error) && (error.response?.status === 400 || error.response?.status === 401)) {
        const msg = error.response?.data?.message ?? 'Código inválido ou expirado.';
        setCodeError(msg);
        toastError(msg);
      } else {
        const message = isAxiosError(error)
          ? error.response?.data?.message ?? "Código inválido ou expirado."
          : "Código inválido ou expirado.";
        toastError(message);
      }
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!cpf) return; 
    setResendLoading(true);
    try {
      await authService.resend2FA(); //
      toastSuccess("Novo código enviado para seu e-mail.");
    } catch (error: unknown) {
      console.error("Erro ao reenviar código:", error);
      const message = isAxiosError(error)
        ? error.response?.data?.message ?? "Erro ao reenviar código."
        : "Erro ao reenviar código.";
      toastError(message);
    } finally {
      setResendLoading(false);
    }
};

  return (
      <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', p: 3, color: 'text.primary' }}>
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
          onChange={(e) => {
            setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6));
            if (codeError) setCodeError(null);
          }} // Permite apenas números, max 6
          inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
          required
          error={(codigo.length > 0 && codigo.length < 6) || !!codeError}
          helperText={
            codeError
              ? codeError
              : codigo.length > 0 && codigo.length < 6
              ? 'Código deve ter 6 dígitos'
              : ''
          }
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
        </Box>
      </Box>
  );
};

export default LoginVerify2FAPage;
