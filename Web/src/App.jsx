import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Landing from './pages/Landing';
import { Login, Register } from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Questionnaire from './pages/Questionnaire';
import Home from './pages/Home';
import Exercises from './pages/Exercises';
import Routines from './pages/Routines';
import Favorites from './pages/Favorites';
import Admin from './pages/Admin';
import Preview from './pages/Preview';
import VerifyEmail from './pages/VerifyEmail';
import NotFound from './pages/NotFound';
import './index.css';

// ─── Route Guards ─────────────────────────────────────────────

function ProtectedRoute({ children, allowQuestionnaire = false }) {
  const { currentUser, loading, hasCompletedQuestionnaire } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'SUPER' && !hasCompletedQuestionnaire() && !allowQuestionnaire) {
    return <Navigate to="/questionnaire" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'SUPER') return <Navigate to="/home" replace />;
  return children;
}

// ─── Routes ───────────────────────────────────────────────────

function AppRoutes() {
  const { currentUser } = useAuth();
  // Helper: admins go to /admin, users to /home
  const homeRedirect = currentUser?.role === 'SUPER'
    ? <Navigate to="/admin" replace />
    : <Navigate to="/home" replace />;
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={currentUser ? homeRedirect : <Landing />} />
      <Route path="/login" element={currentUser ? homeRedirect : <Login />} />
      <Route path="/register" element={currentUser ? <Navigate to="/questionnaire" replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/preview" element={<Preview />} />

      {/* Questionnaire — auth required */}
      <Route path="/questionnaire" element={
        <ProtectedRoute allowQuestionnaire={true}>
          <Questionnaire />
        </ProtectedRoute>
      } />

      {/* Protected — auth required */}
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/exercises" element={<ProtectedRoute><Exercises /></ProtectedRoute>} />
      <Route path="/routines" element={<ProtectedRoute><Routines /></ProtectedRoute>} />
      <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />

      {/* Admin only */}
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  // Initialize dark mode class on mount so pages without Header (like Admin) still get it
  useEffect(() => {
    if (localStorage.getItem('mx_theme') === 'dark') {
      document.body.classList.add('dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
