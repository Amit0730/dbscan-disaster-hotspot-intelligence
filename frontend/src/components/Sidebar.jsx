import React, { useState, useEffect } from 'react';
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
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
  Activity,
  Shield,
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

export const Sidebar = ({ isMobileOpen, onMobileClose }) => {
  const { stats, clusters } = useMission();
  const criticalCount = stats?.critical_hotspots ?? 0;

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('aegis_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('aegis_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 md:top-14 z-40 md:z-30 h-screen md:h-[calc(100vh-3.5rem)] bg-[#0D1624] border-r border-[#27364C] flex flex-col justify-between transition-all duration-200 select-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'w-16' : 'w-60'}`}
        role="navigation"
        aria-label="Main Navigation"
      >
        {/* Navigation Items */}
        <div className="py-3 px-2 space-y-4 overflow-y-auto flex-1">
          {/* Collapse Toggle for Desktop */}
          <div className="hidden md:flex items-center justify-between px-2 pb-1 border-b border-[#27364C]/50">
            {!collapsed && (
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#98AAC2]">
                Navigation
              </span>
            )}
            <button
              onClick={toggleCollapse}
              className={`p-1 rounded text-[#98AAC2] hover:text-[#EAF2FF] hover:bg-[#18263A] transition-colors cursor-pointer ${
                collapsed ? 'mx-auto' : ''
              }`}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-[#00B7FF]" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              {!collapsed && (
                <div className="px-2.5 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#98AAC2]">
                  {group.title}
                </div>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    onClick={() => {
                      if (onMobileClose) onMobileClose();
                    }}
                    title={collapsed ? item.name : undefined}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-[#18263A] text-[#EAF2FF] font-semibold border-l-2 border-l-[#00B7FF] border-y border-r border-[#27364C]'
                          : 'text-[#98AAC2] hover:text-[#EAF2FF] hover:bg-[#131F30] border-l-2 border-l-transparent'
                      } ${collapsed ? 'justify-center px-0 py-2' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-[#00B7FF]' : 'text-[#98AAC2] group-hover:text-[#EAF2FF]'
                            }`}
                          />
                          {!collapsed && <span>{item.name}</span>}
                        </div>

                        {!collapsed && item.path === '/clustering' && clusters?.length > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#131F30] text-[#00B7FF] border border-[#27364C]">
                            {clusters.length}
                          </span>
                        )}

                        {!collapsed && item.path === '/dashboard' && criticalCount > 0 && (
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#FF5A70]/15 text-[#FF5A70] border border-[#FF5A70]/30">
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

        {/* System Engine Status Footer */}
        <div className="p-2.5 border-t border-[#27364C] bg-[#0A101B]/50 text-[#98AAC2] text-[11px] font-mono">
          {!collapsed ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#EAF2FF]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#18D9A4]" />
                  Aegis Engine
                </span>
                <span className="text-[10px] text-[#98AAC2]">v1.4.0</span>
              </div>
              <div className="text-[10px] text-[#98AAC2] flex items-center justify-between">
                <span>Haversine DBSCAN</span>
                <span className="text-[#18D9A4]">Online</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="Aegis Engine v1.4.0 Online">
              <span className="w-2 h-2 rounded-full bg-[#18D9A4]" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
