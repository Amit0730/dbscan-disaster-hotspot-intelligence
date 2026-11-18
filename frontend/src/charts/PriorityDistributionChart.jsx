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

export const PriorityDistributionChart = ({ clusters }) => {
  if (!clusters || clusters.length === 0) {
    return <div className="h-64 flex items-center justify-center text-xs text-slate-500 font-sans">No sectors detected</div>;
  }

  // Aggregate clusters by priority tier
  const tierCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  clusters.forEach((c) => {
    const tier = c.classification || 'LOW';
    if (tierCounts[tier] !== undefined) {
      tierCounts[tier]++;
    }
  });

  const data = [
    { tier: 'Critical', count: tierCounts.CRITICAL, fill: PRIORITY_COLORS.CRITICAL.fill },
    { tier: 'High', count: tierCounts.HIGH, fill: PRIORITY_COLORS.HIGH.fill },
    { tier: 'Medium', count: tierCounts.MEDIUM, fill: PRIORITY_COLORS.MEDIUM.fill },
    { tier: 'Low', count: tierCounts.LOW, fill: PRIORITY_COLORS.LOW.fill },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis dataKey="tier" stroke="rgba(255, 255, 255, 0.15)" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'sans-serif' }} />
          <YAxis stroke="rgba(255, 255, 255, 0.15)" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#141722',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              fontSize: '12px',
              color: '#e2e8f0',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
