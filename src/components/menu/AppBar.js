import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext"; // Ajuste o caminho para UserContext

const Header = () => {
  const { user, logOut } = useUser();
  const navigate = useNavigate();

  const handleLogOut = () => {
    logOut();
    navigate("/");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          {user ? `Bem-vindo, ${user.name}` : "Bem-vindo"}
        </Typography>
        {user && (
          <Button color="inherit" onClick={handleLogOut}>
            Logoff
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
