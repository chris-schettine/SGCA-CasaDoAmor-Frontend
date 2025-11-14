import Button from '@mui/material/Button';
import { Link } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import TableUsers from "../../components/Table/TableUsers";
import PageHeader from "../../components/PageHeader";
import PageContainer from "../../components/PageContainer";
import { FormControl, Input, InputAdornment, InputLabel, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import { AnimatedPage } from "../../components/AnimatedPage";

const Users = () => {
  const { canManageUsers } = usePermissions();
  const [searchText, setSearchText] = useState('');

  const searchComponent = (
    <FormControl fullWidth variant="standard">
      <InputLabel htmlFor="search">Buscar Usuário</InputLabel>
      <Input
        id="search"
        type="search"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Digite os dados para pesquisa"
        endAdornment={
          <InputAdornment position="end">
            <IconButton aria-label="buscar">
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        }
      />
    </FormControl>
  );

  const actionButton = canManageUsers ? (
    <Button
      component={Link}
      to="/user/register"
      variant="contained"
      sx={{ width: { xs: '100%', sm: 'auto' } }}
    >
      Adicionar
    </Button>
  ) : undefined;

  return (
    <AnimatedPage>
      <PageContainer>
        <PageHeader 
          title="Usuários Autorizados"
          searchComponent={searchComponent}
          action={actionButton}
        />
        <TableUsers searchText={searchText} />
      </PageContainer>
    </AnimatedPage>
  );
};

export default Users;