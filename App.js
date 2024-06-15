//app.js
import { ThemeProvider } from "@mui/material/styles";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/UserContext"; // Verifique se o caminho está correto
import Rotas from "./navigation/Rotas"; // Verifique se o caminho está correto
import temaUNNA from "./temas"; // Verifique se o caminho está correto e a exportação do tema

function App() {
  return (
    <ThemeProvider theme={temaUNNA}>
      <UserProvider>
        {" "}
        {/* Adicione o UserProvider aqui */}
        <BrowserRouter>
          <Rotas />
        </BrowserRouter>
      </UserProvider>{" "}
      {/* Feche o UserProvider aqui */}
    </ThemeProvider>
  );
}

export default App;
