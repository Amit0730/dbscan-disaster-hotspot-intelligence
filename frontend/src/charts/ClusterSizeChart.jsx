import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { PRIORITY_COLORS } from '../utils/geo';

export const ClusterSizeChart = ({ clusters }) => {
  if (!clusters || clusters.length === 0) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-500 font-sans">No sectors detected</div>;
  }

  const data = clusters.map((c) => ({
    name: `Sector ${c.cluster_label + 1}`,
    signals: c.signal_count,
    priority: c.priority_score,
    tier: c.classification,
    fill: PRIORITY_COLORS[c.classification]?.fill || '#38bdf8',
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.15)" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
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
            formatter={(value, name) => [`${value} signals`, 'Signal Count']}
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
          />
          <Bar dataKey="signals" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
