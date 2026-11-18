import React, { useState, useMemo } from 'react';
import { useMission } from '../context/MissionContext';
import { TacticalBadge } from '../components/TacticalBadge';
import { formatCoords, formatPercentage } from '../utils/geo';
import { TemporalDetectionChart } from '../charts/TemporalDetectionChart';
import {
  Radio,
  Flame,
  User,
  Boxes,
  Building2,
  Car,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';

export const SignalAnalysisPage = () => {
  const { signals, clusters } = useMission();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState('ALL');
  const [minThermalFilter, setMinThermalFilter] = useState(0);

  const filteredSignals = useMemo(() => {
    return signals.filter((sig) => {
      const matchSearch =
        sig.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sig.image_id && sig.image_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sig.ground_truth_priority && sig.ground_truth_priority.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCluster =
        selectedClusterFilter === 'ALL'
          ? true
          : selectedClusterFilter === 'NOISE'
          ? sig.cluster_id === -1
          : sig.cluster_id === parseInt(selectedClusterFilter, 10);

      const matchThermal = sig.thermal_score * 100 >= minThermalFilter;

      return matchSearch && matchCluster && matchThermal;
    });
  }, [signals, searchTerm, selectedClusterFilter, minThermalFilter]);

  const handleExportCSV = () => {
    const headers = [
      'id',
      'latitude',
      'longitude',
      'altitude',
      'timestamp',
      'temperature_c',
      'thermal_anomaly',
      'thermal_score',
      'person_probability',
      'debris_probability',
      'damage_probability',
      'vehicle_probability',
      'confidence',
      'cluster_id',
      'ground_truth_priority',
    ];

    const rows = filteredSignals.map((s) => [
      s.id,
      s.lat,
      s.lon,
      s.altitude,
      s.timestamp,
      s.temperature,
      s.thermal_anomaly,
      s.thermal_score,
      s.person_probability,
      s.debris_probability,
      s.damage_probability,
      s.vehicle_probability,
      s.confidence,
      s.cluster_id,
      s.ground_truth_priority,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `disaster_signals_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">
              Multi-Sensor Signal Feature Telemetry
            </h1>
            <TacticalBadge variant="cyan">{signals.length} Standardized Records</TacticalBadge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Geo-tagged radiometric thermal anomalies and visual detector probability tensors extracted from drone surveys.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 text-xs font-medium rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-sky-300 border border-sky-500/25 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Operational Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
        <div className="space-y-1">
          <span className="font-semibold text-amber-200">
            Signal Interpretation Protocol:
          </span>
          <p className="text-amber-300/80 leading-relaxed text-[11px] font-sans">
            Thermal signatures indicate local temperature deviations that may stem from humans, solar-heated concrete, cooling vehicle engines, or ruptured utilities. Signals are classified as <strong>Potential Human Signals</strong> to aid tactical search prioritization.
          </p>
        </div>
      </div>

      {/* Dual Sensor Extraction Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Thermal Extraction Card */}
        <div className="pro-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-amber-400 flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span>Radiometric Thermal Feature Pipeline</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">15°C – 50°C</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Extracts radiometric variance from thermal frames, computing localized temperature gradients normalized between 0.0 and 1.0.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-500 text-[10px] block">Mean Temp</span>
              <strong className="text-amber-400 font-bold tabular-nums">29.4°C</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-500 text-[10px] block">Peak Anomaly</span>
              <strong className="text-rose-400 font-bold tabular-nums">48.5°C</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-500 text-[10px] block">Model Weight</span>
              <strong className="text-sky-400 font-bold">35%</strong>
            </div>
          </div>
        </div>

        {/* Visual Multi-class Extraction Card */}
        <div className="pro-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-sky-400 flex items-center gap-2">
              <Radio className="w-4 h-4" />
              <span>Visual Multi-Class Feature Pipeline</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Confidence: 0.75 – 0.98</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Evaluates multi-class probabilities for person silhouette contours, structural debris density, and vehicle presence.
          </p>
          <div className="grid grid-cols-4 gap-2 pt-1 text-center text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-500 text-[10px] block">Person</span>
              <strong className="text-sky-400 font-bold">30%</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-500 text-[10px] block">Debris</span>
              <strong className="text-amber-400 font-bold">15%</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-500 text-[10px] block">Damage</span>
              <strong className="text-indigo-400 font-bold">10%</strong>
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-500 text-[10px] block">Density</span>
              <strong className="text-emerald-400 font-bold">10%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Temporal Detection Activity Chart */}
      <div className="pro-card p-5 space-y-3">
        <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Sensor Detections Along Survey Timeline (08:00 – 18:00)</span>
        </h3>
        <TemporalDetectionChart signals={signals} />
      </div>

      {/* Standardized Signal Dataset Table */}
      <div className="pro-card p-5 space-y-4">
        {/* Table Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Signal ID, Image ID, GT Zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0c0d12] border border-white/[0.08] rounded-lg pl-8.5 pr-3 py-1.5 text-xs font-sans text-slate-200 placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Sector:</span>
              <select
                value={selectedClusterFilter}
                onChange={(e) => setSelectedClusterFilter(e.target.value)}
                className="bg-[#0c0d12] border border-white/[0.08] rounded-lg px-2.5 py-1 text-slate-200 text-xs cursor-pointer focus:border-sky-500 focus:outline-none"
              >
                <option value="ALL">All Signals ({signals.length})</option>
                <option value="NOISE">Spatial Noise (-1)</option>
                {clusters.map((c) => (
                  <option key={c.id} value={c.cluster_label}>
                    Sector #{c.cluster_label + 1} ({c.signal_count} pts)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Min Thermal:</span>
              <span className="text-amber-400 font-bold font-mono tabular-nums">{minThermalFilter}%</span>
              <input
                type="range"
                min="0"
                max="90"
                step="10"
                value={minThermalFilter}
                onChange={(e) => setMinThermalFilter(Number(e.target.value))}
                className="w-20 accent-amber-400 cursor-pointer h-1.5 bg-white/[0.1] rounded"
              />
            </div>
          </div>
        </div>

        {/* Signals Table */}
        <div className="overflow-x-auto border border-white/[0.07] rounded-lg max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-slate-400 uppercase text-[10px] font-mono border-b border-white/[0.07] sticky top-0 z-10 backdrop-blur">
              <tr>
                <th className="p-3">Signal ID</th>
                <th className="p-3">Coordinates (Lat, Lon)</th>
                <th className="p-3">Temp (°C)</th>
                <th className="p-3">Thermal Score</th>
                <th className="p-3">Human Prob</th>
                <th className="p-3">Debris Prob</th>
                <th className="p-3">Damage Prob</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] bg-[#11131a]/40 font-mono text-[11px]">
              {filteredSignals.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-500 font-sans">
                    No signals matched your criteria.
                  </td>
                </tr>
              ) : (
                filteredSignals.slice(0, 100).map((sig) => {
                  const isNoise = sig.cluster_id === -1;
                  return (
                    <tr key={sig.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 font-semibold text-slate-200">{sig.id}</td>
                      <td className="p-3 text-slate-400">{formatCoords(sig.lat, sig.lon)}</td>
                      <td className="p-3 font-bold text-amber-400 tabular-nums">{sig.temperature}°C</td>
                      <td className="p-3 text-amber-300 tabular-nums">{formatPercentage(sig.thermal_score)}</td>
                      <td className="p-3 text-sky-400 tabular-nums">{formatPercentage(sig.person_probability)}</td>
                      <td className="p-3 text-orange-400 tabular-nums">{formatPercentage(sig.debris_probability)}</td>
                      <td className="p-3 text-purple-400 tabular-nums">{formatPercentage(sig.damage_probability)}</td>
                      <td className="p-3 text-slate-300 tabular-nums">{formatPercentage(sig.confidence)}</td>
                      <td className="p-3">
                        {isNoise ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.05] text-slate-400 border border-white/[0.08]">
                            Noise (-1)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/25 font-semibold">
                            Sector #{sig.cluster_id + 1}
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

        {filteredSignals.length > 100 && (
          <p className="text-[11px] text-slate-500 text-center font-sans">
            Showing first 100 of {filteredSignals.length} filtered signals. Export CSV for the complete telemetry stream.
          </p>
        )}
      </div>
    </div>
  );
};
