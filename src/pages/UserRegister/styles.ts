import { css } from "@emotion/react";

export const stylesContainer = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  gap: "16px",
  width: "100%",
  minHeight: "56px",
  marginTop: "24px",
  marginBottom: "24px",
});

export const TitleStyles = css({
  fontSize: "24px",
  color: "#000",
  fontWeight: "600",
  textAlign: "center",
  margin: 0,
});

export const buttonStyles = css({
  padding: '10px 24px',
  fontSize: '14px',
  fontWeight: 500,
  minWidth: '120px',
  '&:not(:last-child)': {
    marginRight: '16px',
  },
});

export const saveButtonStyles = css({
  backgroundColor: '#1976d2', // Material Blue 700 - melhor contraste
  color: '#fff',
  '&:hover': {
    backgroundColor: '#1565c0', // Material Blue 800
  },
  '&:focus-visible': {
    outline: '3px solid #90caf9', // Foco visível para acessibilidade
    outlineOffset: '2px',
  },
});

export const cancelButtonStyles = css({
  backgroundColor: '#d32f2f', // Material Red 700 - melhor contraste
  color: '#fff',
  '&:hover': {
    backgroundColor: '#c62828', // Material Red 800
  },
  '&:focus-visible': {
    outline: '3px solid #ef9a9a', // Foco visível para acessibilidade
    outlineOffset: '2px',
  },
});