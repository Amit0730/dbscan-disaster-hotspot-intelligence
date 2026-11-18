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
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[#98AAC2] font-mono">
        No statistics available
      </div>
    );
  }

  const clustered = stats.total_signals - stats.noise_points;
  const noise = stats.noise_points;

  const data = [
    { name: 'Clustered Hotspot Signals', value: clustered, fill: '#00B7FF' },
    { name: 'Filtered Spatial Noise (ID: -1)', value: noise, fill: '#27364C' },
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
              <Cell key={`cell-${index}`} fill={entry.fill} stroke="#131F30" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#131F30',
              borderColor: '#27364C',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#EAF2FF',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
              fontFamily: 'monospace',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-xs font-mono text-[#98AAC2]">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
