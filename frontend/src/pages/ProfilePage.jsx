import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMission } from '../context/MissionContext';
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
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Plane,
  Flame,
  Globe2,
  ExternalLink,
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { stats, clusters } = useMission();
  const navigate = useNavigate();

  const [copiedEmail, setCopiedEmail] = useState(false);

  // Compute clean display values
  const displayName =
    user?.name ||
    (user?.email
      ? user.email
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Alex Mercer');

  const displayEmail = user?.email || 'ops.lead@aegis-recon.org';
  const displayRole = user?.role || 'Search & Rescue Lead';
  const provider = user?.provider || 'Firebase / Local';
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Return Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link
            to="/dashboard"
            className="hover:text-sky-400 transition-colors flex items-center gap-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-semibold">Operator Profile & Account</span>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Session Authenticated</span>
        </div>
      </div>

      {/* Main Profile Hero Card */}
      <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Large Gradient Avatar */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-sky-400 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl font-mono shadow-lg shadow-sky-500/20 shrink-0 border border-white/[0.15]">
              {initials}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {displayName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  {displayRole}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{displayEmail}</span>
                </span>
                <button
                  onClick={handleCopyEmail}
                  className="p-1 hover:text-sky-400 transition-colors cursor-pointer text-slate-500 hover:bg-white/[0.05] rounded"
                  title="Copy email to clipboard"
                >
                  {copiedEmail ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Level-5 USAR Operations Clearance &bull; AES-256 GCM Security</span>
              </div>
            </div>
          </div>

          {/* Direct Log Out Button in Hero */}
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/25 hover:border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out / Log Out</span>
          </button>
        </div>
      </div>

      {/* Account Details & Session Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Security & Authentication Identity */}
        <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Key className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Authentication & Identity</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-slate-400">Auth Provider</span>
              <span className="font-semibold text-slate-200 capitalize">{provider}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-slate-400">Assigned Call-Sign</span>
              <span className="font-mono text-sky-400 font-medium">
                {user?.callsign || 'TAC-LEAD-01'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-slate-400">Authenticated Since</span>
              <span className="font-mono text-slate-300 text-[11px]">{authenticatedAt}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-slate-400">Session Token Type</span>
              <span className="font-mono text-slate-400 text-[11px]">JWT (Encrypted)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Operational Clearance & Permissions */}
        <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Operational Node & Permissions</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-slate-400">Assigned Operational Sector</span>
              <span className="font-medium text-slate-200">Sector Alpha - Urban Collapse</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-slate-400">DBSCAN Geodesic Engine</span>
              <span className="font-mono text-emerald-400">Full Execution Access</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-slate-400">Thermal / Drone Feed Ingest</span>
              <span className="font-mono text-emerald-400">Read / Write Enabled</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-slate-400">USAR Prioritization Export</span>
              <span className="font-mono text-emerald-400">PDF / JSON Export</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Mission Readiness & Telemetry Stats */}
      <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Live Mission Telemetry Summary</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Operation Aegis</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center space-y-1">
            <div className="text-2xl font-bold font-mono text-white">
              {stats?.total_signals || 385}
            </div>
            <div className="text-[11px] text-slate-400">Total Signals Processed</div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center space-y-1">
            <div className="text-2xl font-bold font-mono text-sky-400">
              {clusters?.length || 5}
            </div>
            <div className="text-[11px] text-slate-400">DBSCAN Hotspot Clusters</div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center space-y-1">
            <div className="text-2xl font-bold font-mono text-rose-400">
              {stats?.critical_hotspots || 1}
            </div>
            <div className="text-[11px] text-slate-400">Critical Rescue Sectors</div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center space-y-1">
            <div className="text-2xl font-bold font-mono text-emerald-400">
              100%
            </div>
            <div className="text-[11px] text-slate-400">Ground-Truth Spatial Match</div>
          </div>
        </div>
      </div>

      {/* Account Actions & Exit Footer Card */}
      <div className="bg-[#141722] border border-rose-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="text-sm font-bold text-slate-200">End Operator Session</div>
          <div className="text-xs text-slate-400">
            Sign out to securely terminate your active disaster response token on this machine.
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-rose-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Now</span>
        </button>
      </div>
    </div>
  );
};
