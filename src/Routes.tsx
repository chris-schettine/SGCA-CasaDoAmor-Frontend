import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { TableSkeleton } from './components/SuspenseWrapper';

// Componentes de Rota
const Layout = lazy(() => import('./components/Layout'));
const AdminRoute = lazy(() => import('./components/AdminRoute'));
const PrivateRoute = lazy(() => import('./components/PrivateRoute'));
const PublicRoute = lazy(() => import('./components/PublicRoute')); 

// Pages Públicas
const LandingPage = lazy(() => import('./pages/LandingPage')); 
const AboutPage = lazy(() => import('./pages/About')); // Se tiver criado a página Sobre
const LoginPage = lazy(() => import('./pages/Login'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPassword'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmail'));
const ActivateAccountPage = lazy(() => import('./pages/ActivateAccount'));
const LoginVerify2FAPage = lazy(() => import('./pages/LoginVerify2FA'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Pages Privadas
const Patients = lazy(() => import('./pages/Patients'));
const PatientInformation = lazy(() => import('./pages/PatientInformation'));
const MedicalRecordPage = lazy(() => import('./pages/MedicalRecord'));
const PatientEditPage = lazy(() => import('./pages/PatientEdit'));
const PatientRegisterPage = lazy(() => import('./pages/PatientRegister'));
const CompanionRegisterPage = lazy(() => import('./pages/CompanionRegister'));
const CompanionEditPage = lazy(() => import('./pages/CompanionEdit'));
const CompanionInformation = lazy(() => import('./pages/CompanionInformation'));
const Companions = lazy(() => import('./pages/Companions'));
const RelatoryPage = lazy(() => import('./components/RelatoryPage'));
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'));
const Users = lazy(() => import('./pages/Users'));
const SessionsPage = lazy(() => import('./pages/Sessions'));
const UserRegisterPage = lazy(() => import('./pages/UserRegister'));
const UserEditPage = lazy(() => import('./pages/UserEdit'));
const MyProfilePage = lazy(() => import('./pages/MyProfile'));
const ConsentimentoLGPDPage = lazy(() => import('./pages/ConsentimentoLGPD'));

const preloadRoutes = () => {
  import('./pages/Login');
  import('./pages/Patients');
  import('./components/Layout');
  import('./pages/LandingPage');
};

const AppRoutes = () => {
  useEffect(() => {
    const timer = setTimeout(() => preloadRoutes(), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
  <Suspense fallback={<TableSkeleton rows={10} />}>
    <Routes>
      
      <Route path="/" element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      } />

     
      <Route path="/about" element={<AboutPage />} />

   
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      
    
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/activate-account" element={<ActivateAccountPage />} />
      <Route path="/login/verify-2fa" element={<LoginVerify2FAPage />} />
      
      
      
      
      <Route

        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
     
        <Route path="/patients" element={<Patients />} />
        
     
        <Route path="patient/information" element={<PatientInformation />} />
        <Route path="patient/information/medical-record" element={<MedicalRecordPage />} />
        <Route path="patient/edit/:id" element={<PatientEditPage />} />
        <Route path="/patient/report/:id" element={<RelatoryPage />} />
        
        <Route path="companions" element={<Companions />} />
        <Route path="companion/information" element={<CompanionInformation />} />
        <Route path="companion/edit/:id" element={<CompanionEditPage />} />
        
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
        <Route path="consentimentos-lgpd" element={<ConsentimentoLGPDPage />} />

        <Route path="patient/register" element={<PatientRegisterPage />} />
        <Route path="patient/companion/register" element={<CompanionRegisterPage />} />
        <Route path="user/register" element={<UserRegisterPage />} />
        <Route path="user/edit/:id" element={<UserEditPage />} />
      </Route>

      {/* Rota de erro */}
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  </Suspense>
  );
};

export default AppRoutes;