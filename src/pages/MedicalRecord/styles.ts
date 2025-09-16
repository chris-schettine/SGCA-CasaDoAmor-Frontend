import { css } from "@emotion/react";

export const stylesContainer = css({
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  gap: "10px",
  width: "90%",
  minHeight: "56px",
  margin: "24px auto",
});

export const TitleStyles = css({
  fontSize: "24px",
  color: "#000",
  fontWeight: "600",
  textAlign: "center",
  margin: 0,
});

export const SubtitleStyles = css({
  fontSize: "20px",
  color: "#000",
  fontWeight: "600",
  margin: "5px 0",
});

export const typeStyles = css({
  fontSize: "16px",
  color: "#000",
  fontWeight: "600",
  margin: 0,
  paddingTop: "10px"
});

export const stylesDivCheckbox = css({
  display: "flex",
  flexDirection: "column",
  width: "100%"
});