import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppRoutes from './Routes';
import { ToastContainer } from 'react-toastify';
import { theme } from './theme';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppRoutes />
          {/* Limita toasts simultâneos e mostra os mais novos no topo */}
          <ToastContainer limit={3} newestOnTop />
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
