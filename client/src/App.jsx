import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Shopping from './pages/Shopping';
import Chores from './pages/Chores';
import Appointments from './pages/Appointments';
import Todos from './pages/Todos';
import Reminders from './pages/Reminders';
import Whiteboard from './pages/Whiteboard';
import VisionBoard from './pages/VisionBoard';
import Messages from './pages/Messages';
import Webhooks from './pages/Webhooks';
import Layout from './components/Layout';
import { motion, AnimatePresence } from 'framer-motion';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--purple-400)' }}>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--purple-400)' }}>Loading...</p>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function AppRoutes() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="shopping" element={<Shopping />} />
            <Route path="chores" element={<Chores />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="todos" element={<Todos />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="whiteboard" element={<Whiteboard />} />
            <Route path="vision-board" element={<VisionBoard />} />
            <Route path="messages" element={<Messages />} />
            <Route path="webhooks" element={<Webhooks />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
