import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  useTheme, 
  alpha 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home'; 

const NotFoundPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const logoSrc = theme.palette.mode === 'dark' ? '/logo3branco.png' : '/logo3.png';

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: theme.palette.background.default,
        p: 2,
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: "center" }}>

        <Box
          component="img"
          src={logoSrc}
          alt="Logo do Sistema SGCA"
          sx={{
            height: { xs: 50, md: 70 },
            width: "auto",
            mb: 4,
          }}
        />

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "6rem", md: "9rem" },
            fontWeight: 900,
            lineHeight: 1,
            mb: 1,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: `drop-shadow(0 4px 20px ${alpha(theme.palette.primary.main, 0.3)})`
          }}
        >
          404
        </Typography>
        <Typography 
          variant="h4" 
          sx={{ 
            color: theme.palette.text.primary, 
            fontWeight: 700, 
            mb: 2 
          }}
        >
          Página não encontrada
        </Typography>

        <Typography 
          variant="body1" 
          sx={{ 
            color: theme.palette.text.secondary, 
            fontSize: "1.1rem", 
            maxWidth: "400px",
            mx: "auto",
            mb: 5
          }}
        >
          Ops! Parece que você tentou acessar uma URL que não existe ou foi movida.
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/patients')} 
          sx={{
            bgcolor: theme.palette.primary.main,
            color: '#fff',
            fontWeight: 'bold',
            px: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: theme.shadows[4],
            textTransform: 'none',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[8],
            },
          }}
        >
          Voltar para a Dashboard
        </Button>

      </Container>
    </Box>
  );
};

export default NotFoundPage;