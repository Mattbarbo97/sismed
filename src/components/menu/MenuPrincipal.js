import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    AppBar,
    Button,
    Collapse,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography
} from "@mui/material";
import {
    Assignment as AssignmentIcon,
    CalendarToday as CalendarTodayIcon,
    ExitToApp as ExitToAppIcon,
    ExpandLess,
    ExpandMore,
    Group as GroupIcon,
    Menu as MenuIcon
} from "@mui/icons-material";
import logoini from "../../img/logoini.png";
import { useUser } from "../../context/UserContext";
import './MenuPrincipal.css'; // Importando o CSS

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
        if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
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
            <AppBar position="fixed" className="app-bar">
                <Toolbar className="toolbar">
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={toggleDrawer(true)}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
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

            <Drawer anchor="left" open={isMenuOpen} onClose={toggleDrawer(false)} className="drawer">
                <div className="drawer">
                    <div className="logo-container">
                        <img src={logoini} alt="Logo UNNA" className="logo" />
                    </div>
                    
                    <List className="drawer-list">
                        <ListItemButton onClick={() => setShowAgendamentoMenu(!showAgendamentoMenu)}>
                            <ListItemIcon>
                                <CalendarTodayIcon />
                            </ListItemIcon>
                            <ListItemText primary="Agendamentos" />
                            {showAgendamentoMenu ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse in={showAgendamentoMenu} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItemButton className="collapse-menu" onClick={() => handleNavigate("/verificar-agendamentos")}>
                                    <ListItemText primary="Verificar Agenda" />
                                </ListItemButton>
                                <ListItemButton className="collapse-menu" onClick={() => handleNavigate("/agendamentos")}>
                                    <ListItemText primary="Agendar Paciente" />
                                </ListItemButton>
                                <ListItemButton className="collapse-menu" onClick={() => handleNavigate("/gestao-horario")}>
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
                                <ListItemButton className="collapse-menu" onClick={() => handleNavigate("/cadastro-usuario")}>
                                    <ListItemText primary="Cadastrar" />
                                </ListItemButton>
                                <ListItemButton className="collapse-menu" onClick={() => handleNavigate("/usuarios-cadastrados")}>
                                    <ListItemText primary="Colaboradores" />
                                </ListItemButton>
                                <ListItemButton className="collapse-menu" onClick={() => handleNavigate("/gerenciar-funcoes")}>
                                    <ListItemText primary="Função" />
                                </ListItemButton>
                                <ListItemButton className="collapse-menu" onClick={() => handleNavigate("/pacientes-cadastrados")}>
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
                    </List>

                    {user && (
                        <ListItemButton onClick={logOut} style={{ justifyContent: "center" }}>
                            <ListItemIcon>
                                <ExitToAppIcon />
                            </ListItemIcon>
                            <ListItemText primary="Sair" />
                        </ListItemButton>
                    )}
                </div>
            </Drawer>
            <Toolbar />
        </>
    );
};

export default MenuPrincipal;
