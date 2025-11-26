import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import RouteTransition from './motion/RouteTransition';
import { TableSkeleton } from './components/SuspenseWrapper';

// NOTE: global `requestIdleCallback` types are declared in `src/types/globals.d.ts`

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
// Usa requestIdleCallback para não bloquear o thread principal
const preloadRoutes = () => {
  // Preload apenas rotas críticas que provavelmente serão acessadas
  const criticalRoutes = [
    () => import('./pages/Login'),
    () => import('./pages/Patients'),
    () => import('./components/Layout'),
    () => import('./pages/Users'),
    () => import('./pages/Sessions'),
    () => import('./pages/AuditLogPage'),
  ];

  // Usa requestIdleCallback se disponível, senão usa setTimeout
  const schedulePreload = (callback: () => void) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout: 2000 });
    } else {
      setTimeout(callback, 2000);
    }
  };

  // Preload sequencial para não sobrecarregar
  criticalRoutes.forEach((routeLoader) => {
    schedulePreload(() => {
      routeLoader().catch(() => {
        // Silently fail - preload é otimização, não crítico
      });
    });
  });
};

const AppRoutes = () => {
  // Efeito para iniciar o pre-carregamento das rotas após interação inicial
  useEffect(() => {
    // Aguarda interação do usuário ou 3 segundos, o que vier primeiro
    let preloadScheduled = false;
    
    const schedulePreload = () => {
      if (!preloadScheduled) {
        preloadScheduled = true;
        preloadRoutes();
      }
    };

    // Preload após primeira interação (mouse, touch, keyboard)
    const events = ['mousedown', 'touchstart', 'keydown'];
    const handlers = events.map(event => {
      const handler = () => {
        schedulePreload();
        events.forEach(e => document.removeEventListener(e, handlers[events.indexOf(e)]));
      };
      document.addEventListener(event, handler, { once: true, passive: true });
      return handler;
    });

    // Fallback: preload após 3 segundos se não houver interação
    const fallbackTimer = setTimeout(schedulePreload, 3000);

    return () => {
      clearTimeout(fallbackTimer);
      events.forEach((event, index) => {
        document.removeEventListener(event, handlers[index]);
      });
    };
  }, []);

  return (
  // Suspense exibe um esqueleto de carregamento enquanto o codigo da pagina e baixado
  <Suspense fallback={<TableSkeleton rows={10} />}>
    <Routes>
      
      {/* Rota Raiz: Landing Page */}
      {/* Protegida por PublicRoute: Se o usuario ja estiver logado, redireciona para o sistema */}
      <Route path="/" element={
        <PublicRoute>
          <RouteTransition>
            <LandingPage />
          </RouteTransition>
        </PublicRoute>
      } />

      {/* Pagina Sobre/Institucional */}
      <Route path="/about" element={<RouteTransition><AboutPage /></RouteTransition>} />

      {/* Pagina de Login */}
      {/* Tambem protegida por PublicRoute para evitar acesso de usuarios ja autenticados */}
      <Route path="/login" element={
        <PublicRoute>
          <RouteTransition>
            <LoginPage />
          </RouteTransition>
        </PublicRoute>
      } />
      
      {/* Rotas de Recuperacao e Ativacao de Conta */}
      <Route path="/forgot-password" element={<RouteTransition><ForgotPasswordPage /></RouteTransition>} />
      <Route path="/reset-password" element={<RouteTransition><ResetPasswordPage /></RouteTransition>} />
      <Route path="/verify-email/:token" element={<RouteTransition><VerifyEmailPage /></RouteTransition>} />
      <Route path="/activate-account" element={<RouteTransition><ActivateAccountPage /></RouteTransition>} />
      <Route path="/login/verify-2fa" element={<RouteTransition><LoginVerify2FAPage /></RouteTransition>} />
      
      
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
        <Route path="/patients" element={<RouteTransition><Patients /></RouteTransition>} />
        
        {/* Gestao de Pacientes */}
        <Route path="patient/information" element={<RouteTransition><PatientInformation /></RouteTransition>} />
        <Route path="patient/information/medical-record" element={<RouteTransition><MedicalRecordPage /></RouteTransition>} />
        <Route path="patient/edit/:id" element={<RouteTransition><PatientEditPage /></RouteTransition>} />
        <Route path="/patient/report/:id" element={<RouteTransition><RelatoryPage /></RouteTransition>} />
        <Route path="patient/register" element={<RouteTransition><PatientRegisterPage /></RouteTransition>} />
        
        {/* Gestao de Acompanhantes */}
        <Route path="companions" element={<RouteTransition><Companions /></RouteTransition>} />
        <Route path="companion/information" element={<RouteTransition><CompanionInformation /></RouteTransition>} />
        <Route path="companion/edit/:id" element={<RouteTransition><CompanionEditPage /></RouteTransition>} />
        <Route path="patient/companion/register" element={<RouteTransition><CompanionRegisterPage /></RouteTransition>} />
        
        {/* Auditoria e Logs (Requer permissao de Administrador) */}
        <Route path="/auditoria" element={
          <AdminRoute>
            <RouteTransition>
              <AuditLogPage />
            </RouteTransition>
          </AdminRoute>
        } />

        {/* Gestao de Usuarios do Sistema (Requer permissao de Administrador) */}
        <Route path="users" element={
          <AdminRoute>
            <RouteTransition>
              <Users />
            </RouteTransition>
          </AdminRoute>
        } />
        
        {/* Gestao de Sessoes Ativas (Requer permissao de Administrador) */}
        <Route path="sessions" element={
          <AdminRoute>
            <RouteTransition>
              <SessionsPage />
            </RouteTransition>
          </AdminRoute>
        } />
        
        {/* Cadastro de Usuarios (Acesso interno) */}
        <Route path="user/register" element={<RouteTransition><UserRegisterPage /></RouteTransition>} />
        <Route path="user/edit/:id" element={<RouteTransition><UserEditPage /></RouteTransition>} />

        {/* Perfil do Usuario Logado e Termos */}
        <Route path="profile" element={<RouteTransition><MyProfilePage /></RouteTransition>} />
        <Route path="consentimentos-lgpd" element={<RouteTransition><ConsentimentoLGPDPage /></RouteTransition>} />

      </Route>

      {/* Rota de "Página Não Encontrada" (404) para qualquer URL desconhecida */}
      <Route path="*" element={<RouteTransition><NotFoundPage /></RouteTransition>} />

    </Routes>
  </Suspense>
  );
};

export default AppRoutes;
