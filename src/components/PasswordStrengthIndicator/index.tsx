import { Box, LinearProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface Requirement {
  label: string;
  test: (pwd: string) => boolean;
}

const requirements: Requirement[] = [
  { label: 'Mínimo de 8 caracteres', test: (pwd) => pwd.length >= 8 },
  { label: 'Letra maiúscula', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'Letra minúscula', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'Número', test: (pwd) => /[0-9]/.test(pwd) },
  { label: 'Caractere especial (!@#$%^&*)', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const metRequirements = requirements.filter(req => req.test(password));
  const strength = (metRequirements.length / requirements.length) * 100;
  
  const getStrengthColor = () => {
    if (strength < 40) return 'error';
    if (strength < 80) return 'warning';
    return 'success';
  };

  const getStrengthLabel = () => {
    if (strength < 40) return 'Fraca';
    if (strength < 80) return 'Média';
    return 'Forte';
  };

  if (!password) return null;

  return (
    <Box sx={{ mt: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 500 }}>
          Força da senha:
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 600,
            color: getStrengthColor() === 'error' ? 'error.main' : 
                   getStrengthColor() === 'warning' ? 'warning.main' : 
                   'success.main'
          }}
        >
          {getStrengthLabel()}
        </Typography>
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={strength} 
        color={getStrengthColor()}
        aria-label={`Força da senha: ${getStrengthLabel()}`}
        sx={{ 
          height: 8, 
          borderRadius: 4,
          mb: 2,
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {requirements.map((req, index) => {
          const met = req.test(password);
          return (
            <Box 
              key={index}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: met ? 'success.main' : 'text.secondary',
              }}
            >
              {met ? (
                <CheckCircleIcon sx={{ fontSize: 16 }} />
              ) : (
                <CancelIcon sx={{ fontSize: 16, opacity: 0.5 }} />
              )}
              <Typography 
                variant="caption"
                sx={{ 
                  fontSize: '0.75rem',
                  fontWeight: met ? 500 : 400,
                }}
              >
                {req.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
