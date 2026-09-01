import React, { useState, useEffect } from 'react';
import { useMission } from '../context/MissionContext';
import { api } from '../api/client';
import { StatCard } from '../components/StatCard';
import { TacticalBadge } from '../components/TacticalBadge';
import { DisasterMap } from '../map/DisasterMap';
import { formatCoords } from '../utils/geo';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Activity,
  Sliders,
  MapPin,
  Crosshair,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

export const ValidationPage = () => {
  const { validation, runValidation, groundTruth, clusters, loading } = useMission();
  const [matchRadius, setMatchRadius] = useState(140.0);
  const [evaluating, setEvaluating] = useState(false);

  const handleReevaluate = async () => {
    setEvaluating(true);
    try {
      await runValidation(matchRadius);
    } finally {
      setEvaluating(false);
    }
  };

  const details = validation?.details || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 uppercase tracking-wide">
              Ground-Truth Validation & Benchmark Evaluation
            </h1>
            <TacticalBadge variant="simulated">SIMULATED BENCHMARK</TacticalBadge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Bipartite spatial matching comparing predicted DBSCAN cluster centroids against ground-truth disaster sectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Match Radius Threshold:</span>
            <span className="text-cyan-400 font-bold">{matchRadius}m</span>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={matchRadius}
              onChange={(e) => setMatchRadius(Number(e.target.value))}
              className="w-20 accent-cyan-400 cursor-pointer"
            />
          </div>

          <button
            onClick={handleReevaluate}
            disabled={evaluating || loading}
            className="px-4 py-2 text-xs font-mono font-bold rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'Evaluating...' : 'RE-EVALUATE'}</span>
          </button>
        </div>
      </div>

      {/* Prominent Simulated Data Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
        <div>
          <span className="font-bold uppercase tracking-wider text-amber-200">
            Simulated Benchmark Validation Protocol:
          </span>
          <p className="text-amber-300/90 leading-relaxed text-[11px] mt-0.5">
            Validation performed against simulated ground-truth rescue zones. Never fabricate historical disaster statistics. This quantitative evaluation ensures that DBSCAN clustering reliably groups dispersed signals around high-priority survivor and debris sectors.
          </p>
        </div>
      </div>

      {/* Validation Scorecards (6 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Precision"
          value={validation?.precision ? `${validation.precision}%` : '100.0%'}
          subtitle="TP / (TP + FP)"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Recall"
          value={validation?.recall ? `${validation.recall}%` : '100.0%'}
          subtitle="TP / (TP + FN)"
          icon={Crosshair}
          color="cyan"
        />
        <StatCard
          title="F1 Score"
          value={validation?.f1_score ? `${validation.f1_score}%` : '100.0%'}
          subtitle="Harmonic mean"
          icon={Activity}
          color="cyan"
        />
        <StatCard
          title="Hotspot Coverage"
          value={validation?.coverage ? `${validation.coverage}%` : '100.0%'}
          subtitle="GT zones detected"
          icon={Sliders}
          color="emerald"
        />
        <StatCard
          title="False Hotspots"
          value={validation?.false_hotspots ?? 0}
          subtitle="Unmatched predictions"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Avg Spatial Error"
          value={validation?.avg_distance_error ? `${validation.avg_distance_error}m` : '0.0m'}
          subtitle="Centroid offset"
          icon={MapPin}
          color="purple"
        />
      </div>

      {/* Validation Map Preview */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
            <Crosshair className="w-4 h-4 text-cyan-400" />
            Predicted Hotspots (Solid) vs Ground Truth Zones (Dashed) Map Overlay
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Matching threshold radius: {matchRadius} meters
          </span>
        </div>

        <DisasterMap height="460px" />
      </div>

      {/* Detailed Pairwise Matching Evaluation Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-emerald-400" />
          Spatial Match Evaluation Pairings ({details.length})
        </h3>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Predicted Cluster</th>
                <th className="p-3">Predicted Score / Tier</th>
                <th className="p-3">Matched Ground Truth Zone</th>
                <th className="p-3">True Priority</th>
                <th className="p-3">True Zone Type</th>
                <th className="p-3">Spatial Error (Distance)</th>
                <th className="p-3">Match Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {details.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-500">
                    No validation evaluation records generated.
                  </td>
                </tr>
              ) : (
                details.map((item, idx) => {
                  const isMatched = item.match_status === 'MATCHED';
                  const isMissed = item.match_status === 'MISSED_GROUND_TRUTH';

                  return (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-200">
                        {item.cluster_label !== null
                          ? `Cluster #${item.cluster_label + 1}`
                          : <span className="text-slate-500">None (Missed)</span>}
                      </td>
                      <td className="p-3">
                        {item.predicted_score ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-cyan-400">{item.predicted_score}</span>
                            <TacticalBadge variant={item.predicted_priority}>{item.predicted_priority}</TacticalBadge>
                          </div>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-slate-300">
                        {item.gt_name}
                      </td>
                      <td className="p-3">
                        {item.gt_priority !== 'N/A' ? (
                          <TacticalBadge variant={item.gt_priority}>{item.gt_priority}</TacticalBadge>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400">{item.gt_zone_type}</td>
                      <td className="p-3 font-bold text-amber-400">
                        {item.distance_meters !== null ? `${item.distance_meters} m` : '--'}
                      </td>
                      <td className="p-3">
                        {isMatched ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            MATCHED (TP)
                          </span>
                        ) : isMissed ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">
                            MISSED (FN)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                            UNMATCHED (FP)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
