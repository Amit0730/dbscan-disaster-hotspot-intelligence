import React from 'react';
import { NavLink } from 'react-router-dom';
import { useMission } from '../context/MissionContext';
import {
  LayoutDashboard,
  MapPin,
  Radio,
  SlidersHorizontal,
  BarChart3,
  CheckCircle2,
  BookOpen,
  UploadCloud,
  Home,
  ShieldAlert,
  Info,
  User,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    title: 'Operations',
    items: [
      { name: 'Mission Overview', path: '/', icon: Home, exact: true },
      { name: 'Command Center', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Tactical GIS Map', path: '/map', icon: MapPin },
    ],
  },
  {
    title: 'Analytics & ML',
    items: [
      { name: 'Hotspot Clustering', path: '/clustering', icon: SlidersHorizontal },
      { name: 'Cluster Analytics', path: '/analytics', icon: BarChart3 },
      { name: 'Validation Benchmark', path: '/validation', icon: CheckCircle2 },
    ],
  },
  {
    title: 'Survey Data',
    items: [
      { name: 'Drone Data & Ingest', path: '/data', icon: UploadCloud },
      { name: 'Signal Telemetry', path: '/signals', icon: Radio },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'Operator Profile', path: '/profile', icon: User },
      { name: 'Technical Docs', path: '/system-info', icon: BookOpen },
    ],
  },
];

export const Sidebar = () => {
  const { stats, clusters } = useMission();
  const criticalCount = stats?.critical_hotspots ?? 0;

  return (
    <aside className="w-60 shrink-0 pro-sidebar flex flex-col justify-between hidden md:flex h-[calc(100vh-3.75rem)] sticky top-15 select-none z-30">
      <div className="py-4 px-3 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-2.5 pb-1.5 text-[10px] font-medium tracking-wider text-slate-400 uppercase font-mono">
              {group.title}
            </div>

            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 group ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-300 font-semibold border border-sky-500/20 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>

                      {item.path === '/clustering' && clusters?.length > 0 && (
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-white/[0.06] text-sky-400 border border-white/[0.08]">
                          {clusters.length}
                        </span>
                      )}

                      {item.path === '/dashboard' && criticalCount > 0 && (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          {criticalCount} CRIT
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* System status footer */}
      <div className="p-3 border-t border-white/[0.07] bg-white/[0.015] text-slate-400">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Tactical Engine
          </span>
          <span className="text-[10px] text-slate-500">v1.4.0</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
          <span>Geodesic DBSCAN</span>
          <span className="text-emerald-400/80 font-medium">Ready</span>
        </div>
      </div>
    </aside>
  );
};
