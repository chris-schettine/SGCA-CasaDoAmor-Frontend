import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes';
import { ToastContainer } from 'react-toastify';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
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
