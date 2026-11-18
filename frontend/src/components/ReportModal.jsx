import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { TacticalBadge } from './TacticalBadge';
import { formatCoords, formatPercentage } from '../utils/geo';
import {
  X,
  Printer,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Layers,
  MapPin,
  Clock,
  Info,
} from 'lucide-react';

export const ReportModal = ({ isOpen, onClose }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api
        .getReportSummary()
        .then((data) => setReport(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-4xl bg-[#141722] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header Action Bar */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-[#0c0d12]/60 no-print">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-mono">
                Mission Intelligence Debrief Report
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/25 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Report Body */}
          <div className="p-6 sm:p-8 space-y-6 text-slate-200 bg-[#141722]" id="mission-report-printable">
            {loading ? (
              <div className="py-20 text-center font-mono text-slate-400 animate-pulse text-xs">
                Compiling multi-sensor telemetry & spatial clusters...
              </div>
            ) : report ? (
              <>
                {/* Report Header */}
                <div className="border-b border-white/[0.08] pb-5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                          {report.mission_name}
                        </h1>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans">{report.description}</p>
                    </div>

                    <div className="text-right font-mono text-xs text-slate-400 shrink-0">
                      <div>Generated: {report.generated_at}</div>
                      <div className="text-sky-400 font-medium mt-0.5">Source: {report.data_source}</div>
                    </div>
                  </div>

                  {/* Operational Protocol Banner */}
                  <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <div className="font-sans text-[11px] leading-relaxed">
                      <strong className="font-semibold text-amber-200">Disaster Intelligence Protocol:</strong> {report.disclaimer}
                    </div>
                  </div>
                </div>

                {/* Key Statistics Grid */}
                <div>
                  <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 font-semibold">
                    <Activity className="w-3.5 h-3.5 text-sky-400" />
                    <span>Operational Telemetry Summary</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#0c0d12] border border-white/[0.06]">
                      <div className="text-xs text-slate-400">Total Signals</div>
                      <div className="text-xl font-bold font-mono text-slate-100 mt-0.5 tabular-nums">{report.stats.total_signals}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0c0d12] border border-white/[0.06]">
                      <div className="text-xs text-slate-400">DBSCAN Clusters</div>
                      <div className="text-xl font-bold font-mono text-sky-400 mt-0.5 tabular-nums">{report.stats.dbscan_clusters}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0c0d12] border border-white/[0.06]">
                      <div className="text-xs text-slate-400">Critical Sectors</div>
                      <div className="text-xl font-bold font-mono text-rose-400 mt-0.5 tabular-nums">{report.stats.critical_hotspots}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0c0d12] border border-white/[0.06]">
                      <div className="text-xs text-slate-400">Noise Points</div>
                      <div className="text-xl font-bold font-mono text-slate-400 mt-0.5 tabular-nums">{report.stats.noise_points}</div>
                    </div>
                  </div>
                </div>

                {/* Cluster Prioritization Table */}
                <div>
                  <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5 font-semibold">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>Clustered Hotspot Priority Ranking</span>
                  </h3>
                  <div className="overflow-x-auto border border-white/[0.07] rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.02] text-slate-400 uppercase text-[10px] font-mono border-b border-white/[0.07]">
                        <tr>
                          <th className="p-2.5">Rank / ID</th>
                          <th className="p-2.5">Priority Score</th>
                          <th className="p-2.5">Tier</th>
                          <th className="p-2.5">Signals</th>
                          <th className="p-2.5">Coordinates</th>
                          <th className="p-2.5">Thermal %</th>
                          <th className="p-2.5">Human %</th>
                          <th className="p-2.5">Field Directive</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05] bg-[#0c0d12]/50 font-mono text-[11px]">
                        {report.clusters?.map((c, i) => (
                          <tr key={c.id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="p-2.5 font-medium text-slate-200 font-sans">
                              #{String(i + 1).padStart(2, '0')} (Sector {c.cluster_label + 1})
                            </td>
                            <td className="p-2.5 font-bold text-sky-400 tabular-nums">{c.priority_score} / 100</td>
                            <td className="p-2.5">
                              <TacticalBadge variant={c.classification}>{c.classification}</TacticalBadge>
                            </td>
                            <td className="p-2.5 tabular-nums">{c.signal_count}</td>
                            <td className="p-2.5 text-slate-400">{formatCoords(c.center_lat, c.center_lon)}</td>
                            <td className="p-2.5 text-amber-400 tabular-nums">{formatPercentage(c.avg_thermal_score)}</td>
                            <td className="p-2.5 text-sky-400 tabular-nums">{formatPercentage(c.avg_person_prob)}</td>
                            <td className="p-2.5 text-slate-300 truncate max-w-xs font-sans text-xs">{c.recommended_action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Validation Benchmark */}
                {report.validation && (
                  <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/[0.07]">
                    <h3 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ground-Truth Benchmark Metrics</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 font-sans">Precision:</span>{' '}
                        <span className="font-bold text-emerald-400 tabular-nums">{report.validation.precision}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans">Recall:</span>{' '}
                        <span className="font-bold text-emerald-400 tabular-nums">{report.validation.recall}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans">F1 Score:</span>{' '}
                        <span className="font-bold text-sky-400 tabular-nums">{report.validation.f1_score}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans">Avg Spatial Error:</span>{' '}
                        <span className="font-bold text-amber-400 tabular-nums">{report.validation.avg_distance_error} m</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Methodology & Limitations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/[0.07]">
                    <h4 className="font-semibold text-slate-300 mb-2 uppercase text-[10px] font-mono">Tactical Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs font-sans">
                      {report.recommendations?.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/[0.07]">
                    <h4 className="font-semibold text-slate-300 mb-2 uppercase text-[10px] font-mono">System Limitations</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 text-xs font-sans">
                      {report.limitations?.map((l, idx) => (
                        <li key={idx}>{l}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-rose-400 font-sans">Failed to load report data.</div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
