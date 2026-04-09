import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { isAuthenticated, getCurrentUser } from './services/auth';
import AdminMachines from './pages/AdminMachines';
import ProfileSetup from './pages/ProfileSetup';
import SocioDashboard from './pages/SocioDashboard';


const PrivateRoute = ({ children, allowedRoles = [] }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  const user = getCurrentUser();
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Si no tiene el rol permitido, redirige a la página correspondiente según su rol
    if (user?.role === 'admin') return <Navigate to="/admin/machines" />;
    if (user?.role === 'socio') return <Navigate to="/dashboard" />;
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route
          path="/admin/machines"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminMachines />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile-setup"
          element={
            <PrivateRoute allowedRoles={['socio']}>
              <ProfileSetup />
            </PrivateRoute>
          }
        />

        <Route
          path="/socio/dashboard"
          element={
            <PrivateRoute allowedRoles={['socio']}>
              <SocioDashboard />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
