import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export const SignalTypeRadarChart = ({ clusters }) => {
  if (!clusters || clusters.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-xs text-[#98AAC2] font-mono">
        <span>NO TELEMETRY SIGNALS AVAILABLE</span>
        <span className="text-[10px] text-slate-500 mt-1">Awaiting sensor data feed</span>
      </div>
    );
  }

  // Calculate overall dataset mean feature values
  const avgThermal = (clusters.reduce((acc, c) => acc + (c.avg_thermal_score || 0), 0) / clusters.length) * 100;
  const avgPerson = (clusters.reduce((acc, c) => acc + (c.avg_person_prob || 0), 0) / clusters.length) * 100;
  const avgDebris = (clusters.reduce((acc, c) => acc + (c.avg_debris_prob || 0), 0) / clusters.length) * 100;
  const avgDamage = (clusters.reduce((acc, c) => acc + (c.avg_damage_prob || 0), 0) / clusters.length) * 100;
  const avgVehicle = (clusters.reduce((acc, c) => acc + (c.avg_vehicle_prob || 0), 0) / clusters.length) * 100;

  // Top critical cluster feature values for comparison
  const topCluster = clusters[0];
  const topThermal = (topCluster?.avg_thermal_score || 0) * 100;
  const topPerson = (topCluster?.avg_person_prob || 0) * 100;
  const topDebris = (topCluster?.avg_debris_prob || 0) * 100;
  const topDamage = (topCluster?.avg_damage_prob || 0) * 100;
  const topVehicle = (topCluster?.avg_vehicle_prob || 0) * 100;

  const data = [
    { subject: 'Thermal Anomaly', topCluster: Math.round(topThermal), missionAvg: Math.round(avgThermal) },
    { subject: 'Human Signal', topCluster: Math.round(topPerson), missionAvg: Math.round(avgPerson) },
    { subject: 'Debris Load', topCluster: Math.round(topDebris), missionAvg: Math.round(avgDebris) },
    { subject: 'Structural Damage', topCluster: Math.round(topDamage), missionAvg: Math.round(avgDamage) },
    { subject: 'Vehicle Presence', topCluster: Math.round(topVehicle), missionAvg: Math.round(avgVehicle) },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#27364C" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#98AAC2', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            stroke="#27364C"
            tick={{ fill: '#98AAC2', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18263A',
              borderColor: '#27364C',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#EAF2FF',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
          />
          <Radar
            name={`Top Priority Sector #${(topCluster?.cluster_label ?? 0) + 1}`}
            dataKey="topCluster"
            stroke="#FF5A70"
            fill="#FF5A70"
            fillOpacity={0.35}
          />
          <Radar
            name="Mission Average"
            dataKey="missionAvg"
            stroke="#00B7FF"
            fill="#00B7FF"
            fillOpacity={0.15}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
