import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMission } from '../context/MissionContext';
import { SeverityBadge } from '../components/SeverityBadge';
import {
  User,
  Mail,
  Shield,
  ShieldCheck,
  Key,
  LogOut,
  Layers,
  MapPin,
  Radio,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Copy,
  Check,
  Flame,
  Globe2,
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { stats, clusters } = useMission();
  const navigate = useNavigate();

  const [copiedEmail, setCopiedEmail] = useState(false);

  const displayName =
    user?.name ||
    (user?.email
      ? user.email
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Alex Mercer');

  const displayEmail = user?.email || 'ops.lead@aegis-recon.org';
  const displayRole = user?.role || 'Incident Commander';
  const provider = user?.provider || 'Firebase / Operational Core';
  const authenticatedAt = user?.authenticatedAt
    ? new Date(user.authenticatedAt).toLocaleString()
    : 'Active Session';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(displayEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 text-[#EAF2FF]">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-[#98AAC2]">
          <Link
            to="/dashboard"
            className="hover:text-[#00B7FF] transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Command Center</span>
          </Link>
          <span>/</span>
          <span className="text-[#EAF2FF]">Operator Profile & Session</span>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#18263A] border border-[#27364C] text-[#18D9A4] text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#18D9A4] animate-pulse" />
          <span>Session Authenticated</span>
        </div>
      </div>

      {/* Main Profile Hero Card */}
      <div className="pro-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Operator Avatar */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded bg-[#18263A] text-[#00B7FF] border border-[#00B7FF]/30 flex items-center justify-center font-mono font-bold text-2xl shrink-0">
              {initials}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#EAF2FF] tracking-tight">
                  {displayName}
                </h1>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#00B7FF]/10 text-[#00B7FF] border border-[#00B7FF]/30">
                  {displayRole}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#98AAC2] font-mono flex-wrap">
                <span className="flex items-center gap-1.5 text-[#EAF2FF]">
                  <Mail className="w-3.5 h-3.5 text-[#98AAC2]" />
                  <span>{displayEmail}</span>
                </span>
                <button
                  onClick={handleCopyEmail}
                  className="p-1 hover:text-[#00B7FF] text-[#98AAC2] transition"
                  title="Copy email to clipboard"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#18D9A4]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="text-[11px] text-[#98AAC2] flex items-center gap-2 pt-1 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00B7FF] shrink-0" />
                <span>Level-5 USAR Operations Clearance &bull; Decision Support Authority</span>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 py-2 bg-[#FF5A70]/10 hover:bg-[#FF5A70]/20 text-[#FF5A70] border border-[#FF5A70]/30 text-xs font-mono font-bold rounded flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Account Details & Session Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Security & Authentication Identity */}
        <div className="pro-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#27364C]">
            <Key className="w-4 h-4 text-[#00B7FF]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#EAF2FF]">
              Authentication & Security Credentials
            </h3>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded bg-[#18263A] border border-[#27364C]">
              <span className="text-[#98AAC2]">Auth Provider</span>
              <span className="font-semibold text-[#EAF2FF]">{provider}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-[#18263A] border border-[#27364C]">
              <span className="text-[#98AAC2]">Assigned Call-Sign</span>
              <span className="text-[#00B7FF] font-bold">
                {user?.callsign || 'TAC-LEAD-01'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-[#18263A] border border-[#27364C]">
              <span className="text-[#98AAC2]">Authenticated Since</span>
              <span className="text-[#EAF2FF] text-[11px]">{authenticatedAt}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-[#18263A] border border-[#27364C]">
              <span className="text-[#98AAC2]">Session Token Type</span>
              <span className="text-[#18D9A4] text-[11px]">JWT (Encrypted Local)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Mission Operational Telemetry */}
        <div className="pro-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#27364C]">
            <Globe2 className="w-4 h-4 text-[#00B7FF]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#EAF2FF]">
              Operational Sector Telemetry
            </h3>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded bg-[#18263A] border border-[#27364C]">
              <span className="text-[#98AAC2]">Active Mission</span>
              <span className="font-semibold text-[#EAF2FF]">Operation Aegis: Sector-7</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-[#18263A] border border-[#27364C]">
              <span className="text-[#98AAC2]">Monitored Sectors</span>
              <span className="text-[#00B7FF] font-bold">{clusters.length} Sectors</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-[#18263A] border border-[#27364C]">
              <span className="text-[#98AAC2]">Total Signals Tracked</span>
              <span className="text-[#EAF2FF]">{stats?.total_signals || 395} Detections</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded bg-[#18263A] border border-[#27364C]">
              <span className="text-[#98AAC2]">Critical Triage Priority</span>
              <span className="text-[#FF5A70] font-bold">
                {clusters.filter((c) => c.classification === 'CRITICAL').length} Sectors
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
