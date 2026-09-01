import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { DisasterMap } from '../map/DisasterMap';
import { TimeSlider } from '../components/TimeSlider';
import { DronePathPlayer } from '../components/DronePathPlayer';
import { ClusterDetailModal } from '../components/ClusterDetailModal';
import { TacticalBadge } from '../components/TacticalBadge';
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
} from 'lucide-react';

export const HotspotMapPage = () => {
  const {
    mission,
    clusters,
    visibleSignals,
    selectedCluster,
    setSelectedCluster,
    timeFilterMinutes,
  } = useMission();

  const [activeDroneWpIndex, setActiveDroneWpIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const handleClusterSelect = (cluster) => {
    setSelectedCluster(cluster);
    setModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 uppercase tracking-wide">
              Tactical Geospatial Hotspot Map
            </h1>
            <TacticalBadge variant="active">FULLSCREEN GIS</TacticalBadge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Dynamic Leaflet GIS interface displaying multi-sensor detections, geodesic DBSCAN polygons, and live drone flight simulation.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Visible Signals: <strong className="text-cyan-400">{visibleSignals.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
            Detected Hotspots: <strong className="text-amber-400">{clusters.length}</strong>
          </div>
        </div>
      </div>

      {/* Main Full-Scale Map */}
      <div className="relative">
        <DisasterMap
          height="620px"
          activeDroneWaypointIndex={activeDroneWpIndex}
          onClusterSelect={handleClusterSelect}
        />
      </div>

      {/* Synchronized Drone Playback & Timeline Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TimeSlider />
        <DronePathPlayer
          currentWaypointIndex={activeDroneWpIndex}
          onStepChange={(idx) => setActiveDroneWpIndex(idx)}
        />
      </div>

      {/* Quick Cluster Selector Strip */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            Quick Hotspot Focus Selector
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Click to open triage breakdown
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {clusters.map((c, i) => (
            <button
              key={c.id}
              onClick={() => handleClusterSelect(c)}
              className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-200 group-hover:text-cyan-400">
                  Cluster #{c.cluster_label + 1}
                </span>
                <TacticalBadge variant={c.classification}>{c.classification}</TacticalBadge>
              </div>
              <div className="text-sm font-black font-mono text-cyan-400 mt-1">
                {c.priority_score} <span className="text-[10px] text-slate-500 font-normal">pts</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                {c.signal_count} signals &bull; {c.cluster_density}/km²
              </div>
            </button>
          ))}
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
