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
          `sector ${c.cluster_label + 1}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <div className="p-4 sm:p-6 lg:p-7 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">
              Cluster Analytics & Triage Intelligence
            </h1>
            <TacticalBadge variant="cyan">Analytics Engine</TacticalBadge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Statistical multi-factor evaluation of clustered survivor pockets and structural debris zones.
          </p>
        </div>
      </div>

      {/* Top 3 Analytical Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Chart 1: Priority Distribution */}
        <div className="pro-card p-5 space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Priority Score Distribution</span>
          </h3>
          <PriorityDistributionChart clusters={clusters} />
        </div>

        {/* Chart 2: Cluster Sizes */}
        <div className="pro-card p-5 space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>Signal Volume Per Cluster</span>
          </h3>
          <ClusterSizeChart clusters={clusters} />
        </div>

        {/* Chart 3: Feature Radar */}
        <div className="pro-card p-5 space-y-2.5">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Top Cluster vs Mission Average Radar</span>
          </h3>
          <SignalTypeRadarChart clusters={clusters} />
        </div>
      </div>

      {/* Master Cluster Analytics Table */}
      <div className="pro-card p-5 space-y-4">
        {/* Table Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sector ID, tier, action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0c0d12] border border-white/[0.08] rounded-lg pl-8.5 pr-3 py-1.5 text-xs font-sans text-slate-200 placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Classification:</span>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="bg-[#0c0d12] border border-white/[0.08] rounded-lg px-2.5 py-1 text-slate-200 text-xs font-medium cursor-pointer focus:border-sky-500 focus:outline-none"
            >
              <option value="ALL">All Tiers ({clusters.length})</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto border border-white/[0.07] rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] text-slate-400 uppercase text-[10px] font-mono border-b border-white/[0.07]">
              <tr>
                <th onClick={() => handleSort('cluster_label')} className="p-3 cursor-pointer hover:text-sky-300">
                  <div className="flex items-center gap-1">Sector <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('priority_score')} className="p-3 cursor-pointer hover:text-sky-300">
                  <div className="flex items-center gap-1">Score <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('classification')} className="p-3 cursor-pointer hover:text-sky-300">
                  <div className="flex items-center gap-1">Tier <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('signal_count')} className="p-3 cursor-pointer hover:text-sky-300">
                  <div className="flex items-center gap-1">Signals <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-3">Centroid</th>
                <th onClick={() => handleSort('avg_thermal_score')} className="p-3 cursor-pointer hover:text-sky-300">
                  <div className="flex items-center gap-1">Thermal Anomaly <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('avg_person_prob')} className="p-3 cursor-pointer hover:text-sky-300">
                  <div className="flex items-center gap-1">Human Signal <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('avg_debris_prob')} className="p-3 cursor-pointer hover:text-sky-300">
                  <div className="flex items-center gap-1">Debris Score <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th onClick={() => handleSort('cluster_density')} className="p-3 cursor-pointer hover:text-sky-300">
                  <div className="flex items-center gap-1">Density (/km²) <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-3">Recommended Field Directive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] bg-[#11131a]/40 font-mono text-[11px]">
              {sortedAndFilteredClusters.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-slate-500 font-sans">
                    No sectors matching your query.
                  </td>
                </tr>
              ) : (
                sortedAndFilteredClusters.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => handleOpenCluster(c)}
                    className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-semibold text-slate-100 font-sans">
                      Sector {String(c.cluster_label + 1).padStart(2, '0')}
                    </td>
                    <td className="p-3 font-bold text-sky-400 text-xs tabular-nums">
                      {c.priority_score} <span className="text-[10px] font-normal text-slate-500">/100</span>
                    </td>
                    <td className="p-3">
                      <TacticalBadge variant={c.classification}>{c.classification}</TacticalBadge>
                    </td>
                    <td className="p-3 font-medium text-slate-200 tabular-nums">{c.signal_count}</td>
                    <td className="p-3 text-slate-400">{formatCoords(c.center_lat, c.center_lon)}</td>
                    <td className="p-3 text-amber-400 font-medium tabular-nums">{formatPercentage(c.avg_thermal_score)}</td>
                    <td className="p-3 text-sky-400 font-medium tabular-nums">{formatPercentage(c.avg_person_prob)}</td>
                    <td className="p-3 text-orange-400 tabular-nums">{formatPercentage(c.avg_debris_prob)}</td>
                    <td className="p-3 text-emerald-400 tabular-nums">{c.cluster_density}</td>
                    <td className="p-3 text-slate-300 truncate max-w-xs font-sans text-xs">{c.recommended_action}</td>
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
