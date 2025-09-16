import { css } from "@emotion/react";
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import TableUsers from "../../components/Table/TableUsers";

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
  return (
    <>
      <div css={headerContainer}>
        <h1 css={TitleStyles}>Profissionais</h1>
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
        <TableUsers />
      </div>
    </>
  );
};

export default Users;

