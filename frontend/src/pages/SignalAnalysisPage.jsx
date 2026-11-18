import React, { useState, useMemo } from 'react';
import { useMission } from '../context/MissionContext';
import { SeverityBadge } from '../components/SeverityBadge';
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
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const SignalAnalysisPage = () => {
  const { signals, clusters } = useMission();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClusterFilter, setSelectedClusterFilter] = useState('ALL');
  const [minThermalFilter, setMinThermalFilter] = useState(0);
  const [sortField, setSortField] = useState('thermal_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredSignals = useMemo(() => {
    return signals
      .filter((sig) => {
        const matchSearch =
          (sig.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sig.image_id && sig.image_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (sig.ground_truth_priority && sig.ground_truth_priority.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchCluster =
          selectedClusterFilter === 'ALL'
            ? true
            : selectedClusterFilter === 'NOISE'
            ? sig.cluster_id === -1
            : sig.cluster_id === parseInt(selectedClusterFilter, 10);

        const matchThermal = (sig.thermal_score || 0) * 100 >= minThermalFilter;

        return matchSearch && matchCluster && matchThermal;
      })
      .sort((a, b) => {
        const valA = a[sortField] ?? 0;
        const valB = b[sortField] ?? 0;
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [signals, searchTerm, selectedClusterFilter, minThermalFilter, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredSignals.length / pageSize) || 1;
  const paginatedSignals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSignals.slice(start, start + pageSize);
  }, [filteredSignals, currentPage]);

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
    ];

    const rows = filteredSignals.map((s) => [
      s.id,
      s.lat,
      s.lon,
      s.altitude || 100,
      s.timestamp || '',
      s.temperature || 37.0,
      s.thermal_anomaly ? 1 : 0,
      (s.thermal_score || 0).toFixed(3),
      (s.person_probability || 0).toFixed(3),
      (s.debris_probability || 0).toFixed(3),
      (s.damage_probability || 0).toFixed(3),
      (s.vehicle_probability || 0).toFixed(3),
      (s.confidence || 0).toFixed(3),
      s.cluster_id,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aegis_signal_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const highThermalCount = signals.filter((s) => (s.thermal_score || 0) >= 0.7).length;
  const humanConfidenceCount = signals.filter((s) => (s.person_probability || 0) >= 0.6).length;
  const clusteredCount = signals.filter((s) => s.cluster_id !== -1).length;
  const noiseCount = signals.filter((s) => s.cluster_id === -1).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-[#EAF2FF]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#27364C]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#00B7FF] uppercase">
              Telemetry Records
            </span>
            <span className="text-[#27364C]">•</span>
            <span className="text-[10px] font-mono text-[#98AAC2]">Raw Drone Observations</span>
          </div>
          <h1 className="text-xl font-bold text-[#EAF2FF] tracking-tight mt-0.5">
            Signal Telemetry & Radiometric Vector Analysis
          </h1>
          <p className="text-xs text-[#98AAC2] mt-0.5">
            Full record of individual drone detections across FLIR radiometric thermal, optical computer vision, and coordinate points.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={signals.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18263A] hover:bg-[#1f324d] text-xs font-mono text-[#EAF2FF] border border-[#27364C] rounded transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-[#00B7FF]" />
            Export Telemetry (CSV)
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="pro-card p-4">
          <div className="text-[10px] font-mono tracking-wider text-[#98AAC2] uppercase">Total Detections</div>
          <div className="text-2xl font-mono font-bold text-[#EAF2FF] mt-1">{signals.length}</div>
          <div className="text-[11px] text-[#98AAC2] mt-1 font-mono">Geotagged Points</div>
        </div>
        <div className="pro-card p-4">
          <div className="text-[10px] font-mono tracking-wider text-[#F5B94E] uppercase">Thermal Anomalies (≥70%)</div>
          <div className="text-2xl font-mono font-bold text-[#F5B94E] mt-1">{highThermalCount}</div>
          <div className="text-[11px] text-[#98AAC2] mt-1 font-mono">
            {signals.length > 0 ? formatPercentage(highThermalCount / signals.length) : '0%'} of signals
          </div>
        </div>
        <div className="pro-card p-4">
          <div className="text-[10px] font-mono tracking-wider text-[#00B7FF] uppercase">Human Detection (≥60%)</div>
          <div className="text-2xl font-mono font-bold text-[#00B7FF] mt-1">{humanConfidenceCount}</div>
          <div className="text-[11px] text-[#98AAC2] mt-1 font-mono">Visual Detector Hits</div>
        </div>
        <div className="pro-card p-4">
          <div className="text-[10px] font-mono tracking-wider text-[#18D9A4] uppercase">Clustered vs Noise</div>
          <div className="text-2xl font-mono font-bold text-[#18D9A4] mt-1">
            {clusteredCount} <span className="text-xs text-[#98AAC2] font-normal">/ {noiseCount} noise</span>
          </div>
          <div className="text-[11px] text-[#98AAC2] mt-1 font-mono">Spatial Core Partition</div>
        </div>
      </div>

      {/* Temporal Distribution Chart */}
      <div className="pro-card p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#27364C]">
          <div>
            <h2 className="text-xs font-mono font-semibold tracking-wider text-[#EAF2FF] uppercase">
              Temporal Signal Ingestion Stream
            </h2>
            <p className="text-[11px] text-[#98AAC2] mt-0.5">
              Hourly detection frequency comparing thermal anomalies against optical observations
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18263A] text-[#00B7FF] border border-[#27364C]">
            Mission Timeline
          </span>
        </div>
        <TemporalDetectionChart signals={signals} />
      </div>

      {/* Telemetry Filter & Table View */}
      <div className="pro-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#27364C]">
          <div>
            <h2 className="text-xs font-mono font-semibold tracking-wider text-[#EAF2FF] uppercase">
              Individual Signal Telemetry Log
            </h2>
            <p className="text-[11px] text-[#98AAC2] mt-0.5">
              Displaying {filteredSignals.length} of {signals.length} recorded signals
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#98AAC2] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search signal ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1 bg-[#18263A] border border-[#27364C] rounded text-xs font-mono text-[#EAF2FF] placeholder-[#98AAC2] focus:outline-none focus:border-[#00B7FF] w-48"
              />
            </div>

            <select
              value={selectedClusterFilter}
              onChange={(e) => {
                setSelectedClusterFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#18263A] border border-[#27364C] rounded text-xs font-mono text-[#EAF2FF] px-2.5 py-1 focus:outline-none focus:border-[#00B7FF]"
            >
              <option value="ALL">All Sectors</option>
              <option value="NOISE">Noise Only (Cluster -1)</option>
              {clusters.map((c) => (
                <option key={c.cluster_label} value={c.cluster_label}>
                  Sector {c.cluster_label + 1}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 bg-[#18263A] border border-[#27364C] rounded px-2.5 py-1 text-xs font-mono text-[#98AAC2]">
              <span>Min Thermal:</span>
              <span className="text-[#F5B94E] font-bold">{minThermalFilter}%</span>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={minThermalFilter}
                onChange={(e) => {
                  setMinThermalFilter(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-16 accent-[#F5B94E] cursor-pointer h-1.5 bg-[#27364C] rounded"
              />
            </div>
          </div>
        </div>

        {/* Dense Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#27364C] text-[10px] font-mono text-[#98AAC2] uppercase tracking-wider">
                <th className="py-2.5 px-3">Signal ID</th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-[#00B7FF]" onClick={() => handleSort('cluster_id')}>
                  <div className="flex items-center gap-1">
                    Sector
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Coordinates (WGS-84)</th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-[#00B7FF]" onClick={() => handleSort('thermal_score')}>
                  <div className="flex items-center gap-1">
                    Thermal Score
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-[#00B7FF]" onClick={() => handleSort('person_probability')}>
                  <div className="flex items-center gap-1">
                    Person Prob
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Debris / Damage</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27364C]/50 font-mono">
              {paginatedSignals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#98AAC2]">
                    No signals matched the selected query.
                  </td>
                </tr>
              ) : (
                paginatedSignals.map((sig) => (
                  <tr key={sig.id} className="hover:bg-[#18263A]/80 transition">
                    <td className="py-2.5 px-3 text-[#EAF2FF] font-medium">
                      {sig.id}
                    </td>
                    <td className="py-2.5 px-3">
                      {sig.cluster_id === -1 ? (
                        <SeverityBadge severity="NOISE" />
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00B7FF]/10 text-[#00B7FF] border border-[#00B7FF]/20">
                          Sector {sig.cluster_id + 1}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[#98AAC2] text-[11px]">
                      {formatCoords(sig.lat, sig.lon)}
                    </td>
                    <td className="py-2.5 px-3 text-[#F5B94E] font-bold">
                      {formatPercentage(sig.thermal_score || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-[#00B7FF]">
                      {formatPercentage(sig.person_probability || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-[#98AAC2]">
                      {formatPercentage(sig.debris_probability || 0)} / {formatPercentage(sig.damage_probability || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-[#98AAC2]">
                      {formatPercentage(sig.vehicle_probability || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[#98AAC2]">
                      {sig.timestamp ? new Date(sig.timestamp).toLocaleTimeString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#27364C] text-xs font-mono text-[#98AAC2]">
          <div>
            Page {currentPage} of {totalPages} ({filteredSignals.length} records)
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-[#18263A] hover:bg-[#1f324d] text-[#EAF2FF] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-[#18263A] hover:bg-[#1f324d] text-[#EAF2FF] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
