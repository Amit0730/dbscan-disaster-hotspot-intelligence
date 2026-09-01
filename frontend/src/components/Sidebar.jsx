import React from 'react';
import { NavLink } from 'react-router-dom';
import { useMission } from '../context/MissionContext';
import {
  LayoutDashboard,
  MapPin,
  Flame,
  Radio,
  SlidersHorizontal,
  BarChart3,
  CheckCircle2,
  BookOpen,
  UploadCloud,
  Home,
  ShieldAlert,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Overview / Landing', path: '/', icon: Home, exact: true },
  { name: 'Mission Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Drone Data & Ingest', path: '/data', icon: UploadCloud },
  { name: 'Signal Analysis', path: '/signals', icon: Radio },
  { name: 'Tactical Hotspot Map', path: '/map', icon: MapPin },
  { name: 'DBSCAN Clustering', path: '/clustering', icon: SlidersHorizontal },
  { name: 'Cluster Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Ground-Truth Validation', path: '/validation', icon: CheckCircle2 },
  { name: 'System Technical Docs', path: '/system-info', icon: BookOpen },
];

export const Sidebar = () => {
  const { stats, clusters } = useMission();
  const criticalCount = stats?.critical_hotspots ?? 0;

  return (
    <aside className="w-64 shrink-0 bg-slate-950/95 border-r border-slate-800/80 flex flex-col justify-between hidden md:flex h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
          Command Navigation
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.path === '/clustering' && clusters?.length > 0 && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      {clusters.length}
                    </span>
                  )}

                  {item.path === '/dashboard' && criticalCount > 0 && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800 animate-pulse">
                      {criticalCount} CRIT
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Field disclaimer & status footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 text-amber-400/90 font-mono text-[10px] mb-1 font-semibold">
          <ShieldAlert className="w-3.5 h-3.5" />
          DECISION SUPPORT TOOL
        </div>
        <p className="leading-tight text-[10px] text-slate-500">
          DBSCAN identifies spatial densities. Thermal anomalies indicate potential search zones, not confirmed survivors.
        </p>
      </div>
    </aside>
  );
};
