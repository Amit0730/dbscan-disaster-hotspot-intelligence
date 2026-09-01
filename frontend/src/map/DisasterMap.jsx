import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useMission } from '../context/MissionContext';
import { ClusterPolygonLayer } from './ClusterPolygonLayer';
import { SignalMarkerLayer } from './SignalMarkerLayer';
import { FlightPathLayer } from './FlightPathLayer';
import { GroundTruthLayer } from './GroundTruthLayer';
import { Layers, Eye } from 'lucide-react';

// Sub-component to handle programmatically focusing map center
const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 14);
    }
  }, [center, zoom, map]);
  return null;
};

export const DisasterMap = ({
  height = '500px',
  activeDroneWaypointIndex = null,
  showControls = true,
  focusCoords = null,
  onClusterSelect = null,
}) => {
  const {
    mission,
    clusters,
    visibleSignals,
    groundTruth,
    flightPath,
    activeLayers,
    toggleLayer,
    setSelectedCluster,
  } = useMission();

  const centerCoords = useMemo(() => {
    if (focusCoords && focusCoords[0]) return focusCoords;
    if (mission?.center_lat && mission?.center_lon) return [mission.center_lat, mission.center_lon];
    return [38.355, 37.855];
  }, [focusCoords, mission]);

  const handleClusterClick = (cluster) => {
    setSelectedCluster(cluster);
    if (onClusterSelect) onClusterSelect(cluster);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-slate-800 shadow-2xl bg-slate-950" style={{ height }}>
      <MapContainer
        center={centerCoords}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <MapRecenter center={centerCoords} zoom={focusCoords ? 15 : 14} />

        {/* Tactical Dark Matter Basemap */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* 1. Ground Truth Zones Layer */}
        {activeLayers.groundTruth && <GroundTruthLayer groundTruth={groundTruth} />}

        {/* 2. Drone Flight Path Layer */}
        {activeLayers.flightPath && (
          <FlightPathLayer
            waypoints={flightPath}
            activeWaypointIndex={activeDroneWaypointIndex}
          />
        )}

        {/* 3. DBSCAN Cluster Convex Hulls & Centroids Layer */}
        {activeLayers.clusters && (
          <ClusterPolygonLayer
            clusters={clusters}
            onClusterClick={handleClusterClick}
            showHulls={activeLayers.hulls}
          />
        )}

        {/* 4. Thermal & Visual Signal Markers Layer */}
        <SignalMarkerLayer
          signals={visibleSignals}
          showThermal={activeLayers.thermal}
          showVisual={activeLayers.visual}
          showNoise={activeLayers.noise}
        />
      </MapContainer>

      {/* Interactive Layer Toggle Overlay Toolbar */}
      {showControls && (
        <div className="absolute top-3 right-3 z-20 bg-slate-950/90 backdrop-blur border border-slate-800 rounded-lg p-2.5 shadow-xl text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold mb-2 uppercase text-[10px] tracking-wider border-b border-slate-800 pb-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Tactical GIS Layers
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-slate-300 hover:text-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.clusters}
                onChange={() => toggleLayer('clusters')}
                className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> DBSCAN Clusters
              </span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 hover:text-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.thermal}
                onChange={() => toggleLayer('thermal')}
                className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Thermal Signals
              </span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 hover:text-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.visual}
                onChange={() => toggleLayer('visual')}
                className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> Visual Detections
              </span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 hover:text-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.noise}
                onChange={() => toggleLayer('noise')}
                className="rounded bg-slate-800 border-slate-700 text-slate-400 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500" /> Spatial Noise (ID: -1)
              </span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 hover:text-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.flightPath}
                onChange={() => toggleLayer('flightPath')}
                className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Drone Trajectory
              </span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 hover:text-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.groundTruth}
                onChange={() => toggleLayer('groundTruth')}
                className="rounded bg-slate-800 border-slate-700 text-purple-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400" /> Ground Truth Zones
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Map Legend Overlay at Bottom-Left */}
      <div className="absolute bottom-3 left-3 z-20 bg-slate-950/85 backdrop-blur border border-slate-800 rounded px-3 py-1.5 text-[10px] font-mono text-slate-400 flex items-center gap-3">
        <span className="font-bold text-slate-300 uppercase">Priority:</span>
        <span className="flex items-center gap-1 text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500" /> CRITICAL (≥90)
        </span>
        <span className="flex items-center gap-1 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> HIGH (75-89)
        </span>
        <span className="flex items-center gap-1 text-blue-400">
          <span className="w-2 h-2 rounded-full bg-blue-500" /> MEDIUM (50-74)
        </span>
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> LOW (&lt;50)
        </span>
      </div>
    </div>
  );
};
