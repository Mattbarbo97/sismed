import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { auth, firestore } from "../../firebase";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logoini from "../../img/logoini.png";
import { Box, Button, Container, IconButton, TextField, Typography, Alert as MuiAlert } from "@mui/material";

const Alert = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, [message, onClose, type]);

    return (
        <MuiAlert
            severity={type}
            onClose={onClose}
            sx={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                zIndex: 1000,
            }}
        >
            {message}
        </MuiAlert>
    );
};

const LoginFormMobile = () => {
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
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <img src={logoini} alt="Logo" style={{ width: "150px", height: "150px", marginBottom: "20px" }} />
                <Typography component="h1" variant="h5">
                    Bem-vindo! Faça o Login.
                </Typography>
                {alert.message && (
                    <Alert
                        message={alert.message}
                        type={alert.type}
                        onClose={() => setAlert({ message: "", type: "" })}
                    />
                )}
                <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="login"
                        label="Login"
                        name="login"
                        autoComplete="login"
                        autoFocus
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                    />
                    <Box sx={{ position: "relative" }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Senha"
                            type={showPassword ? "text" : "password"}
                            id="password"
                            autoComplete="current-password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                        />
                        <IconButton
                            onClick={toggleShowPassword}
                            sx={{
                                position: "absolute",
                                right: 10,
                                top: "30%",
                                transform: "translateY(-50%)",
                            }}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </IconButton>
                    </Box>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, backgroundColor: "#a26e35" }}
                    >
                        Login
                    </Button>
                    <Button
                        fullWidth
                        variant="text"
                        onClick={handlePasswordRecovery}
                        sx={{ color: "#a26e35", textDecoration: "underline" }}
                    >
                        Esqueceu a senha?
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default LoginFormMobile;
