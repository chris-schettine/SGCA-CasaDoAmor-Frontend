import { useState } from "react";
import { Box } from "@mui/material";
import TableCompanions from "../../components/Table/TableCompanions";
import PageHeader from "../../components/PageHeader";
import { AnimatedPage } from "../../components/AnimatedPage";
import SearchBar from "../../components/SearchBar";

const Companions = () => {
  const [searchText, setSearchText] = useState('');

  const searchComponent = (
    <SearchBar
      value={searchText}
      onChange={setSearchText}
      label="Buscar Acompanhante"
      placeholder="Digite o nome, CPF ou nome do paciente"
    />
  );

  return (
    <AnimatedPage>
      <Box sx={{ width: '90%', margin: '0 auto', py: 3 }}>
        <PageHeader 
          title="Acompanhantes"
          searchComponent={searchComponent}
        />
        <TableCompanions searchText={searchText} />
      </Box>
    </AnimatedPage>
  );
};

export default Companions;
