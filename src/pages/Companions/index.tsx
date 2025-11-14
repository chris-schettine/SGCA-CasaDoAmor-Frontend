import { useState } from "react";
import TableCompanions from "../../components/Table/TableCompanions";
import PageHeader from "../../components/PageHeader";
import PageContainer from "../../components/PageContainer";
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
      <PageContainer>
        <PageHeader 
          title="Acompanhantes"
          searchComponent={searchComponent}
        />
        <TableCompanions searchText={searchText} />
      </PageContainer>
    </AnimatedPage>
  );
};

export default Companions;
