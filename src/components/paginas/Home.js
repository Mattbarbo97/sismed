import { Button, CssBaseline, ThemeProvider } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import logoini from "../../img/logoini.png"; // Ajuste o caminho conforme necessário
import temaUNNA from "../../temas"; // Ajuste o caminho conforme necessário
import MenuPrincipal from "../menu/MenuPrincipal";
import "../paginas/Home.css"; // Ajuste o caminho conforme necessário

import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";

const Home = () => {
  const { logOut } = useUser();
  const navigate = useNavigate();

  const handleRedirect = (route) => {
    navigate(route);
  };

  return (
    <ThemeProvider theme={temaUNNA}>
      <CssBaseline />
      <div className="home-container">
        <MenuPrincipal />
        <div className="home-content">
          
          <div className="welcome-section">
            <h1 className="title">Bem-vindo à UNNA</h1>

            <div className="button-container">
              <div className="left-buttons">
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<AssignmentIcon />}
                  onClick={() => handleRedirect("/criar-prontuario")}
                >
                  Prontuários
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<GroupIcon />}
                  onClick={() => handleRedirect("/pacientes-cadastrados")}
                >
                  Pacientes
                </Button>
              </div>
              <div className="right-buttons">
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<CalendarTodayIcon />}
                  onClick={() => handleRedirect("/usuarios-cadastrados")}
                >
                  Colaboradores
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<CalendarTodayIcon />}
                  onClick={() => handleRedirect("/agendamentos")}
                >
                  Agendamento
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Home;
