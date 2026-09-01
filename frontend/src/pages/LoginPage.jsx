import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TacticalBadge } from '../components/TacticalBadge';
import {
  Shield,
  Lock,
  Radio,
  UserCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Activity,
  AlertCircle,
  Cpu,
  Fingerprint,
  ChevronRight,
  Plane,
  BarChart3,
} from 'lucide-react';

export const LoginPage = () => {
  const { loginWithPreset, loginWithCredentials, loading, presetUsers } = useAuth();
  const navigate = useNavigate();

  const [callsign, setCallsign] = useState('');
  const [password, setPassword] = useState('');
  const [sector, setSector] = useState('Sector Alpha - Urban Collapse');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' | 'manual'

  const handleQuickLogin = async (presetKey) => {
    try {
      await loginWithPreset(presetKey);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg('Authentication handshake failed. Try again.');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!callsign.trim()) {
      setErrorMsg('Please provide your tactical Call Sign or Identifier.');
      return;
    }

    try {
      await loginWithCredentials(callsign, password, sector);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg('Authentication failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Grid & Radar Sweep Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Center Authentication Terminal */}
      <div className="relative z-10 max-w-xl w-full">
        {/* Terminal Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-xs font-mono shadow-lg shadow-cyan-950/60">
            <Shield className="w-3.5 h-3.5 animate-pulse" />
            <span>SIH26030 DISASTER RESPONSE SYSTEM</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-400 font-bold">RESTRICTED ACCESS</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-mono uppercase tracking-tight text-slate-100">
            AEGIS RECON // <span className="bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">LOGIN GATEWAY</span>
          </h1>

          <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
            DBSCAN-Based Hotspot Clustering & Thermal/Visual Signal Intelligence for Rescue Prioritization.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm relative space-y-6">
          {/* Top Tabs: Quick Demo Access vs Manual Login */}
          <div className="flex border-b border-slate-800 pb-3 gap-2">
            <button
              onClick={() => setActiveTab('quick')}
              className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'quick'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Preset Roles</span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
              <span>Manual Clearance</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: Quick Preset Roles */}
          {activeTab === 'quick' && (
            <div className="space-y-3">
              <p className="text-[11px] font-mono text-slate-400 text-center">
                Select an authorized mission profile for immediate 1-click evaluation access:
              </p>

              <div className="space-y-2.5">
                {/* 1. Rescue Commander */}
                <button
                  onClick={() => handleQuickLogin('commander')}
                  disabled={loading}
                  className="w-full p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-red-500/60 hover:bg-slate-900 transition-all text-left flex items-center justify-between group cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 text-lg group-hover:scale-105 transition-transform">
                      🛡️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs font-mono text-slate-100">
                          {presetUsers.commander.name}
                        </span>
                        <TacticalBadge variant="CRITICAL">LEVEL-5</TacticalBadge>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Callsign: <strong className="text-red-400">{presetUsers.commander.callsign}</strong> &bull; {presetUsers.commander.role}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" />
                </button>

                {/* 2. UAV Drone Operator */}
                <button
                  onClick={() => handleQuickLogin('operator')}
                  disabled={loading}
                  className="w-full p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900 transition-all text-left flex items-center justify-between group cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-lg group-hover:scale-105 transition-transform">
                      🛰️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs font-mono text-slate-100">
                          {presetUsers.operator.name}
                        </span>
                        <TacticalBadge variant="cyan">LEVEL-4</TacticalBadge>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Callsign: <strong className="text-cyan-400">{presetUsers.operator.callsign}</strong> &bull; {presetUsers.operator.role}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </button>

                {/* 3. GIS & Thermal Analyst */}
                <button
                  onClick={() => handleQuickLogin('analyst')}
                  disabled={loading}
                  className="w-full p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900 transition-all text-left flex items-center justify-between group cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 text-lg group-hover:scale-105 transition-transform">
                      📊
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs font-mono text-slate-100">
                          {presetUsers.analyst.name}
                        </span>
                        <TacticalBadge variant="HIGH">LEVEL-4</TacticalBadge>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Callsign: <strong className="text-amber-400">{presetUsers.analyst.callsign}</strong> &bull; {presetUsers.analyst.role}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Manual Clearance Form */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 font-bold block">
                  Operator Callsign / Officer ID:
                </label>
                <input
                  type="text"
                  placeholder="e.g. TAC-LEAD-07 or COMMANDER-ALPHA"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 font-bold block">
                  Security Passcode / Encryption Key:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter security access key (any for demo)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3.5 pr-10 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 font-bold block">
                  Active Mission Sector Clearance:
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none cursor-pointer"
                >
                  <option value="Sector Alpha - Urban Collapse">Sector Alpha - Urban Collapse</option>
                  <option value="Sector Bravo - Industrial Hazard">Sector Bravo - Industrial Hazard</option>
                  <option value="Sector Charlie - Flood Recon">Sector Charlie - Flood Recon</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    <span>AUTHENTICATING HANDSHAKE...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>INITIATE SECURE ACCESS &rarr;</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Security Badge */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>PROTOCOL: <strong>AES-256 ENCRYPTED</strong></span>
            <span>STATUS: <strong className="text-emerald-400">READY</strong></span>
            <span>MAPPING: <strong>SIH26030</strong></span>
          </div>
        </div>

        {/* Bottom Operational Disclaimer */}
        <div className="mt-4 text-center">
          <TacticalBadge variant="simulated">
            AUTHORIZED DISASTER RESPONSE &bull; DECISION-SUPPORT PROTOCOL ONLY
          </TacticalBadge>
        </div>
      </div>
    </div>
  );
};
