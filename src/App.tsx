import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <Router>
      <AppRoutes />
      <ToastContainer />
    </Router>
  );
}

export default App;
