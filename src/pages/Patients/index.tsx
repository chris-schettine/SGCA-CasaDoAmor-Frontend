import { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Typography,
  CircularProgress,
  Button,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { Link } from "react-router-dom";
import TablePatients from "../../components/Table/TablePatients";
import { buttonStyles, stylesContainer, searchContainer, TitleStyles } from "./styles";

const Patients = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular requisição
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div
        css={stylesContainer}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
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
            endAdornment={
              <InputAdornment position="end">
                <IconButton>
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

      <TablePatients />
    </div>
  );
};

export default Patients;
