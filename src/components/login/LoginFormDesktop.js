import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { auth, firestore } from "../../firebase";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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

const LoginFormDesktop = () => {
    const navigate = useNavigate();
    const { setUser, user } = useUser();
    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [alert, setAlert] = useState({ message: "", type: "" });

    const getUserFromDb = async (uid) => {
        const docRef = doc(firestore, "usuarios_cadastrados", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Colaborador já existe no banco de dados.", docSnap.data());
            return docSnap.data();
        } else {
            console.log("Colaborador não encontrado no banco de dados.");
            return null;
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
            const userCredential = await signInWithEmailAndPassword(auth, login, senha);
            const userFromDb = await getUserFromDb(userCredential.user.uid);

            if (!userFromDb) {
                setAlert({ message: "Colaborador não cadastrado.", type: "error" });
                return;
            }

            console.log("Colaborador logado com sucesso:", userFromDb);

            const userData = {
                nome: userFromDb.nome || "Colaborador sem nome",
                email: userFromDb.email,
                identificacaoProfissional: userFromDb.identificacaoProfissional,
                uid: userCredential.user.uid,
            };

            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));

            setAlert({
                message: "Login realizado com sucesso!",
                type: "success",
            });
            navigate("/home");
        } catch (error) {
            console.error("Erro no login do Colaborador:", error);
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

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
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
                <div style={styles.passwordContainer}>
                    <input
                        style={styles.passwordInput}
                        type={showPassword ? "text" : "password"}
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                    />
                    <div onClick={toggleShowPassword} style={styles.eyeIcon}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </div>
                </div>
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
        backgroundColor: "red",
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
        boxSizing: "border-box",
    },
    passwordContainer: {
        width: "100%",
        position: "relative",
        marginBottom: "16px",
    },
    passwordInput: {
        width: "100%",
        height: "40px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        paddingLeft: "8px",
        paddingRight: "40px",
        boxSizing: "border-box",
    },
    eyeIcon: {
        position: "absolute",
        top: "50%",
        right: "10px",
        transform: "translateY(-50%)",
        cursor: "pointer",
        fontSize: "20px",
        color: "#888",
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

export default LoginFormDesktop;
