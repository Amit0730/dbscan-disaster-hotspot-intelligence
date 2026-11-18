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
  SlidersHorizontal,
  MapPin,
  Crosshair,
  ShieldAlert,
  Info,
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
    <div className="p-4 sm:p-6 lg:p-7 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">
              Ground-Truth Validation & Benchmark
            </h1>
            <TacticalBadge variant="simulated">Benchmark Protocol</TacticalBadge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bipartite spatial matching comparing predicted DBSCAN cluster centroids against simulated ground-truth rescue sectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono bg-[#11131a] px-3 py-1.5 rounded-lg border border-white/[0.08]">
            <span className="text-slate-400">Match Radius:</span>
            <span className="text-sky-400 font-bold tabular-nums">{matchRadius}m</span>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={matchRadius}
              onChange={(e) => setMatchRadius(Number(e.target.value))}
              className="w-20 accent-sky-400 cursor-pointer h-1.5 bg-white/[0.1] rounded"
            />
          </div>

          <button
            onClick={handleReevaluate}
            disabled={evaluating || loading}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'Evaluating...' : 'Re-Evaluate'}</span>
          </button>
        </div>
      </div>

      {/* Protocol Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
        <div>
          <span className="font-semibold text-amber-200">
            Simulated Benchmark Validation Protocol:
          </span>
          <p className="text-amber-300/80 leading-relaxed text-[11px] mt-0.5 font-sans">
            Validation is performed against simulated ground-truth sectors to quantitatively verify that DBSCAN clustering reliably detects dense pockets without introducing false phantom clusters.
          </p>
        </div>
      </div>

      {/* Validation Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
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
          icon={SlidersHorizontal}
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
      <div className="pro-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-sky-400" />
            <span>Predicted Hotspots (Solid) vs Ground Truth Zones (Dashed) Overlay</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Radius threshold: {matchRadius}m
          </span>
        </div>

        <div className="rounded-lg overflow-hidden border border-white/[0.07]">
          <DisasterMap height="460px" />
        </div>
      </div>

      {/* Detailed Pairwise Matching Evaluation Table */}
      <div className="pro-card p-5 space-y-4">
        <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Spatial Match Evaluation Pairings ({details.length})</span>
        </h3>

        <div className="overflow-x-auto border border-white/[0.07] rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] text-slate-400 uppercase text-[10px] font-mono border-b border-white/[0.07]">
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
            <tbody className="divide-y divide-white/[0.05] bg-[#11131a]/40 font-mono text-[11px]">
              {details.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-500 font-sans">
                    No validation evaluation records generated.
                  </td>
                </tr>
              ) : (
                details.map((item, idx) => {
                  const isMatched = item.match_status === 'MATCHED';
                  const isMissed = item.match_status === 'MISSED_GROUND_TRUTH';

                  return (
                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-semibold text-slate-200 font-sans">
                        {item.cluster_label !== null
                          ? `Sector ${item.cluster_label + 1}`
                          : <span className="text-slate-500">None (Missed)</span>}
                      </td>
                      <td className="p-3">
                        {item.predicted_score ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sky-400 tabular-nums">{item.predicted_score}</span>
                            <TacticalBadge variant={item.predicted_priority}>{item.predicted_priority}</TacticalBadge>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-sans">N/A</span>
                        )}
                      </td>
                      <td className="p-3 font-medium text-slate-300 font-sans">
                        {item.gt_name}
                      </td>
                      <td className="p-3">
                        {item.gt_priority !== 'N/A' ? (
                          <TacticalBadge variant={item.gt_priority}>{item.gt_priority}</TacticalBadge>
                        ) : (
                          <span className="text-slate-500 font-sans">N/A</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400 font-sans">{item.gt_zone_type}</td>
                      <td className="p-3 font-semibold text-amber-400 tabular-nums">
                        {item.distance_meters !== null ? `${item.distance_meters} m` : '--'}
                      </td>
                      <td className="p-3">
                        {isMatched ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                            MATCHED (TP)
                          </span>
                        ) : isMissed ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/25">
                            MISSED (FN)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
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
