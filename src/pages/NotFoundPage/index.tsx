import { css } from "@emotion/react";

const darkBlue = "#0D2E4D";
const primaryBlue = "#65ACD6"; 

const stylesLogo = css({
  height: "60px", 
  width: "auto",
  marginBottom: "20px",
});

// Estilo do container principal: Centraliza verticalmente e adiciona sombra
const stylesContainer = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  padding: "40px 20px",
  textAlign: "center",
  minHeight: "80vh", 
  backgroundColor: "#fff", 
  // NOVO: Estilo para harmonizar com os cards do sistema
  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.07)",
  borderRadius: "12px",
  margin: "50px auto", // Centraliza o bloco na tela
  maxWidth: "500px",
});

// Estilo do número 404 (Visual de destaque)
const styles404 = css({
  fontSize: "6rem",
  fontWeight: 900,
  color: primaryBlue,
  margin: "0 0 10px 0",
  textShadow: `0 4px 10px ${primaryBlue}50`,
  "@media (max-width: 600px)": {
    fontSize: "4rem",
  },
});

// Estilo do botão CTA
const stylesButton = css({
  backgroundColor: primaryBlue,
  color: "#fff",
  border: "none",
  padding: "12px 30px",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "25px",
  fontSize: "1.1rem",
  fontWeight: 700,
  textDecoration: "none", 
  transition: "background-color 0.3s, transform 0.2s",
  "&:hover": {
    backgroundColor: "#5697c1", 
    transform: "translateY(-3px)", 
  },
});


const NotFoundPage = () => {
  const homePath = "/patients"; 

  return (
    <div css={stylesContainer}>
      
      {/* 1. NOVO: Logo do Sistema para branding */}
      <img src="/logo3.png" alt="Logo do Sistema SGCA" css={stylesLogo} />
      
      {/* 2. Número 404 */}
      <h1 css={styles404}>404</h1>
      
      <h2 style={{ color: darkBlue, margin: "0 0 15px 0", fontWeight: 700, fontSize: "2rem" }}>
        Página não encontrada
      </h2>
      
      {/* 3. Mensagem instrutiva */}
      <p style={{ color: darkBlue, fontSize: "1.1rem", maxWidth: "400px" }}>
        Ops! Parece que você tentou acessar uma URL que não existe no sistema. Por favor, utilize o botão abaixo.
      </p>

      {/* 4. CTA para usabilidade */}
      <a href={homePath} css={stylesButton} aria-label="Voltar para a página inicial">
        Voltar para a Dashboard
      </a>
    </div>
  )
}

export default NotFoundPage;