import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const AdminApp: React.FC = () => {
  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    return !!token;
  };
  
  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!checkAuth()) {
      return <Navigate to="/admin/login" />;
    }
    return <>{children}</>;
  };
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AdminApp;