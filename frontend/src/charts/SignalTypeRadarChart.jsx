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
    return <div className="h-64 flex items-center justify-center text-xs text-slate-500 font-sans">No cluster telemetry</div>;
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
          <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'sans-serif' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255, 255, 255, 0.15)" tick={{ fill: '#64748b', fontSize: 9 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#141722',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              fontSize: '12px',
              color: '#e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          />
          <Radar
            name={`Top Sector #${topCluster?.cluster_label + 1 || 1}`}
            dataKey="topCluster"
            stroke="#f43f5e"
            fill="#f43f5e"
            fillOpacity={0.35}
          />
          <Radar
            name="Mission Average"
            dataKey="missionAvg"
            stroke="#38bdf8"
            fill="#38bdf8"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
