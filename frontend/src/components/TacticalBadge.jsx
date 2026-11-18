import React from 'react';
import { PRIORITY_COLORS } from '../utils/geo';

export const TacticalBadge = ({ variant = 'default', children, className = '', pulse = false }) => {
  let badgeStyles = 'bg-white/[0.06] text-slate-300 border-white/[0.1]';

  const v = String(variant).toUpperCase();

  if (v === 'CRITICAL') {
    badgeStyles = PRIORITY_COLORS.CRITICAL.badge;
  } else if (v === 'HIGH') {
    badgeStyles = PRIORITY_COLORS.HIGH.badge;
  } else if (v === 'MEDIUM') {
    badgeStyles = PRIORITY_COLORS.MEDIUM.badge;
  } else if (v === 'LOW') {
    badgeStyles = PRIORITY_COLORS.LOW.badge;
  } else if (v === 'SIMULATED' || v === 'DEMO') {
    badgeStyles = 'bg-amber-500/10 text-amber-300 border-amber-500/20 font-mono';
  } else if (v === 'ACTIVE' || v === 'LIVE') {
    badgeStyles = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 font-mono';
  } else if (v === 'CYAN' || v === 'PRIMARY') {
    badgeStyles = 'bg-sky-500/10 text-sky-300 border-sky-500/25 font-mono';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide border ${badgeStyles} ${
        pulse ? 'animate-pulse' : ''
      } ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-90 shrink-0" />
      <span>{children}</span>
    </span>
  );
};
