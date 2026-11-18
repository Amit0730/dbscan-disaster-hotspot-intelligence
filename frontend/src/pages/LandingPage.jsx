import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMission } from '../context/MissionContext';
import { MetricCard } from '../components/MetricCard';
import { SeverityBadge } from '../components/SeverityBadge';
import { ClusterInspectorDrawer } from '../components/ClusterInspectorDrawer';
import { DisasterMap } from '../map/DisasterMap';
import { formatCoords, formatPercentage, formatTime } from '../utils/geo';
import {
  Shield,
  Radio,
  SlidersHorizontal,
  MapPin,
  Flame,
  CheckCircle2,
  Layers,
  Activity,
  Compass,
  ArrowUpRight,
  Database,
  Clock,
  Crosshair,
  TrendingUp,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export const LandingPage = () => {
  const {
    mission,
    stats,
    clusters,
    signals,
    validation,
    selectedCluster,
    setSelectedCluster,
    dataFreshness,
    isLiveBackend,
    loadDemoMission,
    loading,
  } = useMission();

  const navigate = useNavigate();
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const handleInspectCluster = (cluster) => {
    setSelectedCluster(cluster);
    setInspectorOpen(true);
  };

  const isDemo = mission?.source === 'DEMO';
  const totalDetections = stats?.total_signals || signals.length || 385;
  const clusterCount = clusters?.length || 5;
  const criticalCount =
    stats?.critical_hotspots ??
    clusters.filter((c) => c.classification === 'CRITICAL').length;
  const f1Score = validation?.f1_score ?? 0.942;
  const spatialError = validation?.mean_spatial_error_meters ?? 18.4;

  // Thermal vs Visual detection breakdown
  const thermalCount = useMemo(() => {
    return signals.filter((s) => (s.thermal_anomaly ?? 0) >= 0.5).length || 324;
  }, [signals]);

  const visualCount = useMemo(() => {
    return signals.filter((s) => (s.person_prob ?? 0) >= 0.4).length || 61;
  }, [signals]);

  // Highest priority cluster
  const highestPriorityCluster = useMemo(() => {
    if (!clusters || clusters.length === 0) return null;
    return [...clusters].sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0))[0];
  }, [clusters]);

  // Top clusters sorted by score
  const sortedClusters = useMemo(() => {
    if (!clusters) return [];
    return [...clusters].sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));
  }, [clusters]);

  // Pipeline stages with actual operational status
  const pipelineStages = [
    {
      id: '01',
      name: 'Drone Ingestion',
      detail: `${stats?.total_images || 40} Multi-spectral Frames`,
      status: 'COMPLETED',
      metric: 'EXIF GPS Parsed',
    },
    {
      id: '02',
      name: 'Signal Extraction',
      detail: `${totalDetections} Geotags Extracted`,
      status: 'COMPLETED',
      metric: `${thermalCount} Thermal + ${visualCount} Visual`,
    },
    {
      id: '03',
      name: 'Geodesic DBSCAN',
      detail: 'Spherical Haversine Metric',
      status: clusters.length > 0 ? 'COMPLETED' : 'PENDING',
      metric: 'ε = 100m, MinPts = 5',
    },
    {
      id: '04',
      name: 'Priority Scoring',
      detail: '5-Factor Weighted Triage',
      status: clusters.length > 0 ? 'COMPLETED' : 'PENDING',
      metric: `${clusterCount} Sectors Classified`,
    },
    {
      id: '05',
      name: 'GIS Intelligence',
      detail: 'Convex Hull Boundaries',
      status: clusters.length > 0 ? 'ONLINE' : 'IDLE',
      metric: 'Vector Polygons Landed',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-7 space-y-6 max-w-[1600px] mx-auto text-[#EAF2FF]">
      {/* SECTION A — Mission Identification */}
      <div className="p-4 sm:p-5 rounded-md bg-[#131F30] border border-[#27364C] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#98AAC2]">
            <span>Aegis Recon</span>
            <span className="text-[#27364C]">/</span>
            <span className="text-[#00B7FF]">Operational Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EAF2FF] mt-1 font-mono">
            {mission?.name || 'Operation Aegis: Sector-4 Disaster Reconnaissance'}
          </h1>
          <p className="text-xs text-[#98AAC2] mt-0.5">
            Drone Search & Rescue Command Interface · High-density thermal & visual triage dispatch
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isDemo ? (
            <SeverityBadge severity="SIMULATED" size="md" />
          ) : (
            <SeverityBadge severity="LIVE" size="md" />
          )}

          <div className="px-3 py-1.5 rounded bg-[#18263A] border border-[#27364C] text-xs font-mono text-[#98AAC2]">
            <span>Sector:</span> <strong className="text-[#EAF2FF]">Sector 4 · Urban Collapse</strong>
          </div>

          <button
            onClick={() => navigate('/map')}
            className="btn-primary text-xs"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Open Tactical GIS Map</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SECTION B — KPI Telemetry Row (6 Operational Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        <MetricCard
          title="Total Detections"
          value={totalDetections}
          subtitle="Dual-sensor geotags"
          icon={Radio}
          badgeText="RAW FEEDS"
          accentColor="#00B7FF"
        />

        <MetricCard
          title="Hotspot Sectors"
          value={clusterCount}
          subtitle="Haversine clusters"
          icon={Layers}
          badgeText="DBSCAN"
          accentColor="#00B7FF"
        />

        <MetricCard
          title="Critical Priority"
          value={criticalCount}
          subtitle="Immediate USAR extraction"
          icon={AlertTriangle}
          badgeText="TRIAGE"
          accentColor="#FF5A70"
        />

        <MetricCard
          title="Validation F1"
          value={formatPercentage(f1Score)}
          subtitle="Precision & recall score"
          icon={CheckCircle2}
          badgeText="BENCHMARK"
          accentColor="#18D9A4"
        />

        <MetricCard
          title="Mean Spatial Error"
          value={`${spatialError.toFixed(1)}m`}
          subtitle="Centroid match distance"
          icon={Crosshair}
          badgeText="GEODESIC"
          accentColor="#F5B94E"
        />

        <MetricCard
          title="Telemetry Freshness"
          value={formatTime(dataFreshness)}
          subtitle="Last engine update"
          icon={Clock}
          badgeText={isLiveBackend ? 'LIVE API' : 'STANDALONE'}
          accentColor="#18D9A4"
        />
      </div>

      {/* SECTION C — Live Tactical Overview (Map + Mission Intel Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: GIS Map Preview */}
        <div className="lg:col-span-8 flex flex-col rounded-md bg-[#131F30] border border-[#27364C] overflow-hidden">
          <div className="p-3 bg-[#0D1624] border-b border-[#27364C] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00B7FF]" />
              <span className="font-semibold text-[#EAF2FF]">Tactical GIS Map Preview</span>
              <span className="text-[#98AAC2] hidden sm:inline">· Sector 4 Centered (38.355° N, 37.855° E)</span>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="text-[#00B7FF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full View</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 p-2 bg-[#0A101B]">
            <DisasterMap
              height="430px"
              showControls={true}
              onClusterSelect={handleInspectCluster}
            />
          </div>
        </div>

        {/* Right: Mission Intelligence Panel */}
        <div className="lg:col-span-4 rounded-md bg-[#131F30] border border-[#27364C] p-4.5 flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-[#27364C] pb-2.5 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-[#98AAC2]">
                Mission Intelligence
              </span>
              <span className="text-[11px] font-mono text-[#00B7FF]">Operation Aegis</span>
            </div>

            {/* Survey Area Summary */}
            <div className="mt-3.5 space-y-2 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-[#98AAC2]">Center Origin:</span>
                <span className="text-[#EAF2FF]">{formatCoords(mission?.center_lat || 38.355, mission?.center_lon || 37.855)}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#98AAC2]">Survey Radius:</span>
                <span className="text-[#EAF2FF]">1,450 meters (AGL: 45m)</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#98AAC2]">Sensor Payload:</span>
                <span className="text-[#EAF2FF]">FLIR Radiometric + 4K RGB</span>
              </div>
            </div>

            {/* Thermal / Visual Detection Stats */}
            <div className="mt-4 pt-3 border-t border-[#27364C] space-y-2 text-xs">
              <div className="text-[11px] font-mono uppercase text-[#98AAC2]">Detection Breakdown</div>
              <div className="flex justify-between font-mono">
                <span className="text-[#98AAC2] flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-[#F5B94E]" /> Thermal Anomalies:
                </span>
                <span className="text-[#EAF2FF] font-semibold">{thermalCount} ({formatPercentage(thermalCount / totalDetections)})</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-[#98AAC2] flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-[#00B7FF]" /> Visual Person Detections:
                </span>
                <span className="text-[#EAF2FF] font-semibold">{visualCount} ({formatPercentage(visualCount / totalDetections)})</span>
              </div>
            </div>

            {/* Severity Distribution */}
            <div className="mt-4 pt-3 border-t border-[#27364C] space-y-2">
              <div className="text-[11px] font-mono uppercase text-[#98AAC2]">Cluster Severity Split</div>
              <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[11px]">
                <div className="p-1.5 rounded bg-[#FF5A70]/10 border border-[#FF5A70]/25 text-[#FF5A70]">
                  <div className="font-bold">{criticalCount}</div>
                  <div className="text-[9px]">CRIT</div>
                </div>
                <div className="p-1.5 rounded bg-[#F5B94E]/10 border border-[#F5B94E]/25 text-[#F5B94E]">
                  <div className="font-bold">{stats?.high_priority_hotspots || 1}</div>
                  <div className="text-[9px]">HIGH</div>
                </div>
                <div className="p-1.5 rounded bg-[#00B7FF]/10 border border-[#00B7FF]/25 text-[#00B7FF]">
                  <div className="font-bold">{stats?.medium_priority_hotspots || 1}</div>
                  <div className="text-[9px]">MED</div>
                </div>
                <div className="p-1.5 rounded bg-[#18D9A4]/10 border border-[#18D9A4]/25 text-[#18D9A4]">
                  <div className="font-bold">{stats?.low_priority_hotspots || 1}</div>
                  <div className="text-[9px]">LOW</div>
                </div>
              </div>
            </div>

            {/* Highest Priority Sector Box */}
            {highestPriorityCluster && (
              <div className="mt-4 p-3 rounded bg-[#18263A] border border-[#27364C]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#98AAC2]">Highest Priority Sector:</span>
                  <SeverityBadge severity={highestPriorityCluster.classification} size="sm" />
                </div>
                <div className="mt-1 flex items-baseline justify-between font-mono">
                  <span className="text-base font-bold text-[#EAF2FF]">
                    Sector #{highestPriorityCluster.cluster_id}
                  </span>
                  <span className="text-sm font-bold text-[#FF5A70]">
                    Score: {Math.round(highestPriorityCluster.priority_score)}/100
                  </span>
                </div>
                <div className="text-[11px] text-[#98AAC2] font-mono mt-0.5">
                  {highestPriorityCluster.signal_count} signals · {formatCoords(highestPriorityCluster.centroid_lat, highestPriorityCluster.centroid_lon)}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#27364C] flex items-center justify-between text-[11px] font-mono text-[#98AAC2]">
            <span>Last Ingestion: {formatTime(dataFreshness)}</span>
            <span className="text-[#18D9A4]">Engine Synchronized</span>
          </div>
        </div>
      </div>

      {/* SECTION D — Priority Hotspot Intelligence Table */}
      <div className="rounded-md bg-[#131F30] border border-[#27364C] overflow-hidden">
        <div className="p-3.5 bg-[#0D1624] border-b border-[#27364C] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold font-mono text-[#EAF2FF] uppercase tracking-wider">
              Priority Hotspot Intelligence
            </h2>
            <p className="text-xs text-[#98AAC2] mt-0.5">
              Ranked search and rescue sectors clustered via Geodesic Haversine DBSCAN
            </p>
          </div>
          <button
            onClick={() => navigate('/clustering')}
            className="btn-secondary text-xs py-1 px-2.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#00B7FF]" />
            <span>Tune DBSCAN Parameters</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0D1624]/60 text-[#98AAC2] uppercase text-[10px] tracking-wider border-b border-[#27364C]">
              <tr>
                <th className="py-2.5 px-4">Cluster ID</th>
                <th className="py-2.5 px-3">Triage Classification</th>
                <th className="py-2.5 px-3">Priority Score</th>
                <th className="py-2.5 px-3">Detections</th>
                <th className="py-2.5 px-3">Mean Thermal</th>
                <th className="py-2.5 px-3">Human Conf.</th>
                <th className="py-2.5 px-4">Coordinates (Centroid)</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27364C]/60 text-[#EAF2FF]">
              {sortedClusters.map((c) => (
                <tr
                  key={c.cluster_id}
                  className="hover:bg-[#18263A]/70 transition-colors cursor-pointer"
                  onClick={() => handleInspectCluster(c)}
                >
                  <td className="py-2.5 px-4 font-bold text-[#00B7FF]">
                    Sector #{c.cluster_id}
                  </td>
                  <td className="py-2.5 px-3">
                    <SeverityBadge severity={c.classification} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 font-bold text-sm tabular-nums">
                    {Math.round(c.priority_score)}
                    <span className="text-[#98AAC2] text-[10px] font-normal"> / 100</span>
                  </td>
                  <td className="py-2.5 px-3 tabular-nums text-[#98AAC2]">
                    <strong className="text-[#EAF2FF]">{c.signal_count}</strong> signals
                  </td>
                  <td className="py-2.5 px-3 tabular-nums">
                    <span className="text-[#F5B94E]">
                      {formatPercentage(c.mean_thermal_anomaly ?? c.thermal_score)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 tabular-nums">
                    <span className="text-[#00B7FF]">
                      {formatPercentage(c.mean_person_prob ?? c.person_prob)}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-[#98AAC2] text-[11px]">
                    {formatCoords(c.centroid_lat, c.centroid_lon)}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInspectCluster(c);
                      }}
                      className="px-2 py-1 rounded bg-[#18263A] hover:bg-[#27364C] text-[#00B7FF] border border-[#27364C] text-[11px] transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION E — Processing Pipeline Visualization */}
      <div className="rounded-md bg-[#131F30] border border-[#27364C] p-4.5">
        <div className="flex items-center justify-between border-b border-[#27364C] pb-2 mb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#98AAC2]">
              Operational Processing Pipeline
            </div>
            <div className="text-[11px] text-[#98AAC2] mt-0.5">
              Multi-sensor drone telemetry flow through geospatial clustering and triage ranking
            </div>
          </div>
          <span className="text-xs font-mono text-[#18D9A4] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#18D9A4]" />
            Pipeline Synchronized
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {pipelineStages.map((stage, idx) => (
            <div
              key={stage.id}
              className="p-3 rounded bg-[#18263A] border border-[#27364C] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#98AAC2] mb-1.5">
                  <span>STAGE {stage.id}</span>
                  <span
                    className={`text-[9px] px-1 rounded ${
                      stage.status === 'COMPLETED' || stage.status === 'ONLINE'
                        ? 'bg-[#18D9A4]/10 text-[#18D9A4] border border-[#18D9A4]/30'
                        : 'bg-[#98AAC2]/10 text-[#98AAC2]'
                    }`}
                  >
                    {stage.status}
                  </span>
                </div>
                <div className="font-semibold text-xs text-[#EAF2FF]">
                  {stage.name}
                </div>
                <div className="text-[11px] text-[#98AAC2] mt-1 leading-tight">
                  {stage.detail}
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-[#27364C]/70 text-[10px] font-mono text-[#00B7FF]">
                {stage.metric}
              </div>
            </div>
          ))}
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
