import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SeverityBadge } from './SeverityBadge';
import { formatCoords, formatPercentage } from '../utils/geo';
import {
  X,
  MapPin,
  Flame,
  Radio,
  SlidersHorizontal,
  Layers,
  ArrowUpRight,
  Shield,
  Activity,
} from 'lucide-react';

export const ClusterInspectorDrawer = ({
  cluster,
  onClose,
  isOpen = true,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !cluster) return null;

  const handleLocateOnMap = () => {
    onClose();
    navigate('/map');
  };

  const score = Math.round(cluster.priority_score ?? 0);
  const thermalVal = cluster.mean_thermal_anomaly ?? cluster.thermal_score ?? 0;
  const humanVal = cluster.mean_person_prob ?? cluster.person_prob ?? 0;
  const debrisVal = cluster.mean_debris_prob ?? cluster.debris_prob ?? 0;
  const damageVal = cluster.mean_damage_prob ?? cluster.damage_prob ?? 0;
  const densityVal = cluster.density ?? 0;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0D1624] border-l border-[#27364C] shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#27364C] bg-[#131F30] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[#18263A] border border-[#27364C] flex items-center justify-center text-[#00B7FF]">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#EAF2FF] font-mono">
                Sector Hotspot #{cluster.cluster_id}
              </span>
              <SeverityBadge severity={cluster.classification} size="sm" />
            </div>
            <div className="text-[11px] text-[#98AAC2] font-mono mt-0.5">
              {formatCoords(cluster.centroid_lat, cluster.centroid_lon)}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded text-[#98AAC2] hover:text-[#EAF2FF] hover:bg-[#18263A] transition-colors cursor-pointer"
          title="Close Drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs text-[#EAF2FF]">
        {/* Priority Score Overview */}
        <div className="p-4 rounded-md bg-[#131F30] border border-[#27364C] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#98AAC2] uppercase tracking-wider">
              Triage Priority Score
            </div>
            <div className="text-3xl font-extrabold font-mono text-[#EAF2FF] mt-1 tabular-nums">
              {score}
              <span className="text-sm font-normal text-[#98AAC2] font-mono"> / 100</span>
            </div>
            <div className="text-[11px] text-[#98AAC2] mt-0.5">
              Operational Tier: <strong className="text-[#EAF2FF]">{cluster.classification}</strong>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-[11px] text-[#98AAC2] uppercase">Detections</div>
            <div className="text-xl font-bold text-[#00B7FF] mt-0.5 tabular-nums">
              {cluster.signal_count ?? 0}
            </div>
            <div className="text-[10px] text-[#98AAC2]">Sensor Geotags</div>
          </div>
        </div>

        {/* Action Button: Locate on Map */}
        <button
          onClick={handleLocateOnMap}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          <span>Locate Sector on Tactical GIS Map</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        {/* 5-Factor Score Breakdown */}
        <div className="space-y-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#98AAC2] flex items-center justify-between border-b border-[#27364C] pb-1.5">
            <span>5-Factor Evaluation Breakdown</span>
            <span>Weight</span>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-[#98AAC2] flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-[#F5B94E]" />
                  Thermal Radiometric Gradient
                </span>
                <span className="text-[#EAF2FF]">{formatPercentage(thermalVal)} (35%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#18263A] overflow-hidden">
                <div
                  className="h-full bg-[#F5B94E] rounded-full"
                  style={{ width: `${Math.min(100, thermalVal * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-[#98AAC2] flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-[#00B7FF]" />
                  Human Probability Confidence
                </span>
                <span className="text-[#EAF2FF]">{formatPercentage(humanVal)} (30%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#18263A] overflow-hidden">
                <div
                  className="h-full bg-[#00B7FF] rounded-full"
                  style={{ width: `${Math.min(100, humanVal * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-[#98AAC2] flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-[#98AAC2]" />
                  Structural Rubble & Debris
                </span>
                <span className="text-[#EAF2FF]">{formatPercentage(debrisVal)} (15%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#18263A] overflow-hidden">
                <div
                  className="h-full bg-[#98AAC2] rounded-full"
                  style={{ width: `${Math.min(100, debrisVal * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-[#98AAC2] flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-[#FF5A70]" />
                  Structural Damage Severity
                </span>
                <span className="text-[#EAF2FF]">{formatPercentage(damageVal)} (10%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#18263A] overflow-hidden">
                <div
                  className="h-full bg-[#FF5A70] rounded-full"
                  style={{ width: `${Math.min(100, damageVal * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-[#98AAC2] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3 h-3 text-[#18D9A4]" />
                  Spatial Density Factor
                </span>
                <span className="text-[#EAF2FF]">{Math.round(densityVal)} pts/km² (10%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#18263A] overflow-hidden">
                <div
                  className="h-full bg-[#18D9A4] rounded-full"
                  style={{ width: `${Math.min(100, (densityVal / 250) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operational Dispatch Recommendation */}
        <div className="p-3.5 rounded-md bg-[#18263A] border border-[#27364C] text-[11px]">
          <div className="font-mono text-[#00B7FF] font-semibold uppercase mb-1">
            Recommended Action Protocol
          </div>
          <p className="text-[#98AAC2] leading-relaxed">
            {cluster.classification === 'CRITICAL' &&
              'Deploy immediate heavy USAR extraction team and canine unit. Prioritize perimeter stabilization.'}
            {cluster.classification === 'HIGH' &&
              'Dispatch aerial tactical team for structural entry assessment and secondary thermal sweep.'}
            {cluster.classification === 'MEDIUM' &&
              'Conduct acoustic listening sweep and monitor structural displacement perimeter.'}
            {cluster.classification === 'LOW' &&
              'Clear primary logistics route and maintain secondary surveillance drone orbit.'}
          </p>
        </div>
      </div>
    </div>
  );
};
