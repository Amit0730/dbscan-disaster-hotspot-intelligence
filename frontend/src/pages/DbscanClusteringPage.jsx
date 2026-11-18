import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { StatCard } from '../components/StatCard';
import { TacticalBadge } from '../components/TacticalBadge';
import { ClusterSizeChart } from '../charts/ClusterSizeChart';
import { NoiseVsClusteredChart } from '../charts/NoiseVsClusteredChart';
import { DisasterMap } from '../map/DisasterMap';
import { ClusterDetailModal } from '../components/ClusterDetailModal';
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  Activity,
  Layers,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Info,
  Radio,
} from 'lucide-react';

export const DbscanClusteringPage = () => {
  const {
    stats,
    clusters,
    signals,
    dbscanParams,
    setDbscanParams,
    runDBSCAN,
    loading,
    selectedCluster,
    setSelectedCluster,
  } = useMission();

  const [eps, setEps] = useState(dbscanParams.eps_meters);
  const [minSamples, setMinSamples] = useState(dbscanParams.min_samples);
  const [clusteringResult, setClusteringResult] = useState(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);

  const handleExecuteDBSCAN = async () => {
    try {
      const res = await runDBSCAN({ eps_meters: parseFloat(eps), min_samples: parseInt(minSamples, 10) });
      setClusteringResult(res);
    } catch (err) {
      alert(`Clustering failed: ${err.message}`);
    }
  };

  const handleResetDefaults = () => {
    setEps(100.0);
    setMinSamples(5);
    runDBSCAN({ eps_meters: 100.0, min_samples: 5 });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">
              Haversine DBSCAN Spatial Clustering Engine
            </h1>
            <TacticalBadge variant="cyan">Scikit-Learn Geospatial</TacticalBadge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Execute geodesic density-based spatial clustering (Earth Radius R = 6,371 km) without planar Euclidean coordinate distortion.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 border border-white/[0.08] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults (100m, 5)</span>
          </button>

          <button
            onClick={handleExecuteDBSCAN}
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Clustering...' : 'Execute DBSCAN'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Parameter Control Box */}
      <div className="pro-card p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-semibold text-slate-200">
              Hyperparameter Tuning Console
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Formula: &epsilon;<sub>rad</sub> = EPS<sub>m</sub> / 6,371,000 m
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* EPS Slider */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">
                &epsilon; (Epsilon Distance Threshold):
              </label>
              <span className="text-xs font-bold font-mono text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20 tabular-nums">
                {eps} meters
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={eps}
              onChange={(e) => setEps(Number(e.target.value))}
              className="w-full h-1.5 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Defines the maximum geodesic radius to search for neighboring signals. Lower values isolate tight survivor pockets; higher values merge broad debris zones.
            </p>
          </div>

          {/* Min Samples Slider */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">
                Min Samples (Core Density Threshold):
              </label>
              <span className="text-xs font-bold font-mono text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20 tabular-nums">
                {minSamples} points
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="25"
              step="1"
              value={minSamples}
              onChange={(e) => setMinSamples(Number(e.target.value))}
              className="w-full h-1.5 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              The minimum signal count required within &epsilon; radius to form a dense cluster core. Signals below threshold are classified as spatial noise (ID: -1).
            </p>
          </div>
        </div>
      </div>

      {/* Cluster Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        <StatCard
          title="Total Signals"
          value={stats?.total_signals ?? signals.length}
          subtitle="Evaluated data points"
          icon={Activity}
          color="cyan"
        />
        <StatCard
          title="Clusters Detected"
          value={stats?.dbscan_clusters ?? clusters.length}
          subtitle="Non-noise groups (≥0)"
          icon={Layers}
          color="emerald"
        />
        <StatCard
          title="Noise Points"
          value={stats?.noise_points ?? 0}
          subtitle="Outliers (ID: -1)"
          icon={AlertTriangle}
          color="purple"
        />
        <StatCard
          title="Largest Cluster"
          value={stats?.largest_cluster_size ?? 0}
          subtitle="Signal points"
          icon={SlidersHorizontal}
          color="amber"
        />
        <StatCard
          title="Avg Cluster Size"
          value={stats?.average_cluster_size ?? 0}
          subtitle="Signals per cluster"
          icon={Activity}
          color="cyan"
        />
        <StatCard
          title="Mean Density"
          value={stats?.average_priority_score ? `${clusters[0]?.cluster_density || 120} /km²` : '--'}
          subtitle="Spatial concentration"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Visual Analytics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="pro-card p-5 space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Detected Cluster Point Distributions</span>
          </h3>
          <ClusterSizeChart clusters={clusters} />
        </div>

        <div className="pro-card p-5 space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Clustered vs Spatial Noise Ratio</span>
          </h3>
          <NoiseVsClusteredChart stats={stats} />
        </div>
      </div>

      {/* Real-time Map preview */}
      <div className="pro-card p-5 space-y-3">
        <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-400" />
          <span>Spatial Clustering Output Preview</span>
        </h3>
        <div className="rounded-lg overflow-hidden border border-white/[0.07]">
          <DisasterMap
            height="450px"
            onClusterSelect={(c) => {
              setSelectedCluster(c);
              setInspectModalOpen(true);
            }}
          />
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
