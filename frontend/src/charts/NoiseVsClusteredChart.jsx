import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const NoiseVsClusteredChart = ({ stats }) => {
  if (!stats) {
    return <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-500">No statistics</div>;
  }

  const clustered = stats.total_signals - stats.noise_points;
  const noise = stats.noise_points;

  const data = [
    { name: 'Clustered Hotspot Signals', value: clustered, fill: '#06b6d4' },
    { name: 'Filtered Spatial Noise', value: noise, fill: '#475569' },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} stroke="#0f172a" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs font-mono text-slate-300">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
