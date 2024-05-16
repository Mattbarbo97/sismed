import { Button, CssBaseline, ThemeProvider } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import logoini from "../../img/logoini.png"; // Ajuste o caminho conforme necessário
import temaUNNA from "../../temas"; // Ajuste o caminho conforme necessário
import MenuPrincipal from "../menu/MenuPrincipal";
import "../paginas/Home.css"; // Ajuste o caminho conforme necessário

const Home = () => {
  const { user, logOut } = useUser();
  const navigate = useNavigate();

  const handleLogOut = () => {
    if (logOut) {
      logOut();
      navigate("/");
    }
  };

  return (
    <ThemeProvider theme={temaUNNA}>
      <CssBaseline />
      <div className="home-container">
        <MenuPrincipal />
        <div className="home-content">
          <img src={logoini} alt="Logotipo UNNA" className="logo" />
          <div className="welcome-section">
            <h1 className="title">Bem-vindo à UNNA</h1>
            {user && (
              <div className="user-info">
                <span>
                  {user.name ? user.name : "Usuário Anônimo"}{" "}
                  {user.online ? "(Online)" : "(Bem vindo)"}
                </span>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleLogOut}
                >
                  Logoff
                </Button>
              </div>
            )}
          </div>
          {/* Outros componentes */}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Home;
