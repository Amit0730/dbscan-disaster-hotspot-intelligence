import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { StatCard } from '../components/StatCard';
import { TacticalBadge } from '../components/TacticalBadge';
import { DisasterMap } from '../map/DisasterMap';
import { ClusterDetailModal } from '../components/ClusterDetailModal';
import { TimeSlider } from '../components/TimeSlider';
import { PriorityDistributionChart } from '../charts/PriorityDistributionChart';
import { formatCoords, formatTime } from '../utils/geo';
import {
  ShieldAlert,
  Flame,
  Radio,
  Sliders,
  Layers,
  Activity,
  AlertCircle,
  FileImage,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';

export const MissionDashboard = () => {
  const {
    mission,
    stats,
    clusters,
    signals,
    selectedCluster,
    setSelectedCluster,
    loading,
    loadDemoMission,
  } = useMission();

  const [inspectModalOpen, setInspectModalOpen] = useState(false);

  const handleSelectCluster = (cluster) => {
    setSelectedCluster(cluster);
    setInspectModalOpen(true);
  };

  const isDemo = mission?.source === 'DEMO';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Mission Status Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold font-mono text-slate-100 uppercase tracking-wide">
                {mission?.name || 'Active Disaster Recon Mission'}
              </h1>
              {isDemo ? (
                <TacticalBadge variant="simulated">SIMULATED MISSION</TacticalBadge>
              ) : (
                <TacticalBadge variant="active">LIVE UPLOAD</TacticalBadge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
              <span>Status: <strong className="text-emerald-400 font-bold">{mission?.status || 'ACTIVE'}</strong></span>
              <span>&bull;</span>
              <span>Source: <strong className="text-amber-400">{mission?.source || 'SIMULATED'}</strong></span>
              <span>&bull;</span>
              <span>Last Processed: <strong>{formatTime(mission?.updated_at || mission?.created_at)}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={() => loadDemoMission()}
          disabled={loading}
          className="px-3.5 py-2 text-xs font-mono font-semibold rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reset Demo Sector</span>
        </button>
      </div>

      {/* Top 6 KPI Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Images"
          value={stats?.total_images ?? 40}
          subtitle="RGB + Thermal"
          icon={FileImage}
          color="cyan"
        />
        <StatCard
          title="Total Signals"
          value={stats?.total_signals ?? signals.length}
          subtitle="Dual-sensor geotags"
          icon={Radio}
          color="cyan"
        />
        <StatCard
          title="DBSCAN Clusters"
          value={stats?.dbscan_clusters ?? clusters.length}
          subtitle="Haversine metric"
          icon={Sliders}
          color="emerald"
        />
        <StatCard
          title="Noise Points"
          value={stats?.noise_points ?? 0}
          subtitle="Filtered (ID: -1)"
          icon={Activity}
          color="purple"
        />
        <StatCard
          title="Critical Hotspots"
          value={stats?.critical_hotspots ?? 0}
          subtitle="Priority ≥ 90/100"
          icon={ShieldAlert}
          color="red"
          badge={<span className="text-[10px] font-mono text-red-400 font-bold animate-pulse">IMMEDIATE USAR</span>}
        />
        <StatCard
          title="High Priority"
          value={stats?.high_priority_hotspots ?? 0}
          subtitle="Priority 75 - 89"
          icon={Flame}
          color="amber"
          badge={<span className="text-[10px] font-mono text-amber-400 font-bold">RAPID RECON</span>}
        />
      </div>

      {/* Main Command Map & Side Priority List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Central Map (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Tactical Geospatial Hotspot Map
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              Click any cluster boundary or centroid to inspect triage metrics
            </span>
          </div>

          <DisasterMap
            height="560px"
            onClusterSelect={handleSelectCluster}
          />

          {/* Time Slider Controls below Map */}
          <TimeSlider />
        </div>

        {/* Priority Ranked Hotspots Sidebar (1 Col) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              Hotspot Triage Ranking
            </h2>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">
              {clusters.length} POCKETS
            </span>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {clusters.map((cluster, idx) => {
              const isCrit = cluster.classification === 'CRITICAL';
              return (
                <div
                  key={cluster.id}
                  onClick={() => handleSelectCluster(cluster)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-slate-900/80 hover:bg-slate-800/90 shadow-md ${
                    isCrit
                      ? 'border-red-500/50 hover:border-red-400 shadow-red-950/30'
                      : 'border-slate-800 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-950 font-mono font-bold text-xs flex items-center justify-center text-slate-200 border border-slate-700">
                        #{idx + 1}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-100">
                        CLUSTER #{String(cluster.cluster_label + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <TacticalBadge variant={cluster.classification}>
                      {cluster.classification}
                    </TacticalBadge>
                  </div>

                  {/* Priority Metric */}
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400">Priority Score:</span>
                    <span className="text-lg font-black font-mono text-cyan-400">
                      {cluster.priority_score} <span className="text-[10px] font-normal text-slate-500">/100</span>
                    </span>
                  </div>

                  {/* Signal Count & Density */}
                  <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80 mb-2">
                    <div>Signals: <strong className="text-slate-200">{cluster.signal_count}</strong></div>
                    <div>Density: <strong className="text-slate-200">{cluster.cluster_density} /km²</strong></div>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    &rarr; {cluster.recommended_action}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cluster Inspector Modal */}
      {inspectModalOpen && selectedCluster && (
        <ClusterDetailModal
          cluster={selectedCluster}
          onClose={() => setInspectModalOpen(false)}
        />
      )}
    </div>
  );
};
