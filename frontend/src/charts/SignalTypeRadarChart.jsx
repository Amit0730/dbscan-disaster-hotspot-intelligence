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
    return <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-500">No cluster telemetry</div>;
  }

  // Calculate overall dataset mean feature values
  const avgThermal = (clusters.reduce((acc, c) => acc + c.avg_thermal_score, 0) / clusters.length) * 100;
  const avgPerson = (clusters.reduce((acc, c) => acc + c.avg_person_prob, 0) / clusters.length) * 100;
  const avgDebris = (clusters.reduce((acc, c) => acc + c.avg_debris_prob, 0) / clusters.length) * 100;
  const avgDamage = (clusters.reduce((acc, c) => acc + c.avg_damage_prob, 0) / clusters.length) * 100;
  const avgVehicle = (clusters.reduce((acc, c) => acc + c.avg_vehicle_prob, 0) / clusters.length) * 100;

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
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#1e293b" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" tick={{ fill: '#64748b', fontSize: 9 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
          />
          <Radar
            name={`Top Cluster #${topCluster?.cluster_label + 1 || 1}`}
            dataKey="topCluster"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.4}
          />
          <Radar
            name="Mission Average"
            dataKey="missionAvg"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
