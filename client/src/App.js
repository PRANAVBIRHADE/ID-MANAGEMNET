import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudentHomePage from './pages/StudentHomePage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import OperatorDashboard from './pages/OperatorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CalendarPage from './pages/CalendarPage';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationProvider } from './context/NotificationContext';
import PWARegistration from './components/PWARegistration';

function AppRoutes({ onLogout, isLoggedIn, onLogin, userRole }) {
  const location = useLocation();
  
  return (
    <NotificationProvider>
      <NavBar onLogout={onLogout} isLoggedIn={isLoggedIn} />
      <Routes>
        <Route path="/" element={
          isLoggedIn && userRole === 'student' ? 
            <StudentHomePage /> : 
            <LandingPage />
        } />
        <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/dashboard/operator" element={<ProtectedRoute><OperatorDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
      </Routes>
      <PWARegistration />
    </NotificationProvider>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // Check authentication status on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // Try to determine role from current path or token
      const path = window.location.pathname;
      if (path.includes('/dashboard/operator')) {
        setUserRole('operator');
      } else if (path.includes('/dashboard/student')) {
        setUserRole('student');
      }
    }
  }, []);

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setUserRole(role);
    if (role === 'operator') navigate('/dashboard/operator');
    else if (role === 'student') navigate('/');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AppRoutes 
      onLogout={handleLogout} 
      isLoggedIn={isLoggedIn} 
      onLogin={handleLogin}
      userRole={userRole}
    />
  );
}
