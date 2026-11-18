import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const TemporalDetectionChart = ({ signals }) => {
  if (!signals || signals.length === 0) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-500 font-sans">No telemetry recorded</div>;
  }

  // Bucket signals by hour
  const hourlyBuckets = {};
  for (let h = 8; h <= 18; h++) {
    const label = `${String(h).padStart(2, '0')}:00`;
    hourlyBuckets[label] = { time: label, thermal: 0, visual: 0, total: 0 };
  }

  signals.forEach((s) => {
    if (!s.timestamp) return;
    const d = new Date(s.timestamp);
    const hour = d.getHours();
    const label = `${String(hour).padStart(2, '0')}:00`;
    if (hourlyBuckets[label]) {
      hourlyBuckets[label].total++;
      if (s.thermal_score >= 0.5) {
        hourlyBuckets[label].thermal++;
      } else {
        hourlyBuckets[label].visual++;
      }
    }
  });

  const data = Object.values(hourlyBuckets);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorThermal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorVisual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis dataKey="time" stroke="rgba(255, 255, 255, 0.15)" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
          <YAxis stroke="rgba(255, 255, 255, 0.15)" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
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
          <Area type="monotone" dataKey="thermal" name="Thermal Hotspots" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorThermal)" />
          <Area type="monotone" dataKey="visual" name="Visual Detections" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorVisual)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
