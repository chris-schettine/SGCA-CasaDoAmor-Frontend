import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastContainerWrapper } from './components/ToastContainerWrapper';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AppRoutes />
          <ToastContainerWrapper />
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
