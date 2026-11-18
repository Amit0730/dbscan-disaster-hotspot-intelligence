import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TacticalBadge } from './TacticalBadge';
import { formatCoords, formatPercentage } from '../utils/geo';
import {
  X,
  Flame,
  User,
  Boxes,
  Building2,
  Activity,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from 'lucide-react';

export const ClusterDetailModal = ({ cluster, onClose }) => {
  if (!cluster) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="relative w-full max-w-lg bg-[#141722] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/[0.08] bg-[#0c0d12]/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 font-mono font-bold text-sm">
                #{String(cluster.cluster_label + 1).padStart(2, '0')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                    Sector #{String(cluster.cluster_label + 1).padStart(2, '0')}
                  </h3>
                  <TacticalBadge variant={cluster.classification} pulse={cluster.classification === 'CRITICAL'}>
                    {cluster.classification}
                  </TacticalBadge>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                  <MapPin className="w-3 h-3 text-sky-400" />
                  {formatCoords(cluster.center_lat, cluster.center_lon)}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body content */}
          <div className="p-5 space-y-5">
            {/* Top Score Banner */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0c0d12] border border-white/[0.07]">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                  Rescue Priority Score
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-bold font-mono text-slate-100 tabular-nums">
                    {cluster.priority_score}
                  </span>
                  <span className="text-xs font-mono text-slate-500">/ 100</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                  Signal Density
                </span>
                <div className="text-base font-bold font-mono text-sky-400 mt-0.5 tabular-nums">
                  {cluster.signal_count} <span className="text-xs text-slate-500 font-normal font-sans">signals</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5 tabular-nums">
                  {cluster.cluster_density} pts/km²
                </div>
              </div>
            </div>

            {/* 5-Factor Score Breakdown Progress bars */}
            <div className="space-y-3">
              <h4 className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>Multi-Sensor Feature Breakdown</span>
              </h4>

              {/* Thermal Anomaly (35%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> Thermal Anomaly (35%)
                  </span>
                  <span className="font-mono font-medium text-amber-400 tabular-nums">{formatPercentage(cluster.avg_thermal_score)}</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${Math.min(100, cluster.avg_thermal_score * 100)}%` }}
                  />
                </div>
              </div>

              {/* Human Signal Probability (30%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-400" /> Potential Human Signal (30%)
                  </span>
                  <span className="font-mono font-medium text-sky-400 tabular-nums">{formatPercentage(cluster.avg_person_prob)}</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full"
                    style={{ width: `${Math.min(100, cluster.avg_person_prob * 100)}%` }}
                  />
                </div>
              </div>

              {/* Debris Probability (15%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-orange-400" /> Debris Obstruction (15%)
                  </span>
                  <span className="font-mono font-medium text-orange-400 tabular-nums">{formatPercentage(cluster.avg_debris_prob)}</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full"
                    style={{ width: `${Math.min(100, cluster.avg_debris_prob * 100)}%` }}
                  />
                </div>
              </div>

              {/* Structural Damage (10%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Structural Damage (10%)
                  </span>
                  <span className="font-mono font-medium text-indigo-400 tabular-nums">{formatPercentage(cluster.avg_damage_prob)}</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full"
                    style={{ width: `${Math.min(100, cluster.avg_damage_prob * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tactical Recommended Action */}
            <div className="p-3.5 rounded-xl bg-[#0c0d12] border border-white/[0.07]">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1 mb-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Recommended Tactical Action
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {cluster.recommended_action}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/[0.08] bg-[#0c0d12]/40 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] transition-colors cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
