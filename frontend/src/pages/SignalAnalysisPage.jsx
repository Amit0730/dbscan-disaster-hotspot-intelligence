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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 uppercase tracking-wide">
              Multi-Sensor Signal Feature Analysis
            </h1>
            <TacticalBadge variant="cyan">385 STANDARDIZED SIGNALS</TacticalBadge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Standardized geo-tagged radiometric thermal anomalies and visual detector probability tensors.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 text-xs font-mono font-semibold rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Critical Operational Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
        <div className="space-y-1">
          <span className="font-bold uppercase tracking-wider text-amber-200">
            Important Signal Extraction & Interpretation Rule:
          </span>
          <p className="text-amber-300/90 leading-relaxed text-[11px]">
            Never assume a thermal anomaly is definitively a living survivor. Thermal signatures can originate from sun-exposed concrete rubble, cooling vehicle engines, smoldering building debris, ruptured electrical equipment, or ambient solar reflection. The system classifies these as <strong>"Potential Human Signals"</strong> and <strong>"Potential Rescue Hotspots"</strong> for decision support.
          </p>
        </div>
      </div>

      {/* Dual Sensor Extraction Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thermal Extraction Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <Flame className="w-4 h-4" />
              Thermal Radiometric Processing Pipeline
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Range: 15°C – 50°C</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Extracts radiometric intensity variance from thermal frames. Calculates local temperature gradient and relative anomaly outliers, normalized linearly between 0.0 and 1.0.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-mono">
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Mean Temp</span>
              <strong className="text-amber-400 font-bold">29.4°C</strong>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Peak Anomaly</span>
              <strong className="text-red-400 font-bold">48.5°C</strong>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Anomaly Weight</span>
              <strong className="text-cyan-400 font-bold">35% Scoring</strong>
            </div>
          </div>
        </div>

        {/* Visual Multi-class Extraction Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
              <Radio className="w-4 h-4" />
              RGB Visual Intelligence Extraction
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Confidence: 0.75 – 0.98</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Runs visual detection contour heuristics evaluating human silhouette probability, rubble/debris obstruction, structural collapse fractures, and vehicle locations.
          </p>
          <div className="grid grid-cols-4 gap-1.5 pt-2 text-center text-xs font-mono">
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Person</span>
              <strong className="text-cyan-400 font-bold">30%</strong>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Debris</span>
              <strong className="text-orange-400 font-bold">15%</strong>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Damage</span>
              <strong className="text-purple-400 font-bold">10%</strong>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Density</span>
              <strong className="text-emerald-400 font-bold">10%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Temporal Detection Activity Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          Sensor Detections Along Flight Survey Timeline (08:00 – 18:00)
        </h3>
        <TemporalDetectionChart signals={signals} />
      </div>

      {/* Standardized Signal Dataset Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Cluster Filter:</span>
              <select
                value={selectedClusterFilter}
                onChange={(e) => setSelectedClusterFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs font-mono cursor-pointer"
              >
                <option value="ALL">All Signals ({signals.length})</option>
                <option value="NOISE">Spatial Noise (-1)</option>
                {clusters.map((c) => (
                  <option key={c.id} value={c.cluster_label}>
                    Cluster #{c.cluster_label + 1} ({c.signal_count} pts)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Min Thermal:</span>
              <span className="text-amber-400 font-bold">{minThermalFilter}%</span>
              <input
                type="range"
                min="0"
                max="90"
                step="10"
                value={minThermalFilter}
                onChange={(e) => setMinThermalFilter(Number(e.target.value))}
                className="w-20 accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Signals Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-lg max-h-[500px]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800 sticky top-0 z-10">
              <tr>
                <th className="p-3">Signal ID</th>
                <th className="p-3">Coordinates (Lat, Lon)</th>
                <th className="p-3">Temp (°C)</th>
                <th className="p-3">Thermal Score</th>
                <th className="p-3">Human Prob</th>
                <th className="p-3">Debris Prob</th>
                <th className="p-3">Damage Prob</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Cluster Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {filteredSignals.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-500">
                    No signals matched your search criteria.
                  </td>
                </tr>
              ) : (
                filteredSignals.slice(0, 100).map((sig) => {
                  const isNoise = sig.cluster_id === -1;
                  return (
                    <tr key={sig.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-200">{sig.id}</td>
                      <td className="p-3 text-slate-400">{formatCoords(sig.lat, sig.lon)}</td>
                      <td className="p-3 font-bold text-amber-400">{sig.temperature}°C</td>
                      <td className="p-3 text-amber-300">{formatPercentage(sig.thermal_score)}</td>
                      <td className="p-3 text-cyan-400">{formatPercentage(sig.person_probability)}</td>
                      <td className="p-3 text-orange-400">{formatPercentage(sig.debris_probability)}</td>
                      <td className="p-3 text-purple-400">{formatPercentage(sig.damage_probability)}</td>
                      <td className="p-3 text-slate-300">{formatPercentage(sig.confidence)}</td>
                      <td className="p-3">
                        {isNoise ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                            NOISE (-1)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                            CLUSTER #{sig.cluster_id + 1}
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
          <p className="text-[11px] font-mono text-slate-500 text-center">
            Showing first 100 of {filteredSignals.length} filtered signals. Export CSV for the full telemetry dataset.
          </p>
        )}
      </div>
    </div>
  );
};
