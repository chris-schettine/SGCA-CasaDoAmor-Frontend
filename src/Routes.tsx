import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Users from './pages/Users';
import AdminRoute from './components/AdminRoute';
import CompanionRegisterPage from './pages/CompanionRegister';
import Patients from './pages/Patients';
import PatientRegisterPage from './pages/PatientRegister';
import UserRegisterPage from './pages/UserRegister';
import UserEditPage from './pages/UserEdit';
import MyProfilePage from './pages/MyProfile';
import LoginPage from './pages/Login';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './components/PrivateRoute';
import PatientInformation from './pages/PatientInformation';
import MedicalRecordPage from './pages/MedicalRecord';
import PatientEditPage from './pages/PatientEdit';
import VerifyEmailPage from './pages/VerifyEmail';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword'; 
import ActivateAccountPage from './pages/ActivateAccount';

const AppRoutes = () => (
  <Routes>
    {/* Rotas Públicas */}
    <Route path="login" element={<LoginPage />} />
    
    <Route path="forgot-password" element={<ForgotPasswordPage />} />
    <Route path="reset-password" element={<ResetPasswordPage />} />
    <Route path="verify-email/:token" element={<VerifyEmailPage />} />
    <Route path="activate-account" element={<ActivateAccountPage />} />
    {/* Rotas Privadas */}
    <Route
      path="/"
      element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }
    >
      <Route index element={<Patients />} />

      <Route path="patients" element={<Patients />} />
      <Route path="patient/information" element={<PatientInformation />} />
      <Route path="patient/information/medical-record" element={<MedicalRecordPage />} />
      <Route path="patient/edit/:id" element={<PatientEditPage />} />

      <Route path="users" element={
        <AdminRoute>
          <Users />
        </AdminRoute>
      } />

      <Route path="profile" element={<MyProfilePage />} />

      {/* Cadastros */}
      <Route path="patient/register" element={<PatientRegisterPage />} />
      <Route path="patient/companion/register" element={<CompanionRegisterPage />} />
      <Route path="user/register" element={<UserRegisterPage />} />
      <Route path="user/edit/:id" element={<UserEditPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Route>

  </Routes>
);

export default AppRoutes;