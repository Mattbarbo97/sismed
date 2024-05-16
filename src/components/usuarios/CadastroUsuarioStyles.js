// CadastroUsuarioStyles.js
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(3), // Espaçamento para o contêiner do formulário
    '& .MuiTextField-root': {
      margin: theme.spacing(1), // Espaçamento uniforme para todos os campos de texto
      width: '80%', // Uma largura que se alinha bem com o menu
      backgroundColor: 'white', // Fundo branco para os campos
      borderRadius: theme.shape.borderRadius, // Bordas arredondadas como no menu
    },
    '& .MuiButton-contained': {
      margin: theme.spacing(1),
      width: '50%', // Botão com largura definida para se destacar
      backgroundColor: '#FFD700', // Cor do botão alinhada com o menu
      color: 'black', // Cor do texto no botão
      '&:hover': {
        backgroundColor: '#FFC300', // Efeito hover que se alinha com o estilo do menu
      },
    },
  },
  // Você pode adicionar mais estilos específicos conforme necessário
}));

export default useStyles;
