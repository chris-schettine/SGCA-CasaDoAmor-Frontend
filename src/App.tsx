import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <Router>
      <AppRoutes />
      {/* Limita toasts simultâneos e mostra os mais novos no topo */}
      <ToastContainer limit={3} newestOnTop />
    </Router>
  );
}

export default App;
