import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8f5cff', // neon purple
    },
    secondary: {
      main: '#ff4fd8', // neon pink
    },
    background: {
      default: '#1a1446', // deep blue/purple
      paper: 'rgba(34, 24, 74, 0.85)', // glassmorphic card
    },
    text: {
      primary: '#fff',
      secondary: '#bdbaff',
    },
  },
  typography: {
    fontFamily: 'Poppins, Roboto, Arial, sans-serif',
    h2: { fontWeight: 800, letterSpacing: '-1px' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          background: 'linear-gradient(90deg, #8f5cff 0%, #ff4fd8 100%)',
          color: '#fff',
          boxShadow: '0 2px 16px #8f5cff44',
          transition: '0.3s',
          '&:hover': {
            background: 'linear-gradient(90deg, #ff4fd8 0%, #8f5cff 100%)',
            boxShadow: '0 4px 32px #ff4fd888',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(34, 24, 74, 0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: 24,
          boxShadow: '0 4px 32px #8f5cff22',
        },
      },
    },
  },
});

export default theme; 