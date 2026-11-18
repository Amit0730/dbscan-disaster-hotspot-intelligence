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
    return (
      <div className="h-64 flex flex-col items-center justify-center text-xs text-[#98AAC2] font-mono">
        <span>NO SECTORS IDENTIFIED</span>
        <span className="text-[10px] text-slate-500 mt-1">Awaiting DBSCAN execution</span>
      </div>
    );
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
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="#27364C" vertical={false} />
          <XAxis
            dataKey="tier"
            stroke="#27364C"
            tick={{ fill: '#98AAC2', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
            axisLine={{ stroke: '#27364C' }}
            tickLine={{ stroke: '#27364C' }}
          />
          <YAxis
            stroke="#27364C"
            tick={{ fill: '#98AAC2', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#27364C' }}
            tickLine={{ stroke: '#27364C' }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18263A',
              borderColor: '#27364C',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#EAF2FF',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
            formatter={(value) => [`${value} Sectors`, 'Count']}
            cursor={{ fill: 'rgba(0, 183, 255, 0.05)' }}
          />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
