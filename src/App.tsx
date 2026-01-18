import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import TaliDashboard from './pages/dashboard/TaliDashboard';
import CalisanDashboard from './pages/dashboard/CalisanDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import Policies from './pages/dashboard/Policies';

import CreateQuote from './pages/quotes/CreateQuote';

// Role-based route protection
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { profile, loading } = useAuth();

  if (loading) return <div>Yükleniyor...</div>;
  
  if (!profile) return <Navigate to="/login" />;
  
  if (!allowedRoles.includes(profile.role)) {
    // Redirect to their appropriate dashboard
    if (profile.role === 'tali') return <Navigate to="/dashboard/tali" />;
    if (profile.role === 'calisan') return <Navigate to="/dashboard/calisan" />;
    if (profile.role === 'admin') return <Navigate to="/dashboard/admin" />;
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<Layout />}>
        {/* Redirect root to appropriate dashboard based on role */}
        <Route index element={
          !profile ? <Navigate to="/login" /> :
          profile.role === 'tali' ? <Navigate to="/dashboard/tali" /> :
          profile.role === 'calisan' ? <Navigate to="/dashboard/calisan" /> :
          <Navigate to="/dashboard/admin" />
        } />

        <Route path="dashboard/tali" element={
          <ProtectedRoute allowedRoles={['tali']}>
            <TaliDashboard />
          </ProtectedRoute>
        } />

        <Route path="dashboard/calisan" element={
          <ProtectedRoute allowedRoles={['calisan']}>
            <CalisanDashboard />
          </ProtectedRoute>
        } />

        <Route path="policies" element={
          <ProtectedRoute allowedRoles={['calisan', 'admin']}>
            <Policies />
          </ProtectedRoute>
        } />
        
        <Route path="dashboard/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Quote Creation */}
        <Route path="quotes/create" element={
          <ProtectedRoute allowedRoles={['tali']}>
            <CreateQuote />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
