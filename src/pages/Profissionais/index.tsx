import { Button, useTheme, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import TableProfissionais from '../../components/Table/TableProfissionais';
import PageHeader from '../../components/PageHeader';
import PageContainer from '../../components/PageContainer';
import Breadcrumbs from '../../components/Breadcrumbs';
import SearchBar from '../../components/SearchBar';
import { useState } from 'react';
import { AnimatedPage } from '../../components/AnimatedPage';

const Profissionais = () => {
  const { isAdmin } = usePermissions();
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');

  const searchComponent = (
    <SearchBar
      value={searchText}
      onChange={setSearchText}
      label="Buscar Profissional"
      placeholder="Digite o nome, CPF ou categoria"
    />
  );

  const actionButton = isAdmin ? (
    <Button
      component={Link}
      to="/profissional/register"
      variant="contained"
      sx={{
        width: { xs: '100%', sm: 'auto' },
        backgroundColor: `${theme.palette.primary.main} !important`,
        color: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
        WebkitTextFillColor: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
        opacity: 1,
        '&:hover': { backgroundColor: `${theme.palette.primary.dark} !important` },
        '&:focus-visible': { outline: `3px solid ${theme.palette.primary.light}`, outlineOffset: '2px' }
      }}
    >
      <Box component="span" sx={{ color: theme.palette.getContrastText(theme.palette.primary.main), WebkitTextFillColor: theme.palette.getContrastText(theme.palette.primary.main), fontWeight: 600, opacity: 1 }}>Adicionar</Box>
    </Button>
  ) : undefined;

  return (
    <AnimatedPage>
      <PageContainer>
        <Breadcrumbs items={[{ label: 'Profissionais' }]} />
        
        <PageHeader 
          title="Profissionais de Saúde"
          subtitle="Gestão de profissionais e equipe de saúde"
          searchComponent={searchComponent}
          action={actionButton}
        />
        <TableProfissionais searchText={searchText} />
      </PageContainer>
    </AnimatedPage>
  );
};

export default Profissionais;
