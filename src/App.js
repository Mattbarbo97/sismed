import { ThemeProvider } from "@mui/material/styles";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Rotas from "./navigation/Rotas";
import temaUNNA from "./temas";

function App() {
  return (
    <ThemeProvider theme={temaUNNA}>
      <UserProvider>
        <BrowserRouter>
          <Rotas />
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
