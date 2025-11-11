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
      placeholder="Digite o nome, CPF ou RG do acompanhante"
    />
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
          title="Acompanhantes"
          searchComponent={searchComponent}
        />
        <TableCompanions searchText={searchText} />
      </Box>
    </AnimatedPage>
  );
};

export default Companions;
