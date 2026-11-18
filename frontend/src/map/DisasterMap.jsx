import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { useMission } from '../context/MissionContext';
import { ClusterPolygonLayer } from './ClusterPolygonLayer';
import { SignalMarkerLayer } from './SignalMarkerLayer';
import { FlightPathLayer } from './FlightPathLayer';
import { GroundTruthLayer } from './GroundTruthLayer';
import { formatCoords } from '../utils/geo';
import { Layers, Compass, Crosshair } from 'lucide-react';

// Programmatically center map
const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 14);
    }
  }, [center, zoom, map]);
  return null;
};

// Coordinate tracker on mouse move
const CoordinateTracker = ({ onMouseMove }) => {
  useMapEvents({
    mousemove(e) {
      if (onMouseMove) {
        onMouseMove(e.latlng);
      }
    },
  });
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

  const [cursorCoords, setCursorCoords] = useState(null);

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
    <div
      className="relative w-full overflow-hidden rounded-md border border-[#27364C] bg-[#0A101B]"
      style={{ height }}
    >
      <MapContainer
        center={centerCoords}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <MapRecenter center={centerCoords} zoom={focusCoords ? 15 : 14} />
        <CoordinateTracker onMouseMove={(latlng) => setCursorCoords(latlng)} />

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

      {/* Layer Toggle Toolbar */}
      {showControls && (
        <div className="absolute top-3 right-3 z-20 bg-[#0D1624]/90 backdrop-blur-xs border border-[#27364C] rounded p-2.5 shadow-lg text-xs font-mono select-none">
          <div className="flex items-center gap-1.5 text-[#98AAC2] font-bold mb-2 uppercase text-[10px] tracking-wider border-b border-[#27364C] pb-1">
            <Layers className="w-3.5 h-3.5 text-[#00B7FF]" />
            GIS Layers
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[#EAF2FF] hover:text-[#00B7FF] cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.clusters}
                onChange={() => toggleLayer('clusters')}
                className="rounded bg-[#18263A] border-[#27364C] text-[#00B7FF] focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00B7FF]" /> DBSCAN Sectors
              </span>
            </label>

            <label className="flex items-center gap-2 text-[#EAF2FF] hover:text-[#F5B94E] cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.thermal}
                onChange={() => toggleLayer('thermal')}
                className="rounded bg-[#18263A] border-[#27364C] text-[#F5B94E] focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F5B94E]" /> Thermal Signals
              </span>
            </label>

            <label className="flex items-center gap-2 text-[#EAF2FF] hover:text-[#00B7FF] cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.visual}
                onChange={() => toggleLayer('visual')}
                className="rounded bg-[#18263A] border-[#27364C] text-[#00B7FF] focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00B7FF]" /> Visual Detections
              </span>
            </label>

            <label className="flex items-center gap-2 text-[#EAF2FF] hover:text-[#98AAC2] cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.noise}
                onChange={() => toggleLayer('noise')}
                className="rounded bg-[#18263A] border-[#27364C] text-[#98AAC2] focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#98AAC2]" /> Spatial Noise (ID: -1)
              </span>
            </label>

            <label className="flex items-center gap-2 text-[#EAF2FF] hover:text-[#18D9A4] cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.flightPath}
                onChange={() => toggleLayer('flightPath')}
                className="rounded bg-[#18263A] border-[#27364C] text-[#18D9A4] focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#18D9A4]" /> Drone Trajectory
              </span>
            </label>

            <label className="flex items-center gap-2 text-[#EAF2FF] hover:text-[#FF5A70] cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.groundTruth}
                onChange={() => toggleLayer('groundTruth')}
                className="rounded bg-[#18263A] border-[#27364C] text-[#FF5A70] focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF5A70]" /> Ground Truth
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Coordinate Readout Floating at Bottom-Right */}
      <div className="absolute bottom-3 right-3 z-20 bg-[#0D1624]/90 backdrop-blur-xs border border-[#27364C] rounded px-2.5 py-1 text-[10px] font-mono text-[#98AAC2] flex items-center gap-2">
        <Crosshair className="w-3 h-3 text-[#00B7FF]" />
        <span>
          {cursorCoords
            ? formatCoords(cursorCoords.lat, cursorCoords.lng)
            : formatCoords(centerCoords[0], centerCoords[1])}
        </span>
        <span className="text-[#27364C]">|</span>
        <span className="text-[#EAF2FF]">WGS-84</span>
      </div>

      {/* Map Legend at Bottom-Left */}
      <div className="absolute bottom-3 left-3 z-20 bg-[#0D1624]/90 backdrop-blur-xs border border-[#27364C] rounded px-3 py-1.5 text-[10px] font-mono text-[#98AAC2] flex items-center gap-3 select-none">
        <span className="font-bold text-[#EAF2FF] uppercase">Priority:</span>
        <span className="flex items-center gap-1 text-[#FF5A70]">
          <span className="w-2 h-2 rounded-full bg-[#FF5A70]" /> CRITICAL (≥90)
        </span>
        <span className="flex items-center gap-1 text-[#F5B94E]">
          <span className="w-2 h-2 rounded-full bg-[#F5B94E]" /> HIGH (75–89)
        </span>
        <span className="flex items-center gap-1 text-[#00B7FF]">
          <span className="w-2 h-2 rounded-full bg-[#00B7FF]" /> MEDIUM (50–74)
        </span>
        <span className="flex items-center gap-1 text-[#18D9A4]">
          <span className="w-2 h-2 rounded-full bg-[#18D9A4]" /> LOW (&lt;50)
        </span>
      </div>
    </div>
  );
};
