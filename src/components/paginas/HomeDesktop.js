import { Button, CssBaseline, ThemeProvider, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Importando Link
import { useUser } from "../../context/UserContext";

import temaUNNA from "../../temas"; // Ajuste o caminho conforme necessário
import MenuPrincipal from "../menu/MenuPrincipal";
import "./HomeDesktop.css"; // Ajuste o caminho conforme necessário

import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";

const HomeDesktop = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Dados do usuário no contexto:", user);
  }, [user]);

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

            {/* Link posicionado abaixo dos botões */}
            <div className="link-container">
              <Typography variant="body1" className="link-gerenciar-prontuarios">
                <Link to="/upload-prontuarios" className="link-gerenciar-prontuarios">
                  Clique aqui para gerenciar os prontuários físicos
                </Link>
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default HomeDesktop;
