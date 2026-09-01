import React from 'react';
import { Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { formatCoords } from '../utils/geo';
import { TacticalBadge } from '../components/TacticalBadge';

export const GroundTruthLayer = ({ groundTruth }) => {
  if (!groundTruth || groundTruth.length === 0) return null;

  return (
    <>
      {groundTruth.map((gt) => {
        const isCritical = gt.actual_priority === 'CRITICAL';
        const isHigh = gt.actual_priority === 'HIGH';

        const color = isCritical ? '#dc2626' : isHigh ? '#d97706' : '#2563eb';

        const gtIcon = L.divIcon({
          className: 'custom-gt-marker',
          html: `
            <div style="
              border: 2px dashed ${color};
              background: rgba(15, 23, 42, 0.7);
              color: ${color};
              width: 22px;
              height: 22px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: monospace;
              font-weight: bold;
              font-size: 10px;
              box-shadow: 0 0 8px ${color};
            ">
              GT
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        return (
          <React.Fragment key={gt.id}>
            {/* Ground Truth Boundary Radius */}
            <Circle
              center={[gt.lat, gt.lon]}
              radius={gt.radius_meters || 100}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: '4, 6',
              }}
            />

            {/* Centroid Tag */}
            <Marker position={[gt.lat, gt.lon]} icon={gtIcon}>
              <Popup>
                <div className="p-2 space-y-1 text-xs font-mono text-slate-200 min-w-[210px]">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                    <span className="font-bold text-slate-100">SIMULATED GROUND TRUTH</span>
                    <TacticalBadge variant={gt.actual_priority}>{gt.actual_priority}</TacticalBadge>
                  </div>
                  <div className="font-semibold text-slate-200">{gt.name}</div>
                  <div className="text-[11px] text-cyan-400">Type: {gt.zone_type}</div>
                  <div className="text-[10px] text-slate-400">{gt.description}</div>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                    Radius: {gt.radius_meters}m | Coords: {formatCoords(gt.lat, gt.lon)}
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
};
