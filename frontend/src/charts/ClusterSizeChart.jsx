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
    return (
      <div className="h-64 flex items-center justify-center text-xs text-[#98AAC2] font-mono">
        No sectors detected
      </div>
    );
  }

  const data = clusters.map((c) => ({
    name: `Sector #${c.cluster_id}`,
    signals: c.signal_count,
    priority: Math.round(c.priority_score ?? 0),
    tier: c.classification,
    fill: PRIORITY_COLORS[c.classification]?.fill || '#00B7FF',
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27364C" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#27364C"
            tick={{ fill: '#98AAC2', fontSize: 11, fontFamily: 'monospace' }}
          />
          <YAxis
            stroke="#27364C"
            tick={{ fill: '#98AAC2', fontSize: 11, fontFamily: 'monospace' }}
          />
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
            formatter={(value) => [`${value} signals`, 'Signal Count']}
            cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
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
