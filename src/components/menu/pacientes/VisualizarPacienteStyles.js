import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
    formContainer: {
        display: "flex",
        flexDirection: "column",
        margin: theme?.spacing ? theme.spacing(2) : "16px", // Garante um valor fixo se theme.spacing não existir
        "& .MuiTextField-root": {
            margin: theme?.spacing ? theme.spacing(1) : "8px",
            backgroundColor: "#FFF",
        },
        "& .MuiButton-root": {
            margin: theme?.spacing ? theme.spacing(1) : "8px",
        },
    },
    slider: {
        position: "absolute",
        cursor: "pointer",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#ccc",
        transition: "background-color 0.4s",
        borderRadius: 34, // Adiciona bordas arredondadas para o slider
    },
    submitButton: {
        backgroundColor: "#DAA520",
        "&:hover": {
            backgroundColor: "#B8860B",
        },
        color: "white",
    },
    containerCentered: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
    },
    usuariosContent: {
        padding: "20px",
    },
}));

export default useStyles;
