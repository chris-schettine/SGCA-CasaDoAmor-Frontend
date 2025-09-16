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
  '&:not(:last-child)': {
    marginRight: '16px', // Espaço entre os botões
  },
});

export const saveButtonStyles = css({
  backgroundColor: '#000', // Cor preta para o botão Salvar
  color: '#fff',
  '&:hover': {
    backgroundColor: '#333',
  },
});

export const cancelButtonStyles = css({
  backgroundColor: '#f44336', // Cor vermelha para o botão Cancelar
  color: '#fff',
  '&:hover': {
    backgroundColor: '#d32f2f',
  },
});