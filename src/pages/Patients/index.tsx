import React, { Suspense, useState } from "react";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
const LazyTablePatients = React.lazy(() => import('../../components/Table/TablePatients'));
import { TableSkeleton } from '../../components/SuspenseWrapper';
import PageHeader from "../../components/PageHeader";
import PageContainer from "../../components/PageContainer";
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
      <PageContainer>
        <PageHeader 
          title="Pacientes"
          searchComponent={searchComponent}
          action={actionButton}
        />
        <Suspense fallback={<TableSkeleton rows={10} />}>
          <LazyTablePatients searchText={searchText} />
        </Suspense>
      </PageContainer>
    </AnimatedPage>
  );
};

export default Patients;