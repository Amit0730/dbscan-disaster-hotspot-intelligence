import React from 'react';
import { PRIORITY_COLORS } from '../utils/geo';

export const TacticalBadge = ({ variant = 'default', children, className = '', pulse = false }) => {
  let badgeStyles = 'bg-slate-800 text-slate-300 border-slate-700';

  if (variant === 'CRITICAL' || variant === 'critical') {
    badgeStyles = PRIORITY_COLORS.CRITICAL.badge;
  } else if (variant === 'HIGH' || variant === 'high') {
    badgeStyles = PRIORITY_COLORS.HIGH.badge;
  } else if (variant === 'MEDIUM' || variant === 'medium') {
    badgeStyles = PRIORITY_COLORS.MEDIUM.badge;
  } else if (variant === 'LOW' || variant === 'low') {
    badgeStyles = PRIORITY_COLORS.LOW.badge;
  } else if (variant === 'simulated' || variant === 'demo') {
    badgeStyles = 'bg-amber-950/60 text-amber-300 border-amber-500/40 font-mono';
  } else if (variant === 'active') {
    badgeStyles = 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 font-mono';
  } else if (variant === 'cyan') {
    badgeStyles = 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${badgeStyles} ${
        pulse ? 'animate-pulse' : ''
      } ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
};
