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
    return (
      <div className="h-64 flex flex-col items-center justify-center text-xs text-[#98AAC2] font-mono">
        <span>NO TEMPORAL TELEMETRY</span>
        <span className="text-[10px] text-slate-500 mt-1">Awaiting sensor data timestamps</span>
      </div>
    );
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
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorThermal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F5B94E" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#F5B94E" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorVisual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00B7FF" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#00B7FF" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 2" stroke="#27364C" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#27364C"
            tick={{ fill: '#98AAC2', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#27364C' }}
            tickLine={{ stroke: '#27364C' }}
          />
          <YAxis
            stroke="#27364C"
            tick={{ fill: '#98AAC2', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#27364C' }}
            tickLine={{ stroke: '#27364C' }}
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
          <Area
            type="monotone"
            dataKey="thermal"
            name="Thermal Anomaly"
            stroke="#F5B94E"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#colorThermal)"
          />
          <Area
            type="monotone"
            dataKey="visual"
            name="Visual Detections"
            stroke="#00B7FF"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#colorVisual)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
