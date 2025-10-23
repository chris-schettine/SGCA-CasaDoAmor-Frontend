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
  marginLeft: "86%",
  backgroundColor: "#000",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#333",
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
          {Array.isArray(user?.roles) && user?.roles.includes("ADMIN") && (
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

