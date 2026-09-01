import React from 'react';
import { Polygon, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { PRIORITY_COLORS, formatCoords, formatPercentage } from '../utils/geo';
import { TacticalBadge } from '../components/TacticalBadge';

export const ClusterPolygonLayer = ({ clusters, onClusterClick, showHulls = true }) => {
  if (!clusters || clusters.length === 0) return null;

  return (
    <>
      {clusters.map((cluster) => {
        const tier = cluster.classification || 'MEDIUM';
        const colorStyle = PRIORITY_COLORS[tier] || PRIORITY_COLORS.MEDIUM;

        // Custom Centroid Icon with Priority Badge
        const centroidIcon = L.divIcon({
          className: 'custom-cluster-centroid',
          html: `
            <div style="
              background: ${colorStyle.fill};
              color: #ffffff;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: monospace;
              font-weight: bold;
              font-size: 11px;
              border: 2px solid #ffffff;
              box-shadow: 0 0 14px ${colorStyle.glow};
              cursor: pointer;
            ">
              #${cluster.cluster_label + 1}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        // Parse polygon coordinates from GeoJSON: GeoJSON uses [lon, lat], Leaflet uses [lat, lon]
        let polygonPositions = [];
        if (
          cluster.convex_hull_geojson &&
          cluster.convex_hull_geojson.coordinates &&
          cluster.convex_hull_geojson.coordinates[0]
        ) {
          polygonPositions = cluster.convex_hull_geojson.coordinates[0].map((coord) => [
            coord[1],
            coord[0],
          ]);
        }

        return (
          <React.Fragment key={cluster.id}>
            {/* 1. Convex Hull Polygon Boundary */}
            {showHulls && polygonPositions.length > 0 && (
              <Polygon
                positions={polygonPositions}
                pathOptions={{
                  color: colorStyle.border,
                  fillColor: colorStyle.fill,
                  fillOpacity: 0.18,
                  weight: 2.5,
                  dashArray: tier === 'CRITICAL' ? undefined : '4, 4',
                }}
                eventHandlers={{
                  click: () => onClusterClick && onClusterClick(cluster),
                }}
              />
            )}

            {/* 2. Cluster Centroid Marker */}
            <Marker
              position={[cluster.center_lat, cluster.center_lon]}
              icon={centroidIcon}
              eventHandlers={{
                click: () => onClusterClick && onClusterClick(cluster),
              }}
            >
              <Popup className="tactical-cluster-popup">
                <div className="p-2 space-y-2 text-xs font-mono text-slate-200 min-w-[220px]">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                    <span className="font-bold text-slate-100">
                      CLUSTER #{String(cluster.cluster_label + 1).padStart(2, '0')}
                    </span>
                    <span
                      style={{ color: colorStyle.fill }}
                      className="font-bold uppercase tracking-wider text-[10px]"
                    >
                      {cluster.classification}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div>
                      <span className="text-slate-400">Priority:</span>{' '}
                      <span className="font-bold text-slate-100">{cluster.priority_score}/100</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Signals:</span>{' '}
                      <span className="font-bold text-cyan-400">{cluster.signal_count}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Thermal:</span>{' '}
                      <span className="text-amber-400">{formatPercentage(cluster.avg_thermal_score)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Human:</span>{' '}
                      <span className="text-cyan-400">{formatPercentage(cluster.avg_person_prob)}</span>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      {cluster.recommended_action}
                    </span>
                    <button
                      onClick={() => onClusterClick && onClusterClick(cluster)}
                      className="text-[10px] text-cyan-400 font-bold hover:underline cursor-pointer"
                    >
                      Inspect &rarr;
                    </button>
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
