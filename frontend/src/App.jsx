import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MissionProvider } from './context/MissionContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { LandingPage } from './pages/LandingPage';
import { MissionDashboard } from './pages/MissionDashboard';
import { DroneDataPage } from './pages/DroneDataPage';
import { SignalAnalysisPage } from './pages/SignalAnalysisPage';
import { HotspotMapPage } from './pages/HotspotMapPage';
import { DbscanClusteringPage } from './pages/DbscanClusteringPage';
import { ClusterAnalyticsPage } from './pages/ClusterAnalyticsPage';
import { ValidationPage } from './pages/ValidationPage';
import { SystemInfoPage } from './pages/SystemInfoPage';

function App() {
  return (
    <MissionProvider>
      <HashRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
          <Navbar />
          <div className="flex-1 flex">
            <Sidebar />
            <main className="flex-1 min-w-0 bg-slate-950 overflow-y-auto">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<MissionDashboard />} />
                <Route path="/data" element={<DroneDataPage />} />
                <Route path="/signals" element={<SignalAnalysisPage />} />
                <Route path="/map" element={<HotspotMapPage />} />
                <Route path="/clustering" element={<DbscanClusteringPage />} />
                <Route path="/analytics" element={<ClusterAnalyticsPage />} />
                <Route path="/validation" element={<ValidationPage />} />
                <Route path="/system-info" element={<SystemInfoPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </HashRouter>
    </MissionProvider>
  );
}

export default App;
