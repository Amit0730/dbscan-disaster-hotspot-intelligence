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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-mono font-bold text-lg">
                #{String(cluster.cluster_label + 1).padStart(2, '0')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                    CLUSTER #{String(cluster.cluster_label + 1).padStart(2, '0')}
                  </h3>
                  <TacticalBadge variant={cluster.classification} pulse={cluster.classification === 'CRITICAL'}>
                    {cluster.classification}
                  </TacticalBadge>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  {formatCoords(cluster.center_lat, cluster.center_lon)}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body content */}
          <div className="p-5 space-y-5">
            {/* Top Score Banner */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-950/70 border border-slate-800">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Rescue Priority Score
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black font-mono text-slate-100">
                    {cluster.priority_score}
                  </span>
                  <span className="text-sm font-mono text-slate-500">/ 100</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Signal Density
                </span>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                  {cluster.signal_count} <span className="text-xs text-slate-500 font-normal">signals</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {cluster.cluster_density} pts/km²
                </div>
              </div>
            </div>

            {/* 5-Factor Score Breakdown Progress bars */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Multi-Sensor Feature Breakdown
              </h4>

              {/* Thermal Anomaly (35%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> Thermal Anomaly Score (35%)
                  </span>
                  <span className="font-bold text-amber-400">{formatPercentage(cluster.avg_thermal_score)}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                    style={{ width: `${Math.min(100, cluster.avg_thermal_score * 100)}%` }}
                  />
                </div>
              </div>

              {/* Human Signal Probability (30%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" /> Potential Human Signal (30%)
                  </span>
                  <span className="font-bold text-cyan-400">{formatPercentage(cluster.avg_person_prob)}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, cluster.avg_person_prob * 100)}%` }}
                  />
                </div>
              </div>

              {/* Debris Probability (15%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-orange-400" /> Debris Obstruction Score (15%)
                  </span>
                  <span className="font-bold text-orange-400">{formatPercentage(cluster.avg_debris_prob)}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-600 rounded-full"
                    style={{ width: `${Math.min(100, cluster.avg_debris_prob * 100)}%` }}
                  />
                </div>
              </div>

              {/* Structural Damage (10%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-400" /> Structural Compromise (10%)
                  </span>
                  <span className="font-bold text-purple-400">{formatPercentage(cluster.avg_damage_prob)}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${Math.min(100, cluster.avg_damage_prob * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tactical Recommended Action */}
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Recommended Tactical Action
              </span>
              <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                {cluster.recommended_action}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
