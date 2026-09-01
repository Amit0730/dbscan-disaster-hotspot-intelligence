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
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 uppercase tracking-wide">
              Haversine DBSCAN Spatial Clustering Engine
            </h1>
            <TacticalBadge variant="cyan">REAL-TIME SCIKIT-LEARN</TacticalBadge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Execute geodesic density-based spatial clustering (Earth Radius R = 6,371 km) without arbitrary Euclidean coordinate distortion.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 text-xs font-mono font-semibold rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset (100m, 5)</span>
          </button>

          <button
            onClick={handleExecuteDBSCAN}
            disabled={loading}
            className="px-5 py-2 text-xs font-mono font-bold rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-cyan-500/25"
          >
            <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'CALCULATING...' : 'RUN DBSCAN'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Parameter Control Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Hyperparameter Tuning Console
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Formula: eps_rad = EPS_meters / 6,371,000 m
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* EPS Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-slate-300">
                EPS (Epsilon Distance Threshold):
              </label>
              <span className="text-sm font-black font-mono text-cyan-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
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
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <p className="text-[11px] text-slate-500 font-mono">
              Defines the maximum geodesic radius to search for neighboring signal points. Smaller values isolate tight survivor pockets; larger values merge regional debris zones.
            </p>
          </div>

          {/* Min Samples Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-slate-300">
                Min Samples (Core Density Threshold):
              </label>
              <span className="text-sm font-black font-mono text-cyan-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
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
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <p className="text-[11px] text-slate-500 font-mono">
              The minimum number of signals required within EPS radius to form a dense cluster core. Signals below this threshold become classified as noise (ID: -1).
            </p>
          </div>
        </div>
      </div>

      {/* Cluster Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
          subtitle="Non-noise labels (≥0)"
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

      {/* Visual Analytics Split: Cluster Size Bar Chart & Noise Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            Detected Cluster Point Distributions
          </h3>
          <ClusterSizeChart clusters={clusters} />
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-400" />
            Clustered vs Spatial Noise Ratio
          </h3>
          <NoiseVsClusteredChart stats={stats} />
        </div>
      </div>

      {/* Real-time Map preview */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-cyan-400" />
          Active Spatial Clustering Output Preview
        </h3>
        <DisasterMap
          height="450px"
          onClusterSelect={(c) => {
            setSelectedCluster(c);
            setInspectModalOpen(true);
          }}
        />
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
