import { css } from "@emotion/react";

export const ContainerLoginStyles = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  
  maxWidth: "450px", 
  width: "90%",
  minHeight: "500px", 
  padding: "2rem 1.5rem", 
  
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
  
  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
});

export const ButtonStyles = css({
  width: "300px",
  
  marginTop: "20px",
  padding: "0.75rem", 
  fontWeight: "bold",
  textTransform: "uppercase", 
  
  
  backgroundColor: "#0D47A1", 
  "&:hover": {
    backgroundColor: "#0B3D91", 
  },
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
  marginBottom: "0.5rem",
});