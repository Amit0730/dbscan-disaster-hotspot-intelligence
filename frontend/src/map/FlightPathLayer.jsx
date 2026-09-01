import React from 'react';
import { Polyline, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';

export const FlightPathLayer = ({ waypoints, activeWaypointIndex = null }) => {
  if (!waypoints || waypoints.length === 0) return null;

  const polylineCoords = waypoints.map((wp) => [wp.lat, wp.lon]);

  // Active Drone Icon
  const droneIcon = L.divIcon({
    className: 'custom-drone-icon',
    html: `
      <div style="
        background: #06b6d4;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 16px #06b6d4;
        border: 2px solid #ffffff;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m2 12 5-3 5 3-5 3z"/>
          <path d="m12 2 3 5-3 5-3-5z"/>
          <path d="m22 12-5-3-5 3 5 3z"/>
          <path d="m12 22-3-5 3-5 3 5z"/>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const activeWp =
    activeWaypointIndex !== null && waypoints[activeWaypointIndex]
      ? waypoints[activeWaypointIndex]
      : null;

  return (
    <>
      {/* 1. Trajectory Polyline */}
      <Polyline
        positions={polylineCoords}
        pathOptions={{
          color: '#10b981',
          weight: 2,
          opacity: 0.6,
          dashArray: '6, 6',
        }}
      />

      {/* 2. Waypoint markers */}
      {waypoints.map((wp, idx) => (
        <CircleMarker
          key={wp.id}
          center={[wp.lat, wp.lon]}
          radius={3}
          pathOptions={{
            color: '#10b981',
            fillColor: '#059669',
            fillOpacity: 0.8,
            weight: 1,
          }}
        >
          <Popup>
            <div className="p-1.5 text-xs font-mono text-slate-200">
              <span className="font-bold text-emerald-400">WAYPOINT #{wp.sequence}</span>
              <div className="text-[11px] text-slate-400 mt-0.5">Action: {wp.action_type}</div>
              <div className="text-[11px] text-slate-400">Altitude: {wp.altitude}m | Spd: {wp.speed_mps} m/s</div>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* 3. Live Animated Drone Icon */}
      {activeWp && (
        <Marker position={[activeWp.lat, activeWp.lon]} icon={droneIcon}>
          <Popup>
            <div className="p-2 text-xs font-mono text-slate-200">
              <div className="font-bold text-cyan-400">DRONE RECON SURVEY ACTIVE</div>
              <div className="text-slate-300 mt-1">Waypoint #{activeWp.sequence}</div>
              <div className="text-slate-400 text-[11px]">Alt: {activeWp.altitude}m | Speed: {activeWp.speed_mps} m/s</div>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
};
