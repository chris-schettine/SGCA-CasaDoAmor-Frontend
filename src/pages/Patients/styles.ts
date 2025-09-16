import { css } from "@emotion/react";

export const stylesContainer = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: 'column',
  position: "relative",
  minHeight: "56px",
  margin: "24px auto",
  paddingBottom: "15px",
  width: "90%"
});

export const TitleStyles = css({
  fontSize: "24px",
  color: "#000",
  fontWeight: "600",
  textAlign: "center",
  marginBottom: '16px'
});

export const buttonStyles = css({
  width: '20%',
  backgroundColor: "#000",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#333",
  },
});

export const searchContainer = css({
  display: "flex",
  flexDirection: 'row',
  alignItems: 'center',
  gap: '16px',
  width: '100%'
});