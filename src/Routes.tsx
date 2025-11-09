import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { TableSkeleton } from './components/SuspenseWrapper';

// Lazy load de componentes principais
const Layout = lazy(() => import('./components/Layout'));
const AdminRoute = lazy(() => import('./components/AdminRoute'));
const PrivateRoute = lazy(() => import('./components/PrivateRoute'));

// Lazy load de páginas com preload
const LoginPage = lazy(() => import('./pages/Login'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPassword'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmail'));
const ActivateAccountPage = lazy(() => import('./pages/ActivateAccount'));
const LoginVerify2FAPage = lazy(() => import('./pages/LoginVerify2FA'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Lazy load de páginas privadas
const Patients = lazy(() => import('./pages/Patients'));
const PatientInformation = lazy(() => import('./pages/PatientInformation'));
const MedicalRecordPage = lazy(() => import('./pages/MedicalRecord'));
const PatientEditPage = lazy(() => import('./pages/PatientEdit'));
const PatientRegisterPage = lazy(() => import('./pages/PatientRegister'));
const CompanionRegisterPage = lazy(() => import('./pages/CompanionRegister'));
const CompanionEditPage = lazy(() => import('./pages/CompanionEdit'));
const RelatoryPage = lazy(() => import('./components/RelatoryPage'));
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'));

// Lazy load de páginas de usuários
const Users = lazy(() => import('./pages/Users'));
const SessionsPage = lazy(() => import('./pages/Sessions'));
const UserRegisterPage = lazy(() => import('./pages/UserRegister'));
const UserEditPage = lazy(() => import('./pages/UserEdit'));
const MyProfilePage = lazy(() => import('./pages/MyProfile'));

// Preload de rotas críticas
const preloadRoutes = () => {
  // Preload Login (rota inicial mais comum)
  import('./pages/Login');
  // Preload Patients (dashboard principal após login)
  import('./pages/Patients');
  // Preload Layout (sempre necessário em rotas privadas)
  import('./components/Layout');
};

const AppRoutes = () => {
  // Preload automático após 2 segundos de idle
  useEffect(() => {
    const timer = setTimeout(() => {
      preloadRoutes();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
  <Suspense fallback={<TableSkeleton rows={10} />}>
    <Routes>
    {/* Rotas Públicas */}
    <Route path="/login" element={<LoginPage />} />
    
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
    <Route path="/activate-account" element={<ActivateAccountPage />} />
    <Route path="/login/verify-2fa" element={<LoginVerify2FAPage />} />
    
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
      <Route path="/patient/report/:id" element={<RelatoryPage />} />
      <Route path="/auditoria" element={<AuditLogPage />} />

      <Route path="users" element={
        <AdminRoute>
          <Users />
        </AdminRoute>
      } />

      <Route path="sessions" element={
        <AdminRoute>
          <SessionsPage />
        </AdminRoute>
      } />

      <Route path="profile" element={<MyProfilePage />} />

      {/* Cadastros */}
      <Route path="patient/register" element={<PatientRegisterPage />} />
      <Route path="patient/companion/register" element={<CompanionRegisterPage />} />
      <Route path="companion/edit/:id" element={<CompanionEditPage />} />
      <Route path="user/register" element={<UserRegisterPage />} />
      <Route path="user/edit/:id" element={<UserEditPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Route>

  </Routes>
  </Suspense>
  );
};

export default AppRoutes;