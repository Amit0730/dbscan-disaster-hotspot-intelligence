import React, { useState, useMemo } from 'react';
import { useMission } from '../context/MissionContext';
import { SeverityBadge } from '../components/SeverityBadge';
import { PriorityDistributionChart } from '../charts/PriorityDistributionChart';
import { ClusterSizeChart } from '../charts/ClusterSizeChart';
import { SignalTypeRadarChart } from '../charts/SignalTypeRadarChart';
import { TemporalDetectionChart } from '../charts/TemporalDetectionChart';
import { NoiseVsClusteredChart } from '../charts/NoiseVsClusteredChart';
import { ClusterInspectorDrawer } from '../components/ClusterInspectorDrawer';
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
  Download,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const ClusterAnalyticsPage = () => {
  const { clusters, signals, stats, selectedCluster, setSelectedCluster } = useMission();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('priority_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterTier, setFilterTier] = useState('ALL');
  const [drawerOpen, setDrawerOpen] = useState(false);

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
          (c.classification || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.recommended_action || '').toLowerCase().includes(searchTerm.toLowerCase());

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
    setDrawerOpen(true);
  };

  const exportClustersCSV = () => {
    if (!clusters || clusters.length === 0) return;
    const headers = ['Sector', 'PriorityScore', 'Severity', 'Detections', 'Latitude', 'Longitude', 'AvgThermal', 'AvgPersonProb', 'RecommendedAction'];
    const rows = clusters.map((c) => [
      `Sector ${c.cluster_label + 1}`,
      (c.priority_score || 0).toFixed(1),
      c.classification || 'UNKNOWN',
      c.detection_count || 0,
      c.center_lat,
      c.center_lon,
      (c.avg_thermal_score || 0).toFixed(3),
      (c.avg_person_prob || 0).toFixed(3),
      `"${c.recommended_action || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aegis_clusters_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-[#EAF2FF]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#27364C]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#00B7FF] uppercase">
              Operational Analytics
            </span>
            <span className="text-[#27364C]">•</span>
            <span className="text-[10px] font-mono text-[#98AAC2]">Haversine DBSCAN Evaluation</span>
          </div>
          <h1 className="text-xl font-bold text-[#EAF2FF] tracking-tight mt-0.5">
            Cluster Analytics & Spatial Density Comparison
          </h1>
          <p className="text-xs text-[#98AAC2] mt-0.5">
            Multi-dimensional evaluation of clustered survivor pockets, thermal signatures, and structural damage.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={exportClustersCSV}
            disabled={clusters.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18263A] hover:bg-[#1f324d] text-xs font-mono text-[#EAF2FF] border border-[#27364C] rounded transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-[#00B7FF]" />
            Export Cluster Telemetry (CSV)
          </button>
        </div>
      </div>

      {/* Top Telemetry Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="pro-card p-4">
          <div className="text-[10px] font-mono tracking-wider text-[#98AAC2] uppercase">Evaluated Sectors</div>
          <div className="text-2xl font-mono font-bold text-[#EAF2FF] mt-1">{clusters.length}</div>
          <div className="text-[11px] text-[#98AAC2] mt-1 font-mono">DBSCAN Cores Formed</div>
        </div>
        <div className="pro-card p-4">
          <div className="text-[10px] font-mono tracking-wider text-[#FF5A70] uppercase">Critical Triage Zones</div>
          <div className="text-2xl font-mono font-bold text-[#FF5A70] mt-1">
            {clusters.filter(c => c.classification === 'CRITICAL').length}
          </div>
          <div className="text-[11px] text-[#98AAC2] mt-1 font-mono">Priority Score ≥ 75.0</div>
        </div>
        <div className="pro-card p-4">
          <div className="text-[10px] font-mono tracking-wider text-[#00B7FF] uppercase">Mean Cluster Density</div>
          <div className="text-2xl font-mono font-bold text-[#00B7FF] mt-1">
            {clusters.length > 0 ? (clusters.reduce((acc, c) => acc + (c.detection_count || 0), 0) / clusters.length).toFixed(1) : '0.0'}
          </div>
          <div className="text-[11px] text-[#98AAC2] mt-1 font-mono">Signals per Sector</div>
        </div>
        <div className="pro-card p-4">
          <div className="text-[10px] font-mono tracking-wider text-[#F5B94E] uppercase">Mean Thermal Anomaly</div>
          <div className="text-2xl font-mono font-bold text-[#F5B94E] mt-1">
            {clusters.length > 0 ? formatPercentage(clusters.reduce((acc, c) => acc + (c.avg_thermal_score || 0), 0) / clusters.length) : '0%'}
          </div>
          <div className="text-[11px] text-[#98AAC2] mt-1 font-mono">Radiometric Intensity</div>
        </div>
      </div>

      {/* Primary Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Score Distribution */}
        <div className="pro-card p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#27364C]">
            <div>
              <h2 className="text-xs font-mono font-semibold tracking-wider text-[#EAF2FF] uppercase">
                Priority Tier Distribution
              </h2>
              <p className="text-[11px] text-[#98AAC2] mt-0.5">
                Cluster counts categorized by tactical urgency threshold
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18263A] text-[#00B7FF] border border-[#27364C]">
              4 Tiers
            </span>
          </div>
          <PriorityDistributionChart clusters={clusters} />
        </div>

        {/* Signal Composition Radar */}
        <div className="pro-card p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#27364C]">
            <div>
              <h2 className="text-xs font-mono font-semibold tracking-wider text-[#EAF2FF] uppercase">
                Multi-Modal Signal Profile
              </h2>
              <p className="text-[11px] text-[#98AAC2] mt-0.5">
                Highest priority sector versus overall mission average
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18263A] text-[#FF5A70] border border-[#27364C]">
              Radar Breakdown
            </span>
          </div>
          <SignalTypeRadarChart clusters={clusters} />
        </div>

        {/* Cluster Population Bar Chart */}
        <div className="pro-card p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#27364C]">
            <div>
              <h2 className="text-xs font-mono font-semibold tracking-wider text-[#EAF2FF] uppercase">
                Detections Per Sector
              </h2>
              <p className="text-[11px] text-[#98AAC2] mt-0.5">
                Spatial point density distribution across all identified sectors
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18263A] text-[#98AAC2] border border-[#27364C]">
              Signal Volume
            </span>
          </div>
          <ClusterSizeChart clusters={clusters} />
        </div>

        {/* Clustered vs Noise Ratio */}
        <div className="pro-card p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#27364C]">
            <div>
              <h2 className="text-xs font-mono font-semibold tracking-wider text-[#EAF2FF] uppercase">
                Spatial Density Clustering Efficiency
              </h2>
              <p className="text-[11px] text-[#98AAC2] mt-0.5">
                Clustered signals vs isolated spatial noise (outliers)
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18263A] text-[#18D9A4] border border-[#27364C]">
              DBSCAN Partition
            </span>
          </div>
          <NoiseVsClusteredChart stats={stats} />
        </div>
      </div>

      {/* Cluster Comparison Table */}
      <div className="pro-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#27364C]">
          <div>
            <h2 className="text-xs font-mono font-semibold tracking-wider text-[#EAF2FF] uppercase">
              Sector Comparison Matrix
            </h2>
            <p className="text-[11px] text-[#98AAC2] mt-0.5">
              Sortable multi-factor evaluation of all detected operational sectors
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#98AAC2] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sector or tier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 bg-[#18263A] border border-[#27364C] rounded text-xs font-mono text-[#EAF2FF] placeholder-[#98AAC2] focus:outline-none focus:border-[#00B7FF] w-48"
              />
            </div>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="bg-[#18263A] border border-[#27364C] rounded text-xs font-mono text-[#EAF2FF] px-2.5 py-1 focus:outline-none focus:border-[#00B7FF]"
            >
              <option value="ALL">All Tiers</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#27364C] text-[10px] font-mono text-[#98AAC2] uppercase tracking-wider">
                <th className="py-2.5 px-3 cursor-pointer hover:text-[#00B7FF]" onClick={() => handleSort('cluster_label')}>
                  <div className="flex items-center gap-1">
                    Sector
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-[#00B7FF]" onClick={() => handleSort('priority_score')}>
                  <div className="flex items-center gap-1">
                    Priority Score
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-[#00B7FF]" onClick={() => handleSort('detection_count')}>
                  <div className="flex items-center gap-1">
                    Detections
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-[#00B7FF]" onClick={() => handleSort('avg_thermal_score')}>
                  <div className="flex items-center gap-1">
                    Thermal Signature
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-[#00B7FF]" onClick={() => handleSort('avg_person_prob')}>
                  <div className="flex items-center gap-1">
                    Human Conf.
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3">Coordinates (WGS-84)</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27364C]/50 text-xs">
              {sortedAndFilteredClusters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[#98AAC2] font-mono">
                    No matching sectors found.
                  </td>
                </tr>
              ) : (
                sortedAndFilteredClusters.map((cluster) => (
                  <tr
                    key={cluster.cluster_label}
                    onClick={() => handleOpenCluster(cluster)}
                    className="hover:bg-[#18263A]/80 cursor-pointer transition"
                  >
                    <td className="py-3 px-3 font-mono font-medium text-[#EAF2FF]">
                      Sector {cluster.cluster_label + 1}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-sm text-[#EAF2FF]">
                      {(cluster.priority_score || 0).toFixed(1)}
                    </td>
                    <td className="py-3 px-3">
                      <SeverityBadge severity={cluster.classification} />
                    </td>
                    <td className="py-3 px-3 font-mono text-[#98AAC2]">
                      {cluster.detection_count} pts
                    </td>
                    <td className="py-3 px-3 font-mono text-[#F5B94E]">
                      {formatPercentage(cluster.avg_thermal_score || 0)}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#00B7FF]">
                      {formatPercentage(cluster.avg_person_prob || 0)}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#98AAC2]">
                      {formatCoords(cluster.center_lat, cluster.center_lon)}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCluster(cluster);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-[#00B7FF] hover:bg-[#00B7FF]/10 rounded border border-[#00B7FF]/30 transition"
                      >
                        Inspect
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cluster Inspector Drawer */}
      <ClusterInspectorDrawer
        cluster={selectedCluster}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};
