import { css } from "@emotion/react";

const stylesDiv = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  margin: "50px"
})

const NotFoundPage = () => {
  return (
    <div css={stylesDiv}>
      <h1 style={{ margin: "0" }}>404 - Página não encontrada</h1>
      <p>Verifique se a url em que está tentando acessar está correta.</p>
    </div>
  )
}

export default NotFoundPage;