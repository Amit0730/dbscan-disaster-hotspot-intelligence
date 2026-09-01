import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMission } from '../context/MissionContext';
import { useAuth } from '../context/AuthContext';
import { TacticalBadge } from './TacticalBadge';
import { ReportModal } from './ReportModal';
import {
  Shield,
  Activity,
  RefreshCw,
  FileText,
  Radio,
  Sliders,
  AlertCircle,
  Database,
  ExternalLink,
  LogOut,
  User,
} from 'lucide-react';

export const Navbar = () => {
  const { mission, stats, loading, loadDemoMission } = useMission();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [reportOpen, setReportOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleReloadDemo = async () => {
    setRefreshing(true);
    try {
      await loadDemoMission();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDemo = mission?.source === 'DEMO';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur border-b border-slate-800 text-slate-200">
        <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
          {/* Brand & Project Metadata */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-lg shadow-cyan-950/50">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black tracking-wider text-slate-100 text-base uppercase">
                    Aegis Recon
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                    SIH26030
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 tracking-tight hidden sm:inline">
                  DBSCAN Disaster Hotspot Clustering & Prioritization
                </span>
              </div>
            </Link>
          </div>

          {/* Status & Tactical Mode Indicator */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-900 border border-slate-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-mono text-slate-300">
                SYS: <span className="text-emerald-400 font-bold">ONLINE</span>
              </span>
            </div>

            {isDemo ? (
              <TacticalBadge variant="simulated">SIMULATED DATA</TacticalBadge>
            ) : (
              <TacticalBadge variant="active">LIVE MISSION</TacticalBadge>
            )}
          </div>

          {/* Actions & User Profile */}
          <div className="flex items-center gap-2.5">
            {/* Operator Badge */}
            {user && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono">
                <span className="text-base">{user.avatar || '🎖️'}</span>
                <div>
                  <div className="font-bold text-slate-200 leading-none">{user.callsign}</div>
                  <div className="text-[10px] text-cyan-400 leading-none mt-0.5">{user.role}</div>
                </div>
              </div>
            )}

            <button
              onClick={handleReloadDemo}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition-all disabled:opacity-50 cursor-pointer"
              title="Reload realistic 385-signal disaster scenario"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Load Demo Mission</span>
            </button>

            <button
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-all cursor-pointer shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Report</span>
            </button>

            {/* Logout Button */}
            {user && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 transition-all cursor-pointer"
                title="Logout from tactical terminal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mission Debrief Report Modal */}
      {reportOpen && <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />}
    </>
  );
};
