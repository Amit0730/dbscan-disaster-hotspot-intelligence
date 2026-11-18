import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMission } from '../context/MissionContext';
import { useAuth } from '../context/AuthContext';
import { TacticalBadge } from './TacticalBadge';
import { ReportModal } from './ReportModal';
import {
  Shield,
  RefreshCw,
  FileText,
  LogOut,
  User,
  ChevronDown,
  Mail,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const Navbar = () => {
  const { mission, stats, loading, loadDemoMission } = useMission();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [reportOpen, setReportOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReloadDemo = async () => {
    setRefreshing(true);
    try {
      await loadDemoMission();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const isDemo = mission?.source === 'DEMO';

  // Compute clean display name and initials
  const displayName =
    user?.name ||
    (user?.email ? user.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Alex Mercer');

  const displayEmail = user?.email || 'ops.lead@aegis-recon.org';
  const displayRole = user?.role || 'Search & Rescue Lead';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 w-full pro-header text-slate-200 select-none">
        <div className="px-4 lg:px-6 h-15 flex items-center justify-between gap-4">
          {/* Brand & Project Metadata */}
          <div className="flex items-center gap-3.5">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8.5 h-8.5 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:border-sky-400/50 group-hover:bg-sky-500/15 transition-all duration-200 shadow-sm">
                <Shield className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-100 text-sm tracking-tight group-hover:text-white transition-colors">
                    Aegis Recon
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-normal tracking-tight hidden sm:block">
                  Aerial Search & Rescue Operations
                </div>
              </div>
            </Link>
          </div>

          {/* System Status & Mission Badge */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 text-[11px] font-mono text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Engine Online</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-slate-300">
              <span className="text-slate-500">Active Sector:</span>
              <span className="text-sky-300 font-medium">Sector 4 (385 Feeds)</span>
            </div>
          </div>

          {/* Actions & Profile Dropdown Menu */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleReloadDemo}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 hover:border-sky-500/40 transition-all duration-150 disabled:opacity-50 cursor-pointer shadow-sm"
              title="Reset with 385-signal realistic scenario"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Mission</span>
            </button>

            <button
              onClick={() => setReportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] transition-all duration-150 cursor-pointer shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Debrief Report</span>
            </button>

            {/* Profile Dropdown Button */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  navigate('/profile');
                }}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] hover:border-sky-500/40 transition-all cursor-pointer select-none shadow-xs group"
                title="View Operator Profile & Account"
              >
                {/* Avatar circle with initials */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-[11px] font-mono shadow-xs group-hover:scale-105 transition-transform">
                  {initials}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="font-semibold text-xs text-slate-100 group-hover:text-white leading-none">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans leading-none mt-0.5">
                    {displayRole}
                  </span>
                </div>
                <User className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 transition-colors ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mission Debrief Report Modal */}
      {reportOpen && <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />}
    </>
  );
};
