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
  justifyContent: "center",
  flexDirection: 'column',
  position: "relative",
  width: "90%",
  minHeight: "56px",
  margin: "24px auto",
  paddingBottom: "15px",
});

const TitleStyles = css({
  fontSize: "24px",
  color: "#000",
  fontWeight: "600",
  textAlign: "center",
  margin: 0,
  marginBottom: '16px'
});

const searchContainer = css({
  display: "flex",
  flexDirection: 'row',
  alignItems: 'center',
  gap: '16px',
  width: '100%'
});

const buttonStyles = css({
  width: '20%',
  flexShrink: 0, 
  whiteSpace: "nowrap", 
  backgroundColor: '#1976d2', // Material Blue 700 - melhor contraste WCAG
  color: '#fff',
  '&:hover': {
    backgroundColor: '#1565c0', // Material Blue 800
  },
  '&:focus-visible': {
    outline: '3px solid #90caf9', // Foco visível para acessibilidade
    outlineOffset: '2px',
  },
});

const Users = () => {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  return (
    <>
      <div css={headerContainer}>
        <h1 css={TitleStyles}>Profissionais</h1>
        <Box css={searchContainer}>
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

