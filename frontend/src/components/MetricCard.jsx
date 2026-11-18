import React from 'react';

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeVariant = 'default',
  accentColor = '#00B7FF',
  className = '',
}) => {
  return (
    <div
      className={`p-4 rounded-md bg-[#131F30] border border-[#27364C] flex flex-col justify-between transition-colors hover:border-[#384f6f] ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-mono uppercase tracking-wider text-[#98AAC2]">
          {title}
        </div>
        {Icon && (
          <div
            className="w-7 h-7 rounded flex items-center justify-center shrink-0 bg-[#18263A] border border-[#27364C]"
            style={{ color: accentColor }}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="my-2.5">
        <div className="text-2xl font-bold font-mono text-[#EAF2FF] tracking-tight tabular-nums">
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-[#98AAC2] font-sans mt-0.5 leading-normal">
            {subtitle}
          </div>
        )}
      </div>

      {badgeText && (
        <div className="pt-2 border-t border-[#27364C]/60 flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#98AAC2]">Status</span>
          <span
            className="px-1.5 py-0.2 rounded text-[10px]"
            style={{
              color: accentColor,
              backgroundColor: `${accentColor}15`,
              border: `1px solid ${accentColor}30`,
            }}
          >
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
};
