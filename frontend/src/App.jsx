import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MissionProvider } from './context/MissionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { MissionDashboard } from './pages/MissionDashboard';
import { DroneDataPage } from './pages/DroneDataPage';
import { SignalAnalysisPage } from './pages/SignalAnalysisPage';
import { HotspotMapPage } from './pages/HotspotMapPage';
import { DbscanClusteringPage } from './pages/DbscanClusteringPage';
import { ClusterAnalyticsPage } from './pages/ClusterAnalyticsPage';
import { ValidationPage } from './pages/ValidationPage';
import { SystemInfoPage } from './pages/SystemInfoPage';
import { ProfilePage } from './pages/ProfilePage';

// Protected Route Guard Component
const ProtectedLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 min-w-0 bg-slate-950 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const AuthGate = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* 1. Public Authentication Route */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* 2. Protected Application Routes */}
      <Route
        path="/"
        element={
          <ProtectedLayout>
            <LandingPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <MissionDashboard />
          </ProtectedLayout>
        }
      />
      <Route
        path="/data"
        element={
          <ProtectedLayout>
            <DroneDataPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/signals"
        element={
          <ProtectedLayout>
            <SignalAnalysisPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedLayout>
            <HotspotMapPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/clustering"
        element={
          <ProtectedLayout>
            <DbscanClusteringPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedLayout>
            <ClusterAnalyticsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/validation"
        element={
          <ProtectedLayout>
            <ValidationPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/system-info"
        element={
          <ProtectedLayout>
            <SystemInfoPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedLayout>
            <ProfilePage />
          </ProtectedLayout>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <MissionProvider>
        <HashRouter>
          <AuthGate />
        </HashRouter>
      </MissionProvider>
    </AuthProvider>
  );
}

export default App;
