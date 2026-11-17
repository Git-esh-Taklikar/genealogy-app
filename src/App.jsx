import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import TreeView from './pages/TreeView';
import Pathfinder from './pages/Pathfinder';
import EventList from './pages/EventList';
import EventPage from './pages/EventPage';
import KioskMode from './pages/KioskMode';
import Upload from './pages/Upload';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-warm-50">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tree/:personId"
        element={
          <ProtectedRoute>
            <Layout fullWidth>
              <TreeView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pathfinder"
        element={
          <ProtectedRoute>
            <Layout>
              <Pathfinder />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Layout>
              <EventList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/event/:code"
        element={
          <ProtectedRoute>
            <Layout>
              <EventPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/kiosk/:code" element={<KioskMode />} />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Layout>
              <Upload />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

