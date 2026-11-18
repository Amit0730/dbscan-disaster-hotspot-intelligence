import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { DisasterMap } from '../map/DisasterMap';
import { TimeSlider } from '../components/TimeSlider';
import { DronePathPlayer } from '../components/DronePathPlayer';
import { ClusterInspectorDrawer } from '../components/ClusterInspectorDrawer';
import { SeverityBadge } from '../components/SeverityBadge';
import { formatCoords } from '../utils/geo';
import {
  MapPin,
  Flame,
  Layers,
  Plane,
  Clock,
  Activity,
  Maximize2,
  Shield,
  Eye,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';

export const HotspotMapPage = () => {
  const {
    mission,
    clusters,
    visibleSignals,
    selectedCluster,
    setSelectedCluster,
    timeFilterMinutes,
    stats,
  } = useMission();

  const [activeDroneWpIndex, setActiveDroneWpIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleClusterSelect = (cluster) => {
    setSelectedCluster(cluster);
    setDrawerOpen(true);
  };

  const totalDetections = stats?.total_signals || visibleSignals.length || 385;
  const criticalCount =
    stats?.critical_hotspots ??
    clusters.filter((c) => c.classification === 'CRITICAL').length;

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-4 max-w-[1700px] mx-auto text-[#EAF2FF]">
      {/* Top Tactical Command Bar */}
      <div className="p-3.5 rounded-md bg-[#131F30] border border-[#27364C] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-[#18263A] border border-[#27364C] flex items-center justify-center text-[#00B7FF]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-[#EAF2FF] tracking-tight">
                Tactical GIS Hotspot Map
              </h1>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00B7FF]/10 text-[#00B7FF] border border-[#00B7FF]/30 font-semibold">
                FULL VIEWPORT
              </span>
            </div>
            <div className="text-[11px] text-[#98AAC2]">
              Sector 4 · Urban Collapse Zone (38.3550° N, 37.8550° E) · Haversine DBSCAN Clusters
            </div>
          </div>
        </div>

        {/* Operational Counters */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded bg-[#18263A] border border-[#27364C]">
            <span className="text-[#98AAC2]">Signals:</span>{' '}
            <strong className="text-[#00B7FF]">{visibleSignals.length}</strong> / {totalDetections}
          </div>
          <div className="px-2.5 py-1 rounded bg-[#18263A] border border-[#27364C]">
            <span className="text-[#98AAC2]">Sectors:</span>{' '}
            <strong className="text-[#EAF2FF]">{clusters.length}</strong>
          </div>
          <div className="px-2.5 py-1 rounded bg-[#FF5A70]/10 border border-[#FF5A70]/30 text-[#FF5A70]">
            <span>Critical:</span> <strong>{criticalCount}</strong>
          </div>
        </div>
      </div>

      {/* Main Dominant Map */}
      <div className="rounded-md overflow-hidden border border-[#27364C] shadow-xl">
        <DisasterMap
          height="620px"
          activeDroneWaypointIndex={activeDroneWpIndex}
          onClusterSelect={handleClusterSelect}
          showControls={true}
        />
      </div>

      {/* Timeline & Drone Replay Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md bg-[#131F30] border border-[#27364C] p-3">
          <TimeSlider />
        </div>
        <div className="rounded-md bg-[#131F30] border border-[#27364C] p-3">
          <DronePathPlayer
            currentWaypointIndex={activeDroneWpIndex}
            onStepChange={(idx) => setActiveDroneWpIndex(idx)}
          />
        </div>
      </div>

      {/* Quick Sector Selector Grid */}
      <div className="rounded-md bg-[#131F30] border border-[#27364C] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between border-b border-[#27364C] pb-2 text-xs font-mono">
          <span className="text-[#98AAC2] uppercase tracking-wider">
            Quick Sector Focus & Inspector
          </span>
          <span className="text-[11px] text-[#98AAC2]">
            Click any sector to open operational triage breakdown
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {clusters.map((c) => {
            const isSelected = selectedCluster?.cluster_id === c.cluster_id;
            return (
              <button
                key={c.cluster_id}
                onClick={() => handleClusterSelect(c)}
                className={`p-3 rounded text-left transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-[#18263A] border-[#00B7FF] shadow-sm'
                    : 'bg-[#18263A]/60 border-[#27364C] hover:border-[#384f6f] hover:bg-[#18263A]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#EAF2FF]">Sector #{c.cluster_id}</span>
                  <SeverityBadge severity={c.classification} size="sm" />
                </div>
                <div className="text-base font-bold font-mono text-[#EAF2FF] mt-1 tabular-nums">
                  {Math.round(c.priority_score)}{' '}
                  <span className="text-[10px] text-[#98AAC2] font-normal">pts</span>
                </div>
                <div className="text-[11px] font-mono text-[#98AAC2] mt-1 truncate">
                  {c.signal_count} signals · {Math.round(c.density || 0)} pts/km²
                </div>
              </button>
            );
          })}
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
