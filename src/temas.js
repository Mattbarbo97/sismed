import { createTheme } from '@mui/material/styles';

const temaUNNA = createTheme({
  palette: {
    primary: {
      main: '#a26e35',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c0c0c0',
      contrastText: '#333333',
    },
    background: {
      default: '#f7f7f7',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#555555',
    },
  },
  typography: {
    fontFamily: '"Open Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.0rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.6rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.6rem',
      fontWeight: '600',
      textAlign: 'left', // Alinha à esquerda
    },
    // Continue definindo os estilos para h3, h4, h5, h6, subtitle1, subtitle2, body1, body2, etc.
  },
  spacing: 8, // Adicione esta linha para definir a função spacing
  components: {
    MuiDrawer: { // Ou o componente que você usa para o menu
      styleOverrides: {
        paper: {
          backgroundColor: '#a26e35',
          color: '#ffffff',
          // Outros estilos específicos para o drawer
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#ffffff',
        }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          // Estilos para o texto do menu, como tamanho da fonte, peso, etc.
          fontSize: '0.8rem',
          fontWeight: 500,
        }
      }
    },
    // Adicione mais personalizações conforme necessário
  },
});

export default temaUNNA;
