import React from "react";
import {
    Button,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useUser } from "../../context/UserContext"; // Ajuste o caminho para UserContext
import MenuPrincipal from "../menu/MenuPrincipal"; // Ajuste o caminho conforme necessário

const Home = ({ navigation }) => {
    const { user, logOut } = useUser(); // Obtém o usuário e a função de logOut do contexto

    const handleLogOut = () => {
        logOut();
        navigation.navigate("/"); // Navega para a tela de Login após logoff
    };

    return (
        <View style={styles.container}>
            <MenuPrincipal navigation={navigation} />
            <View style={styles.logoContainer}>
                <Image
                    source={require("../../img/logoini.png")} // Ajuste o caminho para sua imagem de logotipo
                    style={styles.logo}
                />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>Bem-vindo à UNNA</Text>

                {/* Outros componentes */}
                {user && (
                    <View style={styles.headerContainer}>
                        <Text style={styles.header}>
                            {` - ${user.name} ${
                                user.online ? "(Online)" : "Bem vindo"
                            }`}
                        </Text>
                        <Button
                            title="Logoff"
                            onPress={handleLogOut}
                            color="#a26e35"
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

const window = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center", // Centraliza o conteúdo verticalmente
        alignItems: "center", // Centraliza o conteúdo horizontalmente
        backgroundColor: "#fff", // Fundo branco para o conteúdo
    },
    logoContainer: {
        position: "absolute", // Posicionamento absoluto para sobrepor os outros elementos
        top: 0,
        left: 0,
        width: window.width, // Largura total da tela
        height: window.height, // Altura total da tela
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.1, // Opacidade de 10%
    },
    logo: {
        width: 300, // Largura do logotipo
        height: 300, // Altura do logotipo
        resizeMode: "contain",
    },
    content: {
        width: "100%", // Ocupa 100% da largura disponível
        padding: 20,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    header: {
        color: "#333", // Cor para o cabeçalho
        fontSize: 18,
        fontWeight: "bold",
    },
    title: {
        color: "#a26e35", // Dourado para o título
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center", // Centraliza o texto do título
    },
    // Adicione outros estilos conforme necessário
});

export default Home;
