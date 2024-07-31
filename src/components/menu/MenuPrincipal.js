import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Button, Collapse, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from "@mui/material";
import { Assignment as AssignmentIcon, CalendarToday as CalendarTodayIcon, ExitToApp as ExitToAppIcon, ExpandLess, ExpandMore, Group as GroupIcon, Home as HomeIcon, Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";
import logoini from "../../img/logoini.png";
import { useUser } from "../../context/UserContext";

const MenuPrincipal = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showUserCrudMenu, setShowUserCrudMenu] = useState(false);
    const [showAgendamentoMenu, setShowAgendamentoMenu] = useState(false);

    const { user, setUser } = useUser();

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

                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {user ? `${user.nome} bem vindo(a)` : "Colaborador não logado"}
                    </Typography>

                    {user && (
                        <Button color="inherit" onClick={logOut}>
                            <ExitToAppIcon />
                            Logoff
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer anchor="left" open={isMenuOpen} onClose={toggleDrawer(false)}>
                <div style={{ width: "250px", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "50px", background: "white" }}>
                        <img src={logoini} alt="Logo UNNA" style={{ height: "140px" }} />
                    </div>

                    <IconButton onClick={toggleDrawer(false)} sx={{ justifyContent: "flex-end" }}>
                        <CloseIcon />
                    </IconButton>

                    <List style={{ width: "250px" }}>
                        <ListItemButton onClick={() => setShowAgendamentoMenu(!showAgendamentoMenu)}>
                            <ListItemIcon>
                                <CalendarTodayIcon />
                            </ListItemIcon>
                            <ListItemText primary="Agendamentos" />
                            {showAgendamentoMenu ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse in={showAgendamentoMenu} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigate("/verificar-agendamentos")}>
                                    <ListItemText primary="Verificar Agenda" />
                                </ListItemButton>
                                <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigate("/agendamentos")}>
                                    <ListItemText primary="Agendar Paciente" />
                                </ListItemButton>
                                <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigate("/gestao-horario")}>
                                    <ListItemText primary="Gerenciar Horários" />
                                </ListItemButton>
                            </List>
                        </Collapse>

                        <ListItemButton onClick={() => setShowUserCrudMenu(!showUserCrudMenu)}>
                            <ListItemIcon>
                                <GroupIcon />
                            </ListItemIcon>
                            <ListItemText primary="Cadastros" />
                            {showUserCrudMenu ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse in={showUserCrudMenu} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {/* <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigate("/cadastro-usuario")}>
                                    <ListItemText primary="Cadastrar" />
                                </ListItemButton> */}

                                <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigate("/usuarios-cadastrados")}>
                                    <ListItemText primary="Colaboradores" />
                                </ListItemButton>

                                <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigate("/gerenciar-funcoes")}>
                                    <ListItemText primary="Função" />
                                </ListItemButton>

                                <ListItemButton sx={{ pl: 4 }} onClick={() => handleNavigate("/pacientes-cadastrados")}>
                                    <ListItemText primary="Pacientes" />
                                </ListItemButton>
                            </List>
                        </Collapse>

                        <ListItemButton onClick={() => handleNavigate("/criar-prontuario")}>
                            <ListItemIcon>
                                <AssignmentIcon />
                            </ListItemIcon>
                            <ListItemText primary="Prontuários" />
                        </ListItemButton>

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
            <Toolbar />
        </>
    );
};

export default MenuPrincipal;
