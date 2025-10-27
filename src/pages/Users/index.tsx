import { css } from "@emotion/react";
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import TableUsers from "../../components/Table/TableUsers";
import { Box, FormControl, Input, InputAdornment, InputLabel, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';

const headerContainer = css({
  display: "flex",
  alignItems: "center",
  flexDirection: 'column',
  width: "90%",
  minHeight: "56px",
  margin: "24px auto",
});

const TitleStyles = css({
  fontSize: "24px",
  color: "#000",
  fontWeight: "600",
  textAlign: "center",
  margin: 0,
});

const buttonStyles = css({
 
  marginLeft: "auto",
  flexShrink: 0, 
  whiteSpace: "nowrap", 

  backgroundColor: '#09244B', // Cor azul escuro para o botão salvar
  color: '#fff',
  '&:hover': {
  backgroundColor: '#0C2F58',// um tom mais claro do azul escuro para melhorar o hover;
  },
});

const Users = () => {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  return (
    <>
      <div css={headerContainer}>
        <h1 css={TitleStyles}>Profissionais</h1>
        <Box sx={{ width: '90%', display: 'flex', alignItems: 'center', marginTop: 2 }}>
          <FormControl fullWidth sx={{ m: 1 }} variant="standard">
            <InputLabel htmlFor="search">Buscar Usuário</InputLabel>
            <Input
              id="search"
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          {/* Esse botão só deverá aparecer se o users tiver permissão */}
          {user?.tipoUsuario === "ADMINISTRADOR" && (
            <Button
              component={Link}
              to="/user/register"
              variant="contained"
              css={buttonStyles}
            >
              Adicionar
            </Button>
          )}
        </Box>
        <TableUsers searchText={searchText} />
      </div>
    </>
  );
};

export default Users;

