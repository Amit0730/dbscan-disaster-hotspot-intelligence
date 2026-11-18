import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMission } from '../context/MissionContext';
import { MetricCard } from '../components/MetricCard';
import { SeverityBadge } from '../components/SeverityBadge';
import { ClusterInspectorDrawer } from '../components/ClusterInspectorDrawer';
import { DisasterMap } from '../map/DisasterMap';
import { TimeSlider } from '../components/TimeSlider';
import { formatCoords, formatPercentage, formatTime } from '../utils/geo';
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
  Crosshair,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertTriangle,
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
    error,
    loadDemoMission,
    dataFreshness,
    isLiveBackend,
  } = useMission();

  const navigate = useNavigate();
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [sortBy, setSortBy] = useState('score'); // 'score' | 'signals' | 'thermal' | 'human'

  const handleSelectCluster = (cluster) => {
    setSelectedCluster(cluster);
    setInspectorOpen(true);
  };

  const isDemo = mission?.source === 'DEMO';
  const totalSignals = stats?.total_signals || signals.length || 385;
  const criticalCount =
    stats?.critical_hotspots ??
    clusters.filter((c) => c.classification === 'CRITICAL').length;
  const highCount =
    stats?.high_priority_hotspots ??
    clusters.filter((c) => c.classification === 'HIGH').length;
  const noiseCount = stats?.noise_points ?? signals.filter((s) => s.cluster_id === -1).length;

  // Highest priority cluster
  const highestPriorityCluster = useMemo(() => {
    if (!clusters || clusters.length === 0) return null;
    return [...clusters].sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0))[0];
  }, [clusters]);

  // Filtered and sorted clusters
  const displayedClusters = useMemo(() => {
    let result = [...clusters];
    if (filterSeverity !== 'ALL') {
      result = result.filter((c) => c.classification === filterSeverity);
    }
    result.sort((a, b) => {
      if (sortBy === 'score') return (b.priority_score ?? 0) - (a.priority_score ?? 0);
      if (sortBy === 'signals') return (b.signal_count ?? 0) - (a.signal_count ?? 0);
      if (sortBy === 'thermal') return (b.mean_thermal_anomaly ?? 0) - (a.mean_thermal_anomaly ?? 0);
      if (sortBy === 'human') return (b.mean_person_prob ?? 0) - (a.mean_person_prob ?? 0);
      return 0;
    });
    return result;
  }, [clusters, filterSeverity, sortBy]);

  return (
    <div className="p-4 sm:p-6 lg:p-7 space-y-6 max-w-[1600px] mx-auto text-[#EAF2FF]">
      {/* Top Header / Status Bar */}
      <div className="p-4 sm:p-5 rounded-md bg-[#131F30] border border-[#27364C] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#98AAC2]">
            <span>Command Center</span>
            <span className="text-[#27364C]">/</span>
            <span className="text-[#00B7FF]">Operational Triage</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#EAF2FF] mt-1">
            {mission?.name || 'Urban Disaster Response Sector'}
          </h1>
          <div className="flex items-center gap-3 text-xs font-mono text-[#98AAC2] mt-1 flex-wrap">
            <span>Status: <strong className="text-[#18D9A4]">{mission?.status || 'ONLINE'}</strong></span>
            <span className="text-[#27364C]">•</span>
            <span>Source: <strong className="text-[#F5B94E]">{mission?.source || 'SIMULATED'}</strong></span>
            <span className="text-[#27364C]">•</span>
            <span>Synced: <strong className="text-[#EAF2FF]">{formatTime(dataFreshness)}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isDemo ? (
            <SeverityBadge severity="SIMULATED" size="md" />
          ) : (
            <SeverityBadge severity="LIVE" size="md" />
          )}

          <button
            onClick={() => loadDemoMission()}
            disabled={loading}
            className="btn-secondary text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#00B7FF] ${loading ? 'animate-spin' : ''}`} />
            <span>Reset Scenario</span>
          </button>
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        <MetricCard
          title="Drone Images"
          value={stats?.total_images ?? 40}
          subtitle="RGB + radiometric FLIR"
          icon={FileImage}
          badgeText="TELEMETRY"
          accentColor="#00B7FF"
        />
        <MetricCard
          title="Signal Geotags"
          value={totalSignals}
          subtitle="Dual-sensor feeds"
          icon={Radio}
          badgeText="RAW FEEDS"
          accentColor="#00B7FF"
        />
        <MetricCard
          title="DBSCAN Clusters"
          value={clusters.length}
          subtitle="Haversine metric"
          icon={SlidersHorizontal}
          badgeText="GEODESIC"
          accentColor="#00B7FF"
        />
        <MetricCard
          title="Spatial Noise"
          value={noiseCount}
          subtitle="Filtered false alarms"
          icon={Activity}
          badgeText="FILTERED"
          accentColor="#98AAC2"
        />
        <MetricCard
          title="Critical Hotspots"
          value={criticalCount}
          subtitle="Priority score ≥ 90"
          icon={ShieldAlert}
          badgeText="IMMEDIATE"
          accentColor="#FF5A70"
        />
        <MetricCard
          title="High Priority"
          value={highCount}
          subtitle="Priority score 75–89"
          icon={Flame}
          badgeText="RAPID SWEEP"
          accentColor="#F5B94E"
        />
      </div>

      {/* Main View: Tactical Map & Sortable Hotspot Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: GIS Map Panel (8 cols) */}
        <div className="lg:col-span-8 flex flex-col rounded-md bg-[#131F30] border border-[#27364C] overflow-hidden">
          <div className="p-3 bg-[#0D1624] border-b border-[#27364C] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#00B7FF]" />
              <span className="font-semibold text-[#EAF2FF]">Tactical GIS Map</span>
              <span className="text-[#98AAC2] hidden sm:inline">· Click a sector polygon to inspect</span>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="text-[#00B7FF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Fullscreen Map</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-2 bg-[#0A101B]">
            <DisasterMap
              height="520px"
              onClusterSelect={handleSelectCluster}
            />
          </div>

          <div className="p-3 border-t border-[#27364C] bg-[#0D1624]/60">
            <TimeSlider />
          </div>
        </div>

        {/* Right: Sortable Hotspot Ranking List (4 cols) */}
        <div className="lg:col-span-4 rounded-md bg-[#131F30] border border-[#27364C] flex flex-col justify-between overflow-hidden">
          {/* Header & Controls */}
          <div className="p-3.5 bg-[#0D1624] border-b border-[#27364C] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#F5B94E]" />
                <h2 className="text-xs font-bold font-mono text-[#EAF2FF] uppercase tracking-wider">
                  Triage Hotspot Ranking
                </h2>
              </div>
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-[#18263A] text-[#00B7FF] border border-[#27364C]">
                {displayedClusters.length} Sectors
              </span>
            </div>

            {/* Severity Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setFilterSeverity(tier)}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer border ${
                    filterSeverity === tier
                      ? 'bg-[#00B7FF]/15 text-[#00B7FF] border-[#00B7FF]/40 font-bold'
                      : 'bg-[#18263A] text-[#98AAC2] border-[#27364C] hover:text-[#EAF2FF]'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Sort Dropdown / Toggle */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#98AAC2]">
              <span className="flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" /> Sort by:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSortBy('score')}
                  className={`cursor-pointer ${sortBy === 'score' ? 'text-[#00B7FF] font-bold' : 'hover:text-[#EAF2FF]'}`}
                >
                  Score
                </button>
                <span>|</span>
                <button
                  onClick={() => setSortBy('signals')}
                  className={`cursor-pointer ${sortBy === 'signals' ? 'text-[#00B7FF] font-bold' : 'hover:text-[#EAF2FF]'}`}
                >
                  Detections
                </button>
                <span>|</span>
                <button
                  onClick={() => setSortBy('thermal')}
                  className={`cursor-pointer ${sortBy === 'thermal' ? 'text-[#00B7FF] font-bold' : 'hover:text-[#EAF2FF]'}`}
                >
                  Thermal
                </button>
              </div>
            </div>
          </div>

          {/* Cluster Cards List */}
          <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[580px]">
            {displayedClusters.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#98AAC2] font-mono">
                No clusters found matching filter criteria.
              </div>
            ) : (
              displayedClusters.map((cluster) => {
                const isSelected = selectedCluster?.cluster_id === cluster.cluster_id;
                return (
                  <div
                    key={cluster.cluster_id}
                    onClick={() => handleSelectCluster(cluster)}
                    className={`p-3 rounded-md border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#18263A] border-[#00B7FF] shadow-sm'
                        : 'bg-[#18263A]/60 border-[#27364C] hover:border-[#384f6f] hover:bg-[#18263A]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs font-mono text-[#EAF2FF]">
                          Sector #{cluster.cluster_id}
                        </span>
                        <SeverityBadge severity={cluster.classification} size="sm" />
                      </div>
                      <div className="text-sm font-bold font-mono text-[#EAF2FF] tabular-nums">
                        {Math.round(cluster.priority_score)}
                        <span className="text-[10px] text-[#98AAC2] font-normal"> / 100</span>
                      </div>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] font-mono border-t border-[#27364C]/50 pt-2">
                      <div>
                        <span className="text-[#98AAC2]">Signals:</span>{' '}
                        <strong className="text-[#EAF2FF]">{cluster.signal_count}</strong>
                      </div>
                      <div>
                        <span className="text-[#98AAC2]">Thermal:</span>{' '}
                        <span className="text-[#F5B94E]">{formatPercentage(cluster.mean_thermal_anomaly)}</span>
                      </div>
                      <div>
                        <span className="text-[#98AAC2]">Human:</span>{' '}
                        <span className="text-[#00B7FF]">{formatPercentage(cluster.mean_person_prob)}</span>
                      </div>
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-[#98AAC2]">
                      <span>{formatCoords(cluster.centroid_lat, cluster.centroid_lon)}</span>
                      <span className="text-[#00B7FF] flex items-center gap-0.5">
                        Inspect <ChevronRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Highest-Priority Actionable Sector & Operational Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {highestPriorityCluster && (
          <div className="p-4 rounded-md bg-[#131F30] border border-[#27364C] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#27364C] pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#98AAC2]">
                  Immediate Field Action Target
                </span>
                <SeverityBadge severity={highestPriorityCluster.classification} size="sm" />
              </div>
              <div className="mt-3 flex items-baseline justify-between font-mono">
                <div className="text-lg font-bold text-[#EAF2FF]">
                  Sector #{highestPriorityCluster.cluster_id} · Priority {Math.round(highestPriorityCluster.priority_score)}/100
                </div>
                <button
                  onClick={() => handleSelectCluster(highestPriorityCluster)}
                  className="text-xs text-[#00B7FF] hover:underline cursor-pointer"
                >
                  Inspect Target
                </button>
              </div>
              <p className="text-xs text-[#98AAC2] mt-1.5 leading-relaxed">
                {highestPriorityCluster.classification === 'CRITICAL'
                  ? 'Urgent triage sector exhibiting highest thermal radiometric divergence and visual person contour confidence. Deploy lead canine and heavy extraction teams immediately.'
                  : 'Secondary operational sector requiring rapid reconnaissance and acoustic listening deployment.'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#27364C]/60 flex items-center justify-between text-xs font-mono text-[#98AAC2]">
              <span>Centroid: {formatCoords(highestPriorityCluster.centroid_lat, highestPriorityCluster.centroid_lon)}</span>
              <span className="text-[#EAF2FF]">{highestPriorityCluster.signal_count} Sensor Detections</span>
            </div>
          </div>
        )}

        <div className="p-4 rounded-md bg-[#131F30] border border-[#27364C] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#27364C] pb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#98AAC2]">
                Clustering Engine Diagnostics
              </span>
              <span className="text-[11px] font-mono text-[#18D9A4]">Algorithm Converged</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#18263A] border border-[#27364C]">
                <div className="text-[#98AAC2] text-[10px]">EPS NEIGHBORHOOD</div>
                <div className="text-sm font-bold text-[#EAF2FF] mt-0.5">100.0 meters</div>
                <div className="text-[10px] text-[#98AAC2]">Haversine Spherical</div>
              </div>
              <div className="p-2.5 rounded bg-[#18263A] border border-[#27364C]">
                <div className="text-[#98AAC2] text-[10px]">MIN CORE SAMPLES</div>
                <div className="text-sm font-bold text-[#EAF2FF] mt-0.5">5 signals</div>
                <div className="text-[10px] text-[#98AAC2]">Minimum point threshold</div>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#27364C]/60 flex items-center justify-between text-xs font-mono text-[#98AAC2]">
            <span>Coordinate Space: WGS-84 Radians</span>
            <button
              onClick={() => navigate('/clustering')}
              className="text-[#00B7FF] hover:underline cursor-pointer"
            >
              Reconfigure Parameters →
            </button>
          </div>
        </div>
      </div>

      {/* Cluster Inspector Drawer */}
      <ClusterInspectorDrawer
        cluster={selectedCluster}
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
      />
    </div>
  );
};
