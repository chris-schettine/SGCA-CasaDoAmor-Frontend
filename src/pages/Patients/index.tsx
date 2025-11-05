import { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Typography,
  Button,
  Skeleton,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { Link } from "react-router-dom";
import TablePatients from "../../components/Table/TablePatients";
import { buttonStyles, stylesContainer, searchContainer, TitleStyles } from "./styles";

const Patients = () => {
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // Simular requisição
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div css={stylesContainer}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="30%" height={50} sx={{ mb: 2 }} />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="rectangular" width="60%" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width="20%" height={56} sx={{ borderRadius: 1 }} />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 1 }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rectangular" width="100%" height={50} sx={{ mb: 1 }} />
          ))}
        </Box>
      </div>
    );
  }

  return (
    <div css={stylesContainer}>
      <Box>
        <Typography variant="h1" css={TitleStyles}>
          Pacientes
        </Typography>
      </Box>

      <Box css={searchContainer}>
        <FormControl fullWidth sx={{ m: 1 }} variant="standard">
          <InputLabel htmlFor="search">Buscar Paciente</InputLabel>
          <Input
            id="search"
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={() => { /* opcional: foco ou busca imediata */ }}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>

        <Button
          component={Link}
          to="/patient/register"
          variant="contained"
          css={buttonStyles}
        >
          Adicionar
        </Button>
      </Box>

      <TablePatients searchText={searchText} />
    </div>
  );
};

export default Patients;
