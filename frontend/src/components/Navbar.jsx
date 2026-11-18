import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMission } from '../context/MissionContext';
import { useAuth } from '../context/AuthContext';
import { StatusIndicator } from './StatusIndicator';
import { SeverityBadge } from './SeverityBadge';
import { ReportModal } from './ReportModal';
import { formatTime } from '../utils/geo';
import {
  Shield,
  RefreshCw,
  FileText,
  User,
  Menu,
  Clock,
  Compass,
  Database,
  Radio,
} from 'lucide-react';

export const Navbar = ({ onToggleMobileMenu }) => {
  const {
    mission,
    stats,
    loading,
    loadDemoMission,
    isLiveBackend,
    dataFreshness,
  } = useMission();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [reportOpen, setReportOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

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

  const isDemo = mission?.source === 'DEMO';

  const displayName =
    user?.name ||
    (user?.email ? user.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Alex Mercer');

  const displayRole = user?.role || 'Search & Rescue Lead';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const missionName = mission?.name || 'Operation Aegis: Sector-4 Recon';
  const sectorLabel = 'Sector 4 · Urban Collapse';
  const detectionCount = stats?.total_signals || 385;

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-14 bg-[#0D1624] border-b border-[#27364C] text-[#EAF2FF] select-none">
        <div className="px-3 sm:px-5 h-full flex items-center justify-between gap-3">
          {/* Left: Mobile Menu Toggle + Brand Identity */}
          <div className="flex items-center gap-3">
            {onToggleMobileMenu && (
              <button
                onClick={onToggleMobileMenu}
                className="p-1.5 rounded text-[#98AAC2] hover:text-[#EAF2FF] hover:bg-[#18263A] md:hidden cursor-pointer"
                title="Toggle Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded bg-[#18263A] border border-[#27364C] flex items-center justify-center text-[#00B7FF] group-hover:border-[#00B7FF] transition-colors">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-[#EAF2FF] group-hover:text-white font-mono">
                    AEGIS RECON
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#18263A] text-[#98AAC2] border border-[#27364C]">
                    OPS INTEL
                  </span>
                </div>
              </div>
            </Link>

            {/* Vertical Divider */}
            <div className="hidden lg:block h-5 w-[1px] bg-[#27364C]" />

            {/* Active Mission & Sector Metadata */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
              <span className="text-[#98AAC2]">Mission:</span>
              <span className="text-[#EAF2FF] font-semibold truncate max-w-[220px]" title={missionName}>
                {missionName}
              </span>
              <span className="text-[#27364C]">•</span>
              <span className="text-[#98AAC2]">Sector:</span>
              <span className="text-[#00B7FF] font-medium">{sectorLabel}</span>
            </div>
          </div>

          {/* Middle: System Health & Freshness Indicators */}
          <div className="hidden xl:flex items-center gap-3">
            {isLiveBackend ? (
              <StatusIndicator status="online" label="FastAPI Core" details="Online" />
            ) : (
              <StatusIndicator status="standalone" label="Client Engine" details="Standalone" />
            )}

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#131F30] border border-[#27364C] text-[11px] font-mono text-[#98AAC2]">
              <Clock className="w-3 h-3 text-[#98AAC2]" />
              <span>Synced:</span>
              <span className="text-[#EAF2FF] font-medium">
                {formatTime(dataFreshness)}
              </span>
            </div>

            {isDemo ? (
              <SeverityBadge severity="SIMULATED" size="sm" />
            ) : (
              <SeverityBadge severity="LIVE" size="sm" />
            )}
          </div>

          {/* Right: Quick Operational Actions & Profile Menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReloadDemo}
              disabled={loading || refreshing}
              className="btn-secondary text-xs py-1 px-2.5"
              title="Reset mission with 385-signal drone scenario"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#00B7FF] ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Scenario</span>
            </button>

            <button
              onClick={() => setReportOpen(true)}
              className="btn-secondary text-xs py-1 px-2.5"
              title="Generate Mission Debrief PDF Report"
            >
              <FileText className="w-3.5 h-3.5 text-[#F5B94E]" />
              <span className="hidden sm:inline">Debrief Report</span>
            </button>

            {/* Profile Menu Button */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded bg-[#131F30] hover:bg-[#18263A] border border-[#27364C] hover:border-[#00B7FF]/50 transition-colors cursor-pointer select-none"
                title="View Operator Profile"
              >
                <div className="w-6 h-6 rounded bg-[#18263A] border border-[#27364C] text-[#00B7FF] flex items-center justify-center font-bold text-[10px] font-mono">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-semibold text-[11px] text-[#EAF2FF] leading-none">
                    {displayName}
                  </span>
                  <span className="text-[9px] text-[#98AAC2] font-mono leading-none mt-0.5">
                    {displayRole}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Debrief Report Modal */}
      {reportOpen && <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />}
    </>
  );
};
