import { useState } from "react";
import { Box, Button } from "@mui/material";
import { Link } from "react-router-dom";
import TablePatients from "../../components/Table/TablePatients";
import PageHeader from "../../components/PageHeader";
import { AnimatedPage } from "../../components/AnimatedPage";
import SearchBar from "../../components/SearchBar";

const Patients = () => {
  const [searchText, setSearchText] = useState('');

  const searchComponent = (
    <SearchBar
      value={searchText}
      onChange={setSearchText}
      label="Buscar Paciente"
      placeholder="Digite o nome, CPF ou RG do paciente"
    />
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
      <Box sx={{ 
        width: { xs: '100%', sm: '95%', md: '90%' }, 
        margin: '0 auto', 
        py: { xs: 2, sm: 3 },
        px: { xs: 1, sm: 2 }
      }}>
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