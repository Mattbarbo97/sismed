//GerenciamentoFuncoesStyles.js
import { makeStyles } from "@mui/styles";


const useStyles = makeStyles((theme) => ({
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "90vw", // Alterado para 90vw para ocupar 90% da largura da tela
      height: "100vh",
      padding: theme.spacing(2),
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
      borderRadius: 8,
      "&.MuiContainer-maxWidthLg": {
        maxWidth: "98vw",
      },
    },
    
    usuariosContent: {
      width: "100%",
      maxWidth: 1200,
      margin: "auto",
      padding: theme.spacing(2),
      height: "calc(100vh - 64px - 16px)",
      overflowY: "auto",
    },
    
    switch: {
      position: "relative",
      display: "inline-block",
      width: 60,
      height: 34,
      marginRight: theme.spacing(1),
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
    },
    sliderBefore: {
      position: "absolute",
      content: '""',
      height: 26,
      width: 26,
      left: 4,
      bottom: 4,
      backgroundColor: "white",
      transition: "transform 0.4s",
    },
    round: {
      borderRadius: 34,
    },
    roundBefore: {
      borderRadius: "50%",
    },
    removerBtn: {
      marginLeft: theme.spacing(1),
    },
  }));
  
  export default useStyles;
  