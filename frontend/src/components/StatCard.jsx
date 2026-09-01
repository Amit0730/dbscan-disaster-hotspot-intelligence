import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'cyan', badge = null, onClick }) => {
  const colorMap = {
    cyan: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/20 group-hover:border-cyan-500/60',
    red: 'border-red-500/30 text-red-400 bg-red-950/20 group-hover:border-red-500/60',
    amber: 'border-amber-500/30 text-amber-400 bg-amber-950/20 group-hover:border-amber-500/60',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20 group-hover:border-emerald-500/60',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-950/20 group-hover:border-purple-500/60',
  };

  const selectedColor = colorMap[color] || colorMap.cyan;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`group relative overflow-hidden bg-slate-900/80 backdrop-blur border rounded-lg p-4 shadow-lg transition-all ${
        onClick ? 'cursor-pointer' : ''
      } ${selectedColor}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold font-mono text-slate-100 mt-1 tracking-tight">
            {value ?? '--'}
          </h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-md border ${selectedColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {badge && <div className="mt-3 pt-2 border-t border-slate-800 flex items-center">{badge}</div>}

      {/* Tactical corner accents */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-slate-600 opacity-40 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-slate-600 opacity-40 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};
