import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { SeverityBadge } from '../components/SeverityBadge';
import { DisasterMap } from '../map/DisasterMap';
import { formatCoords, formatPercentage } from '../utils/geo';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  MapPin,
  Crosshair,
  Info,
  HelpCircle,
  ShieldCheck,
  Target,
  ArrowRight,
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
  const tp = validation?.true_positives ?? (validation?.matched_clusters ?? 0);
  const fp = validation?.false_positives ?? 0;
  const fn = validation?.false_negatives ?? 0;
  const precision = validation?.precision ?? 0;
  const recall = validation?.recall ?? 0;
  const f1 = validation?.f1_score ?? 0;
  const meanError = validation?.mean_spatial_error_meters ?? 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-[#EAF2FF]">
      {/* Benchmark Disclaimer Banner */}
      <div className="bg-[#18263A] border-l-4 border-[#00B7FF] border-y border-r border-[#27364C] p-4 rounded-r flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-[#00B7FF] shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#EAF2FF] uppercase tracking-wider">
                SIMULATED GROUND-TRUTH BENCHMARK
              </span>
              <SeverityBadge severity="SIMULATED" />
            </div>
            <p className="text-xs text-[#98AAC2] mt-0.5">
              Scientific evaluation measuring spatial clustering fidelity against synthetic disaster ground-truth casualty zones.
              This benchmark protocol evaluates algorithmic precision and recall; it is not live mission telemetry.
            </p>
          </div>
        </div>

        {/* Threshold Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono bg-[#131F30] px-3 py-1.5 rounded border border-[#27364C]">
            <span className="text-[#98AAC2]">Match Threshold:</span>
            <span className="text-[#00B7FF] font-bold tabular-nums">{matchRadius}m</span>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={matchRadius}
              onChange={(e) => setMatchRadius(Number(e.target.value))}
              className="w-20 accent-[#00B7FF] cursor-pointer h-1.5 bg-[#27364C] rounded"
            />
          </div>

          <button
            onClick={handleReevaluate}
            disabled={evaluating || loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00B7FF] hover:bg-[#00a3e3] text-[#0A101B] font-mono text-xs font-bold rounded transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin' : ''}`} />
            Run Evaluation
          </button>
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Precision */}
        <div className="pro-card p-4">
          <div className="flex items-center justify-between text-[#98AAC2] text-[10px] font-mono uppercase tracking-wider">
            <span>Precision</span>
            <span title="True Positives / (True Positives + False Positives)">
              <HelpCircle className="w-3 h-3 text-[#98AAC2]" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#18D9A4] mt-1">
            {formatPercentage(precision)}
          </div>
          <div className="text-[11px] font-mono text-[#98AAC2] mt-1">TP / (TP + FP)</div>
        </div>

        {/* Recall */}
        <div className="pro-card p-4">
          <div className="flex items-center justify-between text-[#98AAC2] text-[10px] font-mono uppercase tracking-wider">
            <span>Recall</span>
            <span title="True Positives / (True Positives + False Negatives)">
              <HelpCircle className="w-3 h-3 text-[#98AAC2]" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#18D9A4] mt-1">
            {formatPercentage(recall)}
          </div>
          <div className="text-[11px] font-mono text-[#98AAC2] mt-1">TP / (TP + FN)</div>
        </div>

        {/* F1 Score */}
        <div className="pro-card p-4">
          <div className="flex items-center justify-between text-[#98AAC2] text-[10px] font-mono uppercase tracking-wider">
            <span>F1 Score</span>
            <span title="Harmonic Mean of Precision and Recall. Evaluates classification balance.">
              <HelpCircle className="w-3 h-3 text-[#98AAC2]" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#00B7FF] mt-1">
            {formatPercentage(f1)}
          </div>
          <div className="text-[11px] font-mono text-[#98AAC2] mt-1">Harmonic Mean</div>
        </div>

        {/* Mean Spatial Error */}
        <div className="pro-card p-4">
          <div className="flex items-center justify-between text-[#98AAC2] text-[10px] font-mono uppercase tracking-wider">
            <span>Spatial Error</span>
            <span title="Mean Haversine geodesic displacement between predicted centroid and ground-truth centroid">
              <HelpCircle className="w-3 h-3 text-[#98AAC2]" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#F5B94E] mt-1">
            {meanError.toFixed(1)}m
          </div>
          <div className="text-[11px] font-mono text-[#98AAC2] mt-1">Mean Haversine Shift</div>
        </div>

        {/* Matched Clusters */}
        <div className="pro-card p-4">
          <div className="flex items-center justify-between text-[#98AAC2] text-[10px] font-mono uppercase tracking-wider">
            <span>Matched Sectors</span>
            <span title="Clusters matched to ground truth within tolerance threshold">
              <HelpCircle className="w-3 h-3 text-[#98AAC2]" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#EAF2FF] mt-1">
            {tp} / {groundTruth?.length || 5}
          </div>
          <div className="text-[11px] font-mono text-[#18D9A4] mt-1">Valid Spatial Matches</div>
        </div>

        {/* False Positives */}
        <div className="pro-card p-4">
          <div className="flex items-center justify-between text-[#98AAC2] text-[10px] font-mono uppercase tracking-wider">
            <span>False Positives</span>
            <span title="Predicted clusters that did not match any ground truth sector">
              <HelpCircle className="w-3 h-3 text-[#98AAC2]" />
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#FF5A70] mt-1">
            {fp}
          </div>
          <div className="text-[11px] font-mono text-[#98AAC2] mt-1">{fn} False Negatives</div>
        </div>
      </div>

      {/* Main Validation Layout: Map + Pairwise Matching Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Validation Map */}
        <div className="lg:col-span-7 pro-card p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#27364C]">
            <div>
              <h2 className="text-xs font-mono font-semibold tracking-wider text-[#EAF2FF] uppercase">
                Spatial Alignment Inspection
              </h2>
              <p className="text-[11px] text-[#98AAC2] mt-0.5">
                Blue hulls represent predicted DBSCAN clusters; dashed amber rings depict ground-truth sectors
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18263A] text-[#00B7FF] border border-[#27364C]">
              Bipartite Overlay
            </span>
          </div>
          <div className="h-[460px] rounded border border-[#27364C] overflow-hidden">
            <DisasterMap />
          </div>
        </div>

        {/* Right: Pairwise Matching Details Table */}
        <div className="lg:col-span-5 pro-card p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#27364C]">
            <div>
              <h2 className="text-xs font-mono font-semibold tracking-wider text-[#EAF2FF] uppercase">
                Bipartite Matching Details
              </h2>
              <p className="text-[11px] text-[#98AAC2] mt-0.5">
                Cluster centroid distance against reference targets
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18263A] text-[#18D9A4] border border-[#27364C]">
              Threshold: {matchRadius}m
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[460px]">
            {details.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-xs font-mono text-[#98AAC2]">
                <Target className="w-8 h-8 text-[#27364C] mb-2" />
                <span>NO BENCHMARK DETAILS RECORDED</span>
                <span className="text-[10px] text-slate-500 mt-1">Execute benchmark to generate bipartite pairs</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#27364C] text-[10px] font-mono text-[#98AAC2] uppercase tracking-wider">
                    <th className="py-2 px-2">Pred. Sector</th>
                    <th className="py-2 px-2">Ground Truth</th>
                    <th className="py-2 px-2">Spatial Error</th>
                    <th className="py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27364C]/50 text-xs font-mono">
                  {details.map((item, idx) => {
                    const isMatched = item.matched || item.distance_error <= matchRadius;
                    return (
                      <tr key={idx} className="hover:bg-[#18263A]/80 transition">
                        <td className="py-2.5 px-2 text-[#EAF2FF] font-medium">
                          {item.cluster_label !== undefined ? `Sector ${item.cluster_label + 1}` : `Pred #${idx + 1}`}
                        </td>
                        <td className="py-2.5 px-2 text-[#98AAC2]">
                          {item.ground_truth_id || `GT-Sector ${idx + 1}`}
                        </td>
                        <td className="py-2.5 px-2">
                          <span className={`font-bold ${isMatched ? 'text-[#18D9A4]' : 'text-[#FF5A70]'}`}>
                            {item.distance_error !== undefined ? `${item.distance_error.toFixed(1)}m` : 'N/A'}
                          </span>
                        </td>
                        <td className="py-2.5 px-2">
                          {isMatched ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#18D9A4] font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              MATCHED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#FF5A70] font-bold">
                              <AlertTriangle className="w-3 h-3" />
                              UNMATCHED
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Scientific Methodology & Metrics Glossary */}
      <div className="pro-card p-5">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#27364C]">
          <Info className="w-4 h-4 text-[#00B7FF]" />
          <h2 className="text-xs font-mono font-semibold tracking-wider text-[#EAF2FF] uppercase">
            Validation Protocol & Scientific Methodology
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#98AAC2] leading-relaxed">
          <div>
            <div className="text-[11px] font-mono font-bold text-[#EAF2FF] uppercase mb-1">
              Bipartite Haversine Matching
            </div>
            <p>
              Each predicted DBSCAN cluster centroid is paired with the nearest synthetic ground-truth coordinate using great-circle Haversine distance. Matches within the configured radius ({matchRadius}m) count as True Positives (TP).
            </p>
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold text-[#EAF2FF] uppercase mb-1">
              Precision vs Recall Balance
            </div>
            <p>
              Precision penalizes spurious cluster detections (False Positives), while Recall ensures no critical casualty sector is overlooked (False Negatives). The F1 score evaluates harmonic balance between both metrics.
            </p>
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold text-[#EAF2FF] uppercase mb-1">
              Spatial Error Formulation
            </div>
            <p>
              Mean spatial error reports centroid displacement in meters. Unlike planar Euclidean approximations, geodesic calculations account for Earth's curvature (R = 6,371 km) ensuring centimeter-scale coordinate fidelity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
