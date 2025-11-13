import Button from '@mui/material/Button';
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import TableUsers from "../../components/Table/TableUsers";
import PageHeader from "../../components/PageHeader";
import { Box, FormControl, Input, InputAdornment, InputLabel, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';

const Users = () => {
  const { user } = useAuth();
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
            <IconButton>
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        }
      />
    </FormControl>
  );

  const actionButton = user?.tipoUsuario === "ADMINISTRADOR" ? (
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
    <Box sx={{ 
      width: { xs: '100%', sm: '95%', md: '90%' }, 
      margin: '0 auto', 
      py: { xs: 2, sm: 3 },
      px: { xs: 1, sm: 2 }
    }}>
      <PageHeader 
        title="Usuários Autorizados"
        searchComponent={searchComponent}
        action={actionButton}
      />
      <TableUsers searchText={searchText} />
    </Box>
  );
};

export default Users;