import React, { useState, useMemo } from 'react';
import { useMission } from '../context/MissionContext';
import { TacticalBadge } from '../components/TacticalBadge';
import { PriorityDistributionChart } from '../charts/PriorityDistributionChart';
import { ClusterSizeChart } from '../charts/ClusterSizeChart';
import { SignalTypeRadarChart } from '../charts/SignalTypeRadarChart';
import { TemporalDetectionChart } from '../charts/TemporalDetectionChart';
import { NoiseVsClusteredChart } from '../charts/NoiseVsClusteredChart';
import { ClusterDetailModal } from '../components/ClusterDetailModal';
import { formatCoords, formatPercentage } from '../utils/geo';
import {
  BarChart3,
  Search,
  Filter,
  ArrowUpDown,
  Flame,
  Activity,
  Layers,
  MapPin,
  CheckCircle2,
  PieChart,
} from 'lucide-react';

export const ClusterAnalyticsPage = () => {
  const { clusters, signals, stats, selectedCluster, setSelectedCluster } = useMission();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('priority_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterTier, setFilterTier] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedAndFilteredClusters = useMemo(() => {
    return clusters
      .filter((c) => {
        const matchesSearch =
          `cluster #${c.cluster_label + 1}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.classification.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.recommended_action.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTier = filterTier === 'ALL' || c.classification === filterTier;
        return matchesSearch && matchesTier;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [clusters, searchTerm, filterTier, sortField, sortAsc]);

  const handleOpenCluster = (cluster) => {
    setSelectedCluster(cluster);
    setModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 uppercase tracking-wide">
              Cluster Analytics & Triage Intelligence
            </h1>
            <TacticalBadge variant="cyan">ANALYTICS ENGINE</TacticalBadge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Statistical multi-factor evaluation of clustered survivor pockets and structural debris zones.
          </p>
        </div>
      </div>

      {/* Top 4 Analytical Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Chart 1: Priority Distribution */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-red-400" />
            Priority Score Tiers
          </h3>
          <PriorityDistributionChart clusters={clusters} />
        </div>

        {/* Chart 2: Cluster Sizes */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Signal Volume Per Cluster
          </h3>
          <ClusterSizeChart clusters={clusters} />
        </div>

        {/* Chart 3: Feature Radar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-400" />
            Top Cluster vs Mission Average Radar
          </h3>
          <SignalTypeRadarChart clusters={clusters} />
        </div>
      </div>

      {/* Master Cluster Analytics Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        {/* Table Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search cluster ID, tier, tactical action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Classification:</span>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs font-mono cursor-pointer"
            >
              <option value="ALL">All Tiers ({clusters.length})</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th onClick={() => handleSort('cluster_label')} className="p-3 cursor-pointer hover:text-cyan-400">
                  <div className="flex items-center gap-1">Cluster ID <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('priority_score')} className="p-3 cursor-pointer hover:text-cyan-400">
                  <div className="flex items-center gap-1">Priority Score <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('classification')} className="p-3 cursor-pointer hover:text-cyan-400">
                  <div className="flex items-center gap-1">Classification <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('signal_count')} className="p-3 cursor-pointer hover:text-cyan-400">
                  <div className="flex items-center gap-1">Signals <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-3">Centroid (Lat, Lon)</th>
                <th onClick={() => handleSort('avg_thermal_score')} className="p-3 cursor-pointer hover:text-cyan-400">
                  <div className="flex items-center gap-1">Thermal Anomaly <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('avg_person_prob')} className="p-3 cursor-pointer hover:text-cyan-400">
                  <div className="flex items-center gap-1">Human Signal <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('avg_debris_prob')} className="p-3 cursor-pointer hover:text-cyan-400">
                  <div className="flex items-center gap-1">Debris Score <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('cluster_density')} className="p-3 cursor-pointer hover:text-cyan-400">
                  <div className="flex items-center gap-1">Density (/km²) <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-3">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {sortedAndFilteredClusters.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-500">
                    No clusters found matching your query.
                  </td>
                </tr>
              ) : (
                sortedAndFilteredClusters.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => handleOpenCluster(c)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-bold text-slate-100">
                      Cluster #{String(c.cluster_label + 1).padStart(2, '0')}
                    </td>
                    <td className="p-3 font-black text-cyan-400 text-sm">
                      {c.priority_score} <span className="text-[10px] font-normal text-slate-500">/100</span>
                    </td>
                    <td className="p-3">
                      <TacticalBadge variant={c.classification}>{c.classification}</TacticalBadge>
                    </td>
                    <td className="p-3 font-bold text-slate-200">{c.signal_count}</td>
                    <td className="p-3 text-slate-400">{formatCoords(c.center_lat, c.center_lon)}</td>
                    <td className="p-3 text-amber-400 font-bold">{formatPercentage(c.avg_thermal_score)}</td>
                    <td className="p-3 text-cyan-400 font-bold">{formatPercentage(c.avg_person_prob)}</td>
                    <td className="p-3 text-orange-400">{formatPercentage(c.avg_debris_prob)}</td>
                    <td className="p-3 text-emerald-400">{c.cluster_density}</td>
                    <td className="p-3 text-slate-300 truncate max-w-xs">{c.recommended_action}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cluster Inspector Modal */}
      {modalOpen && selectedCluster && (
        <ClusterDetailModal
          cluster={selectedCluster}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};
