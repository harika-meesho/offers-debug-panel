import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#6C3FC5' },      // Meesho purple
    background: { default: '#F5F5F5' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#6C3FC5',
          '&:hover': { backgroundColor: '#5a33a8' },
        },
      },
    },
  },
});
