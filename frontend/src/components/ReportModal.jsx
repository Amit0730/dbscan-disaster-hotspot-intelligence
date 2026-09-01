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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header Action Bar */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950 no-print">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wider">
                Mission Intelligence Debrief Report
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/50 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Report Body */}
          <div className="p-8 space-y-6 text-slate-200 bg-slate-900 font-sans" id="mission-report-printable">
            {loading ? (
              <div className="py-20 text-center font-mono text-slate-400 animate-pulse">
                Compiling multi-sensor telemetry & spatial clusters...
              </div>
            ) : report ? (
              <>
                {/* Report Header */}
                <div className="border-b border-slate-700 pb-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          SIH26030
                        </span>
                        <h1 className="text-2xl font-black text-slate-100 uppercase tracking-tight">
                          {report.mission_name}
                        </h1>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-2xl">{report.description}</p>
                    </div>

                    <div className="text-right font-mono text-xs text-slate-400">
                      <div>Generated: {report.generated_at}</div>
                      <div className="text-cyan-400 font-semibold mt-1">Source: {report.data_source}</div>
                    </div>
                  </div>

                  {/* Prominent Ethical & Operational Disclaimer */}
                  <div className="mt-4 p-3 rounded bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <span className="font-bold">CRITICAL DISASTER INTELLIGENCE PROTOCOL:</span> {report.disclaimer}
                    </div>
                  </div>
                </div>

                {/* Key Statistics Grid */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    Operational Telemetry Summary
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                      <div className="text-xs text-slate-400">Total Signals</div>
                      <div className="text-xl font-bold font-mono text-slate-100">{report.stats.total_signals}</div>
                    </div>
                    <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                      <div className="text-xs text-slate-400">DBSCAN Clusters</div>
                      <div className="text-xl font-bold font-mono text-cyan-400">{report.stats.dbscan_clusters}</div>
                    </div>
                    <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                      <div className="text-xs text-slate-400">Critical Hotspots</div>
                      <div className="text-xl font-bold font-mono text-red-400">{report.stats.critical_hotspots}</div>
                    </div>
                    <div className="p-3 rounded bg-slate-950/70 border border-slate-800">
                      <div className="text-xs text-slate-400">Spatial Noise Points</div>
                      <div className="text-xl font-bold font-mono text-slate-400">{report.stats.noise_points}</div>
                    </div>
                  </div>
                </div>

                {/* Cluster Prioritization Table */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Clustered Hotspot Priority Ranking
                  </h3>
                  <div className="overflow-x-auto border border-slate-800 rounded-lg">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">Rank / ID</th>
                          <th className="p-2.5">Priority Score</th>
                          <th className="p-2.5">Tier</th>
                          <th className="p-2.5">Signals</th>
                          <th className="p-2.5">Coordinates</th>
                          <th className="p-2.5">Thermal %</th>
                          <th className="p-2.5">Human %</th>
                          <th className="p-2.5">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                        {report.clusters?.map((c, i) => (
                          <tr key={c.id} className="hover:bg-slate-800/40">
                            <td className="p-2.5 font-bold text-slate-100">
                              #{String(i + 1).padStart(2, '0')} (ID: {c.cluster_label + 1})
                            </td>
                            <td className="p-2.5 font-bold text-cyan-400">{c.priority_score} / 100</td>
                            <td className="p-2.5">
                              <TacticalBadge variant={c.classification}>{c.classification}</TacticalBadge>
                            </td>
                            <td className="p-2.5">{c.signal_count}</td>
                            <td className="p-2.5 text-slate-400">{formatCoords(c.center_lat, c.center_lon)}</td>
                            <td className="p-2.5 text-amber-400">{formatPercentage(c.avg_thermal_score)}</td>
                            <td className="p-2.5 text-cyan-400">{formatPercentage(c.avg_person_prob)}</td>
                            <td className="p-2.5 text-slate-300 truncate max-w-xs">{c.recommended_action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Validation Benchmark */}
                {report.validation && (
                  <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Ground-Truth Validation Metrics
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-slate-400">Precision:</span>{' '}
                        <span className="font-bold text-emerald-400">{report.validation.precision}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Recall:</span>{' '}
                        <span className="font-bold text-emerald-400">{report.validation.recall}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400">F1 Score:</span>{' '}
                        <span className="font-bold text-cyan-400">{report.validation.f1_score}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Avg Localization Error:</span>{' '}
                        <span className="font-bold text-amber-400">{report.validation.avg_distance_error} m</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Methodology & Limitations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
                    <h4 className="font-bold text-slate-300 mb-2 uppercase text-[11px]">Tactical Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      {report.recommendations?.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
                    <h4 className="font-bold text-slate-300 mb-2 uppercase text-[11px]">System Limitations</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      {report.limitations?.map((l, idx) => (
                        <li key={idx}>{l}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-red-400">Failed to load report data.</div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
