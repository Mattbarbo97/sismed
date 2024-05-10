import React from "react";
import { useUser } from "../../../context/UserContext"; // Ajuste o caminho para UserContext
import MenuPrincipal from "../../menu/MenuPrincipal"; // Ajuste o caminho conforme necessário
import "./Agendamentos.css";

const Agendamentos = ({ navigation }) => {
    const { user, logOut } = useUser(); // Obtém o usuário e a função de logOut do contexto

    const handleLogOut = () => {
        logOut();
        navigation.navigate("/"); // Navega para a tela de Login após logoff
    };

    return (
        <div className="container">
            <MenuPrincipal navigation={navigation} />
            <div className="logoContainer">
                <img
                    src={require("../../../img/logoini.png")} // Ajuste o caminho para sua imagem de logotipo
                    alt="Logo"
                    className="logo"
                />
            </div>
            <div className="content">
                <h1 className="title">Bem-vindo à UNNA</h1>

                {/* Outros componentes */}
                {user && (
                    <div className="headerContainer">
                        <p className="header">
                            {` - ${user.name} ${
                                user.online ? "(Online)" : "Bem vindo"
                            }`}
                        </p>
                        <button
                            onClick={handleLogOut}
                            className="logoffButton"
                        >
                            Logoff
                        </button>
                    </div>
                )}

                {/* Mensagem de página não pronta */}
                <p className="mensagem">
                    OPS, PARECE QUE ESSA PÁGINA AINDA NÃO ESTÁ PRONTA, MAS ESTAMOS TRABALHANDO PARA FAZÊ-LA
                </p>

                {/* Calendário ocupando 90% da tela */}
                <div className="calendario">
                    {/* Adicione seu calendário aqui */}
                </div>
            </div>
        </div>
    );
};

export default Agendamentos;
