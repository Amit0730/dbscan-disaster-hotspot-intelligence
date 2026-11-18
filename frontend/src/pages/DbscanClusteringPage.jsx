import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { MetricCard } from '../components/MetricCard';
import { SeverityBadge } from '../components/SeverityBadge';
import { ClusterSizeChart } from '../charts/ClusterSizeChart';
import { NoiseVsClusteredChart } from '../charts/NoiseVsClusteredChart';
import { DisasterMap } from '../map/DisasterMap';
import { ClusterInspectorDrawer } from '../components/ClusterInspectorDrawer';
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
  Clock,
  Compass,
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleExecuteDBSCAN = async () => {
    try {
      const res = await runDBSCAN({
        eps_meters: parseFloat(eps),
        min_samples: parseInt(minSamples, 10),
      });
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

  const handleInspect = (cluster) => {
    setSelectedCluster(cluster);
    setDrawerOpen(true);
  };

  const totalSignals = stats?.total_signals || signals.length || 385;
  const noiseCount = stats?.noise_points ?? signals.filter((s) => s.cluster_id === -1).length;
  const clusteredCount = totalSignals - noiseCount;
  const noisePct = totalSignals > 0 ? Math.round((noiseCount / totalSignals) * 100) : 15;

  return (
    <div className="p-4 sm:p-6 lg:p-7 space-y-6 max-w-[1600px] mx-auto text-[#EAF2FF]">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-md bg-[#131F30] border border-[#27364C] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#98AAC2]">
            <span>DBSCAN Clustering</span>
            <span className="text-[#27364C]">/</span>
            <span className="text-[#00B7FF]">Geodesic Haversine Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#EAF2FF] mt-1">
            Spherical Spatial Clustering & Noise Filtration
          </h1>
          <p className="text-xs text-[#98AAC2] mt-0.5">
            Haversine metric over WGS-84 coordinates (R = 6,371 km) discovering arbitrary disaster topologies with zero planar distortion.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="btn-secondary text-xs"
            title="Reset parameters to 100m EPS and 5 Min Samples"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#98AAC2]" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleExecuteDBSCAN}
            disabled={loading}
            className="btn-primary text-xs"
          >
            <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Recalculating...' : 'Execute Clustering'}</span>
          </button>
        </div>
      </div>

      {/* REGION 1: Parameter Controls Console */}
      <div className="p-5 rounded-md bg-[#131F30] border border-[#27364C] space-y-4">
        <div className="flex items-center justify-between border-b border-[#27364C] pb-2.5 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#EAF2FF]">
            <SlidersHorizontal className="w-4 h-4 text-[#00B7FF]" />
            <span className="font-bold uppercase tracking-wider">Hyperparameter Controls</span>
          </div>
          <span className="text-[#98AAC2]">
            ε<sub>rad</sub> = {eps}m / 6,371,000m = {(eps / 6371000).toExponential(3)} rad
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* EPS Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <label className="text-[#98AAC2]">
                Epsilon Geodesic Distance (ε):
              </label>
              <span className="text-xs font-bold font-mono text-[#00B7FF] bg-[#18263A] px-2.5 py-0.5 rounded border border-[#27364C] tabular-nums">
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
              className="w-full h-1.5 bg-[#18263A] rounded appearance-none cursor-pointer accent-[#00B7FF]"
            />
            <p className="text-[11px] text-[#98AAC2] leading-relaxed">
              Maximum spherical distance to evaluate point connectivity. Lower values isolate compact survivor pockets; higher values merge adjacent debris sectors.
            </p>
          </div>

          {/* Min Samples Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <label className="text-[#98AAC2]">
                Min Core Samples (k):
              </label>
              <span className="text-xs font-bold font-mono text-[#00B7FF] bg-[#18263A] px-2.5 py-0.5 rounded border border-[#27364C] tabular-nums">
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
              className="w-full h-1.5 bg-[#18263A] rounded appearance-none cursor-pointer accent-[#00B7FF]"
            />
            <p className="text-[11px] text-[#98AAC2] leading-relaxed">
              Minimum dense point count required in ε radius to form an active rescue cluster. Isolated anomaly points below threshold are labeled as spatial noise (ID: -1).
            </p>
          </div>
        </div>
      </div>

      {/* REGION 2: Clustering Results Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        <MetricCard
          title="Total Signals"
          value={totalSignals}
          subtitle="Input dataset size"
          icon={Radio}
          badgeText="INPUT"
          accentColor="#00B7FF"
        />
        <MetricCard
          title="Sectors Formed"
          value={clusters.length}
          subtitle="Non-noise clusters"
          icon={Layers}
          badgeText="CLUSTERS"
          accentColor="#00B7FF"
        />
        <MetricCard
          title="Clustered Points"
          value={clusteredCount}
          subtitle={`${100 - noisePct}% of total signals`}
          icon={CheckCircle2}
          badgeText="CONVERGED"
          accentColor="#18D9A4"
        />
        <MetricCard
          title="Noise Outliers"
          value={noiseCount}
          subtitle={`${noisePct}% filtered noise`}
          icon={Activity}
          badgeText="ID: -1"
          accentColor="#98AAC2"
        />
        <MetricCard
          title="Active Epsilon"
          value={`${eps}m`}
          subtitle="Geodesic radius"
          icon={SlidersHorizontal}
          badgeText="HAVERSINE"
          accentColor="#F5B94E"
        />
        <MetricCard
          title="Min Core Points"
          value={minSamples}
          subtitle="Density threshold"
          icon={Shield}
          badgeText="DENSITY"
          accentColor="#FF5A70"
        />
      </div>

      {/* Population & Noise Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="p-4 rounded-md bg-[#131F30] border border-[#27364C] flex flex-col justify-between">
          <div className="border-b border-[#27364C] pb-2 text-xs font-mono flex items-center justify-between">
            <span className="text-[#98AAC2] uppercase tracking-wider">Cluster Population Distribution</span>
            <span className="text-[#00B7FF]">Signals per Sector</span>
          </div>
          <div className="mt-3">
            <ClusterSizeChart clusters={clusters} />
          </div>
        </div>

        <div className="p-4 rounded-md bg-[#131F30] border border-[#27364C] flex flex-col justify-between">
          <div className="border-b border-[#27364C] pb-2 text-xs font-mono flex items-center justify-between">
            <span className="text-[#98AAC2] uppercase tracking-wider">Density vs Noise Ratio</span>
            <span className="text-[#00B7FF]">{clusteredCount} Clustered / {noiseCount} Noise</span>
          </div>
          <div className="mt-3">
            <NoiseVsClusteredChart stats={{ total_signals: totalSignals, noise_points: noiseCount }} />
          </div>
        </div>
      </div>

      {/* Spatial Visualization Result Map */}
      <div className="rounded-md bg-[#131F30] border border-[#27364C] overflow-hidden">
        <div className="p-3 bg-[#0D1624] border-b border-[#27364C] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-[#00B7FF]" />
            <span className="font-semibold text-[#EAF2FF]">Spatial Cluster Hulls on GIS Basemap</span>
          </div>
          <span className="text-[#98AAC2]">
            {clusters.length} active sectors rendered
          </span>
        </div>
        <div className="p-2 bg-[#0A101B]">
          <DisasterMap
            height="460px"
            onClusterSelect={handleInspect}
            showControls={true}
          />
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
