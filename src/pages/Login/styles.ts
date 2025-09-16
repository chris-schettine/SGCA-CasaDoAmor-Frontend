import { css } from "@emotion/react";

export const ContainerLoginStyles = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "475px",
  height: "500px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.45)",
});

export const BoxStyles = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  margin: 0,
  padding: 0,
  backgroundColor: "#65ACD6",
});

export const ButtonStyles = css({
  marginTop: "20px",
  backgroundColor: "#65ACD6",
  width: "300px",
  margin: "10px",
});

export const TextFieldStyles = css({
  width: "300px",
  height: "50px",
  margin: "10px",

  "& .MuiInputBase-root": {
    height: 54,
    borderRadius: 8,
  }
});

export const imgStyles = css({
  width: "180px",
});
