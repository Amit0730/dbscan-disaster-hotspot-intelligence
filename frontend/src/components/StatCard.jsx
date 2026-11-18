import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'cyan', badge = null, onClick }) => {
  const colorMap = {
    cyan: {
      borderHover: 'hover:border-sky-500/40',
      iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      glow: 'group-hover:bg-sky-500/[0.02]',
    },
    red: {
      borderHover: 'hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'group-hover:bg-rose-500/[0.02]',
    },
    amber: {
      borderHover: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'group-hover:bg-amber-500/[0.02]',
    },
    emerald: {
      borderHover: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'group-hover:bg-emerald-500/[0.02]',
    },
    purple: {
      borderHover: 'hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      glow: 'group-hover:bg-indigo-500/[0.02]',
    },
  };

  const scheme = colorMap[color] || colorMap.cyan;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={onClick}
      className={`group relative overflow-hidden bg-[#11131a] border border-white/[0.07] rounded-xl p-4.5 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:bg-[#141722]' : ''
      } ${scheme.borderHover} ${scheme.glow}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-medium tracking-wider text-slate-400 uppercase font-mono">
            {title}
          </p>
          <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight tabular-nums">
            {value ?? '--'}
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-500 font-normal leading-tight">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg border shrink-0 transition-transform group-hover:scale-105 ${scheme.iconBg}`}>
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
      </div>

      {badge && (
        <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center">
          {badge}
        </div>
      )}
    </motion.div>
  );
};
