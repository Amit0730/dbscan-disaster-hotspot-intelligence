import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { StatCard } from '../components/StatCard';
import { TacticalBadge } from '../components/TacticalBadge';
import { DisasterMap } from '../map/DisasterMap';
import { ClusterDetailModal } from '../components/ClusterDetailModal';
import { TimeSlider } from '../components/TimeSlider';
import { formatCoords, formatTime } from '../utils/geo';
import {
  ShieldAlert,
  Flame,
  Radio,
  SlidersHorizontal,
  Activity,
  FileImage,
  MapPin,
  RefreshCw,
  Clock,
  Layers,
  ChevronRight,
  TrendingUp,
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
    <div className="p-4 sm:p-6 lg:p-7 space-y-6 max-w-[1600px] mx-auto">
      {/* Top Mission Status Bar */}
      <div className="pro-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                {mission?.name || 'Urban Disaster Response Sector'}
              </h1>
              {isDemo ? (
                <TacticalBadge variant="simulated">Simulated Mission</TacticalBadge>
              ) : (
                <TacticalBadge variant="active">Live Telemetry</TacticalBadge>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-slate-400 mt-1 flex-wrap">
              <span>Status: <strong className="text-emerald-400 font-medium">{mission?.status || 'ONLINE'}</strong></span>
              <span className="text-slate-600">&bull;</span>
              <span>Source: <strong className="text-amber-400 font-medium">{mission?.source || 'SIMULATED'}</strong></span>
              <span className="text-slate-600">&bull;</span>
              <span>Synced: <strong className="text-slate-300">{formatTime(mission?.updated_at || mission?.created_at)}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <button
          onClick={() => loadDemoMission()}
          disabled={loading}
          className="px-3.5 py-2 text-xs font-medium rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/[0.1] transition-all cursor-pointer flex items-center gap-2 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reset Scenario Data</span>
        </button>
      </div>

      {/* Top 6 KPI Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        <StatCard
          title="Drone Images"
          value={stats?.total_images ?? 40}
          subtitle="RGB + Thermal frames"
          icon={FileImage}
          color="cyan"
        />
        <StatCard
          title="Signal Feeds"
          value={stats?.total_signals ?? signals.length}
          subtitle="Dual-sensor geotags"
          icon={Radio}
          color="cyan"
        />
        <StatCard
          title="DBSCAN Clusters"
          value={stats?.dbscan_clusters ?? clusters.length}
          subtitle="Haversine metric"
          icon={SlidersHorizontal}
          color="emerald"
        />
        <StatCard
          title="Spatial Noise"
          value={stats?.noise_points ?? 0}
          subtitle="Filtered outliers"
          icon={Activity}
          color="purple"
        />
        <StatCard
          title="Critical Hotspots"
          value={stats?.critical_hotspots ?? 0}
          subtitle="Priority ≥ 90/100"
          icon={ShieldAlert}
          color="red"
          badge={<span className="text-[11px] font-mono text-rose-400 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" /> Immediate USAR</span>}
        />
        <StatCard
          title="High Priority"
          value={stats?.high_priority_hotspots ?? 0}
          subtitle="Priority 75 - 89"
          icon={Flame}
          color="amber"
          badge={<span className="text-[11px] font-mono text-amber-400 font-medium">Rapid Recon Sweep</span>}
        />
      </div>

      {/* Main Command Map & Side Priority List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Central Map (3 Cols) */}
        <div className="lg:col-span-3 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-semibold text-slate-200">
                Tactical Geospatial Hotspot Map
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">
              Click cluster polygon or marker to view sensor breakdown
            </span>
          </div>

          <div className="rounded-xl overflow-hidden border border-white/[0.08] shadow-lg">
            <DisasterMap
              height="580px"
              onClusterSelect={handleSelectCluster}
            />
          </div>

          {/* Time Slider Controls below Map */}
          <TimeSlider />
        </div>

        {/* Priority Ranked Hotspots Sidebar (1 Col) */}
        <div className="lg:col-span-1 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-slate-200">
                Triage Priority Ranking
              </h2>
            </div>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white/[0.06] text-sky-400 border border-white/[0.08]">
              {clusters.length} Sectors
            </span>
          </div>

          <div className="space-y-2.5 max-h-[660px] overflow-y-auto pr-1">
            {clusters.map((cluster, idx) => {
              const isCrit = cluster.classification === 'CRITICAL';
              return (
                <div
                  key={cluster.id}
                  onClick={() => handleSelectCluster(cluster)}
                  className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer bg-[#11131a] hover:bg-[#151824] ${
                    isCrit
                      ? 'border-rose-500/40 hover:border-rose-500/60 shadow-xs'
                      : 'border-white/[0.07] hover:border-sky-500/35'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5.5 h-5.5 rounded-md bg-white/[0.06] font-mono font-semibold text-[11px] flex items-center justify-center text-slate-300 border border-white/[0.08]">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-xs text-slate-100">
                        Sector {String(cluster.cluster_label + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <TacticalBadge variant={cluster.classification}>
                      {cluster.classification}
                    </TacticalBadge>
                  </div>

                  {/* Priority Progress */}
                  <div className="space-y-1 mb-2.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-[11px] text-slate-400">Triage Score:</span>
                      <span className="font-bold font-mono text-sky-400 tabular-nums">
                        {cluster.priority_score}<span className="text-[10px] text-slate-500 font-normal">/100</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isCrit
                            ? 'bg-rose-500'
                            : cluster.classification === 'HIGH'
                            ? 'bg-amber-500'
                            : 'bg-sky-500'
                        }`}
                        style={{ width: `${Math.min(100, cluster.priority_score)}%` }}
                      />
                    </div>
                  </div>

                  {/* Signal Count & Density */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-400 bg-white/[0.03] p-2 rounded-lg border border-white/[0.05] mb-2">
                    <div>Signals: <strong className="text-slate-200">{cluster.signal_count}</strong></div>
                    <div>Density: <strong className="text-slate-200">{cluster.cluster_density}/km²</strong></div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="truncate max-w-[200px]">{cluster.recommended_action}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
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
