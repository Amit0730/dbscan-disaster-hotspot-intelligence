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
    return <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-500">No clusters detected</div>;
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
    { tier: 'CRITICAL', count: tierCounts.CRITICAL, fill: PRIORITY_COLORS.CRITICAL.fill },
    { tier: 'HIGH', count: tierCounts.HIGH, fill: PRIORITY_COLORS.HIGH.fill },
    { tier: 'MEDIUM', count: tierCounts.MEDIUM, fill: PRIORITY_COLORS.MEDIUM.fill },
    { tier: 'LOW', count: tierCounts.LOW, fill: PRIORITY_COLORS.LOW.fill },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="tier" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
          <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
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
