import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
    formContainer: {
        display: "flex",
        flexDirection: "column",
        margin: theme.spacing(2),
        "& .MuiTextField-root": {
            margin: theme.spacing(1),
            backgroundColor: "#FFF",
        },
        "& .MuiButton-root": {
            margin: theme.spacing(1),
        },
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
        height: "100vh", // Isso centraliza verticalmente o conteúdo na tela
    },
    usuariosContent: {
        padding: "20px",
    },
}));

export default useStyles;
