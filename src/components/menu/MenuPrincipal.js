import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import GroupIcon from "@mui/icons-material/Group";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoini from "../../img/logoini.png";
// eslint-disable-next-line
import { ListSubheader } from '@mui/material';

import CloseIcon from "@mui/icons-material/Close";
import { useUser } from "../../context/UserContext";

const MenuPrincipal = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showUserCrudMenu, setShowUserCrudMenu] = useState(false);
    // eslint-disable-next-line
    const [showPatientCrudMenu, setShowPatientCrudMenu] = useState(false);
    //   const [user, setUser] = useState(null);

    const { user, setUser } = useUser();

    // useEffect(() => {
    //     // Recupera o Colaborador do localStorage e atualiza o estado
    //     const storedUser = localStorage.getItem("user");
    //     if (storedUser) {
    //         setUser(JSON.parse(storedUser));
    //     }
    // }, []);

    const logOut = () => {
        localStorage.removeItem("user");
        setUser(null);
        navigate("/");
    };

    const toggleDrawer = (open) => (event) => {
        if (
            event.type === "keydown" &&
            (event.key === "Tab" || event.key === "Shift")
        ) {
            return;
        }
        setIsMenuOpen(open);
    };

    const handleNavigate = (path) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    return (
        <>
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={toggleDrawer(true)}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="home"
                        onClick={() => navigate("/home")}
                        sx={{ mr: 2 }}
                    >
                        <HomeIcon />
                    </IconButton>

                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
                        {user
                            ? `${user.nome} bem vindo(a)`
                            : "Colaborador não logado"}
                    </Typography>

                    {user && (
                        <Button color="inherit" onClick={logOut}>
                            <ExitToAppIcon />
                            Logoff
                        </Button>
                    )}
                </Toolbar>
            </AppBar>{" "}
            {/* Adiciona espaço para o AppBar, evitando sobreposição do conteúdo */}
            <Drawer
                anchor="left"
                open={isMenuOpen}
                onClose={toggleDrawer(false)}
            >
                <div
                    style={{
                        width: "250px",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div style={{ padding: "50px", background: "white" }}>
                        <img
                            src={logoini}
                            alt="Logo UNNA"
                            style={{ height: "140px" }}
                        />
                    </div>

                    <IconButton
                        onClick={toggleDrawer(false)}
                        sx={{ justifyContent: "flex-end" }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <List style={{ width: "250px" }}>
                        <ListItemButton
                            onClick={() => handleNavigate("/agendamentos")}
                        >
                            <ListItemIcon>
                                <CalendarTodayIcon />
                            </ListItemIcon>
                            <ListItemText primary="Agendamentos" />
                        </ListItemButton>
                        <ListItemButton
                            onClick={() =>
                                setShowUserCrudMenu(!showUserCrudMenu)
                            }
                        >
                            <ListItemIcon>
                                <GroupIcon />
                            </ListItemIcon>

                            <ListItemText primary="Cadastros" />
                            {showUserCrudMenu ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse
                            in={showUserCrudMenu}
                            timeout="auto"
                            unmountOnExit
                        >
                            <List component="div" disablePadding>
                                <ListItemButton
                                    sx={{ pl: 4 }}
                                    onClick={() =>
                                        handleNavigate("/cadastro-usuario")
                                    }
                                >
                                    {/* <ListItemText primary="Cadastrar" /> */}
                                </ListItemButton>

                                <ListItemButton
                                    sx={{ pl: 4 }}
                                    onClick={() =>
                                        handleNavigate("/usuarios-cadastrados")
                                    }
                                >
                                    <ListItemText primary="Colaboradores" />
                                </ListItemButton>

                                <ListItemButton
                                    sx={{ pl: 4 }}
                                    onClick={() =>
                                        handleNavigate("/gerenciar-funcoes")
                                    }
                                >
                                    <ListItemText primary="Função" />
                                </ListItemButton>

                                <ListItemButton
                                    sx={{ pl: 4 }}
                                    onClick={() =>
                                        handleNavigate("/pacientes-cadastrados")
                                    }
                                >
                                    <ListItemText primary="Pacientes" />
                                </ListItemButton>
                            
                            </List>
                        </Collapse>

                        
                      
                            {/*<List component="div" disablePadding>
                                 <ListItemButton
                                    sx={{ pl: 4 }}
                                    onClick={() =>
                                        handleNavigate("/cadastro-paciente")
                                    }
                                >
                                    <ListItemText primary="Cadastrar Novo Paciente" />
                                </ListItemButton> */}

                                
                        
                          <List>
                              <ListItemButton onClick={() => handleNavigate("/criar-prontuario")}>
                                  <ListItemIcon>
                                      <AssignmentIcon />
                                  </ListItemIcon>
                                  <ListItemText primary="Prontuários" />
                              </ListItemButton>
                              
                              {/* Outros itens do submenu */}
                          </List>

                          
                        {/* Botão de sair */}
                        {user && (
                            <ListItemButton onClick={logOut}>
                                <ListItemIcon>
                                    <ExitToAppIcon />
                                </ListItemIcon>
                                <ListItemText primary="Sair" />
                            </ListItemButton>
                        )}
                    </List>
                </div>
            </Drawer>
            <Toolbar />{" "}
            {/* Adiciona espaço para o AppBar, evitando sobreposição do conteúdo */}
        </>
    );
};

export default MenuPrincipal;
