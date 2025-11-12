import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { TableSkeleton } from './components/SuspenseWrapper';

// Carregamento dinamico (Lazy Loading) dos componentes de estrutura de rotas
// Isso ajuda a reduzir o tamanho inicial do bundle da aplicacao
const Layout = lazy(() => import('./components/Layout'));
const AdminRoute = lazy(() => import('./components/AdminRoute'));
const PrivateRoute = lazy(() => import('./components/PrivateRoute'));
const PublicRoute = lazy(() => import('./components/PublicRoute')); 

// Paginas Publicas
// Acessiveis por qualquer usuario, logado ou nao (com excecao daquelas protegidas por PublicRoute)
const LandingPage = lazy(() => import('./pages/LandingPage')); 
const AboutPage = lazy(() => import('./pages/About')); 
const LoginPage = lazy(() => import('./pages/Login'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPassword'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmail'));
const ActivateAccountPage = lazy(() => import('./pages/ActivateAccount'));
const LoginVerify2FAPage = lazy(() => import('./pages/LoginVerify2FA'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Paginas Privadas (Area Logada)
// So podem ser acessadas apos autenticacao bem-sucedida
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

// Funcao para pre-carregar rotas criticas em segundo plano
// Melhora a percepcao de performance apos o carregamento inicial
const preloadRoutes = () => {
  import('./pages/Login');
  import('./pages/Patients');
  import('./components/Layout');
  import('./pages/LandingPage');
};

const AppRoutes = () => {
  // Efeito para iniciar o pre-carregamento das rotas apos 2 segundos
  useEffect(() => {
    const timer = setTimeout(() => preloadRoutes(), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
  // Suspense exibe um esqueleto de carregamento enquanto o codigo da pagina e baixado
  <Suspense fallback={<TableSkeleton rows={10} />}>
    <Routes>
      
      {/* Rota Raiz: Landing Page */}
      {/* Protegida por PublicRoute: Se o usuario ja estiver logado, redireciona para o sistema */}
      <Route path="/" element={
        <PublicRoute>
          <LandingPage />
        </PublicRoute>
      } />

      {/* Pagina Sobre/Institucional */}
      <Route path="/about" element={<AboutPage />} />

      {/* Pagina de Login */}
      {/* Tambem protegida por PublicRoute para evitar acesso de usuarios ja autenticados */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      
      {/* Rotas de Recuperacao e Ativacao de Conta */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/activate-account" element={<ActivateAccountPage />} />
      <Route path="/login/verify-2fa" element={<LoginVerify2FAPage />} />
      
      
      {/* Rotas Privadas e do Sistema Principal */}
      {/* Todas as rotas filhas estao protegidas pelo componente PrivateRoute */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* Dashboard Principal: Lista de Pacientes */}
        <Route path="/patients" element={<Patients />} />
        
        {/* Gestao de Pacientes */}
        <Route path="patient/information" element={<PatientInformation />} />
        <Route path="patient/information/medical-record" element={<MedicalRecordPage />} />
        <Route path="patient/edit/:id" element={<PatientEditPage />} />
        <Route path="/patient/report/:id" element={<RelatoryPage />} />
        <Route path="patient/register" element={<PatientRegisterPage />} />
        
        {/* Gestao de Acompanhantes */}
        <Route path="companions" element={<Companions />} />
        <Route path="companion/information" element={<CompanionInformation />} />
        <Route path="companion/edit/:id" element={<CompanionEditPage />} />
        <Route path="patient/companion/register" element={<CompanionRegisterPage />} />
        
        {/* Auditoria e Logs (Acesso restrito) */}
        <Route path="/auditoria" element={<AuditLogPage />} />

        {/* Gestao de Usuarios do Sistema (Requer permissao de Administrador) */}
        <Route path="users" element={
          <AdminRoute>
            <Users />
          </AdminRoute>
        } />
        
        {/* Gestao de Sessoes Ativas (Requer permissao de Administrador) */}
        <Route path="sessions" element={
          <AdminRoute>
            <SessionsPage />
          </AdminRoute>
        } />
        
        {/* Cadastro de Usuarios (Acesso interno) */}
        <Route path="user/register" element={<UserRegisterPage />} />
        <Route path="user/edit/:id" element={<UserEditPage />} />

        {/* Perfil do Usuario Logado e Termos */}
        <Route path="profile" element={<MyProfilePage />} />
        <Route path="consentimentos-lgpd" element={<ConsentimentoLGPDPage />} />

      </Route>

      {/* Rota de "Página Não Encontrada" (404) para qualquer URL desconhecida */}
      <Route path="*" element={<NotFoundPage />} />

    </Routes>
  </Suspense>
  );
};

export default AppRoutes;