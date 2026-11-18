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
    return <div className="h-64 flex items-center justify-center text-xs text-slate-500 font-sans">No statistics</div>;
  }

  const clustered = stats.total_signals - stats.noise_points;
  const noise = stats.noise_points;

  const data = [
    { name: 'Clustered Hotspot Signals', value: clustered, fill: '#38bdf8' },
    { name: 'Filtered Spatial Noise', value: noise, fill: '#334155' },
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
              <Cell key={`cell-${index}`} fill={entry.fill} stroke="#141722" strokeWidth={2} />
            ))}
          </Pie>
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
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs font-medium text-slate-300 font-sans">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
