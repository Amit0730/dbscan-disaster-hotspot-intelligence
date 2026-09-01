import React from 'react';
import { CircleMarker, Popup, Tooltip } from 'react-leaflet';
import { formatCoords, formatPercentage } from '../utils/geo';

export const SignalMarkerLayer = ({
  signals,
  showThermal = true,
  showVisual = true,
  showNoise = true,
}) => {
  if (!signals || signals.length === 0) return null;

  return (
    <>
      {signals.map((sig) => {
        const isNoise = sig.cluster_id === -1;
        if (isNoise && !showNoise) return null;

        // Color coding based on whether thermal is dominant or visual
        const isHighThermal = sig.thermal_score >= 0.6;
        if (isHighThermal && !showThermal && !isNoise) return null;
        if (!isHighThermal && !showVisual && !isNoise) return null;

        let markerColor = '#06b6d4'; // default cyan
        let fillColor = '#0891b2';
        let radius = 4.5;

        if (isNoise) {
          markerColor = '#64748b'; // slate grey for noise
          fillColor = '#475569';
          radius = 3.5;
        } else if (sig.thermal_score >= 0.75) {
          markerColor = '#ef4444'; // intense red
          fillColor = '#dc2626';
          radius = 6;
        } else if (sig.thermal_score >= 0.50) {
          markerColor = '#f59e0b'; // amber
          fillColor = '#d97706';
          radius = 5;
        } else if (sig.person_probability >= 0.70) {
          markerColor = '#38bdf8'; // sky blue
          fillColor = '#0284c7';
          radius = 5.5;
        }

        return (
          <CircleMarker
            key={sig.id}
            center={[sig.lat, sig.lon]}
            radius={radius}
            pathOptions={{
              color: markerColor,
              fillColor: fillColor,
              fillOpacity: 0.75,
              weight: 1.5,
            }}
          >
            <Tooltip direction="top" offset={[0, -5]} opacity={0.9}>
              <div className="text-[10px] font-mono p-0.5">
                <span className="font-bold">{sig.id}</span>
                {isNoise ? (
                  <span className="text-slate-400"> (Noise)</span>
                ) : (
                  <span className="text-cyan-400"> (Cluster #{sig.cluster_id + 1})</span>
                )}
                <br />
                Temp: {sig.temperature}°C | Conf: {formatPercentage(sig.confidence)}
              </div>
            </Tooltip>

            <Popup>
              <div className="p-2 space-y-1 text-xs font-mono text-slate-200 min-w-[200px]">
                <div className="flex justify-between items-center border-b border-slate-700 pb-1">
                  <span className="font-bold text-slate-100">{sig.id}</span>
                  <span className={`text-[10px] font-bold ${isNoise ? 'text-slate-400' : 'text-cyan-400'}`}>
                    {isNoise ? 'NOISE POINT (-1)' : `CLUSTER #${sig.cluster_id + 1}`}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  Coords: {formatCoords(sig.lat, sig.lon)}
                </div>

                <div className="grid grid-cols-2 gap-1 pt-1 text-[11px]">
                  <div>Temp: <span className="text-amber-400 font-bold">{sig.temperature}°C</span></div>
                  <div>Thermal Anomaly: <span className="text-amber-400">{formatPercentage(sig.thermal_anomaly)}</span></div>
                  <div>Human Prob: <span className="text-cyan-400">{formatPercentage(sig.person_probability)}</span></div>
                  <div>Debris Prob: <span className="text-orange-400">{formatPercentage(sig.debris_probability)}</span></div>
                  <div>Damage Prob: <span className="text-purple-400">{formatPercentage(sig.damage_probability)}</span></div>
                  <div>Confidence: <span className="text-slate-300">{formatPercentage(sig.confidence)}</span></div>
                </div>

                {sig.ground_truth_priority && (
                  <div className="mt-1 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                    GT Priority: <span className="text-amber-400 font-semibold">{sig.ground_truth_priority}</span>
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
};
