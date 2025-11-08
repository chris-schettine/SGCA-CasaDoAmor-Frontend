import { useState } from "react";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Button,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { Link } from "react-router-dom";
import TablePatients from "../../components/Table/TablePatients";
import PageHeader from "../../components/PageHeader";
import { AnimatedPage } from "../../components/AnimatedPage";

const Patients = () => {
  const [searchText, setSearchText] = useState('');

  const searchComponent = (
    <FormControl fullWidth variant="standard">
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
  );

  const actionButton = (
    <Button
      component={Link}
      to="/patient/register"
      variant="contained"
    >
      Adicionar
    </Button>
  );

  return (
    <AnimatedPage>
      <Box sx={{ width: '90%', margin: '0 auto', py: 3 }}>
        <PageHeader 
          title="Pacientes"
          searchComponent={searchComponent}
          action={actionButton}
        />
        <TablePatients searchText={searchText} />
      </Box>
    </AnimatedPage>
  );
};

export default Patients;