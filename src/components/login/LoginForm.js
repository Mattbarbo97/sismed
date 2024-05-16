import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { auth, firestore } from "../../firebase";
import logoini from "../../img/logoini.png";

const Alert = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, [message, onClose, type]);

    return (
        <div
            style={{
                ...styles.alert,
                backgroundColor: type === "error" ? "red" : "green",
            }}
        >
            {message}
        </div>
    );
};

const LoginForm = () => {
    const navigate = useNavigate();
    const { setUser, user } = useUser();
    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");
    const [alert, setAlert] = useState({ message: "", type: "" });

    const getUserFromDb = async (uid) => {
        const docRef = doc(firestore, "usuarios_cadastrados", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Usuário já existe no banco de dados.", docSnap.data());
            return docSnap.data();
        } else {
            console.log("Usuário não encontrado no banco de dados.");
            return null; // Indica que o usuário não foi encontrado
        }
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        setAlert({ message: "", type: "" });

        if (!login || !senha) {
            setAlert({
                message: "Por favor, preencha todos os campos.",
                type: "error",
            });
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                login,
                senha
            );

            const user = await getUserFromDb(userCredential.user.uid);
            if (!user) {
                // Usuário não encontrado no banco de dados
                setAlert({ message: "Usuário não cadastrado.", type: "error" });
                return; // Interrompe a execução se não encontrar o usuário
            }

            console.log("Usuário logado com sucesso:", user);

            const userData = {
                name: user.nome || "Usuário sem nome",
                email: user.email,
                uid: user.uid,
            };

            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));

            setAlert({
                message: "Login realizado com sucesso!",
                type: "success",
            });
            navigate("/home");
        } catch (error) {
            console.error("Erro no login do usuário:", error);
            setAlert({ message: error.message, type: "error" });
        }
    };

    useEffect(() => {
        if (user) {
            navigate("/home");
        }
    }, [user, navigate]);

    const handlePasswordRecovery = () => {
        console.log("Recuperação de senha solicitada");
    };

    return (
        <form onSubmit={handleLogin} style={styles.container}>
            <img src={logoini} alt="Logo" style={styles.logo} />
            <div style={styles.formContainer}>
                <p style={styles.welcomeText}>Bem-vindo! Faça o Login.</p>
                {alert.message && (
                    <Alert
                        message={alert.message}
                        type={alert.type}
                        onClose={() => setAlert({ message: "", type: "" })}
                    />
                )}
                <input
                    style={styles.input}
                    type="text"
                    placeholder="Login"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                />
                <input
                    style={styles.input}
                    type="password"
                    placeholder="Senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                />
                <button type="submit" style={styles.button}>
                    Login
                </button>
                <button
                    type="button"
                    style={styles.recoveryButton}
                    onClick={handlePasswordRecovery}
                >
                    Esqueceu a senha?
                </button>
            </div>
        </form>
    );
};

const styles = {
    alert: {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        color: "white",
        padding: "10px",
        borderRadius: "4px",
        textAlign: "center",
        zIndex: 1000,
        backgroundColor: "red", // Este valor é sobrescrito com base no tipo de alerta
    },
    container: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
    },
    logo: {
        width: "380px",
        height: "380px",
        marginRight: "50px",
    },
    formContainer: {
        width: "100%",
        maxWidth: "350px",
        padding: "20px",
        backgroundColor: "#fff",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    welcomeText: {
        fontSize: "18px",
        color: "#333",
        marginBottom: "24px",
    },
    input: {
        width: "100%",
        height: "40px",
        marginBottom: "16px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        paddingLeft: "8px",
    },
    button: {
        width: "100%",
        height: "40px",
        backgroundColor: "#a26e35",
        borderRadius: "4px",
        color: "#fff",
        fontWeight: "bold",
        marginTop: "8px",
        border: "none",
        cursor: "pointer",
    },
    recoveryButton: {
        marginTop: "10px",
        backgroundColor: "transparent",
        border: "none",
        color: "#a26e35",
        textDecoration: "underline",
        cursor: "pointer",
    },
};

export default LoginForm;
